import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function sendGmailotp(email, otp) {
  try {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const secure = process.env.SMTP_SECURE === "true";

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
                <title>OTP for Verification</title>
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
                        text-align: center;
                    }
                    .otp {
                        font-size: 24px;
                        font-weight: bold;
                        color: #333;
                        background-color: #f7f7f7;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Your OTP Code</h2>
                    <p>Please use the following One-Time Password (OTP) to complete your verification:</p>
                    <div class="otp">${otp}</div>
                    <p class="footer">If you did not request this OTP, please ignore this email.</p>
                </div>
            </body>
            </html>
        `;

    const mailOptions = {
      from: `"Awards Nomination" <${user}>`,
      to: email,
      subject: "Your OTP Code for Verification",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to " + email + ": " + info.response);
  } catch (error) {
    console.error("Error sending email to " + email + ":", error);
  }
}

export default sendGmailotp;
