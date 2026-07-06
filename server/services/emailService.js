const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Neon Hub" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request - Neon Hub',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0D0D1A; color: #E8E8F0; padding: 40px; text-align: center;">
        <h1 style="color: #00B4D8; margin-bottom: 20px;">Neon Hub</h1>
        <div style="background-color: #1A1A2E; border: 1px solid #7B2FBE; border-radius: 8px; padding: 30px; max-width: 500px; margin: 0 auto;">
          <h2 style="margin-top: 0;">Password Reset</h2>
          <p style="color: #9A9AB0; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset the password for your Neon Hub account. 
            If you didn't make this request, you can safely ignore this email.
          </p>
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7B2FBE, #9b3fd4); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #9A9AB0; font-size: 0.85rem; margin-top: 30px;">
            This link will expire in 15 minutes.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};
