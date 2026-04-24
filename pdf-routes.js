/**
 * PDF Document Routes
 * Routes for PDF storage, retrieval, and verification
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = '/var/www/vim/pdfs/uploaded';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

async function loadPageTrace(req, pdfId, pageNum) {
    const imageResult = await req.db.query(
        `SELECT * FROM pdf_page_images WHERE pdf_id = $1 AND page_number = $2`,
        [pdfId, pageNum]
    );

    const textResult = await req.db.query(
        `SELECT * FROM ptp_page_texts WHERE pdf_id = $1 AND page_number = $2`,
        [pdfId, pageNum]
    );

    let anchors = [];
    let textRecord = null;

    if (textResult.rows.length > 0) {
        textRecord = textResult.rows[0];
        const anchorResult = await req.db.query(
            `
            SELECT anchor_id, anchor_type, anchor_label, source_text, start_char, end_char, line_start, line_end, anchor_payload, is_verified, created_at
            FROM ptp_text_anchors
            WHERE text_id = $1
            ORDER BY COALESCE(start_char, 0), anchor_id
            `,
            [textRecord.text_id]
        );
        anchors = anchorResult.rows;
    }

    return {
        image: imageResult.rows[0] || null,
        text: textRecord,
        anchors,
    };
}

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get all PDF documents
router.get('/', async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT 
                pdf_id,
                filename,
                pdf_type,
                total_pages,
                status,
                upload_date,
                file_size_bytes,
                ocr_extraction_date,
                notes
            FROM pdf_documents
            ORDER BY upload_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching PDFs:', err);
        res.status(500).json({ error: 'Failed to fetch PDFs' });
    }
});

// Get specific PDF metadata
router.get('/:id', async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT * FROM pdf_documents WHERE pdf_id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching PDF:', err);
        res.status(500).json({ error: 'Failed to fetch PDF' });
    }
});

// Get all pages for a PDF
router.get('/:id/pages', async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT 
                page_id,
                page_number,
                image_path,
                dpi,
                extraction_confidence,
                is_verified,
                verified_by,
                verified_at,
                LEFT(ocr_text, 500) as text_preview
            FROM pdf_page_images
            WHERE pdf_id = $1
            ORDER BY page_number
        `, [req.params.id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching PDF pages:', err);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// Get specific page with full OCR text
router.get('/:id/page/:pageNum', async (req, res) => {
    try {
        const trace = await loadPageTrace(req, req.params.id, req.params.pageNum);

        if (!trace.image && !trace.text) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({
            ...trace.image,
            source_trace: trace.text
                ? {
                    text_id: trace.text.text_id,
                    page_title: trace.text.page_title,
                    verbatim_text: trace.text.verbatim_text,
                    normalized_text: trace.text.normalized_text,
                    text_hash: trace.text.text_hash,
                    source_format: trace.text.source_format,
                    source_path: trace.text.source_path,
                    anchors: trace.anchors,
                }
                : null,
        });
    } catch (err) {
        console.error('Error fetching page:', err);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// Get text-first trace data for a specific page
router.get('/:id/page/:pageNum/trace', async (req, res) => {
    try {
        const trace = await loadPageTrace(req, req.params.id, req.params.pageNum);

        if (!trace.image && !trace.text) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({
            pdf_id: Number(req.params.id),
            page_number: Number(req.params.pageNum),
            page_image: trace.image,
            page_text: trace.text,
            anchors: trace.anchors,
        });
    } catch (err) {
        console.error('Error fetching page trace:', err);
        res.status(500).json({ error: 'Failed to fetch page trace' });
    }
});

// Get PDF file (for viewing)
router.get('/:id/file', async (req, res) => {
    try {
        const result = await req.db.query(
            'SELECT server_path, filename FROM pdf_documents WHERE pdf_id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        
        const { server_path, filename } = result.rows[0];
        const filePath = path.join('/var/www/vim', server_path);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        console.error('Error serving PDF:', err);
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
});

// Get page image
router.get('/:id/page/:pageNum/image', async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT image_path FROM pdf_page_images
            WHERE pdf_id = $1 AND page_number = $2
        `, [req.params.id, req.params.pageNum]);
        
        if (result.rows.length === 0) {
            // Return placeholder
            return res.status(404).json({ error: 'Image not found' });
        }
        
        const imagePath = result.rows[0].image_path;
        const fullPath = path.join('/var/www/vim', imagePath);
        
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Image file not found' });
        }
        
        res.setHeader('Content-Type', 'image/png');
        fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
        console.error('Error serving image:', err);
        res.status(500).json({ error: 'Failed to serve image' });
    }
});

// Compare PDF data to database
router.get('/:id/compare/:alloyId', async (req, res) => {
    try {
        const { id, alloyId } = req.params;
        
        // Get PDF OCR text for pages mentioning this alloy
        const pagesResult = await req.db.query(`
            SELECT 
                p.page_number,
                p.ocr_text,
                p.is_verified,
                p.extraction_confidence
            FROM pdf_page_images p
            JOIN pdf_documents d ON p.pdf_id = d.pdf_id
            WHERE d.pdf_id = $1 
              AND p.ocr_text ILIKE $2
            ORDER BY p.page_number
        `, [id, `%${alloyId}%`]);
        
        // Get database specs for this alloy
        const specsResult = await req.db.query(`
            SELECT 
                element_sym,
                low_limit,
                high_limit,
                aim_value,
                is_balance,
                is_impurity,
                is_verified
            FROM alloy_specifications
            WHERE alloy_id = $1
            ORDER BY element_sym
        `, [alloyId]);
        
        // Get test methods
        const testsResult = await req.db.query(`
            SELECT 
                test_name,
                test_procedure,
                frequency,
                is_required,
                is_verified
            FROM test_method_requirements
            WHERE alloy_id = $1
            ORDER BY test_name
        `, [alloyId]);
        
        // Get powder sizes
        const sizesResult = await req.db.query(`
            SELECT 
                mesh_size_range,
                typical_application,
                is_verified
            FROM powder_size_specifications
            WHERE alloy_id = $1
            ORDER BY mesh_size_range
        `, [alloyId]);
        
        res.json({
            pdf_id: id,
            alloy_id: alloyId,
            pages: pagesResult.rows,
            database_specs: specsResult.rows,
            test_methods: testsResult.rows,
            powder_sizes: sizesResult.rows
        });
    } catch (err) {
        console.error('Error comparing PDF to DB:', err);
        res.status(500).json({ error: 'Failed to compare data' });
    }
});

// Upload new PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        const { pdf_type = 'Other', notes = '' } = req.body;
        const filename = req.file.originalname;
        const tempPath = req.file.path;
        const fileSize = req.file.size;
        
        // Calculate MD5 hash
        const fileBuffer = fs.readFileSync(tempPath);
        const md5Hash = crypto.createHash('md5').update(fileBuffer).toString('hex');
        
        // Get page count using pdf-parse or similar (simplified here)
        const totalPages = 0; // Would need pdf-parse library
        
        // Move file to final destination
        const finalDir = `/var/www/vim/pdfs/${pdf_type.toLowerCase()}`;
        if (!fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
        }
        
        const finalPath = path.join(finalDir, filename);
        const serverPath = `pdfs/${pdf_type.toLowerCase()}/${filename}`;
        
        // Check if file already exists
        if (fs.existsSync(finalPath)) {
            fs.unlinkSync(tempPath);
            return res.status(409).json({ error: 'PDF with this name already exists' });
        }
        
        fs.renameSync(tempPath, finalPath);
        
        // Insert into database
        const result = await req.db.query(`
            INSERT INTO pdf_documents 
            (filename, original_path, server_path, pdf_type, total_pages, 
             file_size_bytes, md5_hash, status, upload_date, uploaded_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Unprocessed', CURRENT_TIMESTAMP, $8, $9)
            RETURNING *
        `, [filename, tempPath, serverPath, pdf_type, totalPages, fileSize, md5Hash, 'web-upload', notes]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error uploading PDF:', err);
        // Clean up temp file if exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload PDF', details: err.message });
    }
});

// Delete/archive PDF
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get PDF info
        const pdfResult = await req.db.query(
            'SELECT server_path, filename, status FROM pdf_documents WHERE pdf_id = $1',
            [id]
        );
        
        if (pdfResult.rows.length === 0) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        
        const pdf = pdfResult.rows[0];
        
        // Archive instead of delete if already processed
        if (pdf.status === 'Verified' || pdf.status === 'OCR_Extracted') {
            await req.db.query(`
                UPDATE pdf_documents 
                SET status = 'Archived', notes = COALESCE(notes, '') || ' [Archived on ' || CURRENT_TIMESTAMP || ']'
                WHERE pdf_id = $1
            `, [id]);
            
            return res.json({ 
                message: 'PDF archived successfully',
                pdf_id: id,
                action: 'archived'
            });
        }
        
        // For unprocessed PDFs, actually delete
        const filePath = path.join('/var/www/vim', pdf.server_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete from database
        await req.db.query('DELETE FROM pdf_page_images WHERE pdf_id = $1', [id]);
        await req.db.query('DELETE FROM pdf_documents WHERE pdf_id = $1', [id]);
        
        res.json({ 
            message: 'PDF deleted successfully',
            pdf_id: id,
            filename: pdf.filename,
            action: 'deleted'
        });
    } catch (err) {
        console.error('Error deleting PDF:', err);
        res.status(500).json({ error: 'Failed to delete PDF' });
    }
});

// Update PDF status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Unprocessed', 'OCR_Extracted', 'Verified', 'Archived'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        await req.db.query(`
            UPDATE pdf_documents
            SET status = $1,
                ocr_extraction_date = CASE 
                    WHEN $1 = 'OCR_Extracted' THEN CURRENT_TIMESTAMP 
                    ELSE ocr_extraction_date 
                END
            WHERE pdf_id = $2
        `, [status, req.params.id]);
        
        res.json({ message: 'Status updated', pdf_id: req.params.id, status });
    } catch (err) {
        console.error('Error updating PDF status:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
