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
// const PORT = 5000;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio Client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// =======================
// OTP Routes
// =======================
app.post("/sendEmailOtp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

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
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

  const result = verifyOtp(email, otp);
  result.success
    ? res.json({ success: true, message: result.message })
    : res.status(400).json({ success: false, message: result.message });
});

// =======================
// Certificate + Email + WhatsApp
// =======================
app.post("/generate-certificate", async (req, res) => {
  const { name, email, course, phone, formId } = req.body;

  if (!formId || !email || !name || !course) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const workshopRef = db.collection("workshops").doc(formId);
    const snap = await workshopRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "Workshop not found" });
    }

    const { workshopName, collegeName, dateTime } = snap.data();

    const outputDir = path.join(__dirname, "certificates");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = `${name.toLowerCase().replace(/ /g, "-")}_${formId}.pdf`;
    const outputPath = path.join(outputDir, filename);

    console.log("📄 Generating certificate for:", name);
    await generateCertificate({
      name,
      course,
      college: collegeName,
      workshop: workshopName,
      date: new Date(dateTime).toDateString(),
    }, outputPath);
    console.log("✅ Certificate created at:", outputPath);

    // Email with attachment
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #004080;">🎉 Congratulations, ${name}!</h2>
        <p>You have successfully completed the <b>${workshopName}</b> workshop at <b>${collegeName}</b>.</p>
        <p>📎 Your certificate is attached to this email.</p>
        <p>Best wishes,<br/>Team Workshop</p>
      </div>
    `;

    console.log("📧 Sending email to:", email);
    await transporter.sendMail({
      from: `"Workshop Certificates" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎓 Your Certificate from ${collegeName}`,
      html: htmlBody,
      attachments: [{ filename, path: outputPath }],
    });
    console.log("📤 Email sent successfully.");

    // WhatsApp Notification (text only)
    const whatsappTo = `whatsapp:+91${phone}`;
    const msg = `🎉 Hello ${name}! Your workshop certificate for "${workshopName}" is ready and sent to your email (${email}).\n\nThank you!\n- ${collegeName}`;

    // 🧪 Debug Logs
    console.log("📲 Sending WhatsApp to:", phone);
    console.log("Using WhatsApp FROM:", process.env.TWILIO_WHATSAPP_FROM);
    console.log("Sending TO:", whatsappTo);
    console.log("Message:", msg);

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: whatsappTo,
      body: msg,
    });
    console.log("✅ WhatsApp message sent to:", phone);

    res.json({ success: true, message: "Certificate generated, emailed, and WhatsApp sent", filename });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Failed to generate/send certificate" });
  }
});

// =======================

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Frontend is connected to Backend ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
