import {
  checkAwardId,
  checkeventId,
  checkroundId,
} from "../service/adminService.js";
import {
  checkjudgeId,
  createJudgeScore,
  criteriaCreate,
  getConfirmedScores,
  geteventDetail,
  getJudgeData,
  getJudgescoredata,
  getJudgetoScore,
  getJudgetoScoretest,
  getScorecardByEventRoundCategory,
  getScoresByDataNames,
  isJudgeLocked,
  TokengenrateForJudge,
} from "../service/judgeService.js";
import resposne from "../middleware/resposne.js";

export async function fetchJudgeData(req, res) {
  const { email, eventId, roundId } = req.query;

  // console.log("req", req.query)
  if (!email) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: "Judge Not Verified By Email. Try Again",
    });
  }

  try {
    const judgelock = await isJudgeLocked(email, eventId, roundId);
    console.log("judgelock", judgelock);
    if (judgelock) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: "You are locked by admin.",
      });
    }

    const jurydataget = await TokengenrateForJudge(email, eventId, roundId);
    if (!jurydataget || jurydataget.error) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.invaliduser,
      });
    }
    
    const juryAssignId = jurydataget.id;
    const results = await getJudgeData(email, eventId, roundId);
   const juryscoreconfrim = await  getConfirmedScores( eventId, roundId,juryAssignId);
   console.log("juryscoreconfrim", juryscoreconfrim);
    if (results.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }

    const eventData = await geteventDetail(eventId);
    // console.log("das",dashevent[0])
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      judgeid: juryAssignId,
      judgefirst: jurydataget.first_name,
      judgelastname: jurydataget.last_name,
      juryToken: jurydataget.token,
      dashdata: eventData,
      data: results,
      juryconfirm: juryscoreconfrim,
    });
  } catch (error) {
    console.log("error", error.message);
    return res.status(400).json({
      status: resposne.successFalse,
      message: error,
    });
  }
}
export async function fetchSubmissionsJudge(req, res) {
  const role = req.user.role;

  if (role !== "judge") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, awardId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const awardIdCheck = await checkAwardId(awardId);
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.AwardIdRequired,
    });
  }

  try {
    const results = await getJudgetoScore(eventId, awardId);

    if (results.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }

    const updatedResults = results.map((result) => {
      if (result.score === null) {
        result.score = "To be scored";
      }
      return result;
    });

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: updatedResults,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

export async function fetchSubmissionsToJudge(req, res) {
  const role = req.user.role;

  if (role !== "judge") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, awardId, submission_id, roundId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const awardIdCheck = await checkAwardId(awardId);
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.AwardIdRequired,
    });
  }

  try {
    // const scorefetch = await getScorecardByEventRoundCategory(eventId, awardId,roundId);
    const results = await getJudgescoredata(
      eventId,
      awardId,
      submission_id,
      roundId
    );

    if (results.submissionData.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: {
        submissionData: results.submissionData[0],
        scorecards: results.scorecards,
      },
      // scorecards : scorefetch
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

export const judgeScore = async (req, res) => {
  const role = req.user.role;

  if (role !== "judge") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }

  const {
    eventId,
    awardId,
    roundId,
    judgeId,
    submission_id,
    abstain,
    comment,
    total,
    is_pending,
    is_completed,
    is_confirmed,
    criteria,
  } = req.body;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const awardIdCheck = await checkAwardId(awardId);
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.AwardIdRequired,
    });
  }
  const roundIdCheck = await checkroundId(roundId);
  if (!roundIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const judgeIdCheck = await checkjudgeId(judgeId);
  if (!judgeIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.judgeIdfail,
    });
  }

  try {
    const result = await createJudgeScore(
      eventId,
      awardId,
      roundId,
      judgeId,
      submission_id,
      abstain,
      comment,
      total,
      is_pending,
      is_completed,
      is_confirmed
    );

    if (criteria && criteria.length > 0) {
      try {
        const criteriaResult = await criteriaCreate(result.id, criteria);

        if (criteriaResult.error) {
          return res.status(400).json({
            status: resposne.successFalse,
            message: criteriaResult.error.message,
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: resposne.successFalse,
          message: error.message,
        });
      }
    }

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.judgescored,
      juryscoredId: result.id,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export const datanameValueGet = async (req, res) => {
  const role = req.user.role;

  if (role !== "judge") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { dataNames } = req.body;

  try {
    const result = await getScoresByDataNames(dataNames);
    if (!result) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }
    const updatedResults = result.map((result) => {
      if (result.score === null) {
        result.score = "To be scored";
      }
      return result;
    });
    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.judgescored,
      DATA: updatedResults,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
};

export async function fetchSubmissionsJudgetest1(req, res) {
  const role = req.user.role;
  const judgeId = req.user.id; // Assuming the judge ID is stored in req.user.id
  if (role !== "judge") {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.unauth,
    });
  }
  const { eventId, awardId, roundId } = req.query;

  const eventIdCheck = await checkeventId(eventId);
  if (!eventIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.eventIdfail,
    });
  }

  const awardIdCheck = await checkAwardId(awardId);
  if (!awardIdCheck) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: resposne.AwardIdRequired,
    });
  }

  try {
    const results = await getJudgetoScoretest(
      eventId,
      awardId,
      roundId,
      judgeId
    );
    console.log("results", results);
    if (results.length === 0) {
      return res.status(400).json({
        status: resposne.successFalse,
        message: resposne.nodatavail,
      });
    }

    const updatedResults = results.map((result) => {
      if (result.score === null) {
        result.score = "To be scored";
      }
      return result;
    });

    return res.status(200).json({
      status: resposne.successTrue,
      message: resposne.fetchSuccess,
      data: updatedResults,
    });
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
}

import fs from "fs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import connection from "../database/connection.js";

export const sendJudgeScorePDF = (req, res) => {
  const {eventId ,roundId, judgeId} = req.body;
  
  if (!eventId || !roundId || !judgeId) {
    return res
      .status(400)
      .json({ message: "eventId, roundId, and judgeId are required" });
  }

  // 1. Get judge info
  connection.query(
    `SELECT email, first_name, last_name 
     FROM jury_assign 
     WHERE eventId = ? AND roundId = ? AND id = ? AND is_deleted = 0`,
    [eventId, roundId, judgeId],
    (err, judgeResults) => {
      if (err) {
        console.error("DB error (judge):", err);
        return res.status(500).json({ message: "Database error (judge)" });
      }

      if (!judgeResults.length) {
        return res.status(404).json({ message: "Judge not found" });
      }

      const { email, first_name, last_name } = judgeResults[0];

      // 2. Get scores
      connection.query(
        `SELECT submission_id, total, comment 
         FROM jury_score 
         WHERE eventId = ? AND roundId = ? AND judgeId = ? AND is_deleted = 0`,
        [eventId, roundId, judgeId],
        (err, scoreResults) => {
          if (err) {
            console.error("DB error (scores):", err);
            return res.status(500).json({ message: "Database error (scores)" });
          }

          if (!scoreResults.length) {
            return res.status(404).json({ message: "No score data found" });
          }

          // 3. Create PDF
          const filePath = `./uploads/jury_scores_${judgeId}.pdf`;
          const doc = new PDFDocument();
          const writeStream = fs.createWriteStream(filePath);
          doc.pipe(writeStream);

          doc
            .fontSize(16)
            .text(`Jury Score Report: ${first_name} ${last_name}`, {
              underline: true,
            });
          doc.moveDown();

          scoreResults.forEach((score) => {
            doc.fontSize(12).text(`Submission ID: ${score.submission_id}`);
            doc.text(`Total Score: ${score.total}`);
            doc.text(`Comment: ${score.comment || "N/A"}`);
            doc.moveDown();
          });

          doc.end();

          writeStream.on("finish", () => {
            // 4. Email PDF
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST, // e.g., smtp.example.com
              port: 587,
              secure: false, // true for 465, false for 567
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });

            transporter.sendMail(
              {
                from: `"Award Suite" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Your Jury Score Summary",
                text: `Hi ${first_name},\n\nPlease find attached your jury score report for the event.`,
                attachments: [
                  {
                    filename: `jury_scores_${judgeId}.pdf`,
                    path: filePath,
                  },
                ],
              },
              (err, info) => {
                if (err) {
                  console.error("Email error:", err);
                  return res
                    .status(500)
                    .json({ message: "Failed to send email" });
                }
                res
                  .status(200)
                  .json({ message: "PDF emailed to judge successfully." });
              }
            );
          });

          writeStream.on("error", (err) => {
            console.error("PDF write error:", err);
            return res.status(500).json({ message: "Failed to write PDF" });
          });
        }
      );
    }
  );
};
