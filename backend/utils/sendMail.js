const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  try {
    // Validate email configuration
    if (!process.env.SMPT_MAIL || !process.env.SMPT_PASSWORD) {
      console.error("SMTP email or password not configured in environment variables");
      throw new Error("Email service not properly configured");
    }
    
    // Check if email appears to be valid
    if (!process.env.SMPT_MAIL.includes('@') || process.env.SMPT_MAIL.endsWith('@')) {
      console.error("Invalid email format in environment variables");
      throw new Error("Invalid email configuration");
    }
    
    // Check if password is still the placeholder
    if (process.env.SMPT_PASSWORD === "your-app-password-here" || 
        process.env.SMPT_PASSWORD === "your-16-character-app-password") {
      console.error("Default placeholder password detected in environment variables");
      throw new Error("Email password not properly configured");
    }

    // Create transporter with detailed logging
    console.log("Creating mail transporter with host:", process.env.SMPT_HOST);
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: parseInt(process.env.SMPT_PORT),
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
      debug: true, // Enable debug logs
      logger: true, // Log info
      secure: process.env.SMPT_PORT === '465', // true for 465, false for other ports
      tls: {
        rejectUnauthorized: false, // Don't fail on invalid certs in development
      },
    });

    // Setup mail options
    const mailOptions = {
      from: `"Marketplace" <${process.env.SMPT_MAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    console.log(`Attempting to send email to ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Provide more specific error handling for common SMTP errors
    if (error.code === 'EAUTH') {
      throw new Error("Authentication failed: Please check your email and app password settings. If using Gmail with 2FA, generate an app password at https://myaccount.google.com/apppasswords");
    }
    
    throw error;
  }
};

module.exports = sendMail;
