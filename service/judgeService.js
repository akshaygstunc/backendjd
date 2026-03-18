import db from "../database/connection.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const saltRounds = 10;
import resposne from "../middleware/resposne.js";
dotenv.config();

export function TokengenrateForJudge(email, eventId, roundId) {
  return new Promise((resolve, reject) => {
    const userQuery = `SELECT * FROM jury_assign 
WHERE email = ? 
  AND eventId = ? 
  AND roundId = ? 
  AND is_deleted = 0;`;

    db.query(userQuery, [email, eventId, roundId], (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return reject({ error: "Database error occurred" });
      }

      if (results.length === 0) {
        return resolve({ error: resposne.invaliduser }); 
      }

      const user = results[0];
      const token = jwt.sign(
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      resolve({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        token,
      });
    });
  });
}

export function getJudgeData(email, eventId, roundId) {
  const query = `
    SELECT 
        ed.id AS eventId,
        ed.event_name,
        ed.event_logo,
        ed.jury_welcm_messsage,
        gs.id AS roundId,
        gs.*, 
        ja.id AS juryAssignId,
        ja.email AS judge_email,
        ja.first_name,
        ja.last_name,
        ja.role,
        js.id AS juryScoreId,
        js.submission_id,
        js.is_pending,
        js.is_completed,
        js.is_confirmed,
        sd.*
    FROM jury_assign AS ja
    LEFT JOIN event_details AS ed ON ja.eventId = ed.id
    LEFT JOIN general_settings AS gs ON ja.roundId = gs.id
    LEFT JOIN jury_score AS js ON ja.id = js.judgeId
    LEFT JOIN shortlist_data AS sd ON ja.eventId = sd.eventId AND ja.roundId = sd.roundId
    WHERE ja.email = ?
      AND ja.eventId = ?
      AND ja.roundId = ?
      AND ja.is_deleted = 0
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [email, eventId, roundId], async (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return reject('No judge data found for the provided juryAssignId, eventId, and roundId.');
      }

      const judgeData = results[0];

      // Query: All category stats for this event & round
      const categoryQuery = `
        SELECT 
          ac.id AS awardId,
          ac.category_name,
          ac.category_prefix,
          COUNT(DISTINCT sd.submission_id) AS total_submissionCount,
          COUNT(DISTINCT js.submission_id) AS scored_submissionCount
        FROM awards_category AS ac
        LEFT JOIN general_settings AS gs ON ac.eventId = gs.eventId
        LEFT JOIN shortlist_data AS sd 
          ON ac.eventId = sd.eventId 
          AND sd.roundId = ?
          AND LEFT(sd.submission_id, LENGTH(ac.category_prefix)) = ac.category_prefix
        LEFT JOIN entry_data AS ed 
          ON sd.submission_id = ed.submission_id 
          AND ac.id = ed.awardcatId
        LEFT JOIN jury_score AS js 
          ON ed.awardcatId = js.awardId 
          AND ed.submission_id = js.submission_id 
          AND LEFT(js.submission_id, LENGTH(ac.category_prefix)) = ac.category_prefix
        WHERE ac.eventId = ?
          AND ac.is_deleted = 0
        GROUP BY ac.id, ac.category_name, ac.category_prefix
      `;

      db.query(categoryQuery, [roundId, eventId], async (categoryError, categoryResults) => {
        if (categoryError) {
          return reject(categoryError);
        }

        // Query: Judge-specific stats for this round
        const judgeSpecificCategoryQuery = `
          SELECT 
            ac.id AS awardId,
            ac.category_name,
            ac.category_prefix,
            COUNT(DISTINCT sd.submission_id) AS total_submissionCount,
            COUNT(DISTINCT js.submission_id) AS scored_submissionCount
          FROM awards_category AS ac
          LEFT JOIN general_settings AS gs ON ac.eventId = gs.eventId
          LEFT JOIN shortlist_data AS sd 
            ON ac.eventId = sd.eventId 
            AND sd.roundId = ?
            AND LEFT(sd.submission_id, LENGTH(ac.category_prefix)) = ac.category_prefix
          LEFT JOIN entry_data AS ed 
            ON sd.submission_id = ed.submission_id 
            AND ac.id = ed.awardcatId
          LEFT JOIN jury_score AS js 
            ON ed.awardcatId = js.awardId 
            AND ed.submission_id = js.submission_id 
            AND js.judgeId = ?
            AND LEFT(js.submission_id, LENGTH(ac.category_prefix)) = ac.category_prefix
          WHERE ac.eventId = ?
            AND ac.is_deleted = 0
          GROUP BY ac.id, ac.category_name, ac.category_prefix
        `;

        db.query(judgeSpecificCategoryQuery, [roundId, judgeData.juryAssignId, eventId], async (judgeSpecificCategoryError, judgeSpecificCategoryResults) => {
          if (judgeSpecificCategoryError) {
            return reject(judgeSpecificCategoryError);
          }

          const rearrangedData = {
            eventId: judgeData.eventId,
            roundId: judgeData.roundId,
            jury_welcm_messsage : judgeData.jury_welcm_messsage,
            juryAssignId: judgeData.juryAssignId,
            judge_email: judgeData.judge_email,
            firstName: judgeData.first_name,
            lastName: judgeData.last_name,
            role: judgeData.role,
            is_active: judgeData.is_active,
            is_one_at_a_time: judgeData.is_one_at_a_time,
            is_individual_category_assigned: judgeData.is_individual_category_assigned,
            is_Completed_Submission: judgeData.is_Completed_Submission,
            is_jury_print_send_all: judgeData.is_jury_print_send_all,
            is_scoring_dropdown: judgeData.is_scoring_dropdown,
            is_comments_box_judging: judgeData.is_comments_box_judging,
            is_data_single_page: judgeData.is_data_single_page,
            is_total: judgeData.is_total,
            is_jury_others_score: judgeData.is_jury_others_score,
            is_abstain: judgeData.is_abstain,
            overall_score: judgeData.overall_score,
            award_categories: await Promise.all(
              judgeSpecificCategoryResults.map(async (row) => {
                let scoreStatus = 'To be scored';
                if (row.total_submissionCount === row.scored_submissionCount) {
                  scoreStatus = 'scored';
                } else {
                  const isAllScoredByJudge = await checkJudgeScoreStatus(
                    eventId,
                    row.awardId,
                    roundId,
                    judgeData.juryAssignId
                  );
                  scoreStatus = isAllScoredByJudge;
                }
console.log("score", judgeData);
                return {
                  awardId: row.awardId,
                  categoryName: row.category_name,
                  totalSubmissions: row.total_submissionCount,
                  scored_submissions: row.scored_submissionCount || 0,
                  scoreStatus: scoreStatus,
                };
              })
            ),
          };

          resolve(rearrangedData);
        });
      });
    });
  });
}



export function checkJudgeScoreStatus(eventId, awardId, roundId, judgeId, totalSubmissionCount) {
  const query = `
    SELECT COUNT(DISTINCT js.submission_id) AS scored_count
    FROM jury_score AS js
    WHERE js.eventId = ? 
      AND js.awardId = ? 
      AND js.roundId = ? 
      AND js.judgeId = ?;
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId, awardId, roundId, judgeId], (error, results) => {
      if (error) {
        return reject(error);
      }

      const scoredCount = results[0].scored_count;

      if (scoredCount === totalSubmissionCount) {
        resolve('scored');
      } else {
        resolve('To be scored');
      }
    });
  });
}



export function getJudgetoScore(eventId, awardId,roundId) {
  const query = `
    SELECT 
        sd.submission_id,
        sd.roundId,
        sd.shortlist_round,
        sd.score,
        ed.eventId,
        ed.awardcatId AS awardId,
        ed.field_name,
        ed.field_value,
        ed.status,
        CASE 
            WHEN js.submission_id IS NOT NULL THEN 'scored'
            ELSE 'To be scored'
        END AS scoreStatus
    FROM shortlist_data AS sd
    LEFT JOIN entry_data AS ed 
        ON sd.submission_id = ed.submission_id 
        AND sd.eventId = ed.eventId
    LEFT JOIN jury_score AS js 
        ON sd.submission_id = js.submission_id
        AND sd.eventId = js.eventId
    WHERE sd.eventId = ?
        AND ed.awardcatId = ?
        AND sd.is_deleted = 0
        AND ed.is_deleted = 0
        AND ed.field_name LIKE 'title-%'
  `;

  const values = [eventId, awardId,roundId];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) {
        return reject(error);
      }
console.log("results", results);
      const submissionData = {};

      results.forEach(row => {
        if (!submissionData[row.submission_id]) {
          submissionData[row.submission_id] = {
            eventId: row.eventId,
            awardId: row.awardId,
            submission_id: row.submission_id,
            roundId: row.roundId,
            shortlist_round: row.shortlist_round,
            scoreStatus: row.scoreStatus, 
          };
        }

        submissionData[row.submission_id][row.field_name] = row.field_value;
      });

      resolve(Object.values(submissionData));
    });
  });
}


// export function getJudgescoredata(eventId, awardId, submission_id,roundId) {
//   const query = `
//       SELECT DISTINCT
//           sd.submission_id,
//           sd.roundId,
//           sd.shortlist_round,
//           ed.eventId,
//           ed.awardcatId AS awardId,
//           ed.id AS entrydataId,
//           ed.field_name,
//           ed.field_value,
//           ed.status,
//           s.id AS scorecardId,
//           s.form_schema,
//           s.overall_value,
//           s.categoryId AS scoreawardid,
//           sc.id AS scorecardCategoryId,
//           sc.eventId AS scorecardEventId,
//           sc.roundId AS scorecardRoundId,
//           sc.scoreFormId,
//           sc.scorecard_category,
//           gs. *
//       FROM shortlist_data AS sd
//       LEFT JOIN entry_data AS ed 
//         ON sd.submission_id = ed.submission_id 
//         AND sd.eventId = ed.eventId
//       LEFT JOIN scorecard AS s 
//         ON sd.eventId = s.eventId
//         AND sd.roundId = s.roundId
//       LEFT JOIN scorecard_categories AS sc 
//         ON s.id = sc.scoreFormId
//         AND sd.eventId = sc.eventId
//         AND sd.roundId = sc.roundId
//       LEFT JOIN general_settings AS gs 
//       ON sd.eventId = gs.eventId
//       AND sd.roundId = gs.id
//       WHERE sd.eventId = ? 
//         AND sd.submission_id = ? 
//         AND sd.is_deleted = 0 
//         AND ed.is_deleted = 0
//         AND s.categoryId = ?
//         AND s.roundId = ?
//     `;

//   const values = [eventId, submission_id, awardId,roundId];

//   return new Promise((resolve, reject) => {
//     db.query(query, values, (error, results) => {
//       if (error) {
//         return reject(error);
//       }

//       const submissionData = {};
//       const scorecardsMap = {};

//       results.forEach(row => {
//         if (!submissionData[row.submission_id]) {
//           submissionData[row.submission_id] = {
//             eventId: row.eventId,
//             awardId: row.awardId,
//             roundId: row.roundId,
//             shortlist_round: row.shortlist_round,
//             submission_id: row.submission_id,
//             is_one_at_a_time: row.is_one_at_a_time,
//             is_individual_category_assigned: row.is_individual_category_assigned,
//             is_Completed_Submission: row.is_Completed_Submission,
//             is_jury_print_send_all: row.is_jury_print_send_all,
//             is_scoring_dropdown: row.is_scoring_dropdown,
//             is_comments_box_judging: row.is_comments_box_judging,
//             is_data_single_page: row.is_data_single_page,
//             is_total: row.is_total,
//             is_jury_others_score: row.is_jury_others_score,
//             is_abstain: row.is_abstain,
//             overall_score: row.overall_score,
//             fields: [],
//           };
//         }

//         if (!scorecardsMap[row.scorecardId]) {
//           scorecardsMap[row.scorecardId] = {
//             scoreFormId: row.scoreFormId,
//             eventId: row.scorecardEventId,
//             awardId: row.scorecardCategoryId,
//             roundId: row.scorecardRoundId,
//             category: row.scorecard_category,
//             form_schema: row.form_schema,
//             overall_score:row.overall_value,
//             scoreawardid: row.scoreawardid,
//           };
//         }

//         const fieldExists = submissionData[row.submission_id].fields.map(field => field.hasOwnProperty(row.field_name)).includes(true);
//         if (!fieldExists) {
//           submissionData[row.submission_id].fields.push({
//             entryDataId: row.entrydataId,
//             [row.field_name]: row.field_value,
//           });
//         }
//       });

//       const scorecards = Object.values(scorecardsMap);

//       resolve({
//         submissionData: submissionData[submission_id] ? [submissionData[submission_id]] : [],
//         scorecards: scorecards,
//       });
//     });
//   });
// }

export function getJudgescoredata(eventId, awardId, submission_id, roundId) {
  const query = `
    SELECT DISTINCT
        sd.submission_id,
        sd.roundId,
        sd.shortlist_round,
        ed.eventId,
        ed.awardcatId AS awardId,
        ed.id AS entrydataId,
        ed.field_name,
        ed.field_value,
        ed.status,
        s.id AS scorecardId,
        s.form_schema,
        s.overall_value,
        s.categoryId AS scoreawardid,
        sc.id AS scorecardCategoryId,
        sc.eventId AS scorecardEventId,
        sc.roundId AS scorecardRoundId,
        sc.scoreFormId,
        sc.scorecard_category,
        gs.*,
        ef.id AS entry_form_id
    FROM shortlist_data AS sd
    LEFT JOIN entry_data AS ed 
        ON sd.submission_id = ed.submission_id 
        AND sd.eventId = ed.eventId
     LEFT JOIN entry_form AS ef 
      ON ef.eventId = sd.eventId 
    LEFT JOIN scorecard AS s 
        ON s.eventId = sd.eventId
        AND s.roundId = sd.roundId
        AND s.categoryId = ?
        AND s.is_deleted = 0
        AND s.is_active = 1
    LEFT JOIN scorecard_categories AS sc 
        ON s.id = sc.scoreFormId
        AND sc.eventId = sd.eventId
        AND sc.roundId = sd.roundId
    LEFT JOIN general_settings AS gs 
        ON gs.eventId = sd.eventId
        AND gs.id = sd.roundId
    WHERE sd.eventId = ? 
      AND sd.submission_id = ? 
      AND sd.is_deleted = 0 
      AND ed.is_deleted = 0
      AND sd.roundId = ?
  `;

  const values = [awardId, eventId, submission_id, roundId];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) return reject(error);

      const submissionData = {};
      const scorecardsMap = {};

      results.forEach(row => {
        if (!submissionData[row.submission_id]) {
          submissionData[row.submission_id] = {
            eventId: row.eventId,
            awardId: row.awardId,
            roundId: row.roundId,
            shortlist_round: row.shortlist_round,
            submission_id: row.submission_id,
            is_one_at_a_time: row.is_one_at_a_time,
            is_individual_category_assigned: row.is_individual_category_assigned,
            is_Completed_Submission: row.is_Completed_Submission,
            is_jury_print_send_all: row.is_jury_print_send_all,
            is_scoring_dropdown: row.is_scoring_dropdown,
            is_comments_box_judging: row.is_comments_box_judging,
            is_data_single_page: row.is_data_single_page,
            is_total: row.is_total,
            is_jury_others_score: row.is_jury_others_score,
            is_abstain: row.is_abstain,
            overall_score: row.overall_score,
            entry_form_id: row.entry_form_id, // <-- Add this line
            fields: [],
          };
        }

        if (!scorecardsMap[row.scorecardId]) {
          scorecardsMap[row.scorecardId] = {
            scoreFormId: row.scoreFormId,
            eventId: row.scorecardEventId,
            awardId: row.scorecardCategoryId,
            roundId: row.scorecardRoundId,
            category: row.scorecard_category,
            form_schema: row.form_schema,
            overall_score: row.overall_value,
            scoreawardid: row.scoreawardid,
          };
        }

        const fieldExists = submissionData[row.submission_id].fields.some(
          field => field.hasOwnProperty(row.field_name)
        );
        if (!fieldExists) {
          submissionData[row.submission_id].fields.push({
            entryDataId: row.entrydataId,
            [row.field_name]: row.field_value,
          });
        }
      });

      const scorecards = Object.values(scorecardsMap);

      resolve({
        submissionData: submissionData[submission_id] ? [submissionData[submission_id]] : [],
        scorecards: scorecards,
      });
    });
  });
}

export const geteventDetail = async (eventId) => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
          e.*, 
          g.start_date, 
          g.start_time, 
          g.end_date, 
          g.end_time,
          g.is_active AS active_round
        FROM event_details e
        LEFT JOIN general_settings g ON e.id = g.eventId
        WHERE e.id = ?;
      `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        console.error("Error fetching event details:", err);
        reject({ success: false, message: "Error fetching event details", error: err });
      } else {
        resolve(results[0]);
      }
    });
  });
};

// export async function createJudgeScore(
//   eventId,
//   awardId,
//   roundId,
//   judgeId,
//   submission_id,
//   abstain,
//   comment,
//   total,
//   is_pending,
//   is_completed,
//   is_confirmed,
// ) {
//   const insertSql = `
//     INSERT INTO jury_score (
//       eventId,
//       awardId,
//       roundId,
//       judgeId,
//       submission_id,
//       abstain,
//       comment,
//       total,
//       is_pending,
//       is_completed,
//       is_confirmed,
//       status
//     ) 
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scored');
//   `;

//   const values = [
//     eventId,
//     awardId,
//     roundId,
//     judgeId,
//     submission_id,
//     abstain,
//     comment,
//     total,
//     is_pending,
//     is_completed,
//     is_confirmed,
    
//   ];

//   try {
//     const result = await new Promise((resolve, reject) => {
//       db.query(insertSql, values, (insertError, result) => {
//         if (insertError) {
//           console.log("Error inserting event:", insertError);
//           return reject(
//             new Error(`Error inserting event: ${insertError.message}`)
//           );
//         }
//         if (result.insertId) {
//           resolve(result.insertId);
//         } else {
//           reject(new Error("jury Score creation failed: No insert ID"));
//         }
//       });
//     });

//     return {
//       id: result,
//     };
//   } catch (error) {
//     throw new Error(`Database error: ${error.message}`);
//   }
// }
export async function createJudgeScore(
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
) {
  const checkSql = `
    SELECT id FROM jury_score 
    WHERE eventId = ? AND awardId = ? AND roundId = ? AND judgeId = ? AND submission_id = ?
  `;

  const deleteSql = `
    DELETE FROM jury_score 
    WHERE eventId = ? AND awardId = ? AND roundId = ? AND judgeId = ? AND submission_id = ?
  `;

  const insertSql = `
    INSERT INTO jury_score (
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
      status
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scored');
  `;

  const values = [
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
  ];

  try {
    // Check if record already exists
    const existingRecord = await new Promise((resolve, reject) => {
      db.query(checkSql, [eventId, awardId, roundId, judgeId, submission_id], (err, result) => {
        if (err) {
          reject(new Error(`Error checking for existing record: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });

    // If record exists, delete it
    if (existingRecord.length > 0) {
      await new Promise((resolve, reject) => {
        db.query(deleteSql, [eventId, awardId, roundId, judgeId, submission_id], (err, result) => {
          if (err) {
            reject(new Error(`Error deleting existing record: ${err.message}`));
          } else {
            resolve(result);
          }
        });
      });
    }

    // Insert new record
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, insertResult) => {
        if (insertError) {
          console.log("Error inserting judge score:", insertError);
          return reject(new Error(`Error inserting judge score: ${insertError.message}`));
        }
        if (insertResult.insertId) {
          resolve(insertResult.insertId);
        } else {
          reject(new Error("Jury Score creation failed: No insert ID"));
        }
      });
    });

    return {
      id: result,
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}


export function criteriaCreate(juryscoreId, criteria) {

  return new Promise((resolve, reject) => {
    if (!Array.isArray(criteria)) {
      const error = new Error("criteria must be an array");
      return reject(error);
    }

    const insertSql = `INSERT INTO criteria (juryscoreId, score, score_title, score_comment,is_pending,is_completed,
    is_confirmed,dataName) VALUES (?, ?, ?, ?, ?, ?, ?,?)`;

    const queries = criteria.map((item) => {
      return new Promise((res, rej) => {
        const values = [juryscoreId, item.score, item.score_title, item.score_comment, item.is_pending, item.is_completed, item.is_confirmed,item.dataName];

        db.query(insertSql, values, (error, result) => {
          if (error) {
            rej(new Error(`Error inserting criteria for score title '${item.score_title}': ${error.message}`));
          } else {
            res(result.insertId);
          }
        });
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => {
        reject(new Error(`Error inserting criteria: ${error.message}`));
      });
  });
}

export function checkjudgeId(judgeId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign WHERE id = ?";
    db.query(query, [judgeId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}
export const getScoresByDataNames = (dataNames) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(dataNames) || dataNames.length === 0) {
      return reject(new Error("Invalid dataNames array"));
    }

    const placeholders = dataNames.map(() => "?").join(",");
    const sql = `SELECT dataName, score FROM criteria WHERE dataName IN (${placeholders}) AND is_active = 1 AND is_deleted = 0`;

    db.query(sql, dataNames, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
export function getJudgetoScoretest(eventId, awardId, roundId, judgeId) {
  const query = `
    SELECT 
        sd.submission_id,
        sd.roundId,
        sd.shortlist_round,
        sd.score,
        ed.eventId,
        ed.awardcatId AS awardId,
        ed.field_name,
        ed.field_value,
        ed.status,
        js.total AS judge_score,
        CASE 
            WHEN js.submission_id IS NOT NULL 
                 AND js.judgeId = ? 
                 AND js.eventId = ? 
                 AND js.awardId = ? 
                 AND js.total IS NOT NULL 
            THEN 'scored'
            ELSE 'not scored'
        END AS scoreStatus
    FROM shortlist_data AS sd
    LEFT JOIN entry_data AS ed 
        ON sd.submission_id = ed.submission_id 
        AND sd.eventId = ed.eventId
    LEFT JOIN jury_score AS js 
        ON sd.submission_id = js.submission_id
        AND sd.eventId = js.eventId
        AND js.roundId = ?
        AND js.judgeId = ?
        AND js.awardId = ?
    WHERE sd.eventId = ?
        AND sd.roundId = ?
        AND ed.awardcatId = ?
        AND sd.is_deleted = 0
        AND ed.is_deleted = 0
        AND ed.field_name LIKE 'title-%'
  `;

  const values = [judgeId, eventId, awardId, roundId, judgeId, awardId, eventId, roundId, awardId];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) {
        return reject(error);
      }

      const submissionData = {};

      results.forEach(row => {
        if (!submissionData[row.submission_id]) {
          submissionData[row.submission_id] = {
            eventId: row.eventId,
            awardId: row.awardId,
            submission_id: row.submission_id,
            roundId: row.roundId,
            shortlist_round: row.shortlist_round,
            scoreStatus: row.scoreStatus,
            judge_score: row.judge_score || 0

          };
        }

        submissionData[row.submission_id][row.field_name] = row.field_value;
      });

      resolve(Object.values(submissionData));
    });
  });
}




export const getJudgeDetailsFromAssign = async (eventId, roundId, email) => {
  const query = `
    SELECT first_name AS firstname, last_name AS lastname, email
    FROM jury_assign
    WHERE eventId = ? AND roundId = ? AND email = ?
      AND is_deleted = 0 AND is_active = 1
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId, roundId, email], (err, results) => {
      if (err) {
        return reject(new Error("Error fetching judge details: " + err.message));
      }
      if (results.length === 0) {
        return reject(new Error("Judge not found in jury_assign."));
      }
      resolve(results[0]);
    });
  });
};

export const getScorecardByEventRoundCategory = async (eventId, roundId, awardId) => {
  // Typecasting to make sure values match DB column types (int)
  const parsedEventId = Number(eventId);
  const parsedRoundId = Number(roundId);
  const parsedCategoryId = Number(awardId); // awardId = categoryId

  if (!parsedEventId || !parsedRoundId || !parsedCategoryId) {
    console.error("Invalid parameters provided");
    return [];
  }

  const query = `
    SELECT 
      id AS scoreid,
      eventId,
      roundId,
      categoryId,
      form_schema,
      overall_value,
      is_active,
      is_deleted,
      created_at,
      updated_at
    FROM scorecard
    WHERE eventId = ?
      AND roundId = ?
      AND categoryId = ?
      AND is_deleted = 0
  `;

  const values = [parsedEventId, parsedRoundId, parsedCategoryId];
  console.log("Querying scorecard with values:", values);

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) {
        console.error("Query failed:", error);
        return reject(error);
      }
      console.log("Scorecard results:", results);
      resolve(results);
    });
  });
};

export const isJudgeLocked = (email, eventId, roundId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT is_locked 
      FROM jury_assign 
      WHERE email = ? AND eventId = ? AND roundId = ? AND is_deleted = 0
      LIMIT 1
    `;
  
    db.query(sql, [email, eventId, roundId], (err, results) => {
      if (err) return reject(err);
console.log("results", results);
      if (results.length === 0) {
        return resolve(false); // Not locked if no match
      }

      const isLocked = results[0].is_locked === 1;
      resolve(isLocked);
    });
  });
};


export function getConfirmedScores(eventId, roundId, juryAssignId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, eventId, roundId, categoryId, isConfirmed, createdAt, updatedAt
      FROM judge_score_confirm
      WHERE eventId = ? AND roundId = ? AND judgeId = ? AND isConfirmed = 1
    `;
    db.query(query, [eventId, roundId, juryAssignId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}