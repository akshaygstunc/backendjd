import express from "express";
import authenticate from "../middleware/authentication.js";
import {
    datanameValueGet,
    fetchJudgeData,
    fetchSubmissionsJudge,
    fetchSubmissionsJudgetest1,
    fetchSubmissionsToJudge,
    judgeScore,
    sendJudgeScorePDF
} from "../controller/judgeController.js";
import { validateScore } from "../validation/JudgeValidation.js";
import connection from "../database/connection.js";

const router = express.Router();

// router.post('/register', validateUser, usercreate) 

// router.post('/login', validateUserLogin, loginuser)

router.get('/fetchJudgeData', fetchJudgeData)

router.get('/fetchSubmissionsJudge', authenticate, fetchSubmissionsJudge)

router.get('/fetchDataToScore', authenticate, fetchSubmissionsToJudge)

router.post('/submitScore',authenticate, judgeScore)


router.post('/scorecardgetsubmission',authenticate, datanameValueGet)

router.get('/fetchSubmissionsJudge1', authenticate, fetchSubmissionsJudgetest1)

router.post('/send-judge-score-pdf', sendJudgeScorePDF);

router.post('/confirm-score', authenticate, (req, res) => {
  const { eventId, roundId, categoryId } = req.body;
  const judgeId = req.user.id;
  const now = new Date();

  if (!eventId || !roundId || !categoryId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Check if confirmation already exists
  const checkQuery = `SELECT id FROM judge_score_confirm WHERE eventId = ? AND roundId = ? AND categoryId = ? AND judgeId = ?`;
  const checkValues = [eventId, roundId, categoryId, judgeId];

  connection.query(checkQuery, checkValues, (err, results) => {
    if (err) {
      console.error('Error checking existing confirmation:', err);
      return res.status(500).json({ message: 'Database error while checking.' });
    }

    if (results.length > 0) {
      // Update if exists
      const updateQuery = `UPDATE judge_score_confirm SET isConfirmed = 1, updatedAt = ? WHERE id = ?`;
      const updateValues = [now, results[0].id];

      connection.query(updateQuery, updateValues, (err) => {
        if (err) {
          console.error('Error updating confirmation:', err);
          return res.status(500).json({ message: 'Database error while updating.' });
        }

        res.status(200).json({ message: 'Score confirmation updated successfully.' });
      });
    } else {
      // Insert if not exists
      const insertQuery = `
        INSERT INTO judge_score_confirm 
        (eventId, roundId, categoryId, judgeId, isConfirmed, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const insertValues = [eventId, roundId, categoryId, judgeId, 1, now, now];

      connection.query(insertQuery, insertValues, (err) => {
        if (err) {
          console.error('Error inserting confirmation:', err);
          return res.status(500).json({ message: 'Database error while inserting.' });
        }

        res.status(200).json({ message: 'Score confirmation saved successfully.' });
      });
    }
  });
});

// POST /reset-confirm-score
router.post('/reset-confirm-score', (req, res) => {
  const { eventId, roundId, judgeId } = req.body;

  if (!eventId || !roundId || !judgeId) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  const sql = `
    UPDATE judge_score_confirm 
    SET isConfirmed = 0 
    WHERE eventId = ? AND roundId = ? AND judgeId = ?
  `;

  connection.query(sql, [eventId, roundId, judgeId], (error, results) => {
    if (error) {
      console.error("Error resetting scoring:", error);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "No matching record found" });
    }

    return res.status(200).json({ message: "Scoring confirmation reset successfully" });
  });
});

router.post('/lock-jury', async (req, res) => {
    const { juryAssignId,eventId ,roundId} = req.body;
  
    if (!juryAssignId) {
      return res.status(400).json({ message: "juryAssignId is required" });
    }
  
    try {
      const query = `UPDATE jury_assign SET is_locked = 1, updated_at = NOW() WHERE id = ? AND eventId = ? AND roundId = ?`;
      await connection.query(query, [juryAssignId,eventId,roundId]);
  
      return res.status(200).json({ message: "Jury assignment locked successfully" });
    } catch (error) {
      console.error("Error locking jury assignment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  router.put('/unlock-jury', async (req, res) => {
    const { juryAssignId, eventId, roundId } = req.body;
  
    if (!juryAssignId || !eventId || !roundId) {
      return res.status(400).json({ message: "juryAssignId, eventId, and roundId are required" });
    }
  
    try {
      const query = `
        UPDATE jury_assign 
        SET is_locked = 0, updated_at = NOW() 
        WHERE id = ? AND eventId = ? AND roundId = ?
      `;
      await connection.query(query, [juryAssignId, eventId, roundId]);
  
      return res.status(200).json({ message: "Jury assignment unlocked successfully" });
    } catch (error) {
      console.error("Error unlocking jury assignment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
export default router