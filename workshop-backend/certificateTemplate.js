const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

function generateCertificate(
	{ name, course, workshop, college, date },
	outputPath
) {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

		const bgPath = path.join(__dirname, "assets", "background.png");
		const sign2 = path.join(__dirname, "assets", "sign_head.png");

		const stream = fs.createWriteStream(outputPath);
		doc.pipe(stream);

		if (fs.existsSync(bgPath)) {
			doc.image(bgPath, 0, 0, {
				width: doc.page.width,
				height: doc.page.height,
			});
		}

		const textColor = "white";
		const highlightColor = "#FFD700";
		const centerX = doc.page.width / 2;
		let currentY = 220;

		doc
			.font("Helvetica")
			.fontSize(20)
			.fillColor(textColor)
			.text("This is to certify that", 0, currentY, { align: "center" });

		currentY += 40;
		doc
			.font("Helvetica-Bold")
			.fontSize(32)
			.fillColor(highlightColor)
			.text(name.toUpperCase(), 0, currentY, { align: "center" });

		currentY += 40;
		doc
			.font("Helvetica")
			.fontSize(18)
			.fillColor(textColor)
			.text("a student of", 0, currentY, { align: "center" });

		currentY += 25;
		doc
			.font("Helvetica-Bold")
			.fontSize(22)
			.fillColor(highlightColor)
			.text(college, 0, currentY, { align: "center" });

		currentY += 40;
		doc
			.font("Helvetica")
			.fontSize(18)
			.fillColor(textColor)
			.text(
				"has successfully participated in the workshop titled",
				80,
				currentY,
				{ align: "center", width: doc.page.width - 120 }
			);

		currentY += 25;
		doc
			.font("Helvetica-Bold")
			.fontSize(22)
			.fillColor(highlightColor)
			.text(`"${workshop}"`, 0, currentY, { align: "center" });

		currentY += 40;
		doc
			.font("Helvetica")
			.fontSize(18)
			.fillColor(textColor)
			.text("conducted on", 0, currentY, { align: "center" });

		currentY += 25;
		doc
			.font("Helvetica-Bold")
			.fontSize(20)
			.fillColor(highlightColor)
			.text(date, 0, currentY, { align: "center" });

		currentY += 40;
		doc
			.font("Helvetica")
			.fontSize(18)
			.fillColor(textColor)
			.text("as part of the course:", 0, currentY, { align: "center" });

		currentY += 30;
		doc
			.font("Helvetica-Bold")
			.fontSize(20)
			.fillColor(highlightColor)
			.text(course, 0, currentY, { align: "center" });

		// HOD Signature
		const signY = doc.page.height - 150;

		if (fs.existsSync(sign2)) {
			doc.image(sign2, doc.page.width - 200, signY, { width: 100 });
			doc
				.font("Helvetica")
				.fontSize(12)
				.fillColor(textColor)
				.text("Head of Department", doc.page.width - 200, signY + 70, {
					align: "center",
					width: 100,
				});
		}

		// Certificate ID — bottom left
		const certificateId = uuidv4().slice(0, 8).toUpperCase();
		doc
			.font("Helvetica-Oblique")
			.fontSize(10)
			.fillColor(textColor)
			.text(`Certificate ID: ${certificateId}`, 50, doc.page.height - 40);

		doc.end();

		stream.on("finish", () => resolve());
		stream.on("error", reject);
	});
}

module.exports = generateCertificate;
