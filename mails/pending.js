import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { getTemplateByName } from "../service/template.service.js";

dotenv.config();
import db from "../database/connection.js";

async function getEventDetails(eventid) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM event_details WHERE id = ? LIMIT 1`;

    db.query(sql, [eventid], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}


async function getUserDetails(userId) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM user WHERE id = ? LIMIT 1`;

    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
}
// 🔥 replace variables
function replaceVariables(template, data) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] || "";
  });
}
async function sendPendingPaymentaaaaaa(order, eventid, userId) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 🔥 GET EVENT
    const event = await getEventDetails(eventid);
    if (!event) throw new Error("Event not found");

    // 🔥 GET USER
    const user = await getUserDetails(userId);
    if (!user) throw new Error("User not found");

    // 🔥 GET TEMPLATE
    let template = await getTemplateByName(
      "Pending Payment Notification",
      eventid
    );

    // 🔥 FALLBACK
    if (!template) {
      template = {
        subject: "Payment Pending - {{event.name}}",
        content: `
          <p>Dear {{user.firstname}} {{user.lastname}},</p>
          <p>Your payment is pending for order <b>{{order.order_ref_no}}</b></p>
          <span style="background:#c32728;color:#fff;padding:10px 20px;">
            Complete Payment
          </span>
        `,
      };
    }

    // 🔥 VARIABLES (NOW FULLY DYNAMIC)
    const variableData = {
      "user.firstname": user.first_name,
      "user.lastname": user.last_name,

      "event.name": event.event_name,
      "event.logo": `https://profession-mobility-included-advertisement.trycloudflare.com/uploads/${event.event_logo}`,

      "order.order_ref_no": order.entry_id || order.order_ref_no,
      "order.orderlist": order.orderlist || "",
      "order.submissionlist": order.submissionlist || "",
    };

    const processedContent = replaceVariables(template.content, variableData);
    const finalSubject = replaceVariables(template.subject, variableData);

    // 🔥 DESIGN SAME (NO CHANGE)
    const finalHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

  <div style="padding:40px 0;">
    
    <div style="max-width:650px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;">
      
      <div style="height:120px;background:linear-gradient(to right,#2ec4b6,#66bb2a);"></div>

      <div style="text-align:center;margin-top:-50px;">
        <img src="${variableData["event.logo"]}"
             style="width:90px;height:90px;border-radius:50%;background:#fff;padding:5px;" />
      </div>

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
      from: `"Awards Nomination" <${process.env.SMTP_USER}>`,
      to: user.email, // 🔥 FROM DB
      subject: finalSubject,
      html: finalHtml,
    });

    console.log("Pending Payment Email sent ✅");

  } catch (error) {
    console.error("Pending Payment Email error ❌:", error);
  }
}
export default sendPendingPaymentaaaaaa;