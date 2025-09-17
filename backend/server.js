const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { query } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://10.3.104.75:8080', 'http://127.0.0.1:8080', 'https://amishmathur1.github.io'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Generate PDF with item details
app.post('/api/generate-pdf', async (req, res) => {
    try {
        const {
            vendorName,
            lotNumber,
            itemType,
            manufactureDate,
            supplyDate,
            warrantyPeriod
        } = req.body;

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `railway-item-${timestamp}.pdf`;
        const filepath = path.join(uploadsDir, filename);

        // Pipe PDF to file
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Add content to PDF
        doc.fontSize(24).text('Railway Track Fitting Certificate', { align: 'center' });
        doc.moveDown();

        // Section: Item Details (clean, professional)
        doc.fontSize(14).text('Item Details', { underline: true });
        doc.moveDown(0.5);
        const field = (label, value) => {
            doc.fontSize(11).fillColor('#555').text(label);
            doc.fontSize(12).fillColor('#000').text(value || '-', { width: 480 });
            doc.moveDown(0.25);
        };
        field('Vendor Name', vendorName);
        field('Lot Number', lotNumber);
        field('Item Type', itemType);

        if (manufactureDate) {
            field('Manufacture Date', new Date(manufactureDate).toLocaleDateString());
        }

        if (supplyDate) {
            field('Supply Date', new Date(supplyDate).toLocaleDateString());
        }

        if (warrantyPeriod) {
            field('Warranty Period', warrantyPeriod);
        }

        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();
        doc.text(`Document ID: ${timestamp}`);

        // Finalize PDF
        doc.end();

        // Wait for file to be written
        stream.on('finish', () => {
            // Generate the correct URL based on environment
            const derived = `http://${req.headers.host}`;
            const baseUrl = process.env.PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production'
                ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME || req.headers.host}`
                : derived);

            res.json({
                success: true,
                filename: filename,
                filepath: `/uploads/${filename}`,
                timestamp: timestamp,
                fullUrl: `${baseUrl}/uploads/${filename}`
            });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate QR code that links to the PDF
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { pdfUrl } = req.body;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(pdfUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.json({
            success: true,
            qrCode: qrDataUrl,
            pdfUrl: pdfUrl
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Inventory endpoint (fetch items with vendor, latest inspection)
app.get('/api/inventory', async (req, res) => {
    try {
        const result = await query(`
      with latest_inspection as (
        select distinct on (item_id)
          item_id, status, location, inspected_at, remarks
        from inspections
        order by item_id, inspected_at desc
      )
      select
        i.qr_id,
        v.name as vendor,
        i.lot_number,
        i.item_type,
        to_char(i.manufacture_date, 'YYYY-MM-DD') as manufacture_date,
        to_char(i.supply_date, 'YYYY-MM-DD') as supply_date,
        to_char(i.warranty_expiry, 'YYYY-MM-DD') as warranty_expiry,
        coalesce(li.status, 'pending') as inspection_status,
        coalesce(li.location, '') as location
      from items i
      left join vendors v on v.id = i.vendor_id
      left join latest_inspection li on li.item_id = i.id
      order by i.qr_id asc;
    `);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Per-item PDF generation
app.post('/api/items/:qrId/pdf', async (req, res) => {
    try {
        const { qrId } = req.params;
        const { rows } = await query(`
      with latest_inspection as (
        select distinct on (item_id) item_id, status, location, inspected_at, remarks
        from inspections
        order by item_id, inspected_at desc
      )
      select i.*, v.name as vendor, s.name as supplier,
             coalesce(li.status,'pending') as inspection_status,
             coalesce(li.location,'') as location,
             li.inspected_at, li.remarks
      from items i
      left join vendors v on v.id = i.vendor_id
      left join suppliers s on s.id = i.supplier_id
      left join latest_inspection li on li.item_id = i.id
      where i.qr_id = $1
      limit 1
    `, [qrId]);

        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
        const item = rows[0];

        const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 50, right: 50 } });
        const timestamp = Date.now();
        const filename = `item-${qrId}-${timestamp}.pdf`;
        const filepath = path.join(uploadsDir, filename);
        const out = fs.createWriteStream(filepath);
        doc.pipe(out);

        // Header
        doc.fontSize(20).text('Railway Track Fitting - Inspection Certificate', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#666').text(`Document ID: ${timestamp}    Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000');

        // Item details section (no overlap, label/value on separate lines)
        doc.fontSize(14).text('Item Details', { underline: true });
        doc.moveDown(0.5);
        const fieldLine = (label, value) => {
            doc.fontSize(11).fillColor('#555').text(label);
            doc.fontSize(12).fillColor('#000').text(String(value || '-'), { width: 480 });
            doc.moveDown(0.25);
        };
        fieldLine('QR ID', item.qr_id);
        fieldLine('Item Type', item.item_type);
        fieldLine('Lot Number', item.lot_number);
        fieldLine('Vendor', item.vendor);
        fieldLine('Supplier', item.supplier);
        fieldLine('Manufacture Date', item.manufacture_date ? new Date(item.manufacture_date).toLocaleDateString() : '-');
        fieldLine('Supply Date', item.supply_date ? new Date(item.supply_date).toLocaleDateString() : '-');
        fieldLine('Warranty Expiry', item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString() : '-');

        // Inspection section
        doc.moveDown();
        doc.fontSize(14).text('Inspection Summary', { underline: true });
        doc.moveDown(0.5);
        fieldLine('Status', item.inspection_status?.toUpperCase());
        fieldLine('Location', item.location);
        fieldLine('Inspected At', item.inspected_at ? new Date(item.inspected_at).toLocaleDateString() + ' ' + new Date(item.inspected_at).toLocaleTimeString() : '-');
        fieldLine('Remarks', item.remarks || '-');

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#666').text('This document is system-generated and valid without signature.', { align: 'center' });

        doc.end();
        out.on('finish', () => {
            const baseUrl = `http://localhost:${PORT}`;
            res.json({ success: true, filename, url: `${baseUrl}/uploads/${filename}` });
        });
    } catch (e) {
        console.error('Error generating item PDF', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Per-item QR linking to its PDF
app.post('/api/items/:qrId/qr', async (req, res) => {
    try {
        const { qrId } = req.params;

        // Load item and latest inspection
        const { rows } = await query(`
      with latest_inspection as (
        select distinct on (item_id) item_id, status, location, inspected_at, remarks
        from inspections
        order by item_id, inspected_at desc
      )
      select i.*, v.name as vendor, s.name as supplier,
             coalesce(li.status,'pending') as inspection_status,
             coalesce(li.location,'') as location,
             li.inspected_at, li.remarks
      from items i
      left join vendors v on v.id = i.vendor_id
      left join suppliers s on s.id = i.supplier_id
      left join latest_inspection li on li.item_id = i.id
      where i.qr_id = $1
      limit 1
    `, [qrId]);

        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
        const item = rows[0];

        // Generate the PDF (same as /pdf)
        const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 50, right: 50 } });
        const timestamp = Date.now();
        const filename = `item-${qrId}-${timestamp}.pdf`;
        const filepath = path.join(uploadsDir, filename);
        const out = fs.createWriteStream(filepath);
        doc.pipe(out);

        doc.fontSize(20).text('Railway Track Fitting - Inspection Certificate', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#666').text(`Document ID: ${timestamp}    Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();
        doc.fillColor('#000');

        doc.fontSize(14).text('Item Details', { underline: true });
        doc.moveDown(0.5);
        const left = 50; const col = 260;
        function row(label, value, y) {
            doc.fontSize(11).fillColor('#555').text(label, left, y);
            doc.fontSize(11).fillColor('#000').text(String(value || ''), col, y);
        }
        let y = doc.y;
        row('QR ID', item.qr_id, y); y += 16;
        row('Item Type', item.item_type, y); y += 16;
        row('Lot Number', item.lot_number, y); y += 16;
        row('Vendor', item.vendor, y); y += 16;
        row('Supplier', item.supplier, y); y += 16;
        row('Manufacture Date', item.manufacture_date ? new Date(item.manufacture_date).toLocaleDateString() : '-', y); y += 16;
        row('Supply Date', item.supply_date ? new Date(item.supply_date).toLocaleDateString() : '-', y); y += 16;
        row('Warranty Expiry', item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString() : '-', y); y += 24;

        doc.moveDown();
        doc.fontSize(14).text('Inspection Summary', { underline: true });
        doc.moveDown(0.5);
        y = doc.y;
        row('Status', item.inspection_status?.toUpperCase(), y); y += 16;
        row('Location', item.location, y); y += 16;
        row('Inspected At', item.inspected_at ? new Date(item.inspected_at).toLocaleDateString() + ' ' + new Date(item.inspected_at).toLocaleTimeString() : '-', y); y += 16;
        row('Remarks', item.remarks || '-', y); y += 24;

        doc.moveDown(2);
        doc.fontSize(10).fillColor('#666').text('This document is system-generated and valid without signature.', { align: 'center' });

        doc.end();

        out.on('finish', async () => {
            const derived = `http://${req.headers.host}`;
            const baseUrl = process.env.PUBLIC_BASE_URL || derived;
            const pdfUrl = `${baseUrl}/uploads/${filename}`;
            const dataUrl = await QRCode.toDataURL(pdfUrl, { width: 320, margin: 2 });
            res.json({ success: true, pdfUrl, qrCode: dataUrl });
        });
    } catch (e) {
        console.error('Error generating item QR', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        host: HOST
    });
});

// Root endpoint for Render health checks
app.get('/', (req, res) => {
    res.json({
        message: 'RailTrack Backend API is running',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Backend server running on ${HOST}:${PORT}`);
    console.log(`Uploads directory: ${uploadsDir}`);
}); 