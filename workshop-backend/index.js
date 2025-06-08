// index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const { setOtp, verifyOtp } = require("./otpStore");
const { db } = require("./firebaseAdmin");
const generateCertificate = require("./certificateTemplate");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// =======================
// Email Transporter Setup
// =======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================
// OTP ROUTES
// =======================
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

app.post("/sendEmailOtp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const otp = generateOtp();
  setOtp(email, otp);

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP email" });
  }
});

app.post("/verifyEmailOtp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  const result = verifyOtp(email, otp);
  if (result.success) {
    res.json({ success: true, message: result.message });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

// =======================
// GENERATE CERTIFICATE + EMAIL
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

    const data = snap.data();
    const { workshopName, collegeName, dateTime } = data;

    const outputDir = path.join(__dirname, "certificates");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = `${name.toLowerCase().replace(/ /g, "-")}_${formId}.pdf`;
    const outputPath = path.join(outputDir, filename);

    console.log("📄 Generating certificate for:", name);
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
    console.log("✅ Certificate created at:", outputPath);

    // Email body with professional styling
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 0 8px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #004080;">🎉 Congratulations!</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for participating in the workshop <strong>"${workshopName}"</strong> conducted by <strong>${collegeName}</strong> on <strong>${new Date(dateTime).toDateString()}</strong>.</p>
          <p>We're thrilled to award you a certificate of participation.</p>
          <p><strong>📎 Your certificate is attached to this email.</strong></p>
          <hr style="margin: 30px 0;" />
          <p style="font-size: 14px; color: #777;">
            If you have any questions or didn’t receive your certificate correctly, feel free to contact the workshop coordinator.
          </p>
          <p style="text-align: center; font-size: 13px; color: #aaa;">© ${new Date().getFullYear()} ${collegeName} | All rights reserved.</p>
        </div>
      </div>
    `;

    console.log("📧 Sending email to:", email);

    await transporter.sendMail({
      from: `"Workshop Certificates" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎓 Your Workshop Certificate from ${collegeName}`,
      html: htmlBody,
      attachments: [
        {
          filename,
          path: outputPath,
        },
      ],
    });

    console.log("📤 Email sent successfully to:", email);
    res.json({ success: true, message: "Certificate generated and email sent", filename });

  } catch (err) {
    console.error("❌ Error generating or emailing certificate:", err);
    res.status(500).json({ success: false, message: "Certificate generation or email failed" });
  }
});

// =======================

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Frontend is connected to Backend ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
