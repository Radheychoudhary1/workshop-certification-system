// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const { setOtp, verifyOtp } = require("./otpStore");
const { db } = require("./firebaseAdmin");
const generateCertificate = require("./certificateTemplate");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ============ EMAIL OTP ROUTES ============

app.post("/sendEmailOtp", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email is required" });

  const otp = generateOtp();
  setOtp(email, otp);

  try {
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP email" });
  }
});

app.post("/verifyEmailOtp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ success: false, message: "Email and OTP are required" });

  const result = verifyOtp(email, otp);
  result.success
    ? res.json({ success: true, message: result.message })
    : res.status(400).json({ success: false, message: result.message });
});

// ============ GENERATE CERTIFICATE ============

app.post("/generate-certificate", async (req, res) => {
  const { name, email, course, phone, formId } = req.body;

  if (!formId || !email || !name || !course) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const snap = await db.collection("workshops").doc(formId).get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "Workshop not found" });
    }

    const { workshopName, collegeName, dateTime } = snap.data();

    const outputDir = path.join(__dirname, "certificates");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = `${name.toLowerCase().replace(/ /g, "-")}_${formId}.pdf`;
    const outputPath = path.join(outputDir, filename);
    const certificateLink = `${process.env.BACKEND_PUBLIC_URL}/certificates/${filename}`;

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

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #004080;">🎉 Congratulations, ${name}!</h2>
        <p>You have successfully completed the <b>${workshopName}</b> workshop at <b>${collegeName}</b>.</p>
        <p>📎 Your certificate is attached to this email.</p>
        <p>Best wishes,<br/>Team Workshop</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Workshop Certificates" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎓 Your Certificate from ${collegeName}`,
      html: htmlBody,
      attachments: [{ filename, path: outputPath }],
    });

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+91${phone}`,
      body: `🎉 Hello ${name}! Your workshop certificate for "${workshopName}" is ready.\n\n📩 Sent to: ${email}\n📄 Download: ${certificateLink}\n\nThank you!\n- ${collegeName}`,
    });

    res.json({
      success: true,
      message: "Certificate generated, emailed, and WhatsApp sent",
      filename,
    });
  } catch (err) {
    console.error("🔥 Error in /generate-certificate:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ============ TEST ROUTE ============

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Frontend is connected to Backend" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
