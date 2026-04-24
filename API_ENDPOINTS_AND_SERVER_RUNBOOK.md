# API Endpoints and Server Runbook

## Purpose

This document lists the current API endpoints, including the routes that **read from and update the database**, plus the basic server commands and rebuild/restart steps.

---

## Base Runtime

- **App entrypoint:** `server.js`
- **Port:** `5007`
- **Framework:** Express + PostgreSQL
- **Database:** `vim_production`
- **DB user:** `vim_app`
- **Main route groups:**
  - `/api/pdfs`
  - `/api/verification`
  - `/api/inventory`
  - direct `/api/*` routes in `server.js`

---

## Read-Only API Endpoints

### Health and Info

- **GET `/health`**
  - Returns service status.
  - Example response:
    ```json
    { "status": "ok", "service": "VIM Production API", "version": "1.0.0" }
    ```

- **GET `/`**
  - Returns a JSON index of the main endpoints.

- **GET `/swagger.json`**
  - Serves the OpenAPI/Swagger specification.

### Elements and Alloys

- **GET `/api/elements`**
  - Returns all element rows from `elements`.

- **GET `/api/alloys`**
  - Returns active alloy rows, filtered to exclude element symbols.

- **GET `/api/alloys/:alloyId/specifications`**
  - Returns chemistry specifications for a single alloy.

### Inventory

- **GET `/api/inventory`**
  - Returns inventory lots.
  - Query params supported:
    - `status`
    - `alloy_id`

- **GET `/api/inventory/:lotId`**
  - Returns lot details, chemistry, and transaction history.

- **GET `/api/inventory/valuation`**
  - Returns the inventory valuation summary view.

### Heats

- **GET `/api/heats`**
  - Returns all heats.
  - Query param supported:
    - `status`

- **GET `/api/heats/:heatNumber`**
  - Returns full heat details, charge materials, chemistry, and compliance.

- **GET `/api/heats/:heatNumber/chemistry`**
  - Returns auto-calculated weighted-average chemistry.

- **GET `/api/heats/:heatNumber/compliance`**
  - Returns compliance rows for the heat.

- **GET `/api/heats/:heatNumber/check`**
  - Returns the output of the `check_heat_compliance()` function.

### Compliance

- **GET `/api/compliance/violations`**
  - Returns impurity violations from the compliance view.

### PDF Documents

Mounted through `app.use('/api/pdfs', pdfRoutes)`.

- **GET `/api/pdfs`**
  - Lists PDF documents.

- **GET `/api/pdfs/:id`**
  - Returns one PDF metadata record.

- **GET `/api/pdfs/:id/pages`**
  - Returns page metadata and OCR previews.

- **GET `/api/pdfs/:id/page/:pageNum`**
  - Returns full OCR data for one page.

- **GET `/api/pdfs/:id/file`**
  - Streams the PDF file back to the browser.

- **GET `/api/pdfs/:id/page/:pageNum/image`**
  - Returns the rendered page image.

- **GET `/api/pdfs/:id/compare/:alloyId`**
  - Compares PDF OCR pages against database specs, test methods, and powder sizes.

### Verification

Mounted through `app.use('/api/verification', verificationRoutes)`.

- **GET `/api/verification/pending`**
  - Returns alloys that still need verification.

- **GET `/api/verification/alloy/:alloyId`**
  - Returns one alloy’s verification bundle:
    - alloy metadata
    - specifications
    - test methods
    - powder sizes
    - physical properties
    - audit history

- **GET `/api/verification/audit-log`**
  - Returns verification audit records.

- **GET `/api/verification/summary`**
  - Returns extraction and verification summary data.

### Inventory Subroutes

Mounted through `app.use('/api/inventory', inventoryRoutes)`.

- **GET `/api/inventory/available`**
  - Returns available material.

- **GET `/api/inventory/by-alloy/:alloyId`**
  - Returns inventory grouped by material type.

- **GET `/api/inventory/compatible/:alloyId`**
  - Returns target alloy specs and candidate materials.

- **GET `/api/inventory/summary`**
  - Returns inventory totals.

- **GET `/api/inventory/valuation`**
  - Returns inventory valuation summary.

---

## API Endpoints That Update the Database

Yes — there are several routes that **write back to PostgreSQL**.

### Direct Admin Cell Update

- **PATCH `/api/admin/tables/:tableName`**
  - Updates a single cell in any table.
  - Body:
    ```json
    {
      "primaryKey": "spec_id",
      "primaryValue": 1,
      "column": "is_verified",
      "value": true
    }
    ```
  - This route is the most direct “update the db through the API” endpoint.

### Create Heat and Charge Materials

- **POST `/api/heats`**
  - Inserts a new heat into `heats`.
  - Also inserts `charge_materials` rows inside a transaction.
  - Body example:
    ```json
    {
      "heat_number": "HEAT-F75-003",
      "target_alloy_id": "F75",
      "target_weight": 450,
      "scheduled_date": "2025-01-20",
      "operator": "John Smith",
      "furnace_id": "VIM-1",
      "charge_materials": [
        { "lot_id": "LOT-F75-001", "weight_added": 350 },
        { "lot_id": "LOT-CO-001", "weight_added": 75 }
      ]
    }
    ```

### QA Validation Endpoint

- **POST `/api/qa/validate`**
  - Reads from `heats` and `alloy_specifications`.
  - Does not write production records, but it performs database lookups and returns validation results.

### PDF Upload and Metadata Write

Mounted through `/api/pdfs`.

- **POST `/api/pdfs/upload`**
  - Uploads a PDF file.
  - Inserts a row into `pdf_documents`.
  - Stores file metadata, hash, type, and notes.

- **PUT `/api/pdfs/:id/status`**
  - Updates PDF status in `pdf_documents`.
  - Valid statuses:
    - `Unprocessed`
    - `OCR_Extracted`
    - `Verified`
    - `Archived`

- **DELETE `/api/pdfs/:id`**
  - Deletes or archives a PDF record depending on its status.

### Verification Writes

Mounted through `/api/verification`.

- **POST `/api/verification/element`**
  - Marks an alloy specification as verified.
  - Writes to `alloy_specifications` and `data_verification_audit`.

- **POST `/api/verification/test-method`**
  - Marks a test method as verified.
  - Writes to `test_method_requirements` and `data_verification_audit`.

- **POST `/api/verification/powder-size`**
  - Marks a powder size spec as verified.
  - Writes to `powder_size_specifications`.

- **POST `/api/verification/bulk`**
  - Bulk-verifies all specs for an alloy.
  - Updates `alloy_specifications`, `alloys`, and `data_verification_audit`.

### Inventory Writes

Mounted through `/api/inventory`.

- **POST `/api/inventory/allocate`**
  - Attempts to allocate material from a lot.
  - Uses the database function `allocate_material(lot_id, amount_lbs)` if it exists.
  - Intended to update inventory state.

---

## Database-Update Flow

The app updates the database in two ways:

1. **Direct route-based writes**
   - Example: `PATCH /api/admin/tables/:tableName`
   - Example: `POST /api/heats`
   - Example: `POST /api/verification/element`

2. **Database functions and triggers**
   - Example: `check_heat_compliance()` for validation
   - Example: `update_lot_weight()` trigger on inventory transactions
   - Example: `update_alloy_verification_status()` trigger on spec verification

---

## Basic Server Commands

### Local Development

From the project directory:

```bash
npm install
npm run dev
```

### Production Start

```bash
npm start
```

### PM2 Management

```bash
pm2 list
pm2 logs vim-production-api
pm2 restart vim-production-api
pm2 stop vim-production-api
pm2 monit
```

### Nginx Management

```bash
sudo nginx -t
sudo systemctl reload nginx
cat /etc/nginx/sites-enabled/david.ion-arc.online
```

### PostgreSQL Access

```bash
sudo -u postgres psql vim_production
```

If you need a password prompt, the current documented DB user is `vim_app`.

---

## Rebuild / Redeploy Steps

This project does **not** appear to require a compile step. It is a Node/Express server.

### Standard Rebuild Flow

1. **Pull or edit the code**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Restart the Node process**
   ```bash
   pm2 restart vim-production-api
   ```
4. **Reload Nginx if proxy config changed**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```
5. **Verify health**
   ```bash
   curl https://david.ion-arc.online/health
   ```
6. **Verify endpoints**
   ```bash
   curl https://david.ion-arc.online/api/elements
   curl https://david.ion-arc.online/api/alloys
   curl https://david.ion-arc.online/api/heats
   ```

### If You Changed Static Docs or Swagger

- Make sure `public/` assets are present.
- Make sure `swagger.json` exists in the server root.
- Restart PM2 after the file changes.

---

## Useful Verification Commands

```bash
curl https://david.ion-arc.online/
curl https://david.ion-arc.online/health
curl https://david.ion-arc.online/swagger.json
curl https://david.ion-arc.online/api/alloys/F75/specifications
curl https://david.ion-arc.online/api/inventory/valuation
curl https://david.ion-arc.online/api/heats/HEAT-F75-001/chemistry
```

---

## Notes and Cautions

- The admin table update route is powerful and should be used carefully.
- Some routes assume tables/views/functions already exist.
- A few endpoints gracefully return empty arrays if a view or function is missing.
- The source of truth is PostgreSQL, not JSON files or NocoDB.

---

## Quick Summary

If you want the simplest answer:

- **Yes**, the DB can be updated through the API.
- The key write endpoint is **`PATCH /api/admin/tables/:tableName`**.
- Other write endpoints include **PDF upload/status**, **verification routes**, **heat creation**, and **inventory allocation**.
- For rebuilds, use **`npm install`**, **`pm2 restart vim-production-api`**, and **`sudo systemctl reload nginx`** if needed.
