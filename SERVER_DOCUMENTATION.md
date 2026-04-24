# VIM Production Server Documentation

Complete reference for server access, database structure, file organization, and framework details.

---

## Server Access

### SSH Connection

**Server Host:** `35.227.26.114`
**SSH User:** `max`
**SSH Key:** `/Users/christopheramaya/.ssh/arc_setup_ed25519`

**Connection Command:**
```bash
ssh -i /Users/christopheramaya/.ssh/arc_setup_ed25519 max@35.227.26.114
```

**Quick SSH Commands:**
```bash
# Restart API
ssh max@35.227.26.114 "pm2 restart vim-production-api"

# View logs
ssh max@35.227.26.114 "pm2 logs vim-production-api --lines 50"

# Check nginx
ssh max@35.227.26.114 "sudo nginx -t"

# Reload nginx
ssh max@35.227.26.114 "sudo systemctl reload nginx"

# Check database
ssh max@35.227.26.114 "PGPASSWORD=vim_secure_2026 psql -h localhost -U vim_app -d vim_production -c 'SELECT COUNT(*) FROM inventory_lots;'"
```

---

## Database Configuration

### PostgreSQL Connection

**Database Name:** `vim_production`
**Database User:** `vim_app`
**Database Password:** `vim_secure_2026`
**Port:** `5432`
**Host:** `localhost` (when connecting from server)

**Connection from Server:**
```bash
sudo -u postgres psql vim_production
```

**Connection with Environment Variables:**
```bash
PGPASSWORD=vim_secure_2026 psql -h localhost -U vim_app -d vim_production
```

**Connection from Application (Environment Variables):**
```bash
DB_HOST=localhost
DB_NAME=vim_production
DB_USER=vim_app
DB_PASSWORD=vim_secure_2026
DB_PORT=5432
```

### Database Schema

**Core Tables:**
- `elements` - Chemical elements
- `alloys` - Alloy definitions
- `alloy_specifications` - Chemistry specifications per alloy
- `inventory_lots` - Inventory lot tracking
- `elemental_analysis` - Chemistry analysis per lot
- `inventory_transactions` - Transaction history
- `heats` - Production heat records
- `charge_materials` - Heat charge materials
- `pdf_documents` - PDF file metadata
- `pdf_page_images` - OCR page images and text
- `ptp_page_texts` - Verbatim PTP page text
- `ptp_text_anchors` - Source traceability anchors

**Views:**
- `view_heat_chemistry` - Auto-calculated weighted average chemistry
- `view_heat_compliance` - Spec compliance checking
- `view_inventory_valuation` - Inventory valuation summary

**Functions:**
- `check_heat_compliance()` - Compliance validation function

**Triggers:**
- Auto-updates for timestamps
- Chemistry calculation triggers

### Database Access from Local Workstation

**Note:** The database is not directly accessible from the local workstation due to firewall/network restrictions. Database operations must be performed:
1. From the server via SSH
2. Through the API endpoints
3. Via SSH tunnel if needed

---

## File Structure

### Server Application Directory

**Path:** `/srv/apps/vim-production/`

**Contents:**
```
/srv/apps/vim-production/
├── server.js                    # Express API server
├── package.json                # Dependencies
├── node_modules/               # Installed packages
├── swagger.json                # API documentation
├── public/                     # Static files
│   ├── admin.html             # React admin panel
│   ├── index.html             # Swagger UI
│   ├── spec-viewer.html       # Specification viewer
│   ├── charge-planner.html    # Charge planning interface
│   └── test-dashboard.html    # Testing dashboard
└── routes/                     # API route modules
    ├── pdf-routes.js          # PDF document routes
    ├── verification-routes.js # Verification endpoints
    └── inventory-routes.js    # Inventory management
```

### PDF Storage

**Path:** `/var/www/vim/pdfs/`

**Structure:**
```
/var/www/vim/pdfs/
├── uploaded/                   # User-uploaded PDFs
├── ptp/                       # PTP (Powder Test Pack) documents
│   ├── PTP1.pdf
│   ├── PTP2.pdf
│   └── ...
└── images/                     # Extracted page images
    └── pdf_images/
```

### OCR Cache

**Path:** `/var/www/vim/ocr_cache/`

Stores OCR extraction results and page images for performance.

---

## Framework Details

### Application Framework

**Framework:** Express.js
**Node.js Version:** Latest LTS
**Port:** `5007` (internal), proxied via Nginx
**Process Manager:** PM2
**PM2 Process Name:** `vim-production-api`

### PM2 Management

**List Processes:**
```bash
pm2 list
```

**View Logs:**
```bash
pm2 logs vim-production-api
```

**Restart API:**
```bash
pm2 restart vim-production-api
```

**Stop API:**
```bash
pm2 stop vim-production-api
```

**Monitor:**
```bash
pm2 monit
```

### Nginx Configuration

**Config File:** `/etc/nginx/sites-enabled/arc-apps`

**Domain:** `vim.ion-arc.online` (when DNS is configured)
**Current Domain:** `david.ion-arc.online`

**Test Configuration:**
```bash
sudo nginx -t
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**View Config:**
```bash
cat /etc/nginx/sites-enabled/arc-apps
```

### API Endpoints

**Base URL:** `https://david.ion-arc.online` (current)
**Future URL:** `https://vim.ion-arc.online` (when DNS configured)

**Health Check:**
- `GET /health` - Service status

**PDF Routes:**
- `GET /api/pdfs` - List all PDFs
- `GET /api/pdfs/:id` - Get PDF metadata
- `GET /api/pdfs/:id/pages` - List pages
- `GET /api/pdfs/:id/page/:pageNum` - Get page with OCR
- `GET /api/pdfs/:id/page/:pageNum/trace` - Get page with source traceability
- `GET /api/pdfs/:id/file` - Stream PDF file
- `GET /api/pdfs/:id/page/:pageNum/image` - Get page image
- `GET /api/pdfs/:id/compare/:alloyId` - Compare PDF to database specs

**Inventory Routes:**
- `GET /api/inventory` - List inventory lots
- `GET /api/inventory/:lotId` - Get lot details
- `GET /api/inventory/valuation` - Inventory valuation

**Heats Routes:**
- `GET /api/heats` - List heats
- `GET /api/heats/:heatNumber` - Get heat details
- `GET /api/heats/:heatNumber/chemistry` - Auto-calculated chemistry
- `GET /api/heats/:heatNumber/compliance` - Compliance check
- `POST /api/heats` - Create new heat

**Elements & Alloys:**
- `GET /api/elements` - List all elements
- `GET /api/alloys` - List all active alloys
- `GET /api/alloys/:alloyId/specifications` - Get alloy specs

**Compliance:**
- `GET /api/compliance/violations` - Find impurity violations

---

## Environment Variables

### Server Environment Variables

The application supports the following environment variables for database configuration:

```bash
DB_HOST=localhost              # Database host (default: localhost)
DB_NAME=vim_production        # Database name (default: vim_production)
DB_USER=vim_app              # Database user (default: vim_app)
DB_PASSWORD=vim_secure_2026  # Database password (default: vim_secure_2026)
DB_PORT=5432                 # Database port (default: 5432)
PORT=5007                    # API server port (default: 5007)
```

### Setting Environment Variables

**For PM2 Process:**
```bash
# Edit ecosystem file or set via PM2
pm2 restart vim-production-api --update-env
```

**For Direct Execution:**
```bash
DB_HOST=localhost DB_NAME=vim_production DB_USER=vim_app DB_PASSWORD=vim_secure_2026 DB_PORT=5432 node server.js
```

---

## Deployment

### Deploy Code Changes

```bash
# From local workstation
rsync -avz --exclude=node_modules --exclude=.git \
  /Users/christopheramaya/Downloads/untitled\ folder\ 6/ \
  max@35.227.26.114:/srv/apps/vim-production/

# Install dependencies on server
ssh max@35.227.26.114 'cd /srv/apps/vim-production && npm install'

# Restart PM2
ssh max@35.227.26.114 'pm2 restart vim-production-api'
```

### Database Schema Updates

```bash
# SSH to server
ssh -i /Users/christopheramaya/.ssh/arc_setup_ed25519 max@35.227.26.114

# Connect to database
PGPASSWORD=vim_secure_2026 psql -h localhost -U vim_app -d vim_production

# Run schema file
\i /path/to/vim_schema.sql
```

---

## Troubleshooting

### Common Issues

**API Not Responding:**
```bash
# Check PM2 status
ssh max@35.227.26.114 "pm2 status"

# Check logs
ssh max@35.227.26.114 "pm2 logs vim-production-api --lines 100"

# Restart API
ssh max@35.227.26.114 "pm2 restart vim-production-api"
```

**Database Connection Issues:**
```bash
# Check PostgreSQL is running
ssh max@35.227.26.114 "sudo systemctl status postgresql"

# Check database exists
ssh max@35.227.26.114 "PGPASSWORD=vim_secure_2026 psql -h localhost -U vim_app -d vim_production -c '\l'"

# Check connection from server
ssh max@35.227.26.114 "PGPASSWORD=vim_secure_2026 psql -h localhost -U vim_app -d vim_production -c 'SELECT NOW();'"
```

**Nginx Issues:**
```bash
# Test nginx config
ssh max@35.227.26.114 "sudo nginx -t"

# Reload nginx
ssh max@35.227.26.114 "sudo systemctl reload nginx"

# Check nginx status
ssh max@35.227.26.114 "sudo systemctl status nginx"
```

---

## Security Notes

### Database Credentials

- **Production Password:** `vim_secure_2026`
- **Never expose in public repositories**
- **Use environment variables in production**
- **Rotate passwords regularly**

### SSH Access

- **Key-based authentication only**
- **Key location:** `/Users/christopheramaya/.ssh/arc_setup_ed25519`
- **User:** `max`
- **Passwordless sudo enabled for max on server**

### API Security

- **Currently no authentication on API endpoints**
- **Consider adding API keys or JWT tokens for production**
- **Nginx provides SSL termination**

---

## Related Documentation

- **API Endpoints:** `API_ENDPOINTS_AND_SERVER_RUNBOOK.md`
- **Database Schema:** `VIM_COMPREHENSIVE_DATABASE_SCHEMA.md`
- **PTP Import:** `PTP_COMPLETE_MANUAL_EXTRACTION.md`
- **Deployment:** `DEPLOYMENT_COMPLETE.md`
- **Admin Panel:** `ADMIN_DEPLOYED.md`

---

## Quick Reference

**SSH Login:**
```bash
ssh -i /Users/christopheramaya/.ssh/arc_setup_ed25519 max@35.227.26.114
```

**Database Login (from server):**
```bash
PGPASSWORD=vim_secure_2026 psql -h localhost -U vim_app -d vim_production
```

**Restart API:**
```bash
ssh max@35.227.26.114 "pm2 restart vim-production-api"
```

**View Logs:**
```bash
ssh max@35.227.26.114 "pm2 logs vim-production-api --lines 50"
```

**Deploy Code:**
```bash
rsync -avz --exclude=node_modules --exclude=.git \
  /Users/christopheramaya/Downloads/untitled\ folder\ 6/ \
  max@35.227.26.114:/srv/apps/vim-production/
```

---

## Version History

- **2026-04-24** - Initial comprehensive documentation created
- **2026-04-24** - Added PTP traceability schema and environment variable support
