import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { getTemplateByName } from "../service/template.service.js";

dotenv.config();

// 🔥 replace variables
function replaceVariables(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] || "";
  });
}

// 🔥 ONLY BUTTON FIX
function fixButtons(html, dynamicLink) {
  return html.replace(
    /<span[^>]*background-color:\s*([^;"]+)[^>]*>(.*?)<\/span>/gi,
    (match, bgColor, text) => {
      
      let link = dynamicLink;

      if (text.toLowerCase().includes("contact")) {
        link = "mailto:support@awardsuite.in";
      }

      return `
      <a href="${link}"
         style="
           background:${bgColor};
           color:#ffffff;
           padding:12px 22px;
           text-decoration:none;
           border-radius:8px;
           display:inline-block;
           font-weight:600;
           margin:6px 8px;
           border:1px solid rgba(0,0,0,0.1);
           box-shadow:0 2px 6px rgba(0,0,0,0.15);
         ">
         ${text.trim()}
      </a>
      `;
    }
  );
}

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
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 🔥 GET TEMPLATE FROM DB
    let template = await getTemplateByName(
      "Judge Invitation",
      eventId
    );

    // 🔥 FALLBACK (FIRST TIME)
    if (!template) {
      template = {
        subject: "You Are Assigned As Jury for {{event.name}}",
        content: `
          <p>Dear {{judge.firstname}} {{judge.lastname}},</p>

          <p>You are invited to judge <b>{{event.name}}</b>.</p>

          <p>Round: <b>{{round.no}}</b></p>
          <p>Deadline: <b>{{round.end_date}} {{round.end_time}}</b></p>

          <span style="background-color: rgb(76, 175, 80); color:white;">
            Judging Portal
          </span>

          <p>Best Regards,<br/>
          {{organizer.firstname}} {{organizer.lastname}}</p>
        `,
      };
    }

    // 🔥 VARIABLES
    const variableData = {
      "judge.firstname": first_name,
      "judge.lastname": last_name,

      "event.name": event_name,
      "event.logo": `https://profession-mobility-included-advertisement.trycloudflare.com/uploads/${event_logo}`,

      "round.no": round_no,
      "round.end_date": end_date,
      "round.end_time": end_time,

      "organizer.firstname": organizer_first_name,
      "organizer.lastname": organizer_last_name,
    };

    // 🔥 BUTTON LINK
    const dynamicLink = `https://profession-mobility-included-advertisement.trycloudflare.com/jury-dashboard?judgemail=${email}&eventId=${eventId}&roundId=${alpharoundid}`;

    // 🔥 PROCESS CONTENT
    let processedContent = replaceVariables(template.content, variableData);

    // ✅ ONLY BUTTON FIX APPLY
    processedContent = fixButtons(processedContent, dynamicLink);

    const finalSubject = replaceVariables(template.subject, variableData);

    // 🔥 SAME GLOBAL EMAIL DESIGN
    const finalHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

  <div style="padding:40px 0;">
    
    <div style="max-width:650px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;">
      
      <!-- HEADER -->
      <div style="height:120px;background:linear-gradient(to right,#2ec4b6,#66bb2a);"></div>

      <!-- LOGO -->
      <div style="text-align:center;margin-top:-50px;">
        <img src="${variableData["event.logo"]}"
             style="width:90px;height:90px;border-radius:50%;background:#fff;padding:5px;" />
      </div>

      <!-- CONTENT -->
      <div style="padding:30px;">
        
        <h2 style="text-align:center;">
          ${variableData["event.name"]}
        </h2>

        ${processedContent}

      
        
      </div>

    </div>

  </div>

</body>
</html>
`;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Awards Nomination"}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: finalSubject,
      html: finalHtml,
    });

    console.log("Judge Assign Email sent ✅");

  } catch (error) {
    console.error("Judge Assign Email error ❌:", error);
  }
}

export default sendGmailAssignJudge;