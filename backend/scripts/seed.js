const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString: databaseUrl, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });
  await client.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      create table if not exists vendors (
        id serial primary key,
        name text not null,
        udm_vendor_code text unique not null,
        contact_email text,
        contact_phone text
      );

      create table if not exists suppliers (
        id serial primary key,
        name text not null,
        gstin text,
        udm_supplier_code text unique,
        address text
      );

      create table if not exists items (
        id serial primary key,
        qr_id text unique not null,
        lot_number text not null,
        item_type text not null,
        manufacture_date date,
        supply_date date,
        warranty_expiry date,
        vendor_id integer references vendors(id),
        supplier_id integer references suppliers(id)
      );

      create table if not exists inspections (
        id serial primary key,
        item_id integer references items(id) on delete cascade,
        tms_inspection_id text,
        status text check (status in ('passed','failed','pending')) not null,
        location text,
        inspected_at timestamp with time zone default now(),
        remarks text
      );

      create index if not exists idx_items_vendor on items(vendor_id);
      create index if not exists idx_inspections_item on inspections(item_id);
    `);

    // seed vendors
    const { rows: vRows } = await client.query(`
      insert into vendors (name, udm_vendor_code, contact_email, contact_phone)
      values
        ('RailTech Solutions', 'UDM-VND-RTS-001', 'contact@railtech.example', '+91-9876543210'),
        ('TrackFit Industries', 'UDM-VND-TFI-045', 'info@trackfit.example', '+91-9811122233'),
        ('SteelRail Corp', 'UDM-VND-SRC-089', 'sales@steelrail.example', '+91-9922334455')
      on conflict (udm_vendor_code) do update set name = excluded.name
      returning id, udm_vendor_code
    `);

    const vendorCodeToId = Object.fromEntries(vRows.map(v => [v.udm_vendor_code, v.id]));

    // seed suppliers
    const { rows: sRows } = await client.query(`
      insert into suppliers (name, gstin, udm_supplier_code, address)
      values
        ('DuraRail Systems', '29ABCDE1234F1Z5', 'UDM-SUP-DRS-156', 'Bengaluru, KA'),
        ('FlexiTrack Ltd', '07PQRSX9876Z9Y1', 'UDM-SUP-FTL-023', 'New Delhi'),
        ('MetroSteel Traders', '27LMNOP4321Q8Z7', 'UDM-SUP-MST-200', 'Mumbai, MH')
      on conflict (udm_supplier_code) do update set name = excluded.name
      returning id, udm_supplier_code
    `);

    const supplierCodeToId = Object.fromEntries(sRows.map(s => [s.udm_supplier_code, s.id]));

    // seed items
    const { rows: iRows } = await client.query(`
      insert into items (qr_id, lot_number, item_type, manufacture_date, supply_date, warranty_expiry, vendor_id, supplier_id)
      values
        ('QR-2024-001', 'LOT-RT-001', 'Elastic Rail Clip', '2023-06-15', '2023-07-01', '2025-07-01', $1, $2),
        ('QR-2024-002', 'LOT-TF-045', 'Rail Pad', '2023-08-20', '2023-09-05', '2024-09-05', $3, $4),
        ('QR-2024-003', 'LOT-SR-089', 'Concrete Sleeper', '2023-05-10', '2023-06-15', '2027-06-15', $5, $6)
      on conflict (qr_id) do update set lot_number = excluded.lot_number
      returning id, qr_id
    `, [
      vendorCodeToId['UDM-VND-RTS-001'], supplierCodeToId['UDM-SUP-DRS-156'],
      vendorCodeToId['UDM-VND-TFI-045'], supplierCodeToId['UDM-SUP-FTL-023'],
      vendorCodeToId['UDM-VND-SRC-089'], supplierCodeToId['UDM-SUP-MST-200'],
    ]);

    const qrToItemId = Object.fromEntries(iRows.map(i => [i.qr_id, i.id]));

    // add bulk items (~50) with majority passed
    const bulkValues = [];
    const bulkParams = [];
    let paramIdx = 1;
    for (let n = 4; n <= 53; n++) {
      const qr = `QR-2024-${String(n).padStart(3, '0')}`;
      const lot = `LOT-BULK-${String(n).padStart(3, '0')}`;
      const types = ['Elastic Rail Clip', 'Rail Pad', 'Rail Liner', 'Concrete Sleeper', 'Wooden Sleeper'];
      const itemType = types[n % types.length];
      const mDate = `2023-${String((n % 12) + 1).padStart(2, '0')}-${String((n % 28) + 1).padStart(2, '0')}`;
      const sDate = `2023-${String(((n + 1) % 12) + 1).padStart(2, '0')}-${String(((n + 5) % 28) + 1).padStart(2, '0')}`;
      const wDate = `2026-${String(((n + 1) % 12) + 1).padStart(2, '0')}-${String(((n + 5) % 28) + 1).padStart(2, '0')}`;
      const vIds = [vendorCodeToId['UDM-VND-RTS-001'], vendorCodeToId['UDM-VND-TFI-045'], vendorCodeToId['UDM-VND-SRC-089']];
      const sIds = [supplierCodeToId['UDM-SUP-DRS-156'], supplierCodeToId['UDM-SUP-FTL-023'], supplierCodeToId['UDM-SUP-MST-200']];
      const vendorId = vIds[n % vIds.length];
      const supplierId = sIds[n % sIds.length];
      bulkValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
      bulkParams.push(qr, lot, itemType, mDate, sDate, wDate, vendorId, supplierId);
    }
    if (bulkValues.length) {
      await client.query(
        `insert into items (qr_id, lot_number, item_type, manufacture_date, supply_date, warranty_expiry, vendor_id, supplier_id)
         values ${bulkValues.join(',')}
         on conflict (qr_id) do nothing`,
        bulkParams
      );
    }

    // refresh ids for inspections
    const allItems = await client.query(`select id, qr_id from items order by id asc`);

    // seed inspections with ~70% passed, 20% pending, 10% failed
    const statuses = (idx) => {
      const r = idx % 10; // deterministic
      if (r < 7) return 'passed';
      if (r < 9) return 'pending';
      return 'failed';
    };
    const insValues = [];
    const insParams = [];
    paramIdx = 1;
    allItems.rows.forEach((row, i) => {
      const st = statuses(i);
      const locs = ['Zone A - Track 1', 'Zone B - Track 3', 'Zone C - Track 2', 'Depot D', 'Yard E'];
      const loc = locs[i % locs.length];
      const tmsId = `TMS-INS-${String(i + 1).padStart(4, '0')}`;
      const ts = `2024-${String(((i % 12) + 1)).padStart(2, '0')}-${String(((i % 28) + 1)).padStart(2, '0')}T10:00:00+05:30`;
      insValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
      insParams.push(row.id, tmsId, st, loc, ts, `${st === 'failed' ? 'Requires attention' : 'OK'}`);
    });
    if (insValues.length) {
      await client.query(
        `insert into inspections (item_id, tms_inspection_id, status, location, inspected_at, remarks)
         values ${insValues.join(',')}
         on conflict do nothing`,
        insParams
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed failed', e);
    process.exit(1);
  } finally {
    await client.end();
  }
})(); 