// index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const { setOtp, verifyOtp } = require("./otpStore");
// const admin = require("./firebaseAdmin");
const { db } = require("./firebaseAdmin");

const generateCertificate = require("./certificateTemplate");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// =======================
// OTP ROUTES
// =======================

const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    console.error("Error sending email:", err);
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
// GENERATE CERTIFICATE
// =======================

app.post("/generate-certificate", async (req, res) => {
  const { name, email, course, phone, formId } = req.body;

  if (!formId || !email || !name || !course) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    // const workshopRef = admin.firestore().collection("workshops").doc(formId);
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

    res.json({ success: true, message: "Certificate generated", filename });
  } catch (err) {
    console.error("Error generating certificate:", err);
    res.status(500).json({ success: false, message: "Certificate generation failed" });
  }
});

// =======================

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Frontend is connected to Backend ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
