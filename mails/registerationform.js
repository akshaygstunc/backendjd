import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { getTemplateByName } from "../service/template.service.js";

dotenv.config();
function fixAlignment(html) {
  return html
    .replace(/class="ql-align-center"/g, 'style="text-align:center;"')
    .replace(/class="ql-align-right"/g, 'style="text-align:right;"')
    .replace(/class="ql-align-left"/g, 'style="text-align:left;"');
}

function fixButtons(html) {
  return html.replace(
    /<span[^>]*background-color:[^>]*>(.*?)<\/span>/gi,
    (_, text) => {
      return `
        <div style="text-align:center;margin:20px 0;">
          <a href="https://awardsuite.in/login"
             style="
               background:#4CAF50;
               color:#ffffff;
               padding:12px 24px;
               text-decoration:none;
               border-radius:6px;
               display:inline-block;
               font-weight:600;
             ">
             ${text}
          </a>
        </div>
      `;
    }
  );
}
// 🔥 Extract field
function extractFieldValue(fields, keyName) {
  const matchingKey = Object.keys(fields).find((key) =>
    key.toLowerCase().includes(keyName.toLowerCase())
  );
  return matchingKey ? fields[matchingKey] : "";
}

// 🔥 Replace variables
function replaceVariables(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] || "";
  });
}

async function sendRegistrationAcknowledgement(email, fields, event, emailadminget) {
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

    const firstName = extractFieldValue(fields, "firstName");
    const lastName = extractFieldValue(fields, "lastName");

    const eventId = event.id || event.event_id;

    // 🔥 GET TEMPLATE
    let template = await getTemplateByName(
      "Registration Acknowledgement",
      eventId
    );

    // 🔥 FALLBACK
    if (!template) {
      template = {
        subject: "Registration Successful",
        content: `<p>Hello {{user.firstname}}</p>`,
      };
    }

    // 🔥 VARIABLES
    const variableData = {
      "user.firstname": firstName,
      "user.lastname": lastName,
      "event.name": event.event_name,
      "event.logo": `https://avoid-rachel-performing-drainage.trycloudflare.com/uploads/${event.event_logo}`,
    };

    // 🔥 CONTENT PROCESS
let processedContent = replaceVariables(template.content, variableData);
    const finalSubject = replaceVariables(template.subject, variableData);

// ✅ ONLY BUTTON FIX
processedContent = fixButtons(processedContent);
    // 🔥 FIXED EMAIL DESIGN (WRAPPER)
const finalHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial, sans-serif;">

  <div style="padding:40px 0;">
    
    <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- 🔥 GRADIENT HEADER -->
      <div style="height:120px;background:linear-gradient(to right,#2ec4b6,#66bb2a);"></div>

      <!-- 🔥 LOGO (TOP CENTER) -->
      <div style="text-align:center;margin-top:-50px;">
        <img src="${variableData["event.logo"]}" 
             style="width:100px;height:100px;border-radius:50%;background:#fff;padding:5px;" />
      </div>

      <!-- 🔥 CONTENT -->
      <div style="padding:30px;text-align:left;">

        <!-- EVENT NAME -->
        <h2 style="text-align:center;margin-bottom:20px;">
          ${variableData["event.name"]}
        </h2>

        <!-- 🔥 TEMPLATE CONTENT -->
        ${processedContent}

     
        

      </div>

    </div>

  </div>

</body>
</html>
`;
    const mailOptions = {
      from: `"Awards Nomination" <${process.env.SMTP_USER}>`,
      to: [email, emailadminget],
      subject: finalSubject,
      html: finalHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;

  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

export default sendRegistrationAcknowledgement;