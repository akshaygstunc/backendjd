import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendPendingPayment(
  first_name,
  last_name,
  email,
  event_name,
  event_logo,
  order_ref_no,
  orderlist,
  submissionlist,
  payment_information
) {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // Your SMTP server
        port: process.env.SMTP_PORT || 587, // Default SMTP port
        secure: process.env.SMTP_SECURE === "true", // Use TLS if true
        auth: {
          user: process.env.SMTP_USER, // SMTP username
          pass: process.env.SMTP_PASS, // SMTP password
        },
        tls: {
          rejectUnauthorized: false, // Prevent self-signed certificate errors
        },
      });
      

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Reminder</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              h1{
                  color: #333;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #fff;
                  border: 1px solid #ccc;
                  border-radius: 10px;
              }
              .message {
                  margin-bottom: 15px;
                  color: #333;
              }
              .cta-button {
                  display: inline-block;
                  background-color: #c32728;
                  color: white !important;
                  padding: 10px 20px;
                  text-align: center;
                  border-radius: 5px;
                  text-decoration: none;
                  font-weight: bold;
              }

              .cta-button:hover,
              .cta-button:visited,
              .cta-button:focus,
              .cta-button:active {
                  background-color: #c32728;
                  color: white !important;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://judgify-api.phanomprofessionals.com/uploads/${event_logo}" alt="${event_name} Logo" style="max-width: 100%; height: auto;">
                  <h1>${event_name}</h1>
              </div>
              <p class="message">Dear ${first_name} ${last_name},</p>
              <p class="message">Your payment for order ID: <strong>${order_ref_no}</strong> is currently pending. Please click the button below to complete the payment process:</p>
              <a href="https://your-payment-link.com" class="cta-button">Complete Payment</a>

              <h2>Order Info</h2>
              <p class="message">${orderlist}</p>

              <h2>Nomination Details</h2>
              <p class="message">${submissionlist}</p>

            
              <p class="message">If you have any questions, feel free to reach out.</p>

              <p class="message">Best regards,</p>
              <p class="message"><strong>${event_name} Team</strong></p>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: user,
      to: email,
      subject: `Payment Pending for Order ID: ${order_ref_no}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent to ' + email + ': ' + info.response); 

  } catch (error) {
    console.error('Error sending email to ' + email + ':', error);
  }
}

export default sendPendingPayment;
