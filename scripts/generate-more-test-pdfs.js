import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

function createInvoice(filename, shipper, importer, invNo, invDate, items, currency, totalVal, incoterm, portLoad, portDisch, blNo) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const outputFilePath = path.join(process.cwd(), filename);
  doc.pipe(fs.createWriteStream(outputFilePath));

  // Helper for page headers
  function drawHeader(title, pageNum) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0C2461').text('GLOBAL COMMERCIAL LOGISTICS', 40, 30);
    doc.fontSize(8).font('Helvetica').fillColor('#888888').text('Dubai Customs Clearance Sandbox Test', 40, 42);
    doc.fontSize(8).text(`Page ${pageNum}`, 500, 30);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#111111').text(title.toUpperCase(), 40, 60);
    doc.moveTo(40, 80).lineTo(550, 80).strokeColor('#EBEBEB').lineWidth(1).stroke();
  }

  function drawFooter() {
    doc.moveTo(40, 780).lineTo(550, 780).strokeColor('#F1F5F9').lineWidth(1).stroke();
    doc.fontSize(7).font('Helvetica').fillColor('#888888').text('This document was compiled for AI extraction testing purposes. All figures are mock data.', 40, 790);
  }

  // Page 1: Commercial Invoice
  drawHeader('Commercial Invoice (Consignment Details)', 1);

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('EXPORTER / SHIPPER:', 40, 100);
  doc.font('Helvetica').fillColor('#555555').text(shipper, 40, 115, { lineGap: 3 });

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('IMPORTER / CONSIGNEE:', 300, 100);
  doc.font('Helvetica').fillColor('#555555').text(importer, 300, 115, { lineGap: 3 });

  doc.moveTo(40, 185).lineTo(550, 185).strokeColor('#F1F5F9').stroke();

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('INVOICE METADATA:', 40, 200);

  doc.fontSize(9).font('Helvetica-Bold').text('Invoice Number:', 40, 225).font('Helvetica').text(invNo, 150, 225);
  doc.font('Helvetica-Bold').text('Invoice Date:', 40, 245).font('Helvetica').text(invDate, 150, 245);
  doc.font('Helvetica-Bold').text('Incoterm:', 40, 265).font('Helvetica').text(incoterm, 150, 265);
  doc.font('Helvetica-Bold').text('Port of Loading:', 40, 285).font('Helvetica').text(portLoad, 150, 285);
  doc.font('Helvetica-Bold').text('Port of Discharge:', 40, 305).font('Helvetica').text(portDisch, 150, 305);
  doc.font('Helvetica-Bold').text('Carrier / B/L No:', 40, 325).font('Helvetica').text(blNo, 150, 325);

  doc.moveTo(40, 355).lineTo(550, 355).strokeColor('#F1F5F9').stroke();

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('VALUATION & CHARGES SUMMARY:', 40, 370);
  doc.fontSize(9).font('Helvetica-Bold').text('Currency:', 40, 395).font('Helvetica').text(currency, 150, 395);
  doc.font('Helvetica-Bold').text('Goods FOB Value:', 40, 415).font('Helvetica').text(`${currency} ${totalVal - 1500}`, 150, 415);
  doc.font('Helvetica-Bold').text('Freight Charges:', 40, 435).font('Helvetica').text(`${currency} 1350.00`, 150, 435);
  doc.font('Helvetica-Bold').text('Insurance Charges:', 40, 455).font('Helvetica').text(`${currency} 150.00`, 150, 455);
  doc.font('Helvetica-Bold').fillColor('#0C2461').text('TOTAL INVOICE VALUE:', 40, 480).font('Helvetica-Bold').text(`${currency} ${totalVal}`, 150, 480);

  drawFooter();

  // Page 2: Line Items Specifications
  doc.addPage();
  drawHeader('Commercial Invoice (Line Items Specification)', 2);

  let currentY = 100;
  items.forEach((item, idx) => {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text(`ITEM ${idx + 1} OF ${items.length}`, 40, currentY);
    doc.fontSize(9).font('Helvetica-Bold').text('HS Code:', 40, currentY + 20).font('Helvetica').text(item.hs_code, 140, currentY + 20);
    doc.font('Helvetica-Bold').text('Description:', 40, currentY + 40).font('Helvetica').text(item.goods_description, 140, currentY + 40);
    doc.font('Helvetica-Bold').text('Quantity:', 40, currentY + 60).font('Helvetica').text(`${item.quantity} ${item.unit_of_quantity}`, 140, currentY + 60);
    doc.font('Helvetica-Bold').text('Unit Price:', 40, currentY + 80).font('Helvetica').text(`${currency} ${item.unit_price}`, 140, currentY + 80);
    doc.font('Helvetica-Bold').text('Total Value:', 40, currentY + 100).font('Helvetica').text(`${currency} ${item.total_value}`, 140, currentY + 100);

    doc.moveTo(40, currentY + 125).lineTo(550, currentY + 125).strokeColor('#EBEBEB').stroke();
    currentY += 140;
  });

  drawFooter();
  doc.end();
  console.log(`✅ Created test PDF: ${filename}`);
}

// Generate Invoice 1: Shenzhen Components
createInvoice(
  'invoice_shenzhen_components.pdf',
  'SHENZHEN ELECTRONICS CO\nBlock 4, Nanshan Science Park\nShenzhen, China (CN)',
  'IMEX GENERAL TRADING LLC\nCustoms Code: AE-3948572\nAl Quoz 3, Dubai, UAE (AE)',
  'INV-88711-DXB',
  '2026-07-01',
  [
    {
      hs_code: '8541.10.00',
      goods_description: 'Semiconductor Diodes / Electronic Micro-components',
      quantity: 5000,
      unit_of_quantity: 'PCS',
      unit_price: 1.20,
      total_value: 6000.00
    },
    {
      hs_code: '8542.31.00',
      goods_description: 'Processor Microchips / Electronic Components',
      quantity: 200,
      unit_of_quantity: 'PCS',
      unit_price: 25.00,
      total_value: 5000.00
    }
  ],
  'USD',
  12500.00,
  'CIF',
  'CNSHA',
  'AEJEA',
  'OOLU778901'
);

// Generate Invoice 2: Germany Machinery
createInvoice(
  'invoice_germany_machinery.pdf',
  'MUNICH MACHINERY GMBH\nIndustriestrasse 14\nMunich, Germany (DE)',
  'IMEX GENERAL TRADING LLC\nCustoms Code: AE-3948572\nAl Quoz 3, Dubai, UAE (AE)',
  'INV-33402-DXB',
  '2026-07-02',
  [
    {
      hs_code: '8409.91.90',
      goods_description: 'Automotive Engine Shafts / Heavy Gear Components',
      quantity: 50,
      unit_of_quantity: 'PCS',
      unit_price: 380.00,
      total_value: 19000.00
    }
  ],
  'EUR',
  20500.00,
  'CIF',
  'DEHAM',
  'AEJEA',
  'OOLU554032'
);
