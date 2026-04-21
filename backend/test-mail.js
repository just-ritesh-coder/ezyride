require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log("Testing with User:", process.env.EMAIL_USER);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "EzyRide SMTP Test",
      text: "Testing if Nodemailer is configured correctly.",
    });
    console.log("Success, Message ID:", info.messageId);
  } catch (err) {
    console.error("Error sending mail:", err);
  }
}
test();
