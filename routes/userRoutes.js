import express from "express";
import {
    CouponCodesget, getSubmissionsData, GettotalScore, getUserData, getUserEventEntries, loginuser, MyEventsgetUser, paymentCreate, sendOTP, sendPendingPayment, updateforgetPassword,
    // updatePassword,
    usercreate,  UserPaymentHistory,  UserProfilegets,  UserSubMission,  UserSubMissionList,  UserWithdrawl,  verifyOTPHandler,
    verifyUserHandler,
} from "../controller/userController.js";
import { validateotp, validatePaymentDetails, validateupdateForgetPassword, validateUser, validateUserLogin, validateVerifyOtp, validateVerifyUser } from "../validation/UserValidation.js";
import authenticate from "../middleware/authentication.js";
import connection1 from "../database/connectionmysql2.js";
import connection from "../database/connection.js";
import { couponGet } from "../controller/adminController.js";
const router = express.Router();

router.post('/register', validateUser, usercreate) //* --------  DONE

router.post('/login', validateUserLogin, loginuser)//* --------  DONE

router.post('/send_otp', validateotp, sendOTP);

router.post('/verifyOtp', validateVerifyOtp, verifyOTPHandler);

router.post('/verifyUser', validateVerifyUser, verifyUserHandler);

// router.post('/updatePassword', updatePassword)

router.post('/updateForgetPassword', validateupdateForgetPassword, updateforgetPassword)

router.get('/getCoupon/:id', authenticate, CouponCodesget)

router.get('/submissionData', authenticate, getSubmissionsData)

router.get('/getUserEventEntries', authenticate, getUserEventEntries)

router.post('/createPayment', authenticate, validatePaymentDetails, paymentCreate)

router.get('/getMyEvents', authenticate, MyEventsgetUser)

router.get('/couponGet',authenticate,  couponGet)   

router.get('/gettotalScore', authenticate, GettotalScore)

router.get('/getuserseventlist',authenticate, getUserData)

router.get("/send-pending-payment", sendPendingPayment);

router.get('/usersubmssioncount', authenticate, UserSubMission)

router.get('/UserPaymentHistory', authenticate, UserPaymentHistory)

router.get('/useregistervalueget', authenticate, UserProfilegets)

router.get('/getSubmissionsList',authenticate, UserSubMissionList)

router.post('/withdrawSubmission',authenticate,UserWithdrawl)
router.post('/updateSubmission', (req, res) => {
  const { submission_id, fields } = req.body;

  if (!submission_id || !fields) {
    return res.status(400).json({ message: "submission_id and fields are required." });
  }

  const fieldEntries = Object.entries(fields); // [ [field_name, field_value], ...]

  let completedQueries = 0;
  let hasErrorOccurred = false;

  fieldEntries.forEach(([field_name, field_value]) => {
    const sql = `
      UPDATE entry_data 
      SET field_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE submission_id = ? AND field_name = ? AND is_deleted = 0
    `;

    connection.query(sql, [field_value, submission_id, field_name], (err, result) => {
      if (err) {
        console.error("Update error:", err);
        if (!hasErrorOccurred) {
          hasErrorOccurred = true;
          return res.status(500).json({ message: "Failed to update submission.", error: err });
        }
      }

      completedQueries++;

      if (completedQueries === fieldEntries.length && !hasErrorOccurred) {
        return res.json({ message: "Submission updated successfully." });
      }
    });
  })
})
router.post("/create-group", async (req, res) => {
  const { name, roundId,eventId,awardCategories, submissionFields, entrantFields, submissionIds, submissionValues, entrantValues,formula } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Jury Group Name is required" });
  }

  const group_name = name;

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Transaction Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Insert into `jury_groups`
    connection.query(
      "INSERT INTO jury_groups (group_name,eventId,roundId, created_at, updated_at,formula) VALUES (?,?,?, NOW(), NOW(), ?)",
      [group_name,eventId,roundId,
        formula],
      (err, juryGroupResult) => {
        if (err) {
          connection.rollback(() => {
            console.error("Error inserting jury group:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
          return;
        }

        const juryGroupId = juryGroupResult.insertId;

        // Helper function to insert batch data
        const insertBatch = (query, values, callback) => {
          if (values.length === 0) return callback(null);
          connection.query(query, [values.map((val) => [...val, new Date(), new Date()])], callback);
        };

        // Insert into `jury_group_award_categories`
        insertBatch(
          "INSERT INTO jury_group_award_categories (jury_group_id, award_category, created_at, updated_at) VALUES ?",
          awardCategories.map((category) => [juryGroupId, category]),
          (err) => {
            if (err) return rollbackWithError(err);
            // Insert into `jury_group_submission_fields`
            insertBatch(
              "INSERT INTO jury_group_submission_fields (jury_group_id, submission_field, created_at, updated_at) VALUES ?",
              submissionFields.map((field) => [juryGroupId, field]),
              (err) => {
                if (err) return rollbackWithError(err);
                // Insert into `jury_group_entrant_fields`
                insertBatch(
                  "INSERT INTO jury_group_entrant_fields (jury_group_id, entrant_field, created_at, updated_at) VALUES ?",
                  entrantFields.map((field) => [juryGroupId, field]),
                  (err) => {
                    if (err) return rollbackWithError(err);
                    // Insert into `jury_group_submission_ids`
                    insertBatch(
                      "INSERT INTO jury_group_submission_ids (jury_group_id, submission_id, created_at, updated_at) VALUES ?",
                      submissionIds.map((submissionId) => [juryGroupId, submissionId]),
                      (err) => {
                        if (err) return rollbackWithError(err);
                        // Insert submission and entrant values
                        insertFieldValues(juryGroupId, submissionValues, "jury_group_submission_fields", "submission_field", "jury_group_submission_field_values", "submission_field_id", () => {
                          insertFieldValues(juryGroupId, entrantValues, "jury_group_entrant_fields", "entrant_field", "jury_group_entrant_field_values", "entrant_field_id", () => {
                            connection.commit((err) => {
                              if (err) {
                                return rollbackWithError(err);
                              }
                              res.status(201).json({ message: "Jury Group created successfully", juryGroupId });
                            });
                          });
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });

  function rollbackWithError(err) {
    connection.rollback(() => {
      console.error("Transaction rollback due to error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });
  }

  function insertFieldValues(juryGroupId, valuesObj, table, fieldColumn, valueTable, fieldIdColumn, callback) {
    const keys = Object.keys(valuesObj);
    if (keys.length === 0) return callback();

    let queriesCompleted = 0;
    keys.forEach((field) => {
      connection.query(`SELECT id FROM ${table} WHERE jury_group_id = ? AND ${fieldColumn} = ?`, [juryGroupId, field], (err, results) => {
        if (err) return rollbackWithError(err);
        if (results.length > 0) {
          const fieldId = results[0].id;
          connection.query(
            `INSERT INTO ${valueTable} (jury_group_id, ${fieldIdColumn}, value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
            [juryGroupId, fieldId, valuesObj[field]],
            (err) => {
              if (err) return rollbackWithError(err);
              queriesCompleted++;
              if (queriesCompleted === keys.length) callback();
            }
          );
        } else {
          queriesCompleted++;
          if (queriesCompleted === keys.length) callback();
        }
      });
    });
  }
});


router.delete("/delete-group/:id", (req, res) => {
  const juryGroupId = req.params.id;

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(400).json({ message: "Internal Server Error" });
    }

    const tablesToDelete = [
      "jury_group_award_categories",
      "jury_group_submission_fields",
      "jury_group_entrant_fields",
      "jury_group_submission_ids",
      "jury_group_submission_field_values",
      "jury_group_entrant_field_values"
    ];

    let completed = 0;

    const rollbackWithError = (err, table) => {
      connection.rollback(() => {
        console.error(`Error deleting from ${table}:`, err);
        res.status(500).json({ message: `Failed to delete from ${table}` });
      });
    };

    const deleteFromTable = (table, cb) => {
      connection.query(
        `DELETE FROM ${table} WHERE jury_group_id = ?`,
        [juryGroupId],
        (err) => {
          if (err) {
            rollbackWithError(err, table);
          } else {
            cb();
          }
        }
      );
    };

    tablesToDelete.forEach((table) => {
      deleteFromTable(table, () => {
        completed++;
        if (completed === tablesToDelete.length) {
          // Delete the main group
          connection.query(
            "DELETE FROM jury_groups WHERE id = ?",
            [juryGroupId],
            (err) => {
              if (err) {
                rollbackWithError(err, "jury_groups");
              } else {
                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => {
                      console.error("Commit error:", err);
                      res.status(400).json({ message: "Internal Server Error" });
                    });
                  } else {
                    res.status(200).json({ status: false, message: "Jury Group and related data deleted successfully" });
                  }
                });
              }
            }
          );
        }
      });
    });
  });
});

router.get("/get-group/:id", (req, res) => {
  const juryGroupId = req.params.id;

  const groupData = {};

  const queryWrapper = (query, params) => {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };

  // const fetchAllData = async () => {
  //   try {
  //     const group = await queryWrapper("SELECT * FROM jury_groups WHERE id = ?", [juryGroupId]);
  //     if (group.length === 0) {
  //       return res.status(404).json({ message: "Jury group not found" });
  //     }

  //     groupData.group = group[0];

  //     groupData.awardCategories = await queryWrapper(
  //       "SELECT award_category FROM jury_group_award_categories WHERE jury_group_id = ?",
  //       [juryGroupId]
  //     );

  //     groupData.submissionFields = await queryWrapper(
  //       "SELECT submission_field FROM jury_group_submission_fields WHERE jury_group_id = ?",
  //       [juryGroupId]
  //     );

  //     groupData.entrantFields = await queryWrapper(
  //       "SELECT entrant_field FROM jury_group_entrant_fields WHERE jury_group_id = ?",
  //       [juryGroupId]
  //     );

  //     groupData.submissionIds = await queryWrapper(
  //       "SELECT submission_id FROM jury_group_submission_ids WHERE jury_group_id = ?",
  //       [juryGroupId]
  //     );

  //     groupData.submissionFieldValues = await queryWrapper(
  //       `SELECT s.submission_field, v.value 
  //        FROM jury_group_submission_fields s
  //        JOIN jury_group_submission_field_values v ON s.id = v.submission_field_id
  //        WHERE s.jury_group_id = ?`,
  //       [juryGroupId]
  //     );

  //     groupData.entrantFieldValues = await queryWrapper(
  //       `SELECT e.entrant_field, v.value 
  //        FROM jury_group_entrant_fields e
  //        JOIN jury_group_entrant_field_values v ON e.id = v.entrant_field_id
  //        WHERE e.jury_group_id = ?`,
  //       [juryGroupId]
  //     );

  //     res.status(200).json(groupData);
  //   } catch (error) {
  //     console.error("Error fetching jury group:", error);
  //     res.status(500).json({ message: "Internal Server Error" });
  //   }
  // };
  const fetchAllData = async () => {
    try {
      const group = await queryWrapper("SELECT * FROM jury_groups WHERE id = ?", [juryGroupId]);
      if (group.length === 0) {
        return res.status(404).json({ message: "Jury group not found" });
      }

      groupData.group = group[0];

      groupData.awardCategories = await queryWrapper(
        "SELECT award_category FROM jury_group_award_categories WHERE jury_group_id = ?",
        [juryGroupId]
      );

      groupData.submissionFields = await queryWrapper(
        "SELECT submission_field FROM jury_group_submission_fields WHERE jury_group_id = ?",
        [juryGroupId]
      );

      groupData.entrantFields = await queryWrapper(
        "SELECT entrant_field FROM jury_group_entrant_fields WHERE jury_group_id = ?",
        [juryGroupId]
      );

      groupData.submissionIds = (
        await queryWrapper(
          "SELECT submission_id FROM jury_group_submission_ids WHERE jury_group_id = ?",
          [juryGroupId]
        )
      )
        .map(row => row.submission_id.split(','))
        .flat()
        .map(id => id.trim());

      groupData.submissionFieldValues = await queryWrapper(
        `SELECT s.submission_field, v.value 
         FROM jury_group_submission_fields s
         JOIN jury_group_submission_field_values v ON s.id = v.submission_field_id
         WHERE s.jury_group_id = ?`,
        [juryGroupId]
      );

      groupData.entrantFieldValues = await queryWrapper(
        `SELECT e.entrant_field, v.value 
         FROM jury_group_entrant_fields e
         JOIN jury_group_entrant_field_values v ON e.id = v.entrant_field_id
         WHERE e.jury_group_id = ?`,
        [juryGroupId]
      );

      res.status(200).json(groupData);
    } catch (error) {
      console.error("Error fetching jury group:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  fetchAllData();
});

router.post('/registerss', validateUser, usercreate) //* --------  DONE


router.post("/create-group/:id", async (req, res) => {
  const {
    name,
    roundId,
    eventId,
    awardCategories,
    submissionFields,
    entrantFields,
    submissionIds,
    submissionValues,
    entrantValues,
    formula
  } = req.body;

  const juryGroupId = parseInt(req.params.id);

  if (!name || !juryGroupId) {
    return res.status(400).json({ message: "Jury Group Name and ID are required" });
  }

  const group_name = name;

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Transaction Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Step 1: Delete existing group and related data
    const deleteQueries = [
      `DELETE FROM jury_group_award_categories WHERE jury_group_id = ?`,
      `DELETE FROM jury_group_submission_fields WHERE jury_group_id = ?`,
      `DELETE FROM jury_group_entrant_fields WHERE jury_group_id = ?`,
      `DELETE FROM jury_group_submission_ids WHERE jury_group_id = ?`,
      `DELETE FROM jury_group_submission_field_values WHERE jury_group_id = ?`,
      `DELETE FROM jury_group_entrant_field_values WHERE jury_group_id = ?`,
      `DELETE FROM jury_groups WHERE id = ?`
    ];

    const runDeletes = (i = 0) => {
      if (i >= deleteQueries.length) return insertNewJuryGroup();
      connection.query(deleteQueries[i], [juryGroupId], (err) => {
        if (err) return rollbackWithError(err);
        runDeletes(i + 1);
      });
    };

    runDeletes();

    function insertNewJuryGroup() {
      // Step 2: Insert new jury group
      connection.query(
        "INSERT INTO jury_groups (id, group_name, eventId, roundId, created_at, updated_at, formula) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)",
        [juryGroupId, group_name, eventId, roundId, formula],
        (err) => {
          if (err) return rollbackWithError(err);

          // Helper to insert batch data
          const insertBatch = (query, values, callback) => {
            if (values.length === 0) return callback(null);
            connection.query(query, [values.map((val) => [...val, new Date(), new Date()])], callback);
          };

          // Step 3: Insert award categories
          insertBatch(
            "INSERT INTO jury_group_award_categories (jury_group_id, award_category, created_at, updated_at) VALUES ?",
            awardCategories.map((category) => [juryGroupId, category]),
            (err) => {
              if (err) return rollbackWithError(err);

              // Step 4: Insert submission fields
              insertBatch(
                "INSERT INTO jury_group_submission_fields (jury_group_id, submission_field, created_at, updated_at) VALUES ?",
                submissionFields.map((field) => [juryGroupId, field]),
                (err) => {
                  if (err) return rollbackWithError(err);

                  // Step 5: Insert entrant fields
                  insertBatch(
                    "INSERT INTO jury_group_entrant_fields (jury_group_id, entrant_field, created_at, updated_at) VALUES ?",
                    entrantFields.map((field) => [juryGroupId, field]),
                    (err) => {
                      if (err) return rollbackWithError(err);

                      // Step 6: Insert submission IDs
                      insertBatch(
                        "INSERT INTO jury_group_submission_ids (jury_group_id, submission_id, created_at, updated_at) VALUES ?",
                        submissionIds.map((id) => [juryGroupId, id]),
                        (err) => {
                          if (err) return rollbackWithError(err);

                          // Step 7: Insert submission and entrant values
                          insertFieldValues(juryGroupId, submissionValues, "jury_group_submission_fields", "submission_field", "jury_group_submission_field_values", "submission_field_id", () => {
                            insertFieldValues(juryGroupId, entrantValues, "jury_group_entrant_fields", "entrant_field", "jury_group_entrant_field_values", "entrant_field_id", () => {
                              connection.commit((err) => {
                                if (err) return rollbackWithError(err);
                                res.status(201).json({ message: "Jury Group updated successfully", juryGroupId });
                              });
                            });
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }

    function rollbackWithError(err) {
      connection.rollback(() => {
        console.error("Transaction rollback due to error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      });
    }

    function insertFieldValues(juryGroupId, valuesObj, table, fieldColumn, valueTable, fieldIdColumn, callback) {
      const keys = Object.keys(valuesObj);
      if (keys.length === 0) return callback();

      let queriesCompleted = 0;
      keys.forEach((field) => {
        connection.query(`SELECT id FROM ${table} WHERE jury_group_id = ? AND ${fieldColumn} = ?`, [juryGroupId, field], (err, results) => {
          if (err) return rollbackWithError(err);
          if (results.length > 0) {
            const fieldId = results[0].id;
            connection.query(
              `INSERT INTO ${valueTable} (jury_group_id, ${fieldIdColumn}, value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
              [juryGroupId, fieldId, valuesObj[field]],
              (err) => {
                if (err) return rollbackWithError(err);
                queriesCompleted++;
                if (queriesCompleted === keys.length) callback();
              }
            );
          } else {
            queriesCompleted++;
            if (queriesCompleted === keys.length) callback();
          }
        });
      });
    }
  });
});

export default router