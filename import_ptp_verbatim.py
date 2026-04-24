#!/usr/bin/env python3
"""
Import verbatim PTP page text into the source-trace tables.

This script is designed for one-PDF-at-a-time ingestion.
It upserts the PDF record, stores each verbatim page in ptp_page_texts,
and creates page-level anchors for popup/source preview.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from datetime import datetime
from pathlib import Path

import psycopg2

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'vim_production'),
    'user': os.getenv('DB_USER', 'vim_app'),
    'password': os.getenv('DB_PASSWORD', 'vim_secure_2026'),
    'port': int(os.getenv('DB_PORT', '5432')),
}

DEFAULT_SOURCE_JSON = Path('/Users/christopheramaya/Downloads/PTP/PTP_COMPLETE_MANUAL_EXTRACTION.md')
DEFAULT_PDF_PATH = '/Users/christopheramaya/Downloads/PTP/PTP1.pdf'
DEFAULT_SERVER_PATH = 'pdfs/ptp/PTP1.pdf'


def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except psycopg2.OperationalError as exc:
        host = DB_CONFIG['host']
        port = DB_CONFIG['port']
        raise psycopg2.OperationalError(
            f"Unable to connect to PostgreSQL at {host}:{port}. "
            f"This import likely needs to run on the server host or through an SSH tunnel. Original error: {exc}"
        ) from exc


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def load_source_payload(source_path: Path) -> dict:
    if source_path.suffix.lower() == '.json':
        with source_path.open('r', encoding='utf-8') as handle:
            return json.load(handle)

    with source_path.open('r', encoding='utf-8') as handle:
        raw_text = handle.read().strip()

    return parse_raw_page_text(raw_text, source_path)


def parse_raw_page_text(raw_text: str, source_path: Path) -> dict:
    section_match = re.search(r'^#\s*PTP1\.pdf\s*—\s*17\s+pages\s*$', raw_text, re.MULTILINE)
    if section_match:
        start_index = section_match.end()
        next_section = re.search(r'^#\s*PTP2\.pdf\b', raw_text[start_index:], re.MULTILINE)
        end_index = start_index + next_section.start() if next_section else len(raw_text)
        raw_text = raw_text[start_index:end_index]

    pages = []
    page_marker = re.compile(r'^##\s*Page\s+(\d+)\s*$', re.MULTILINE)
    matches = list(page_marker.finditer(raw_text))

    for idx, match in enumerate(matches):
        page_number = int(match.group(1))
        next_start = matches[idx + 1].start() if idx + 1 < len(matches) else len(raw_text)
        page_text = raw_text[match.start():next_start].strip()
        pages.append({
            'page_number': page_number,
            'page_title': f'Page {page_number}',
            'page_heading': match.group(0),
            'verbatim_text': page_text,
            'normalized_text': None,
        })

    filename_match = re.search(r'(PTP\d+\.pdf)', raw_text, re.IGNORECASE)
    pdf_file = filename_match.group(1) if filename_match else 'PTP1.pdf'
    pdf_name = Path(pdf_file).stem

    return {
        'pdf_file': pdf_file,
        'pdf_name': pdf_name,
        'extraction_date': datetime.now().isoformat(),
        'source_path': source_path.as_posix(),
        'pages': pages,
        'total_pages': len(pages),
    }


def upsert_pdf_document(cur, payload: dict, pdf_path: str, server_path: str) -> int:
    filename = payload.get('pdf_file', 'PTP1.pdf')
    total_pages = payload.get('total_pages', len(payload.get('pages', [])))
    file_size_bytes = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else None
    md5_hash = None
    if os.path.exists(pdf_path):
        with open(pdf_path, 'rb') as handle:
            md5_hash = hashlib.md5(handle.read()).hexdigest()

    cur.execute(
        'SELECT pdf_id FROM pdf_documents WHERE filename = %s',
        (filename,)
    )
    row = cur.fetchone()

    notes = 'PTP1 verbatim source import with page text anchors'
    if row:
        pdf_id = row[0]
        cur.execute(
            '''
            UPDATE pdf_documents
            SET original_path = %s,
                server_path = %s,
                pdf_type = 'PTP',
                total_pages = %s,
                file_size_bytes = COALESCE(%s, file_size_bytes),
                md5_hash = COALESCE(%s, md5_hash),
                status = 'OCR_Extracted',
                ocr_extraction_date = CURRENT_TIMESTAMP,
                notes = COALESCE(notes, '') || CASE WHEN notes IS NULL OR notes = '' THEN '' ELSE E'\n' END || %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE pdf_id = %s
            ''',
            (pdf_path, server_path, total_pages, file_size_bytes, md5_hash, notes, pdf_id),
        )
    else:
        cur.execute(
            '''
            INSERT INTO pdf_documents
                (filename, original_path, server_path, pdf_type, total_pages,
                 upload_date, uploaded_by, status, ocr_extraction_date,
                 file_size_bytes, md5_hash, notes)
            VALUES
                (%s, %s, %s, 'PTP', %s,
                 CURRENT_TIMESTAMP, 'system', 'OCR_Extracted', CURRENT_TIMESTAMP,
                 %s, %s, %s)
            RETURNING pdf_id
            ''',
            (filename, pdf_path, server_path, total_pages, file_size_bytes, md5_hash, notes),
        )
        pdf_id = cur.fetchone()[0]

    return pdf_id


def upsert_page_text(cur, pdf_id: int, page: dict, source_path: str) -> int:
    page_number = page['page_number']
    page_title = page.get('page_title')
    verbatim_text = page['verbatim_text']
    normalized_text = page.get('normalized_text')
    text_hash = sha256_text(verbatim_text)

    cur.execute(
        '''
        INSERT INTO ptp_page_texts
            (pdf_id, page_number, page_title, verbatim_text, normalized_text,
             text_hash, source_format, source_path, is_verified, created_at, updated_at)
        VALUES
            (%s, %s, %s, %s, %s, %s, 'verbatim', %s, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (pdf_id, page_number)
        DO UPDATE SET
            page_title = EXCLUDED.page_title,
            verbatim_text = EXCLUDED.verbatim_text,
            normalized_text = EXCLUDED.normalized_text,
            text_hash = EXCLUDED.text_hash,
            source_format = EXCLUDED.source_format,
            source_path = EXCLUDED.source_path,
            is_verified = EXCLUDED.is_verified,
            updated_at = CURRENT_TIMESTAMP
        RETURNING text_id
        ''',
        (pdf_id, page_number, page_title, verbatim_text, normalized_text, text_hash, source_path),
    )
    return cur.fetchone()[0]


def sync_page_image_text(cur, pdf_id: int, page_number: int, verbatim_text: str) -> None:
    cur.execute(
        '''
        UPDATE pdf_page_images
        SET ocr_text = %s,
            extraction_confidence = 1.00,
            is_verified = TRUE,
            verified_at = CURRENT_TIMESTAMP
        WHERE pdf_id = %s AND page_number = %s
        ''',
        (verbatim_text, pdf_id, page_number),
    )


def upsert_page_anchor(cur, text_id: int, page: dict) -> None:
    page_number = page['page_number']
    page_title = page.get('page_title') or f'Page {page_number}'
    page_heading = page.get('page_heading') or page_title
    verbatim_text = page['verbatim_text']
    payload = {
        'page_number': page_number,
        'page_title': page_title,
        'page_heading': page_heading,
        'source': 'verbatim_page_text',
    }

    cur.execute(
        '''
        INSERT INTO ptp_text_anchors
            (text_id, anchor_type, anchor_label, source_text, start_char, end_char,
             line_start, line_end, anchor_payload, is_verified, created_at)
        VALUES
            (%s, 'page', %s, %s, 0, %s, 1, 1, %s::jsonb, TRUE, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
        ''',
        (text_id, f'page_{page_number}', page_heading, len(verbatim_text), json.dumps(payload)),
    )

    page_heading_pos = verbatim_text.find(page_heading)
    if page_heading_pos >= 0:
        cur.execute(
            '''
            INSERT INTO ptp_text_anchors
                (text_id, anchor_type, anchor_label, source_text, start_char, end_char,
                 line_start, line_end, anchor_payload, is_verified, created_at)
            VALUES
                (%s, 'page_header', %s, %s, %s, %s, 1, 1, %s::jsonb, TRUE, CURRENT_TIMESTAMP)
            ON CONFLICT DO NOTHING
            ''',
            (
                text_id,
                f'page_{page_number}_heading',
                page_heading,
                page_heading_pos,
                page_heading_pos + len(page_heading),
                json.dumps(payload),
            ),
        )

def create_section_anchor(cur, text_id: int, page: dict, anchor_label: str, needle: str, anchor_type: str = 'section') -> None:
    verbatim_text = page['verbatim_text']
    pos = verbatim_text.find(needle)
    if pos < 0:
        return

    payload = {
        'page_number': page['page_number'],
        'page_title': page.get('page_title'),
        'source': 'verbatim_page_text',
        'anchor_label': anchor_label,
    }

    cur.execute(
        '''
        INSERT INTO ptp_text_anchors
            (text_id, anchor_type, anchor_label, source_text, start_char, end_char,
             line_start, line_end, anchor_payload, is_verified, created_at)
        VALUES
            (%s, %s, %s, %s, %s, %s, NULL, NULL, %s::jsonb, TRUE, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
        ''',
        (text_id, anchor_type, anchor_label, needle, pos, pos + len(needle), json.dumps(payload)),
    )


def import_ptp1(source_json: Path, pdf_path: str, server_path: str) -> None:
    payload = load_source_payload(source_json)
    pages = payload.get('pages', [])

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        pdf_id = upsert_pdf_document(cur, payload, pdf_path, server_path)

        for page in pages:
            text_id = upsert_page_text(cur, pdf_id, page, source_json.as_posix())
            upsert_page_anchor(cur, text_id, page)
            for anchor_label, needle in [
                ('quality_tests_required', 'Quality Tests Required'),
                ('physical_properties', 'Physical Properties'),
                ('chemical_composition', 'Chemical Composition (% by weight)'),
                ('sieve_analysis', 'Sieve Analysis (% by weight)'),
                ('document_control', 'Document Control'),
            ]:
                create_section_anchor(cur, text_id, page, anchor_label, needle)
            sync_page_image_text(cur, pdf_id, page['page_number'], page['verbatim_text'])

        conn.commit()
        print(f'Imported {len(pages)} pages for PDF ID {pdf_id}')
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description='Import verbatim PTP page text into source-trace tables')
    parser.add_argument('--source-json', default=str(DEFAULT_SOURCE_JSON), help='Path to the verbatim page JSON file')
    parser.add_argument('--pdf-path', default=DEFAULT_PDF_PATH, help='Original PDF path')
    parser.add_argument('--server-path', default=DEFAULT_SERVER_PATH, help='Server-relative PDF path')
    args = parser.parse_args()

    print(f"Using database {DB_CONFIG['database']} at {DB_CONFIG['host']}:{DB_CONFIG['port']} as {DB_CONFIG['user']}")

    import_ptp1(Path(args.source_json), args.pdf_path, args.server_path)


if __name__ == '__main__':
    main()
