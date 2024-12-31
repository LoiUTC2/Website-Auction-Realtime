const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs'); // Template engine
const { EmailType } = require("../common/constant")
const crypto = require('crypto');
/**
 * Creates a Nodemailer transporter.
 * 
 * @returns {nodemailer.Transporter} The Nodemailer transporter object.
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
}

/**
 * Renders an email template with the given content.
 * 
 * @param {string} templateName - The name of the template file (e.g., 'otp', 'password_reset').
 * @param {object} content - The content to include in the template.
 * @returns {Promise<string>} The rendered HTML string.
 */
const renderTemplate = async (templatePath, content) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(templatePath, content, (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });
    });
}

/**
 * Sends an email with the specified type and content.
 * 
 * @param {string} to - The recipient's email address.
 * @param {string} type - The type of email to send (e.g., 'otp', 'password_reset', 'account_activation').
 * @param {object} content - The content to include in the email.
 * @returns {Promise} A promise that resolves when the email is sent.
 * @throws {Error} Throws an error if the email fails to send.
 */
async function sendEmail(to, type, content) {
    const transporter = createTransporter();

    const subjects = {
        [EmailType.RESET_PASSWORD_OTP]: 'Your OTP Code',
        [EmailType.NOTIFY_TO_AUCTION_WINNER]: 'Thông Báo Trúng Đấu Giá',
        [EmailType.NOTIFY_TO_PRODUCT_OWNER]: 'Thông Báo Sản Phẩm Đấu Giá Thành Công'
    };

    const templatePaths = {
        [EmailType.RESET_PASSWORD_OTP]: path.join(__dirname, '..', 'email-templates', `${EmailType.RESET_PASSWORD_OTP}.html`),
        [EmailType.NOTIFY_TO_AUCTION_WINNER]: path.join(__dirname, '..', 'email-templates', `${EmailType.NOTIFY_TO_AUCTION_WINNER}.html`),
        [EmailType.NOTIFY_TO_PRODUCT_OWNER]: path.join(__dirname, '..', 'email-templates', `${EmailType.NOTIFY_TO_PRODUCT_OWNER}.html`)
    };

    const subject = subjects[type];
    const templatePath = templatePaths[type];

    if (!subject || !templatePath) {
        throw new Error('Unknown email type');
    }

    const htmlContent = await renderTemplate(templatePath, content);

    const mailOptions = {
        from: "Auction_System",
        to: to,
        subject: subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}

async function sendAccountCreationOTP(to) {
    const transporter = createTransporter();

    const otp = crypto.randomInt(100000, 999999).toString();

    const subject = 'Your Account Creation OTP Code';
    const generateEmailTemplate = ( otp) => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Code</title>
        </head>
        <body>
            <p>Your OTP code to create an account is: <strong>${otp}</strong></p>
            <p>Please use this code to complete your registration process.</p>
            <br>
            <p>Thank you for choosing Auction System!</p>
        </body>
        </html>
        `;
    };

    const htmlContent = generateEmailTemplate( otp); // Chuyển đổi thành htmlContent

    const mailOptions = {
        from: "Auction_System",
        to: to,
        subject: subject,
        html: htmlContent 
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            success: true,
            otp
        };
    } catch (error) {
        console.error('Failed to send email:', error);
        return {
            success: false
        };
    }
}

async function sendPasswordResetOTP(to) {
    const transporter = createTransporter();
    const otp = crypto.randomInt(100000, 999999).toString();

    const subject = 'Your Password Reset OTP Code';
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset OTP</title>
        </head>
        <body>
            <p>Your OTP code to reset your password is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <br>
            <p>Thank you for using our service!</p>
        </body>
        </html>
    `;

    const mailOptions = {
        from: "Auction_System",
        to: to,
        subject: subject,
        html: htmlContent 
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, otp };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false };
    }
}

module.exports = {
    sendEmail,
    sendAccountCreationOTP,
    sendPasswordResetOTP
};
