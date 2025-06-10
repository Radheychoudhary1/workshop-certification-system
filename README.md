# workshop-certification-system

## 1. Overview

This React + Firebase-based web application enables workshop trainers to:

- Create and manage workshop feedback forms.
- Collect student feedback and verified contact information via OTP.
- Automatically generate personalized certificates in PDF format.
- Deliver certificates via Email and WhatsApp.

---

## 2. Tech Stack

- *Frontend:* React 18.2 + TypeScript + Bootstrap
- *Backend:* Node.js (Express) + Firebase (Firestore, Auth, Storage)
- *Authentication:* Firebase Auth
- *Certificate Delivery:* Nodemailer (Email), Twilio (WhatsApp)

---

## 3. Setup Instructions

### A. Firebase Setup

1. Create a Firebase project.
2. Enable *Authentication* > Email/Password.
3. Create Firestore collections:
   - users (with role: "admin" for each admin)
   - workshops
   - submissions
4. Enable *Storage* with two folders:
   - templates (optional)
   - certificates (for storing generated PDFs)
5. Deploy Hosting (for client):
   - firebase init (select hosting + Firestore + Storage + Functions)
   - Add build/ folder as public directory
   - firebase deploy

```bash
cd workshop-client
npm install
npm start

### B. Backend Setup (Node.js Server)

```bash
cd workshop-backend
npm install
npm run dev
