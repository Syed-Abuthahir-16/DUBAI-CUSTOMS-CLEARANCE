import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const doc = new PDFDocument({ size: 'A4', margin: 40 });
const outputFilePath = path.join(process.cwd(), 'demo_customs_pack_v2.pdf');
doc.pipe(fs.createWriteStream(outputFilePath));

function drawHeader(title, pageNum) {
  // Title & Brand
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#FF5A2B').text('MIRSAL AI LOGISTICS', 40, 30);
  doc.fontSize(8).font('Helvetica').fillColor('#888888').text('Customs Clearance Sandbox Test File', 40, 42);
  doc.fontSize(8).text(`Page ${pageNum} of 8`, 500, 30);
  
  // Section Title
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#111111').text(title.toUpperCase(), 40, 60);
  
  // Separation bar
  doc.moveTo(40, 80).lineTo(550, 80).strokeColor('#EBEBEB').lineWidth(1).stroke();
}

function drawFooter() {
  doc.moveTo(40, 780).lineTo(550, 780).strokeColor('#F1F5F9').lineWidth(1).stroke();
  doc.fontSize(7).font('Helvetica').fillColor('#888888').text('This document was dynamically compiled for AI extraction testing purposes. All figures are mock data.', 40, 790);
}

// ----------------- PAGE 1: COMMERCIAL INVOICE HEADER -----------------
drawHeader('Commercial Invoice (Consignment Details)', 1);

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('EXPORTER / SHIPPER:', 40, 100);
doc.font('Helvetica').fillColor('#555555').text('ASIA GLOBAL TRADING LTD\nSuite 809, Tech Plaza\nFutian District, Shenzhen\nChina (CN)', 40, 115, { lineGap: 3 });

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('IMPORTER / CONSIGNEE:', 300, 100);
doc.font('Helvetica').fillColor('#555555').text('IMEX GENERAL TRADING LLC\nCustoms Code: AE-3948572\nWarehouse 12, Al Quoz Industrial 3\nDubai, United Arab Emirates (AE)', 300, 115, { lineGap: 3 });

doc.moveTo(40, 185).lineTo(550, 185).strokeColor('#F1F5F9').stroke();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('INVOICE METADATA:', 40, 200);

doc.fontSize(9).font('Helvetica-Bold').text('Invoice Number:', 40, 225).font('Helvetica').text('INV-99281-DXB', 150, 225);
doc.font('Helvetica-Bold').text('Invoice Date:', 40, 245).font('Helvetica').text('2026-06-30', 150, 245);
doc.font('Helvetica-Bold').text('Incoterm:', 40, 265).font('Helvetica').text('FOB (Free On Board)', 150, 265);
doc.font('Helvetica-Bold').text('Port of Loading:', 40, 285).font('Helvetica').text('CNSHA (Shanghai Port)', 150, 285);
doc.font('Helvetica-Bold').text('Port of Discharge:', 40, 305).font('Helvetica').text('AEJEA (Jebel Ali Port, Dubai)', 150, 305);
doc.font('Helvetica-Bold').text('Carrier / B/L No:', 40, 325).font('Helvetica').text('OOLU2039847192', 150, 325);

doc.moveTo(40, 355).lineTo(550, 355).strokeColor('#F1F5F9').stroke();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('VALUATION & CHARGES SUMMARY:', 40, 370);
doc.fontSize(9).font('Helvetica-Bold').text('Currency:', 40, 395).font('Helvetica').text('USD', 150, 395);
doc.font('Helvetica-Bold').text('Goods FOB Value:', 40, 415).font('Helvetica').text('$ 38,500.00', 150, 415);
doc.font('Helvetica-Bold').text('Freight Charges:', 40, 435).font('Helvetica').text('$       0.00', 150, 435);
doc.font('Helvetica-Bold').text('Insurance Charges:', 40, 455).font('Helvetica').text('$       0.00', 150, 455);
doc.font('Helvetica-Bold').fillColor('#FF5A2B').text('TOTAL INVOICE VALUE:', 40, 480).font('Helvetica-Bold').text('$ 38,500.00', 150, 480);

drawFooter();

// ----------------- PAGE 2: COMMERCIAL INVOICE ITEMS PAGE 1 -----------------
doc.addPage();
drawHeader('Commercial Invoice (Line Items 1 - 2)', 2);

// Item 1
doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('ITEM 1 OF 3', 40, 100);
doc.fontSize(9).font('Helvetica-Bold').text('HS Code:', 40, 120).font('Helvetica').text('8504.40.90 (Static Converters / UPS Systems)', 140, 120);
doc.font('Helvetica-Bold').text('Description:', 40, 140).font('Helvetica').text('UPS System 10kVA Uninterruptible Power Supply for industrial racks.', 140, 140);
doc.font('Helvetica-Bold').text('Quantity:', 40, 160).font('Helvetica').text('10 Units (PCS)', 140, 160);
doc.font('Helvetica-Bold').text('Unit Price:', 40, 180).font('Helvetica').text('USD 1,800.00', 140, 180);
doc.font('Helvetica-Bold').text('Item Total Value:', 40, 200).font('Helvetica').text('USD 18,000.00', 140, 200);

doc.moveTo(40, 225).lineTo(550, 225).strokeColor('#EBEBEB').stroke();

// Item 2
doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('ITEM 2 OF 3', 40, 250);
doc.fontSize(9).font('Helvetica-Bold').text('HS Code:', 40, 270).font('Helvetica').text('8507.20.80 (Lead-acid Accumulators)', 140, 270);
doc.font('Helvetica-Bold').text('Description:', 40, 290).font('Helvetica').text('Rechargeable lead-acid batteries 12V 100Ah for backup power system.', 140, 290);
doc.font('Helvetica-Bold').text('Quantity:', 40, 310).font('Helvetica').text('40 Units (PCS)', 140, 310);
doc.font('Helvetica-Bold').text('Unit Price:', 40, 330).font('Helvetica').text('USD 162.50', 140, 330);
doc.font('Helvetica-Bold').text('Item Total Value:', 40, 350).font('Helvetica').text('USD 6,500.00', 140, 350);

drawFooter();

// ----------------- PAGE 3: COMMERCIAL INVOICE ITEMS PAGE 2 -----------------
doc.addPage();
drawHeader('Commercial Invoice (Line Items 3)', 3);

// Item 3
doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('ITEM 3 OF 3', 40, 100);
doc.fontSize(9).font('Helvetica-Bold').text('HS Code:', 40, 120).font('Helvetica').text('8544.49.90 (Electrical Conductors < 1000V)', 140, 120);
doc.font('Helvetica-Bold').text('Description:', 40, 140).font('Helvetica').text('Insulated copper cable 16mm sq on drums, length 100m per drum.', 140, 140);
doc.font('Helvetica-Bold').text('Quantity:', 40, 160).font('Helvetica').text('20 Drums (ROLL)', 140, 160);
doc.font('Helvetica-Bold').text('Unit Price:', 40, 180).font('Helvetica').text('USD 700.00', 140, 180);
doc.font('Helvetica-Bold').text('Item Total Value:', 40, 200).font('Helvetica').text('USD 14,000.00', 140, 200);

doc.moveTo(40, 230).lineTo(550, 230).strokeColor('#EBEBEB').stroke();
doc.fontSize(10).font('Helvetica-Bold').fillColor('#FF5A2B').text('TOTAL EXPORT VALUE SUMMARY: USD 38,500.00 (FOB)', 40, 255);

drawFooter();

// ----------------- PAGE 4: PACKING LIST HEADER -----------------
doc.addPage();
drawHeader('Packing List (Consignment Packaging)', 4);

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('DOCUMENT CORRELATION:', 40, 100);
doc.font('Helvetica').fillColor('#555555').text('Associated Commercial Invoice: INV-99281-DXB\nAssociated Bill of Lading: OOLU2039847192\nExporter Reference: ASIA-9028-SZ\nImporter Reference: IMEX-7788-AE', 40, 115, { lineGap: 3 });

doc.moveTo(40, 180).lineTo(550, 180).strokeColor('#F1F5F9').stroke();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111').text('TOTAL CARGO SUMMARY:', 40, 200);
doc.fontSize(9).font('Helvetica-Bold').text('Total Package Type:', 40, 225).font('Helvetica').text('Pallets / Wooden Cases / Cartons', 150, 225);
doc.font('Helvetica-Bold').text('Total Packages:', 40, 245).font('Helvetica').text('14 Packages total', 150, 245);
doc.font('Helvetica-Bold').fillColor('#6C5CE7').text('TOTAL NET WEIGHT:', 40, 265).font('Helvetica-Bold').text('2,650.00 kg', 150, 265);
doc.font('Helvetica-Bold').fillColor('#6C5CE7').text('TOTAL GROSS WEIGHT:', 40, 285).font('Helvetica-Bold').text('2,810.00 kg', 150, 285);
doc.font('Helvetica-Bold').fillColor('#111111').text('Total Volume:', 40, 305).font('Helvetica').text('6.20 CBM', 150, 305);

drawFooter();

// ----------------- PAGE 5: PACKING LIST DETAILS 1 -----------------
doc.addPage();
drawHeader('Packing List (Packaging Grid 1)', 5);

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('PACKAGING BREAKDOWN FOR UPS SYSTEMS (ITEM 1):', 40, 100);
doc.font('Helvetica').fillColor('#555555').text('Packed in 2 heavy-duty wooden pallets (Pallet #1 - #2).\nNet Weight per Pallet: 425 kg\nGross Weight per Pallet: 460 kg\nDimensions: 120 x 80 x 140 cm each.', 40, 115, { lineGap: 3 });

doc.moveTo(40, 180).lineTo(550, 180).strokeColor('#F1F5F9').stroke();

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('PACKAGING BREAKDOWN FOR BATTERIES (ITEM 2):', 40, 200);
doc.font('Helvetica').fillColor('#555555').text('Packed in 10 strong export cartons (Cartons #3 - #12).\nNet Weight per Carton: 120 kg\nGross Weight per Carton: 124 kg\nDimensions: 60 x 40 x 50 cm each.\nStacking limits: Max 4 layers.', 40, 215, { lineGap: 3 });

drawFooter();

// ----------------- PAGE 6: PACKING LIST DETAILS 2 -----------------
doc.addPage();
drawHeader('Packing List (Packaging Grid 2)', 6);

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('PACKAGING BREAKDOWN FOR COPPER CABLES (ITEM 3):', 40, 100);
doc.font('Helvetica').fillColor('#555555').text('Packed on 2 heavy steel-framed cable drums (Drums #13 - #14).\nNet Weight per Drum: 300 kg\nGross Weight per Drum: 325 kg\nDimensions: Diameter 100 cm, Width 60 cm.', 40, 115, { lineGap: 3 });

doc.moveTo(40, 180).lineTo(550, 180).strokeColor('#F1F5F9').stroke();

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('VERIFICATION AND SEAL SUMMARY:', 40, 200);
doc.font('Helvetica').fillColor('#555555').text('Total Cargo Gross Weight Sum: 2,810.00 kg\nTotal Package Count Sum: 14 Packages\nCargo Container seal number checked: OOLU-SEAL-889281\nContainer Number: OOLU-109283-9', 40, 215, { lineGap: 3 });

drawFooter();

// ----------------- PAGE 7: BILL OF LADING -----------------
doc.addPage();
drawHeader('Bill of Lading (Cargo Carrier Copy)', 7);

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('CARRIER DETAIL:', 40, 100);
doc.font('Helvetica').fillColor('#555555').text('OOCL OCEAN SHIPPING LINE\nDubai Agency Office\nOffice 102, Port Tower, Jebel Ali\nDubai, UAE', 40, 115, { lineGap: 3 });

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('BILL OF LADING NUMBER:', 300, 100);
doc.font('Helvetica-Bold').fillColor('#FF5A2B').text('OOLU2039847192', 300, 115);

doc.moveTo(40, 155).lineTo(550, 155).strokeColor('#F1F5F9').stroke();

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('VOYAGE AND LOGISTICS:', 40, 175);
doc.fontSize(8).font('Helvetica-Bold').text('Vessel Name:', 40, 195).font('Helvetica').text('MSC OSCAR', 140, 195);
doc.font('Helvetica-Bold').text('Voyage Number:', 40, 210).font('Helvetica').text('2401W', 140, 210);
doc.font('Helvetica-Bold').text('Port of Loading:', 40, 225).font('Helvetica').text('CNSHA (Shanghai Port, China)', 140, 225);
doc.font('Helvetica-Bold').text('Port of Discharge:', 40, 240).font('Helvetica').text('AEJEA (Jebel Ali Port, Dubai)', 140, 240);

doc.moveTo(40, 265).lineTo(550, 265).strokeColor('#F1F5F9').stroke();

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('CARRIER DECLARATION DESCRIPTION OF GOODS:', 40, 285);
doc.fontSize(8).font('Helvetica').fillColor('#555555').text('1 x 20FT GENERAL PURPOSE CONTAINER CONTAINING:\n- INDUSTRIAL UPS SYSTEM (10 PCS)\n- backup Lead-acid batteries 12V (40 PCS)\n- copper cables 100m drums (20 PCS)\n\nTOTAL GROSS WEIGHT DECLARED: 2,810.00 kg\nTOTAL PACKAGE COUNT DECLARED: 14 PACKAGES\nSHIPPED ON BOARD - FREIGHT PREPAID', 40, 305, { lineGap: 3 });

drawFooter();

// ----------------- PAGE 8: CERTIFICATE OF ORIGIN -----------------
doc.addPage();
drawHeader('Certificate of Origin (Chamber of Commerce)', 8);

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('CHAMBER OF COMMERCE ISSUING AUTHORITY:', 40, 100);
doc.font('Helvetica').fillColor('#555555').text('SHENZHEN MUNICIPAL BRANCH\nChina Council for the Promotion of International Trade\nChamber of International Commerce, China', 40, 115, { lineGap: 3 });

doc.moveTo(40, 175).lineTo(550, 175).strokeColor('#F1F5F9').stroke();

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('COUNTRY OF ORIGIN DECLARED:', 40, 195);
doc.fontSize(14).font('Helvetica-Bold').fillColor('#6C5CE7').text('CHINA (CN)', 40, 215);

doc.moveTo(40, 255).lineTo(550, 255).strokeColor('#F1F5F9').stroke();

doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('PRODUCT CERTIFICATIONS:', 40, 275);
doc.fontSize(8).font('Helvetica').fillColor('#555555').text('It is hereby certified that the goods described in Commercial Invoice INV-99281-DXB\nhave been manufactured in Shenzhen, China and comply with rules of origin definitions.\n\nCertified Signatory Authority Representative\nCCPIT Secretariat Office.', 40, 295, { lineGap: 4 });

drawFooter();

doc.end();
console.log('Successfully generated 8-page PDF customs package at:', outputFilePath);
