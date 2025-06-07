const generateCertificate = require('./certificateTemplate');

generateCertificate({
  name: 'John Doe',
  workshop: 'Intro to JavaScript',
  college: 'XYZ College',
  date: 'June 12, 2025'
}, './certificates/john-doe.pdf');
