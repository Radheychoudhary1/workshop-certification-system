// workshop-backend/certificateTemplate.js

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function generateCertificate({ name, course, workshop, college, date }, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });

    const logoPath = path.join(__dirname, 'assets', 'logo.jpg');
    const bgPath = path.join(__dirname, 'assets', 'background.png');

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Add background
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
        opacity: 0.1,
      });
    }

    // Border
    doc.lineWidth(4).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#004080');

    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 50, 30, { width: 100 });
    }

    // Header
    doc
      .fillColor('#004080')
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('CERTIFICATE OF PARTICIPATION', {
        align: 'center',
        underline: true,
      })
      .moveDown(1.2);

    // Certificate ID
    const certificateId = uuidv4().slice(0, 8).toUpperCase();
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('gray')
      .text(`Certificate ID: ${certificateId}`, {
        align: 'right',
      })
      .moveDown(1);

    // Body text
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(16)
      .text(`This is to certify that`, {
        align: 'center',
      })
      .moveDown(0.5);

    // Student name in cursive-style
    doc
      .font('Times-Italic')
      .fontSize(26)
      .text(name.toUpperCase(), {
        align: 'center',
      })
      .moveDown(0.5);

    doc
      .font('Helvetica')
      .fontSize(16)
      .text(`a student of`, { align: 'center' })
      .font('Helvetica-Bold')
      .text(college, { align: 'center' })
      .moveDown(0.5);

    doc
      .font('Helvetica')
      .text(`has successfully participated in the workshop titled`, { align: 'center' })
      .font('Helvetica-Bold')
      .text(`"${workshop}"`, { align: 'center' })
      .moveDown(0.5);

    doc
      .font('Helvetica')
      .text(`conducted on`, { align: 'center' })
      .font('Helvetica-Bold')
      .text(date, { align: 'center' })
      .moveDown(0.5);

    doc
      .font('Helvetica')
      .text(`as part of the course:`, { align: 'center' })
      .font('Helvetica-Bold')
      .text(course, { align: 'center' })
      .moveDown(2);

    // Footer: Signatures
    const signatureY = doc.y + 40;
    doc
      .fontSize(14)
      .text('_______________________', 100, signatureY)
      .text('Coordinator', 130, signatureY + 15)

      .text('_______________________', doc.page.width - 250, signatureY)
      .text('Head of Department', doc.page.width - 240, signatureY + 15);

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

module.exports = generateCertificate;
