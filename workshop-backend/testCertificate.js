const generateCertificate = require('./certificateTemplate');

generateCertificate({
  name: 'Radhey',
  workshop: 'Intro to JavaScript',
  college: 'Xavier',
  date: 'June 12, 2025'
}, './certificates/john-doe.pdf');
