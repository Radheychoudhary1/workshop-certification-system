const { db } = require('./firebaseAdmin');
const generateCertificate = require('./certificateTemplate');
const path = require('path');
const fs = require('fs');

async function run() {
  try {
    // Step 1: Fetch the latest submission
    const submissionsRef = db.collection('submissions');
    const snapshot = await submissionsRef.orderBy('timestamp', 'desc').limit(1).get();

    if (snapshot.empty) {
      console.log('No submissions found.');
      return;
    }

    const submission = snapshot.docs[0].data();
    const { name, email, course, phone, feedback, formId } = submission;

    console.log(`Found submission from ${name} (${email})`);

    // Step 2: Fetch workshop data using formId
    const workshopRef = db.collection('workshops').doc(formId);
    const workshopSnap = await workshopRef.get();

    if (!workshopSnap.exists) {
      console.log(`Workshop not found for ID: ${formId}`);
      return;
    }

    const workshop = workshopSnap.data();
    const { collegeName, workshopName, dateTime } = workshop;

    // Ensure output directory exists
    const outputDir = path.join(__dirname, 'certificates');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Format filename
    const filename = `${name.toLowerCase().replace(/ /g, '-')}.pdf`;
    const outputPath = path.join(outputDir, filename);

    // Step 3: Generate certificate
    await generateCertificate(
      {
        name,
        course,
        workshop: workshopName,
        college: collegeName,
        date: new Date(dateTime).toDateString(),
      },
      outputPath
    );

    console.log(`Certificate generated at: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
