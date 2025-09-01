const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // ۱. ساخت یک Transporter (سرویس‌دهنده ایمیل)
    // نکته: برای محصول نهایی، از یک سرویس واقعی مثل SendGrid استفاده کنید.
    // این تنظیمات برای تست با Gmail است.
    const transporter = nodemailer.createTransport({
        service: 'gmail', // یا هر سرویس دیگری
        auth: {
            user: process.env.EMAIL_USERNAME, // ایمیل شما
            pass: process.env.EMAIL_PASSWORD  // پسورد اپلیکیشن شما (App Password)
        }
    });

    // ۲. تعریف گزینه‌های ایمیل
    const mailOptions = {
        from: `آزمونک <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // ۳. ارسال ایمیل
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;