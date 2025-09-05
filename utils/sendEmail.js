const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // <-- این باید 'gmail' باشد
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `آزمونک <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // برای عیب‌یابی، قبل از ارسال لاگ می‌گیریم
    console.log("Attempting to send email with nodemailer using Gmail...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully with nodemailer!");
};

module.exports = sendEmail;