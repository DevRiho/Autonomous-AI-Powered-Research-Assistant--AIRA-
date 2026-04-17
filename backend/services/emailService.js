const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Fallback if environment variables aren't set, we just simulate via console
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`\n\n⚠️  [MOCK EMAIL - Nodemailer credentials not found in .env]`);
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message Length: ${options.html?.length || 0} characters`);
        console.log(`Please add EMAIL_USER and EMAIL_PASS to backend/.env to send real emails.`);
        console.log(`\n\n`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"AIRA Assistant" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email successfully sent to ${options.email}`);
    } catch (error) {
        console.error(`❌ Error sending email:`, error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
