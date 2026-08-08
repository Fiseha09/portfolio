require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing with User:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
  subject: 'Nodemailer Credentials Check',
  text: 'If you receive this, your Nodemailer setup is 100% working!'
}, (err, info) => {
  if (err) {
    console.error('❌ Connection Failed:', err.message);
  } else {
    console.log('✅ Email Sent Successfully:', info.response);
  }
});