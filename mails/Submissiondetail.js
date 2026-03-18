import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function Submissiondetail(
  first_name,
  last_name,
  userEmail,
  event,
  additionalEmails = []
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const submittedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const logoUrl = `https://judgify-api.phanomprofessionals.com/uploads/${event.logo}`;
    const emailadminget = event?.email;

    // 🧹 Clean bcc: Remove userEmail if present
    const bccList = [...new Set([emailadminget, ...additionalEmails])].filter(
      (email) => email && email !== userEmail
    );

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
            <h2>${event.event_name}</h2>
            <p>Your submission has been received.</p>
            <p>Dear ${first_name} ${last_name},</p>
            <p>We acknowledge receipt of your nomination made on <strong>${submittedDate}</strong>, which has been accepted for processing.</p>
            <p>Kindly find your nomination details below:</p>
            
<a href="https://awardsuite.in/submission"
   style="background-color: #c32728; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
   Click here to modify or revise your nomination
</a>
            <div class="footer">
              <p>Best Regards,<br>${event.event_name} Team<br>Award – Suite your awards management</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: "online@awardsuite.in",
      to: userEmail, // main user only
      bcc: bccList, // admin & additional, no duplicates
      subject: `Submission Successful - ${event.event_name}`,
      html: htmlContent,
      text: `Dear ${first_name} ${last_name}, thank you for registering for ${event.event_name}. Visit: ${event.event_url}`,
    };

    console.log("📧 Sending email to:", userEmail);
    console.log("📩 BCC to:", bccList);

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export default Submissiondetail;
