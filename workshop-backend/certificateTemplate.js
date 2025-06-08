const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function generateCertificate({ name, course, workshop, college, date }, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });

    const logoPath = path.join(__dirname, 'assets', 'logo.png');
    const bgPath = path.join(__dirname, 'assets', 'background.png');
    const sign1 = path.join(__dirname, 'assets', 'sign_coordinator.png');
    const sign2 = path.join(__dirname, 'assets', 'sign_head.png');

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Background
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
        opacity: 0.08,
      });
    }

    // Border
    doc.lineWidth(4).rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#004080');

    // Logo
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 40, 40, { width: 80 });
    }

    // Title
    doc
      .font('Helvetica-Bold')
      .fontSize(30)
      .fillColor('#004080')
      .text('CERTIFICATE OF PARTICIPATION', {
        align: 'center',
      });

    // Vertical spacing
    doc.moveDown(2);

    // Main Body
    doc
      .fontSize(16)
      .fillColor('black')
      .font('Helvetica')
      .text('This is to certify that', { align: 'center' })
      .moveDown(0.5)
      .font('Times-Italic')
      .fontSize(26)
      .text(name.toUpperCase(), { align: 'center' })
      .moveDown(0.5)
      .font('Helvetica')
      .fontSize(16)
      .text('a student of', { align: 'center' })
      .font('Helvetica-Bold')
      .text(college, { align: 'center' })
      .moveDown(0.5)
      .font('Helvetica')
      .text('has successfully participated in the workshop titled', { align: 'center' })
      .font('Helvetica-Bold')
      .text(`"${workshop}"`, { align: 'center' })
      .moveDown(0.5)
      .font('Helvetica')
      .text('conducted on', { align: 'center' })
      .font('Helvetica-Bold')
      .text(date, { align: 'center' })
      .moveDown(0.5)
      .font('Helvetica')
      .text('as part of the course:', { align: 'center' })
      .font('Helvetica-Bold')
      .text(course, { align: 'center' });

    // Signatures
    const signY = doc.page.height - 130;

    if (fs.existsSync(sign1)) {
      doc.image(sign1, 100, signY, { width: 100 });
    } else {
      doc
        .font('Helvetica')
        .fontSize(12)
        .text('Radhey (Coordinator)', 100, signY + 40);
    }

    if (fs.existsSync(sign2)) {
      doc.image(sign2, doc.page.width - 200, signY, { width: 100 });
    } else {
      doc
        .font('Helvetica')
        .fontSize(12)
        .text('HOD Signature', doc.page.width - 200, signY + 40);
    }

    doc
      .font('Helvetica')
      .fontSize(12)
      .text('Coordinator', 100, signY + 60)
      .text('Head of Department', doc.page.width - 200, signY + 60);

    // Certificate ID bottom right
    const certificateId = uuidv4().slice(0, 8).toUpperCase();
    doc
      .font('Helvetica-Oblique')
      .fontSize(10)
      .fillColor('gray')
      .text(`Certificate ID: ${certificateId}`, doc.page.width - 160, doc.page.height - 40);

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

module.exports = generateCertificate;
