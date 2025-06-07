require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// rest of your code


transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: "rd.innovations.2024@gmail.com",
  subject: "Test OTP",
  html: "<p>This is a test mail</p>",
})
.then(() => console.log("Email sent ✅"))
.catch((err) => console.error("Error sending test email ❌", err));
