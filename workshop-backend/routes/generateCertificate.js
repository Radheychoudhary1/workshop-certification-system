const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { db } = require("../firebaseAdmin");
const generateCertificate = require("../certificateTemplate");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post("/", async (req, res) => {
  const { name, email, course, phone, formId } = req.body;

  if (!formId || !email || !name || !course || !phone) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const snap = await db.collection("workshops").doc(formId).get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "Workshop not found" });
    }

    const { workshopName, collegeName, dateTime } = snap.data();

    const outputDir = path.join(__dirname, "..", "certificates");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = `${name.toLowerCase().replace(/ /g, "-")}_${formId}.pdf`;
    const outputPath = path.join(outputDir, filename);
    const certificateLink = `${process.env.BACKEND_PUBLIC_URL}/certificates/${filename}`;

    // Generate certificate
    await generateCertificate(
      {
        name,
        course,
        college: collegeName,
        workshop: workshopName,
        date: new Date(dateTime).toDateString(),
      },
      outputPath
    );

    // Send Email
    await transporter.sendMail({
      from: `"Workshop Certificates" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎓 Your Certificate from ${collegeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #004080;">🎉 Congratulations, ${name}!</h2>
          <p>You have successfully completed the <b>${workshopName}</b> workshop at <b>${collegeName}</b>.</p>
          <p>📎 Your certificate is attached to this email.</p>
          <p>Best wishes,<br/>Team Workshop</p>
        </div>
      `,
      attachments: [{ filename, path: outputPath }],
    });

    // Send WhatsApp
    const whatsappTo = `whatsapp:+91${phone}`;
    const msg = `🎉 Hello ${name}! Your workshop certificate for "${workshopName}" is ready.\n\n📩 Sent to: ${email}\n📄 Download: ${certificateLink}\n\nThank you!\n- ${collegeName}`;

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: whatsappTo,
      body: msg,
    });

    res.json({
      success: true,
      message: "Certificate generated, emailed, and WhatsApp sent",
      filename,
    });
  } catch (err) {
    console.error("🔥 General Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
