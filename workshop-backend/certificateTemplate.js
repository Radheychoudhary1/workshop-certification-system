// workshop-backend/certificateTemplate.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateCertificate({ name, workshop, college, date }, outputPath) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.pipe(fs.createWriteStream(outputPath));

  // Title
  doc
    .fontSize(26)
    .text('Certificate of Participation', { align: 'center' })
    .moveDown(1.5);

  // Content box
  doc
    .fontSize(16)
    .text(`This is to certify that`, { align: 'center' })
    .moveDown(0.5);

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text(`${name}`, { align: 'center' })
    .font('Helvetica')
    .moveDown(0.5);

  doc
    .fontSize(16)
    .text(`has successfully participated in the`, { align: 'center' })
    .text(`${workshop}`, { align: 'center', underline: true })
    .moveDown(0.5);

  doc
    .text(`organized by`, { align: 'center' })
    .text(`${college}`, { align: 'center', underline: true })
    .moveDown(0.5);

  doc
    .text(`on ${date}`, { align: 'center' })
    .moveDown(2);

  // Signature area
  doc
    .text('______________________', 100, doc.y, { continued: true })
    .text('                    ', { continued: true })
    .text('______________________', { align: 'right' });

  doc
    .text('  Coordinator', 100, doc.y)
    .text('                                                ')
    .text('  Head of Department', { align: 'right' });

  doc.end();
}

module.exports = generateCertificate;
