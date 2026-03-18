import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendGmailAssignJudge(
  first_name,
  last_name,
  email,
  event_name,
  event_logo,
  event_banner,
  round_no,
  end_date,
  end_time,
  organizer_first_name,
  organizer_last_name,
  eventId,
  alpharoundid
)

{
  console.log("Sending email for eventId:", eventId);
  console.log("Sending email for roundId:", alpharoundid);

  try {
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
          <title>Judge Invitation</title>
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
              <p class="message">We are excited to invite you to join the jury panel for <strong>${event_name}</strong>.</p>
              <p class="message">Below is the access link to the judging portal, where you can begin scoring entries for <strong>${round_no}</strong>.</p>
              <p class="message">Please note that Judging for <strong> ${round_no}</strong> will close on <strong>${end_date} at ${end_time}</strong>.</p>
              <p class="message">We kindly request you to confirm your participation and provide your verdict as a jury member by clicking below:</p>
                  <a href="https://awardsuite.in/jury-dashboard?judgemail=${email}&eventId=${eventId}&roundId=${alpharoundid}" class="cta-button">Judging Portal</a>
              <p class="message">Feel free to reach out to ${organizer_first_name} ${organizer_last_name} for any inquiries.</p>
              <p class="message">Best Regards,</p>
              <p class="message"><strong>${organizer_first_name} ${organizer_last_name}</strong><br>
                  Awards Suite - Awards, Simplified. Excellence, Delivered.
              </p>
          </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: user,
      to: email,
      subject: `You Are Assigned As Jury for ${event_name}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to ' + email + ': ' + info.response);
  } catch (error) {
    console.error('Error sending email to ' + email + ':', error);
  }
}

export default sendGmailAssignJudge;