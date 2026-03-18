import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

function extractFieldValue(fields, keyName) {
  const matchingKey = Object.keys(fields).find((key) => key.startsWith(keyName));
  return matchingKey ? fields[matchingKey] : '';
}

async function sendRegistrationAcknowledgement(email, fields, event,emailadminget) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const firstName = extractFieldValue(fields, 'firstName');
    const lastName = extractFieldValue(fields, 'lastName');
    const logoUrl = `https://judgify-api.phanomprofessionals.com/uploads/${event.logo}`;

    console.log("firstName:", firstName);
    console.log("lastName:", lastName);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 0; }
            .container { background-color: white; padding: 20px; max-width: 600px; margin: 20px auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .logo { max-width: 200px; margin-bottom: 20px; }
            .cta-button { background-color: #c32728; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            .cta-button:hover { background-color: #9a2123; }
            .footer { margin-top: 30px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
                  <img src="https://judgify-api.phanomprofessionals.com/uploads/${event.event_logo}" alt="${event.event_name} Logo" style="max-width: 100%; height: auto;">
            <h2>Registration Successful</h2>
            <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
            <p>Thank you for registering to file nomination for <strong>${event.event_name}</strong>. We appreciate your interest in participating!</p>
            <p>Please note that this email confirms your registration for filing the nomination but does not confirm your nomination itself. To complete the process, you must submit the entry form before the deadline.</p>
            <p>We look forward to receiving your completed submission.</p>
            <br/>
<a href="https://awardsuite.in/" class="cta-button">Click here to log in</a>
            <div class="footer">
              <p>Best Regards,</p>
              <p>The ${event.event_name} Team</p>
              <a href="https://awardsuite.in">AwardSuite.in</a>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: "online@awardsuite.in",
      to: [email, emailadminget], // 👈 Sends to both user and admin
      subject: `Registration Successful - ${event.event_name}`,
      html: htmlContent,
      text: `Dear ${firstName} ${lastName}, thank you for registering for ${event.event_name}. Visit: ${event.event_url}`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export default sendRegistrationAcknowledgement;
