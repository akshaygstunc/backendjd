// utils/sendJudgeScoreEmail.js

import nodemailer from 'nodemailer';

export const sendJudgeScoreEmail = async ({ judge, event, round, organizer }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., smtp.example.com
    port: 567,
    secure: false, // true for 465, false for 567
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <h2>Judge Score List</h2>
    <img src="${event.logo}" alt="Event Logo" width="120" />
    <p>Hi ${judge.firstname} ${judge.lastname},</p>
    <p>
      Thank you for your commitment and valuable contribution to the judging process for <strong>${event.name}</strong>.
    </p>
    <p>You can review the jury evaluation for Round <strong>${round.no}</strong>.</p>
    <p>Best Regards,</p>
    <p>${organizer.firstname} ${organizer.lastname}<br />
    Awards Suite - Awards, Simplified. Excellence, Delivered.</p>
  `;

  const mailOptions = {
    from: 'online@awardsuite.in',
    to: judge.email,
    subject: `Judge Score - ${event.name}`,
    html,
  };

  await transporter.sendMail(mailOptions);
};
