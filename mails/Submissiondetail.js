import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { getTemplateByName } from "../service/template.service.js";

dotenv.config();

const user = process.env.SMTP_USER;
const fromName = process.env.SMTP_FROM_NAME || "Awards Nomination";

// 🔥 replace variables
function replaceVariables(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] || "";
  });
}

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

    const submittedDate = new Date().toLocaleDateString("en-US");

    const emailadminget = event?.email;

    // 🔥 BCC CLEAN
    const bccList = [...new Set([emailadminget, ...additionalEmails])].filter(
      (email) => email && email !== userEmail
    );

    const eventId = event.id || event.event_id;

    // 🔥 GET TEMPLATE FROM DB
    let template = await getTemplateByName(
      "Submission Details",
      eventId
    );

    // 🔥 FALLBACK (FIRST TIME)
    if (!template) {
      template = {
        subject: "Submission Successful - {{event.name}}",
        content: `
        <div style="background:#f4f4f4;padding:40px 0;">
          <div style="max-width:650px;margin:auto;background:#fff;border-radius:10px;overflow:hidden;">
            
            <div style="height:120px;background:linear-gradient(to right,#2ec4b6,#66bb2a);"></div>

            <div style="padding:30px;text-align:center;">
              <h2>{{event.name}}</h2>

              <p>Dear {{user.firstname}} {{user.lastname}},</p>

              <p>Your submission has been received.</p>

              <p>
                We acknowledge your nomination submitted on 
                <b>{{submission.date}}</b>.
              </p>

              <br/>

              <a href="{{submission.link}}"
                style="background:#c32728;color:white;padding:10px 20px;text-decoration:none;">
                Modify or revise your nomination
              </a>

              <p style="margin-top:20px;">
                Best Regards,<br/>
                <b>{{event.name}} Team</b>
              </p>

              <div style="margin-top:30px;background:#eee;padding:15px;">
                <span style="color:#4CAF50;">Judgify</span> - Simplify your judging process
              </div>
            </div>
          </div>
        </div>
        `,
      };
    }

    // 🔥 VARIABLES
    const variableData = {
      "user.firstname": first_name,
      "user.lastname": last_name,

      "event.name": event.event_name,
      "event.logo": `https://judgify-api.phanomprofessionals.com/uploads/${event.event_logo}`,

      "submission.date": submittedDate,
      "submission.link": "https://awardsuite.in/submission",
    };

    const finalHtml = replaceVariables(template.content, variableData);
    const finalSubject = replaceVariables(template.subject, variableData);

    const mailOptions = {
      from: `"${fromName}" <${user}>`,
      to: userEmail,
      bcc: bccList,
      subject: finalSubject,
      html: finalHtml,
      text: `Submission successful for ${event.event_name}`,
    };

    console.log("📧 Sending email to:", userEmail);
    console.log("📩 BCC:", bccList);

    const info = await transporter.sendMail(mailOptions);
    return info.response;

  } catch (error) {
    console.error("Submission Email error ❌:", error);
    throw error;
  }
}

export default Submissiondetail;