import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();


async function sendGmailAssign(first_name, last_name, email) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.PASSWORD;
    // const frontendUrl =  'http://localhost:3000'; 
    const frontendUrl =  'https://awardsuite.in'; 

    try {
        const verificationLink = `${frontendUrl}/verifyUser?email=${email}`;

       const user = process.env.SMTP_USER;
           const pass = process.env.SMTP_PASS;
           const host = process.env.SMTP_HOST;
           const port = process.env.SMTP_PORT || 587;
           const secure = process.env.SMTP_SECURE === 'true';
       
           const transporter = nodemailer.createTransport({
             host,
             port,
             secure,
             auth: {
               user,
               pass,
             },
           });
        

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #fff;
                        border: 1px solid #ccc;
                        border-radius: 10px;
                    }
                    .header {
                        text-align: center;
                        padding: 20px 0;
                    }
                    .message {
                        margin-bottom: 20px;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .verify-link {
                        display: inline-block;
                        background-color: #c32728;
                        color: white;
                        padding: 10px 20px;
                        text-align: center;
                        border-radius: 5px;
                        text-decoration: none;
                        font-size: 16px;
                    }
                    .verify-link:hover {
                        background-color: #9a2123;
                    }
                    .footer {
                        font-size: 12px;
                        color: #888;
                        text-align: left;
                        margin-top: 30px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Email Verification</h2>
                    </div>
                    <div class="message">
                        <p>Dear ${first_name} ${last_name},</p>
                        <p>Thank you for logging in to our platform! Please verify your email address to complete the registration process.</p>
                    </div>
                    <div class="message">
                        <p>Click the link below to verify your email:</p>
                        <p>
                            <a href="${verificationLink}" class="verify-link">Verify Email</a>
                        </p>
                    </div>
                    <div class="message">
                        <p>If you didn't request this, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>Best Regards,</p>
                        <p>The Team</p>
                        <a href="awardsuite.in">AwardSuite.in</a>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: "online@awardsuite.in",
            to: email,
            subject: "Email Verification - AwardSuite",
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        // console.log('Email sent: ' + info.response);
        return info.response;
    } catch (error) {
        // console.error('Error sending email:', error);
        throw error;
    }
}

export default sendGmailAssign;
