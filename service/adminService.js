import db from "../database/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const saltRounds = 10;
import resposne from "../middleware/resposne.js";
dotenv.config();
import ExcelJS from "exceljs";
import connection1 from "../database/connectionmysql2.js";
import connection from "../database/connection.js";

export function adminRegister(
  first_name,
  last_name,
  email,
  password,
  company,
  mobile_number,
  country
) {
  return new Promise((resolve, reject) => {
    const insertSql = `
      INSERT INTO admin (first_name,last_name, email, password,company, mobile_number,country) 
      VALUES (?, ?, ?, ?, ?, ? ,?)
    `;

    const values = [
      first_name,
      last_name,
      email,
      password,
      company,
      mobile_number,
      country,
    ];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const userId = result.insertId;
        if (userId) {
          resolve(userId);
        } else {
          reject(new Error(resposne.adminfailed));
        }
      }
    });
  });
}

export function checkemail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkphone(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function loginAdmin(email, password) {
  const userQuery = "SELECT * FROM admin WHERE email = ?";

  return new Promise((resolve, reject) => {
    db.query(userQuery, [email], async (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve({ error: resposne.invaliduser });
      }

      const user = results[0];

      if (!password || !user.password) {
        return resolve({ error: resposne.missingPass });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return resolve({ error: resposne.invalidpassword });
      }

      db.query([email], () => {
        const token = jwt.sign(
          {
            id: user.id,
            first_name: user.first_name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
            special_role: user.special_role,
          },
          process.env.JWT_SECRET
        );
        console.log(token);
        resolve({
          data: {
            id: user.id,
            first_name: user.first_name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
            token: token,
            special_role: user.special_role,
          },
        });
      });
    });
  });
}

export const updateprofile = (updates, userId) => {
  return new Promise((resolve, reject) => {
    const updateFields = [];
    const updateValues = [];

    if (updates.first_name) {
      updateFields.push("first_name = ?");
      updateValues.push(updates.first_name);
    }
    if (updates.last_name) {
      updateFields.push("last_name = ?");
      updateValues.push(updates.last_name);
    }
    if (updates.email) {
      updateFields.push("email = ?");
      updateValues.push(updates.email);
    }
    if (updates.company) {
      updateFields.push("company = ?");
      updateValues.push(updates.company);
    }
    if (updates.mobile_number) {
      updateFields.push("mobile_number = ?");
      updateValues.push(updates.mobile_number);
    }
    if (updates.time_zone) {
      updateFields.push("time_zone = ?");
      updateValues.push(updates.time_zone);
    }
    if (updates.job_title) {
      updateFields.push("job_title = ?");
      updateValues.push(updates.job_title);
    }
    if (updates.imageFilename) {
      updateFields.push("profile_image = ?");
      updateValues.push(updates.imageFilename);
    }

    if (updateFields.length === 0) {
      return reject(new Error(resposne.novalidfield));
    }

    const updateSql = `
      UPDATE admin
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    db.query(updateSql, [...updateValues, userId], (error, result) => {
      if (error) {
        return reject(error);
      }

      if (result.affectedRows > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export function generateOTP() {
  let OTP = "123456";
  return OTP;
}

export function storeOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM admin_otp WHERE email = ?
    `;
    const insertSql = `
      INSERT INTO admin_otp (email, otp)
      VALUES (?, ?)
    `;
    db.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }

      db.query(deleteSql, [email], (error) => {
        if (error) {
          return db.rollback(() => {
            reject(error);
          });
        }

        db.query(insertSql, [email, otp], (error, result) => {
          if (error) {
            return db.rollback(() => {
              reject(error);
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err);
              });
            }
            const successMessage = resposne.otpsend;
            resolve(successMessage);
          });
        });
      });
    });
  });
}

export function verifyOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT * FROM admin_otp WHERE email = ? AND otp = ?
    `;
    const updateSql = `
      UPDATE admin_otp SET is_verified = 1 WHERE email = ? AND otp = ?
    `;

    db.query(selectSql, [email, otp], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(new Error(resposne.invalidOtp));
      } else {
        db.query(updateSql, [email, otp], (updateError, updateResult) => {
          if (updateError) {
            reject(updateError);
          } else {
            resolve(resposne.otpverified);
          }
        });
      }
    });
  });
}

export function checkemailOtp(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function changeforgetPassword({ email, newPassword }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM admin_otp WHERE email = ? AND is_verified = 1";
    const updateSql = "UPDATE admin SET password = ? WHERE email = ?";

    db.query(selectSql, [email], async (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return reject(new Error(resposne.otpnotverified));
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        db.query(updateSql, [hashedPassword, email], (updateError) => {
          if (updateError) {
            return reject(updateError);
          }

          resolve(resposne.passChanged);
        });
      } catch (hashError) {
        reject(hashError);
      }
    });
  });
}

export function checkeventEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        return reject(
          new Error("Database query error while checking event's email")
        );
      }
      resolve(results.length > 0);
    });
  });
}

export function checkAdmin(adminId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE id = ?";
    db.query(query, [adminId], (err, results) => {
      if (err) {
        return reject(new Error("Database query error while checking admin"));
      }
      resolve(results.length > 0);
    });
  });
}

export async function createEvent(
  adminId,
  event_name,
  closing_date,
  closing_time,
  email,
  event_url,
  time_zone,
  is_endorsement,
  is_withdrawal,
  is_ediit_entry,
  limit_submission,
  submission_limit,
  event_logo,
  event_banner,
  event_description
) {
  const insertSql = `
      INSERT INTO event_details (
        adminId, 
        event_name, 
        closing_date, 
        closing_time, 
        email, 
        event_url, 
        time_zone, 
        is_endorsement, 
        is_withdrawal, 
        is_ediit_entry, 
        limit_submission, 
        event_logo, 
        event_banner, 
        event_description,
        submission_limit
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    adminId,
    event_name,
    closing_date,
    closing_time,
    email,
    event_url,
    time_zone,
    is_endorsement,
    is_withdrawal,
    is_ediit_entry,
    limit_submission,
    event_logo,
    event_banner,
    event_description,
    submission_limit,
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            new Error(`Error inserting event: ${insertError.message}`)
          );
        }
        if (result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error("Event creation failed: No insert ID"));
        }
      });
    });

    return {
      id: result,
      inserId: result.insertId,
      message: resposne.createvent,
    };
  } catch (error) {
    // console.log("Error in createEvent:", error);

    throw new Error(`Database error: ${error.message}`);
  }
}

export function additional_emailssss(eventId, additionalEmails) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(additionalEmails)) {
      const error = new Error("additionalEmails must be an array");
      // console.log("Error in additional_emailssss: ", error.message);
      return reject(error);
    }

    if (additionalEmails.length === 0) {
      return resolve([]);
    }

    const insertSql = `INSERT INTO additional_emails (eventId, additonal_email) VALUES (?, ?)`;
    const queries = additionalEmails.map((email) => {
      return new Promise((res, rej) => {
        if (typeof email !== "string" || email.trim() === "") {
          const error = new Error(`Invalid email address: ${email}`);
          return rej(error);
        }

        db.query(insertSql, [eventId, email], (error, result) => {
          if (error) {
            // console.log("Error inserting additional email:", error);
            rej(error);
          } else {
            res(result.insertId);
          }
        });
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => reject(error));
  });
}

export function industry_types(eventId, industryTypes) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(industryTypes)) {
      const error = new Error("industryTypes must be an array");
      // console.log("Error in industry_types: ", error.message);
      return reject(error);
    }

    const insertSql = `INSERT INTO industry_types (eventId, industry_type) VALUES (?, ?)`;
    const queries = industryTypes.map((industryType) => {
      return new Promise((res, rej) => {
        db.query(insertSql, [eventId, industryType], (error, result) => {
          if (error) {
            // console.log("Error inserting industry type:", error);
            rej(error);
          } else {
            res(result.insertId);
          }
        });
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => {
        // console.log("Error inserting industry types:", error);
        reject(error);
      });
  });
}

export function checkEventRegistration(eventId, createdBy) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
       *
      FROM registration_data 
      WHERE eventId = ? AND created_by = ? AND is_deleted = 0
    `;

    db.query(query, [eventId, createdBy], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      // If registration data exists, return it; otherwise, return false
      resolve(results.length > 0 ? results : false);
    });
  });
}

export function checkeventId(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE id = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function createAward(
  eventId,
  category_name,
  category_prefix,
  belongs_group,
  limit_submission,
  is_start_date,
  is_end_date,
  is_endorsement,
  start_date,
  end_date,
  payment_price
) {
  const insertSql = `
    INSERT INTO awards_category (
      eventId,
      category_name,
      category_prefix,
      belongs_group,
      limit_submission,
      is_start_date,
      is_end_date,
      is_endorsement,
      start_date,
      end_date,
      payment_price
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
  `;

  const values = [
    eventId,
    category_name,
    category_prefix,
    belongs_group,
    limit_submission,
    is_start_date,
    is_end_date,
    is_endorsement,
    start_date,
    end_date,
    payment_price,
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            new Error(`Database insert error: ${insertError.message}`)
          );
        }
        if (result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error(resposne.awardcreatefail));
        }
      });
    });

    return {
      id: result,
      message: resposne.awardcreate,
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export function getAwards(eventId, search, sortOrder = "newest") {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        a.id AS awardId,
        a.category_name,
        a.category_prefix,
        a.belongs_group,
        a.limit_submission,
        a.end_date,
        a.payment_price,
        e.id AS eventId
      FROM awards_category a 
      LEFT JOIN event_details e ON a.eventId = e.id  
      WHERE a.is_deleted = 0 AND a.eventId = ?`;

    if (search) {
      query += ` AND a.category_name LIKE ?`;
    }

    if (sortOrder === "newest") {
      query += ` ORDER BY a.created_at DESC`;
    } else if (sortOrder === "oldest") {
      query += ` ORDER BY a.created_at ASC`;
    }

    const params = [eventId];

    if (search) {
      params.push(`%${search}%`);
    }

    db.query(query, params, (err, awards) => {
      if (err) {
        return reject(err);
      }

      const awardIds = awards.map((a) => a.awardId);
      if (awardIds.length === 0) {
        return resolve([]);
      }

      const countQuery = `
        SELECT awardcatId AS awardId, COUNT(DISTINCT submission_id) AS submission_count
        FROM entry_data
        WHERE awardcatId IN (?) 
        GROUP BY awardcatId`;

      db.query(countQuery, [awardIds], (err, submissionCounts) => {
        if (err) {
          return reject(err);
        }

        const result = awards.map((award) => {
          const submissionCount =
            submissionCounts.find((sc) => sc.awardId === award.awardId)
              ?.submission_count || 0;

          const limitExceeded =
            award.limit_submission > 0 &&
            submissionCount >= award.limit_submission;

          return {
            ...award,
            submission_count: submissionCount,
            limitExceeded: limitExceeded,
          };
        });

        resolve(result.length > 0 ? result : []);
      });
    });
  });
}

export const exportToExcel = async (eventId) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
          a.id AS awardId,
          a.eventId,
          a.category_name,
          a.category_prefix,
          a.belongs_group,
          a.limit_submission,
          a.end_date,
          e.id AS eventId
        FROM awards_category a 
        LEFT JOIN event_details e ON a.eventId = e.id
        WHERE e.id = ?  AND a.is_deleted = 0
      `;

      db.query(query, [eventId], (err, results) => {
        if (err) {
          // console.error("Error executing query:", err.message);
          return reject(err);
        }
        resolve(results);
      });
    } catch (error) {
      // console.error("Error in exportToExcel function:", error.message);
      reject(error);
    }
  });
};

export function getEventDashboard(skip, limit, id, sortOrder) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT
        e.id,
        e.event_name,
        e.event_logo,
        e.closing_date,
        e.is_pending,
        e.is_live,
        e.is_draft,
        e.is_archive,
        e.event_url,
        r.id AS registrationFormId,
        ef.id AS entryFormId,
        COUNT(DISTINCT rd.created_by) AS totalEntrants,
        COUNT(DISTINCT ed.submission_id) AS totalSubmissions
      FROM event_details AS e
      LEFT JOIN registration_form AS r ON e.id = r.eventId
      LEFT JOIN entry_form AS ef ON e.id = ef.eventId
      LEFT JOIN registration_data AS rd ON e.id = rd.eventId
      LEFT JOIN entry_data AS ed ON e.id = ed.eventId
      WHERE e.adminId = ?
      GROUP BY 
        e.id, 
        e.event_name, 
        e.event_logo, 
        e.closing_date, 
        e.is_pending, 
        e.is_live, 
        e.is_draft, 
        e.is_archive, 
        e.event_url, 
        r.id, 
        ef.id
    `;

    // Handle sorting by 'newest' or 'oldest'
    if (sortOrder === "newest") {
      query += ` ORDER BY e.created_at DESC`;
    } else if (sortOrder === "oldest") {
      query += ` ORDER BY e.created_at ASC`;
    }

    // Add pagination with LIMIT and OFFSET
    query += ` LIMIT ? OFFSET ?`;

    const queryParams = [id, parseInt(limit), parseInt(skip)];

    // Execute the query and handle results
    db.query(query, queryParams, (err, results) => {
      if (err) {
        return reject(err);
      }

      resolve(results.length ? results : []);
    });
  });
}

export async function checkCurrentPass(userId, password) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin WHERE id = ?";

    db.query(query, [userId], async (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        return resolve({ error: resposne.usernotfound });
      }

      const dbUser = results[0];
      const passwordMatch = await bcrypt.compare(password, dbUser.password);

      if (!passwordMatch) {
        return resolve({ error: resposne.invalidpassword });
      }

      resolve(true);
    });
  });
}

export async function newPasswordd({ userId, currentPassword, newPassword }) {
  const selectSql = "SELECT * FROM admin WHERE id = ?";
  const updateSql = "UPDATE admin SET password = ? WHERE id = ?";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(selectSql, [userId], (err, results) => {
        if (err) return reject(new Error(resposne.errorchangePass));
        resolve(results);
      });
    });

    if (results.length === 0) {
      throw new Error(resposne.usernotfound);
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error(resposne.incorrectcurrentPass);
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updated = await new Promise((resolve, reject) => {
      db.query(updateSql, [hashedPassword, userId], (err, updated) => {
        if (err) return reject(new Error(resposne.updatePassError));
        resolve(updated);
      });
    });

    if (updated.affectedRows === 0) {
      throw new Error(resposne.passUpdateFail);
    }

    return resposne.passChanged;
  } catch (error) {
    throw new Error(resposne.errorchangePass);
  }
}

export function getMyEvents(skip, limit, id, sortOrder = "oldest") {
  return new Promise((resolve, reject) => {
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM event_details
      WHERE is_deleted = 0
      ${id ? "AND adminId = ?" : ""}
    `;

    db.query(countQuery, id ? [id] : [], (countErr, countResults) => {
      if (countErr) {
        return reject(countErr);
      }

      const totalCount = countResults[0].totalCount;

      let query = `
        SELECT 
          id,
          event_name,
          closing_date,
          event_logo,
          is_draft,
          is_live,
          is_archive,
          is_pending,
          is_withdrawn,
          is_completed
        FROM event_details 
        WHERE is_deleted = 0
        ${id ? "AND adminId = ?" : ""}
      `;

      if (sortOrder === "newest") {
        query += ` ORDER BY created_at ASC`;
      } else if (sortOrder === "oldest") {
        query += ` ORDER BY created_at  DESC`;
      }

      query += ` LIMIT ? OFFSET ?`;

      const queryParams = id
        ? [id, parseInt(limit), parseInt(skip)]
        : [parseInt(limit), parseInt(skip)];

      db.query(query, queryParams, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve({
          events: results.length ? results : [],
          totalCount: totalCount,
        });
      });
    });
  });
}

export async function updateAward(awardId, updates) {
  let updateFields = [];
  let updateValues = [];

  const fields = [
    "category_name",
    "category_prefix",
    "belongs_group",
    "limit_submission",
    "is_start_date",
    "is_end_date",
    "is_endorsement",
    "start_date",
    "end_date",
    "payment_price",
  ];

  fields.forEach((field) => {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      updateValues.push(updates[field]);
    }
  });

  updateValues.push(awardId);

  if (updateFields.length === 0) {
    return Promise.reject({
      message: "No valid fields to update",
    });
  }

  const updateSql = `
    UPDATE awards_category
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(updateSql, updateValues, (updateError, result) => {
      if (updateError) {
        // console.error("Update Error:", updateError);
        return reject({
          message: "Failed to update award",
          error: updateError,
        });
      }

      if (result.affectedRows === 0) {
        return reject({
          message: "No award found with the given ID",
          awardId: awardId,
        });
      }

      resolve({
        message: "Award updated successfully",
      });
    });
  });
}

export async function EmptyStartDate(awardId) {
  const updateSql = "UPDATE awards_category SET start_date = NULL WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) {
          return reject(new Error("Failed to nullify start date"));
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error("No affected rows.");
    }

    return "Start date nullified successfully";
  } catch (error) {
    throw error;
  }
}

export async function EmptyEndDate(awardId) {
  const updateSql = "UPDATE awards_category SET end_date = NULL WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) {
          return reject(new Error("Failed to nullify end date"));
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error("No affected rows.");
    }

    return "End date nullified successfully";
  } catch (error) {
    throw error;
  }
}

export async function softDeleteAward(awardId) {
  const updateSql = "UPDATE awards_category SET is_deleted = 1 WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [awardId], (err, result) => {
        if (err) return reject(new Error(resposne.deleteAwardError));
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error(resposne.awardNotFound);
    }

    return resposne.awardDeleted;
  } catch (error) {
    throw error;
  }
}

export function checkifDeleted(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_deleted FROM awards_category WHERE id = ?";
    db.query(query, [awardId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.deletionerrorCheck));
      }
      if (results.length === 0) {
        return reject(new Error("Award not found"));
      }

      const isDeleted = results[0].is_deleted === 1;
      resolve(isDeleted);
    });
  });
}

export async function getEventById(eventId) {
  const selectSql = `
    SELECT 
      ed.id,
      ed.event_name, 
      ed.closing_date,
      ed.closing_time,
      ed.email,
      ed.event_url,
      ed.time_zone,
      ed.is_endorsement,
      ed.is_withdrawal,
      ed.is_ediit_entry,  
      ed.limit_submission,
      ed.submission_limit,
      ed.event_logo,
      ed.event_banner,
      ed.event_description,
      ed.is_live,
      ed.is_draft,
      ed.is_archive,
      ed.closing_messsage,
      ed.jury_welcm_messsage,
      ed.is_social,
      ed.social,
      ed.social_image,
      ed.is_publicly_visble,
      ae.id AS additionalemailId,
      ae.additonal_email AS email_address,
      it.id AS industrytypeId,
      it.industry_type AS industry_type_name,
      COUNT(DISTINCT rd.created_by) AS totalEntrants,
      COUNT(DISTINCT ed2.submission_id) AS totalSubmissions
FROM event_details ed
LEFT JOIN industry_types it ON ed.id = it.eventId
LEFT JOIN additional_emails ae ON ed.id = ae.eventId
LEFT JOIN registration_data rd ON ed.id = rd.eventId  
LEFT JOIN entry_data ed2 ON ed.id = ed2.eventId  
WHERE ed.id = ?
GROUP BY 
      ed.id, 
      ed.event_name, 
      ed.closing_date, 
      ed.closing_time,
      ed.email,
      ed.event_url,
      ed.time_zone,
      ed.is_endorsement,
      ed.is_withdrawal,
      ed.is_ediit_entry,
      ed.limit_submission,
      ed.submission_limit,
      ed.event_logo,
      ed.event_banner,
      ed.event_description,
      ed.is_live,
      ed.is_draft,
      ed.is_archive,
      ed.closing_messsage,
      ed.jury_welcm_messsage,
      ed.is_social,
      ed.social,
      ed.social_image,
      ed.is_publicly_visble,
      ae.id,
      ae.additonal_email,
      it.id,
      it.industry_type;

  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [eventId], (fetchError, results) => {
        if (fetchError) {
          return reject(fetchError);
        }
        resolve(results);
      });
    });

    const industryTypeNames = [
      ...new Set(
        result
          .filter((row) => row.industry_type_name)
          .map((row) => row.industry_type_name)
      ),
    ];

    const additionalEmails = [
      ...new Set(
        result
          .filter((row) => row.email_address)
          .map((row) => row.email_address)
      ),
    ];

    const eventData = result[0];
    const {
      additionalemailId,
      email_address,
      industrytypeId,
      industry_type_name,
      ...cleanedEventData
    } = eventData;

    //-------NEW ADD -----///----------DATE--ISSUE--////
    if (cleanedEventData.closing_date instanceof Date) {
      const yyyy = cleanedEventData.closing_date.getFullYear();
      const mm = String(cleanedEventData.closing_date.getMonth() + 1).padStart(
        2,
        "0"
      );
      const dd = String(cleanedEventData.closing_date.getDate()).padStart(
        2,
        "0"
      );
      cleanedEventData.closing_date = `${yyyy}-${mm}-${dd}`;
    }
    //-------NEW ADD -----///----------DATE--ISSUE--////

    return {
      ...cleanedEventData,
      industry_type: industryTypeNames,
      additional_email: additionalEmails,
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export const updateEventDetails = async (updates, eventId) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        return reject(new Error("Failed to begin transaction"));
      }

      try {
        const updateFields = Object.keys(updates)
          .map((field) => `${field} = ?`)
          .join(", ");
        const updateValues = Object.values(updates);

        const updateQuery = `
          UPDATE event_details
          SET ${updateFields}, updated_at = NOW()
          WHERE id = ? AND is_deleted = 0;
        `;

        updateValues.push(eventId);

        db.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            return db.rollback(() => {
              reject(new Error("Database update failed: " + err.message));
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(new Error("Transaction commit failed: " + err.message));
              });
            }
            resolve(result);
          });
        });
      } catch (error) {
        db.rollback(() => reject(error));
      }
    });
  });
};

export const updateAdditionalEmails = async (eventId, additional_email) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(additional_email) || additional_email.length === 0) {
      return reject(new Error("Additional Email must be a non-empty array."));
    }

    const placeholders = additional_email.map(() => `(?, ?)`).join(", ");
    const values = additional_email.flatMap((email) => [eventId, email]);

    const deleteSql = `DELETE FROM additional_emails WHERE eventId = ?`;

    const insertSql = `
      INSERT INTO additional_emails (eventId, additonal_email)
      VALUES ${placeholders}
    `;

    db.query(deleteSql, [eventId], (deleteError) => {
      if (deleteError) {
        return reject(deleteError);
      }

      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          reject(insertError);
        } else {
          resolve(result.affectedRows);
        }
      });
    });
  });
};

export const updatedIndustryTypes = async (eventId, industry_type) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(industry_type) || industry_type.length === 0) {
      return reject(new Error("Industry Type must be a non-empty array."));
    }

    const placeholders = industry_type.map(() => `(?, ?)`).join(", ");
    const values = industry_type.flatMap((industry) => [eventId, industry]);

    const deleteSql = `DELETE FROM industry_types WHERE eventId = ?`;

    const insertSql = `
      INSERT INTO industry_types (eventId, industry_type)
      VALUES ${placeholders}
    `;

    db.query(deleteSql, [eventId], (deleteError) => {
      if (deleteError) {
        return reject(deleteError);
      }

      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          reject(insertError);
        } else {
          resolve(result.affectedRows);
        }
      });
    });
  });
};

export const updateEventSocial = (updates, eventId) => {
  return new Promise((resolve, reject) => {
    const updateFields = [];
    const updateValues = [];

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return reject(new Error("Invalid event ID."));
    }

    const checkEventQuery = "SELECT * FROM event_details WHERE id = ?";
    db.query(checkEventQuery, [eventId], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) {
        return reject(new Error("Event not found."));
      }

      if (updates.imageFilename) {
        updateFields.push("event_logo = ?");
        updateValues.push(updates.imageFilename);
      }

      if (updates.event_banner) {
        updateFields.push("event_banner = ?");
        updateValues.push(updates.event_banner);
      }

      if (updates.event_description) {
        updateFields.push("event_description = ?");
        updateValues.push(updates.event_description);
      }

      if (updates.closing_messsage) {
        updateFields.push("closing_messsage = ?");
        updateValues.push(updates.closing_messsage);
      }

      if (updates.jury_welcm_messsage) {
        updateFields.push("jury_welcm_messsage = ?");
        updateValues.push(updates.jury_welcm_messsage);
      }

      if (updates.is_social !== undefined) {
        updateFields.push("is_social = ?");
        updateValues.push(updates.is_social);
      }

      if (updates.social !== undefined) {
        if (Array.isArray(updates.social)) {
          updateFields.push("social = ?");
          updateValues.push(updates.social.join(","));
        } else {
          updateFields.push("social = ?");
          updateValues.push(updates.social);
        }
      }

      if (updates.social_image) {
        updateFields.push("social_image = ?");
        updateValues.push(updates.social_image);
      }

      if (updateFields.length === 0) {
        return reject(new Error("No update field provided."));
      }

      const updateSql = `
        UPDATE event_details
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;

      db.query(updateSql, [...updateValues, eventId], (error, result) => {
        if (error) {
          return reject(new Error("Database update failed."));
        }

        if (result.affectedRows > 0) {
          resolve(true);
        } else {
          reject(new Error("No affected row found with this ID."));
        }
      });
    });
  });
};

export async function addSubmissionId(
  eventId,
  caseValue,
  digits,
  start_from,
  increment,
  prefix
) {
  const insertSql = `
    INSERT INTO submission_id (
      eventId, 
      \`case\`,  
      digits, 
      start_from, 
      increment, 
      prefix
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [eventId, caseValue, digits, start_from, increment, prefix];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            new Error(`Database insert Error: ${insertError.message}`)
          );
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows);
        } else {
          reject(new Error("No rows were affected."));
        }
      });
    });

    return {
      affectedRows: result,
      message: "Submission format updated successfully.",
    };
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
}

export function checkifAlreadyVisible(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_publicly_visble FROM event_details WHERE id = ?";
    db.query(query, [awardId], (err, results) => {
      if (err) {
        return reject(new Error(resposne.visiblecheck));
      }
      if (results.length === 0) {
        return reject(new Error("Event not found"));
      }

      const isVisible = results[0].is_publicly_visble === 1;
      resolve(isVisible);
    });
  });
}

export async function publiclyVisible(eventId, is_publicly_visble) {
  const updateSql = `UPDATE event_details SET is_publicly_visble = ? WHERE id = ?`;
  const values = [is_publicly_visble, eventId];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(
            new Error(`Database Update Error: ${updateError.message}`)
          );
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows);
        } else {
          reject(new Error(resposne.noaffectedRows));
        }
      });
    });

    if (is_publicly_visble === 1) {
      return {
        affectedRows: result,
        message: resposne.publicVisibleTrue,
      };
    } else if (is_publicly_visble === 0) {
      return {
        affectedRows: result,
        message: resposne.visiblezero,
      };
    } else {
      throw new Error("Invalid visibility status provided. It must be 1 or 0.");
    }
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
}

// export async function generalSettings(
//   eventId,
//   start_date,
//   start_time,
//   end_date,
//   end_time,
//   is_active,
//   is_one_at_a_time,
//   is_individual_category_assigned,
//   is_Completed_Submission,
//   is_jury_print_send_all,
//   is_scoring_dropdown,
//   is_comments_box_judging,
//   is_data_single_page,
//   is_total,
//   is_jury_others_score,
//   is_abstain,
//   overall_score
// ) {
//   const insertSql = `INSERT INTO general_settings (
//     eventId,
//     start_date,
//     start_time,
//     end_date,
//     end_time,
//     is_active,
//     is_one_at_a_time,
//     is_individual_category_assigned,
//     is_Completed_Submission,
//     is_jury_print_send_all,
//     is_scoring_dropdown,
//     is_comments_box_judging,
//     is_data_single_page,
//     is_total,
//     is_jury_others_score,
//     is_abstain,
//     overall_score
//   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   const values = [
//     eventId,
//     start_date,
//     start_time,
//     end_date,
//     end_time,
//     is_active,
//     is_one_at_a_time,
//     is_individual_category_assigned,
//     is_Completed_Submission,
//     is_jury_print_send_all,
//     is_scoring_dropdown,
//     is_comments_box_judging,
//     is_data_single_page,
//     is_total,
//     is_jury_others_score,
//     is_abstain,
//     overall_score,
//   ];

//   try {
//     const result = await new Promise((resolve, reject) => {
//       db.query(insertSql, values, (insertError, result) => {
//         if (insertError) {
//           return reject(new Error(`Database Insert Error: ${insertError.message}`));
//         }

//         if (result.affectedRows > 0) {
//           resolve({ affectedRows: result.affectedRows, id: result.insertId });
//         } else {
//           reject(new Error('No rows affected during insert.'));
//         }
//       });
//     });

//     return {
//       affectedRows: result.affectedRows,
//       id: result.id,
//       message: 'General settings created successfully.',
//     };
//   } catch (error) {
//     throw new Error(`Database Error: ${error.message}`);
//   }
// }

export async function generalSettings(
  eventId,
  start_date,
  start_time,
  end_date,
  end_time,
  is_active,
  is_one_at_a_time,
  is_individual_category_assigned,
  is_Completed_Submission,
  is_jury_print_send_all,
  is_scoring_dropdown,
  is_comments_box_judging,
  is_data_single_page,
  is_total,
  is_jury_others_score,
  is_abstain,
  overall_score,
  round_name
) {
  const insertSql = `INSERT INTO general_settings (
    eventId,
    start_date,
    start_time,
    end_date,
    end_time,
    is_active,
    is_one_at_a_time,
    is_individual_category_assigned,
    is_Completed_Submission,
    is_jury_print_send_all,
    is_scoring_dropdown,
    is_comments_box_judging,
    is_data_single_page,
    is_total,
    is_jury_others_score,
    is_abstain,
    overall_score,
    round_name
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    eventId,
    start_date,
    start_time,
    end_date,
    end_time,
    is_active,
    is_one_at_a_time,
    is_individual_category_assigned,
    is_Completed_Submission,
    is_jury_print_send_all,
    is_scoring_dropdown,
    is_comments_box_judging,
    is_data_single_page,
    is_total,
    is_jury_others_score,
    is_abstain,
    overall_score,
    round_name,
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            new Error(`Database Insert Error: ${insertError.message}`)
          );
        }

        if (result.affectedRows > 0) {
          resolve({ affectedRows: result.affectedRows, id: result.insertId });
        } else {
          reject(new Error("No rows affected during insert."));
        }
      });
    });

    return {
      affectedRows: result.affectedRows,
      id: result.id,
      message: "General settings created successfully.",
    };
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
}

export async function statusEvent(eventId, updates) {
  const { is_live, is_draft, is_archive } = updates;

  const updateSql = `
    UPDATE event_details 
    SET is_live = ?, is_draft = ?, is_archive = ? 
    WHERE id = ?`;

  const values = [is_live, is_draft, is_archive, eventId];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, values, (updateError, result) => {
        if (updateError) {
          return reject(
            new Error(`Database Update Error: ${updateError.message}`)
          );
        }

        if (result.affectedRows > 0) {
          resolve(result.affectedRows);
        } else {
          reject(new Error("No rows affected."));
        }
      });
    });

    return {
      affectedRows: result,
      message: "Event status updated successfully.",
    };
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
}

export async function AssignJury(
  eventId,
  roundId,
  email,
  first_name,
  last_name,
  is_readonly,
  is_auto_signin,
  is_assign_New,
  is_assign_close,
  is_assign_send,
  is_locked,
  round_name
) {
  const insertSql = `
    INSERT INTO jury_assign (
      eventId,
      roundId,
      email,
      first_name,
      last_name,
      is_readonly,
      is_auto_signin,
      is_assign_New,
      is_assign_close,
      is_assign_send,
      is_locked,
      round_name
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    eventId,
    roundId,
    email,
    first_name,
    last_name,
    is_readonly,
    is_auto_signin,
    is_assign_New,
    is_assign_close,
    is_assign_send,
    is_locked,
    round_name,
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            new Error(`Database insert error: ${insertError.message}`)
          );
        }
        if (result.insertId) {
          resolve(result);
        } else {
          reject(new Error(resposne.assignJuryCreateFail));
        }
      });
    });

    return {
      juryAssignId: result.insertId,
      affectedRows: result.affectedRows,
      message: resposne.assignJuryCreateSuccess,
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export function groupNameCreate(juryAssignId, eventId, roundId, group_name) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(group_name)) {
      const error = new Error("group_name must be an array");
      return reject(error);
    }

    if (group_name.length === 0) {
      return resolve([]);
    }

    const insertSql = `INSERT INTO jury_assign_grps (juryAssignId, eventId, roundId, group_name) VALUES (?, ?, ?, ?)`;

    const queries = group_name.map((group) => {
      return new Promise((res, rej) => {
        if (typeof group !== "string" || group.trim() === "") {
          const error = new Error(`Invalid group name: ${group}`);
          return rej(error);
        }

        db.query(
          insertSql,
          [juryAssignId, eventId, roundId, group],
          (error, result) => {
            if (error) {
              rej(error);
            } else {
              res(result.insertId);
            }
          }
        );
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => {
        reject(error);
      });
  });
}

export function checkeventIdAssign(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkroundIdAssignJury(roundId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign WHERE roundId = ?";
    db.query(query, [roundId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkJuryAssignId(juryAssignId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign WHERE id = ?";
    db.query(query, [juryAssignId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function getAssignedJury(juryAssignId, eventId, roundId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        j.id AS juryAssignId,
        j.eventId,
        j.roundId,
        j.email,
        j.first_name,
        j.last_name,
        j.is_readonly,
        j.is_auto_signin,
        j.is_assign_New,
        j.is_assign_close,
        j.is_assign_send,
        j.is_restricted,
        j.is_locked,
        jg.group_name
      FROM jury_assign AS j
      LEFT JOIN jury_assign_grps AS jg ON j.id = jg.juryAssignId
      WHERE j.is_deleted = 0 
        AND j.eventId = ? 
        AND j.roundId = ? 
        AND j.id = ?
    `;
    const values = [eventId, roundId, juryAssignId];

    db.query(query, values, (error, results) => {
      if (error) {
        return reject(new Error(`Database query error: ${error.message}`));
      }

      if (results.length === 0) {
        return resolve(null);
      }

      const result = {};

      results.forEach((row) => {
        if (!result[row.juryAssignId]) {
          result[row.juryAssignId] = {
            juryAssignId: row.juryAssignId,
            eventId: row.eventId,
            roundId: row.roundId,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            is_readonly: row.is_readonly || 0,
            is_auto_signin: row.is_auto_signin || 0,
            is_assign_New: row.is_assign_New || 0,
            is_assign_close: row.is_assign_close || 0,
            is_assign_send: row.is_assign_send || 0,
            is_restricted: row.is_restricted || 0,
            is_locked: row.is_locked || 0,
            group_names: row.group_name ? [row.group_name] : [],
          };
        } else {
          if (row.group_name) {
            result[row.juryAssignId].group_names.push(row.group_name);
          }
        }
      });

      // If there is only one entry, return just the value, not the object
      const firstResult = result[Object.keys(result)[0]];

      resolve(firstResult); // Resolving the first entry object
    });
  });
}

export function getAdminProfile(adminId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        time_zone,
        mobile_number,
        company,
        job_title,
        profile_image
      FROM admin
      WHERE id = ? AND is_deleted = 0
    `;

    db.query(query, [adminId], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error("No Admin found for the given ID"));
      }
      resolve({
        admins: results,
      });
    });
  });
}

export async function createCoupon(
  eventId,
  category,
  coupon_name,
  coupon_code,
  percent_off,
  coupon_amount,
  start_date,
  end_date
) {
  const insertSql = `
INSERT INTO coupons (
    eventId,
    awardId,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date)VALUES (?, ?, ?, ?, ?, ?, ?, ?)

  `;
  const values = [
    eventId,
    category,
    coupon_name,
    coupon_code,
    percent_off,
    coupon_amount,
    start_date,
    end_date,
  ];
  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            new Error(`Database insert Error : ${insertError.message}`)
          );
        }
        if (result.insertId) {
          resolve(result.insertId);
        } else {
          reject(new Error(resposne.couponFail));
        }
      });
    });
    return {
      id: result,
      message: resposne.couponSuccess,
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export function checkAwardId(awardId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM awards_category WHERE id = ?";
    db.query(query, [awardId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function getAwardById(awardId) {
  const selectSql = `
        SELECT 
        id,
        eventId,
        category_name, 
        category_prefix, 
        belongs_group, 
        limit_submission, 
        is_start_date, 
        is_end_date, 
        is_endorsement, 
        start_date, 
        end_date,
        payment_price
      FROM awards_category 
      WHERE id = ?;

  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [awardId], (fetchError, results) => {
        if (fetchError) {
          return reject(fetchError);
        }

        if (results.length > 0) {
          return resolve(results[0]);
        } else {
          reject(new Error("Award not found"));
        }
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export function searchEvent(search) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM event_details 
      WHERE event_name LIKE ? AND is_deleted = 0`;

    const values = [`%${search}%`];

    db.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

//----------------------------------------- dynamic from create  ----------------------------------------------//
export function checkFormExists(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM registration_form WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const createRegistrationFormService = (eventId, form_schema) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO registration_form (eventId, form_schema) 
      VALUES (?, ?);
    `;

    db.query(query, [eventId, JSON.stringify(form_schema)], (err, result) => {
      if (err) {
        reject(new Error(`Database insert error: ${err.message}`));
      } else if (result.insertId) {
        resolve({
          insertId: result.insertId,
          affectedRows: result.affectedRows,
        });
      } else {
        reject(new Error("Erorr while Creating Registration Form Failed"));
      }
    });
  });
};

export function checkRegFormId(registrationFormId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM registration_form WHERE id = ?";
    db.query(query, [registrationFormId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const getRegistrationFormService = async (
  eventId,
  registrationFormId
) => {
  const query = `
  SELECT rf.id,
  rf.eventId,
  rf.form_schema,
  ed.event_name,
  ed.closing_date,
  ed.closing_time,
  ed.event_logo,
  ed.event_banner
  FROM registration_form AS rf
  LEFT JOIN event_details AS ed ON rf.eventId = ed.id 
  WHERE rf.eventId = ? 
  AND rf.id = ? 
  AND rf.is_deleted = 0`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(query, [eventId, registrationFormId], (err, result) => {
        if (err) {
          reject(new Error(`Database query error: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });

    if (result.length === 0) {
      return null;
    }

    return result;
  } catch (error) {
    throw new Error(`Error fetching registration form: ${error.message}`);
  }
};

export const updateRegistrationFormService = async (
  eventId,
  registrationFormId,
  form_schema
) => {
  try {
    const query = `UPDATE registration_form SET form_schema = ? WHERE eventId = ? AND id = ? AND is_deleted = 0`;
    const result = await new Promise((resolve, reject) => {
      db.query(
        query,
        [JSON.stringify(form_schema), eventId, registrationFormId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    return result;
  } catch (err) {
    throw err;
  }
};

// Create Entry Form start
export function checkEntryFormExists(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM entry_form WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const createEntryFormService = (eventId, form_schema) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO entry_form (eventId, form_schema) 
      VALUES (?, ?);
    `;

    db.query(query, [eventId, JSON.stringify(form_schema)], (err, result) => {
      if (err) {
        reject(new Error(`Database insert error: ${err.message}`));
      } else if (result.insertId) {
        resolve({
          insertId: result.insertId,
          affectedRows: result.affectedRows,
        });
      } else {
        reject(new Error("Error while creating entry form"));
      }
    });
  });
};

export function checkentryFormId(entryFormId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM entry_form WHERE id = ?";
    db.query(query, [entryFormId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const getEntryFormService = async (eventId, entryFormId) => {
  const query = `SELECT ef.id,
      ef.eventId,
      ef.form_schema,
      ed.event_name,
      ed.closing_date,
      ed.closing_time,
      ed.event_logo,
      ed.event_banner
    FROM entry_form AS ef
    LEFT JOIN event_details AS ed ON ef.eventId = ed.id
    WHERE ef.eventId = ? 
    AND ef.id = ? 
    AND ef.is_deleted = 0`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(query, [eventId, entryFormId], (err, result) => {
        if (err) {
          reject(new Error(`Database query error: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });

    if (result.length === 0) {
      return null;
    }

    return result;
  } catch (error) {
    throw new Error(`Error fetching entry form: ${error.message}`);
  }
};

export const updateEntryFormService = async (
  eventId,
  entryFormId,
  form_schema
) => {
  const query = `UPDATE entry_form SET form_schema = ? WHERE eventId = ? AND id = ? AND is_deleted = 0`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(
        query,
        [JSON.stringify(form_schema), eventId, entryFormId],
        (err, result) => {
          if (err) reject(new Error(`Database update error: ${err.message}`));
          else resolve(result);
        }
      );
    });

    return {
      affectedRows: result.affectedRows,
      entryFormId: entryFormId,
    };
  } catch (err) {
    throw new Error(`Error updating entry form: ${err.message}`);
  }
};

// Create Entry Form end

export function checkroundId(roundId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM general_settings WHERE id = ?";
    db.query(query, [roundId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

// export const getgeneralSettings = async (eventId) => {
//   const query = `SELECT
//                   gs.id AS roundId,
//                   gs.eventId,
//                   gs.start_date,
//                   gs.start_time,
//                   gs.end_date,
//                   gs.end_time,
//                   gs.is_active,
//                   gs.round_name,
//                   (SELECT COUNT(*) FROM scorecard WHERE roundId = gs.id AND eventId = gs.eventId) AS total_scorecards
//                 FROM general_settings AS gs
//                 WHERE gs.eventId = ?
//                 AND gs.is_deleted = 0;`;

//   try {
//     const values = [eventId];
//     const result = await new Promise((resolve, reject) => {
//       db.query(query, values, (err, result) => {
//         if (err) {
//           reject(new Error(`Database query error: ${err.message}`));
//         } else {
//           resolve(result);
//         }
//       });
//     });

//     if (result.length === 0) {
//       return { status: false, message: "No data found", data: [] };
//     }

//     const modifiedResult = result.map((item, index) => {
//       return {
//         ...item,
//         round_name: `round${index + 1}`
//       };
//     });

//     return modifiedResult;

//   } catch (error) {
//     throw new Error(`Error fetching general settings: ${error.message}`);
//   }
// };

// export const getgeneralSettings = async (eventId) => {
//   const query = `SELECT
//                   gs.id AS roundId,
//                   gs.eventId,
//                   gs.start_date,
//                   gs.start_time,
//                   gs.end_date,
//                   gs.end_time,
//                   gs.is_active,
//                   gs.round_name,
//                   (SELECT COUNT(*) FROM scorecard WHERE roundId = gs.id AND eventId = gs.eventId) AS total_scorecards
//                 FROM general_settings AS gs
//                 WHERE gs.eventId = ?
//                 AND gs.is_deleted = 0;`;

//   try {
//     const values = [eventId];
//     const result = await new Promise((resolve, reject) => {
//       db.query(query, values, (err, result) => {
//         if (err) {
//           reject(new Error(`Database query error: ${err.message}`));
//         } else {
//           resolve(result);
//         }
//       });
//     });

//     if (result.length === 0) {
//       return { status: false, message: "No data found", data: [] };
//     }

//     const modifiedResult = result.map((item, index) => {
//       if (!item.round_name) {
//         item.round_name = `round${index + 1}`;
//       }
//       return item;
//     });

//     return modifiedResult;

//   } catch (error) {
//     throw new Error(`Error fetching general settings: ${error.message}`);
//   }
// };

export const getgeneralSettings = async (eventId) => {
  const query = `SELECT 
                  gs.id AS roundId,
                  gs.eventId,
                  gs.start_date,
                  gs.start_time,
                  gs.end_date,
                  gs.end_time,
                  gs.is_active,
                  gs.round_name,
                  (SELECT COUNT(*) 
                     FROM scorecard 
                     WHERE roundId = gs.id 
                       AND eventId = gs.eventId
                       AND is_deleted = 0)          
                     AS total_scorecards  
                  FROM general_settings AS gs
                WHERE gs.eventId = ?
                AND gs.is_deleted = 0;`;

  try {
    const values = [eventId];
    const result = await new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(new Error(`Database query error: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });

    if (result.length === 0) {
      return { status: false, message: "No data found", data: [] };
    }

    const modifiedResult = result.map((item, index) => {
      if (!item.round_name) {
        item.round_name = `round${index + 1}`;
      }
      return item;
    });

    return modifiedResult;
  } catch (error) {
    throw new Error(`Error fetching general settings: ${error.message}`);
  }
};

export function checkeventIdSettings(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM general_settings WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const updateGeneralSettings = async (updates, roundId) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        return reject(new Error("Failed to begin transaction"));
      }

      try {
        const updateFields = Object.keys(updates)
          .map((field) => `${field} = ?`)
          .join(", ");
        const updateValues = Object.values(updates);
        updateValues.push(roundId);

        const updateQuery = `
          UPDATE general_settings
          SET ${updateFields}, updated_at = NOW()
          WHERE id = ?;
        `;

        db.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            return db.rollback(() => {
              reject(new Error("Database update failed: " + err.message));
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(new Error("Transaction commit failed: " + err.message));
              });
            }
            resolve({
              affectedRows: result.affectedRows,
              message: "General settings updated successfully.",
            });
          });
        });
      } catch (error) {
        db.rollback(() => reject(error));
      }
    });
  });
};

export const createScorecaRD = (
  eventId,
  roundId,
  form_schema,
  overall_value,
  categoryId
) => {
  return new Promise((resolve, reject) => {
    // First, check if a scorecard already exists for the given event, round, and category
    const checkQuery = `SELECT id FROM scorecard WHERE eventId = ? AND roundId = ? AND categoryId = ? AND is_deleted = 0`;

    db.query(
      checkQuery,
      [eventId, roundId, categoryId],
      (checkErr, checkResults) => {
        if (checkErr) {
          return reject(new Error(`Database check error: ${checkErr.message}`));
        }

        // If a scorecard already exists, prevent duplicate insertion
        if (checkResults.length > 0) {
          return reject(
            new Error(
              "A scorecard already exists for this event, round, and category."
            )
          );
        }

        // If no existing scorecard, insert a new one
        const insertQuery = `
        INSERT INTO scorecard (eventId, roundId, form_schema, overall_value, categoryId) 
        VALUES (?, ?, ?, ?, ?);
      `;
        const values = [
          eventId,
          roundId,
          JSON.stringify(form_schema),
          overall_value,
          categoryId,
        ];

        db.query(insertQuery, values, (insertErr, result) => {
          if (insertErr) {
            return reject(
              new Error(`Database insert error: ${insertErr.message}`)
            );
          }
          if (result.insertId) {
            resolve({
              insertId: result.insertId,
              affectedRows: result.affectedRows,
            });
          } else {
            reject(
              new Error(
                "Error while creating scorecard form: No insertId returned."
              )
            );
          }
        });
      }
    );
  });
};

export const createScorecaRD1 = async (
  eventId,
  roundId,
  form_schema,
  overall_value,
  categoryIds
) => {
  const created = [];

  for (const categoryId of categoryIds) {
    const checkQuery = `SELECT id FROM scorecard WHERE eventId = ? AND roundId = ? AND categoryId = ? AND is_deleted = 0`;

    const existing = await new Promise((resolve, reject) => {
      db.query(checkQuery, [eventId, roundId, categoryId], (err, results) => {
        if (err)
          return reject(new Error(`Database check error: ${err.message}`));
        resolve(results);
      });
    });

    if (existing.length > 0) {
      throw new Error(
        `A scorecard already exists for eventId ${eventId}, roundId ${roundId}, categoryId ${categoryId}`
      );
    }

    const insertQuery = `
      INSERT INTO scorecard (eventId, roundId, form_schema, overall_value, categoryId) 
      VALUES (?, ?, ?, ?, ?);
    `;

    const result = await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [
          eventId,
          roundId,
          JSON.stringify(form_schema),
          overall_value,
          categoryId,
        ],
        (err, result) => {
          if (err)
            return reject(new Error(`Database insert error: ${err.message}`));
          resolve(result);
        }
      );
    });

    created.push({
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      categoryId: categoryId,
    });
  }

  return created;
};

export async function roundAwardCategory(
  eventId,
  roundId,
  scoreFormIdArray,
  scorecard_categories
) {
  return new Promise((resolve, reject) => {
    if (
      !Array.isArray(scorecard_categories) ||
      !Array.isArray(scoreFormIdArray)
    ) {
      return reject(
        new Error("scorecard_categories and scoreFormIdArray must be arrays")
      );
    }

    if (scorecard_categories.length !== scoreFormIdArray.length) {
      return reject(
        new Error(
          "scoreFormIdArray and scorecard_categories must be of same length"
        )
      );
    }

    const insertSql = `INSERT INTO scorecard_categories 
    (
      eventId,
      roundId,
      scoreFormId,
      scorecard_category
    ) VALUES (?, ?, ?, ?)`;

    const queries = scorecard_categories.map((scorecard_category, index) => {
      const scoreFormId = scoreFormIdArray[index]?.insertId;
      return new Promise((res, rej) => {
        const values = [eventId, roundId, scoreFormId, scorecard_category];
        db.query(insertSql, values, (error, result) => {
          if (error) {
            return rej(error);
          }
          res({ ScoreCardCategoryId: result.insertId });
        });
      });
    });

    Promise.all(queries)
      .then((ids) => resolve(ids))
      .catch((error) => reject(error));
  });
}

export function checkeventIdScore(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM scorecard WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkSCOREFormIdCategory(scoreFormId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM scorecard_categories WHERE scoreFormId = ?";
    db.query(query, [scoreFormId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkroundIdScore(roundId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM scorecard WHERE roundId = ?";
    db.query(query, [roundId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const getscorecardService = async (scoreFormId, eventId, roundId) => {
  const query = `
    SELECT 
      s.id AS scoreFormId,
      s.eventId,
      s.roundId,
      s.categoryId AS categoryId,
      s.form_schema,
      s.overall_value,
      sc.id AS ScoreCardCategoryId,
      sc.scoreFormId,
      sc.scorecard_category AS ScoreCardCategory
    FROM scorecard_categories sc
    LEFT JOIN scorecard s ON sc.scoreFormId = s.id
    WHERE sc.scoreFormId = ?
    AND s.eventId = ?
    AND s.roundId = ?
    AND s.is_deleted = 0
  `;

  try {
    const values = [scoreFormId, eventId, roundId];
    const result = await new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(new Error(`Database query error: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });

    if (result.length === 0) {
      return {
        scoreFormId: null,
        eventId: null,
        roundId: null,
        ScorecardCategories: [],
      };
    }

    const scoreCardCategories = result
      .filter((row) => row.ScoreCardCategory)
      .map((row) => row.ScoreCardCategory);

    const firstRow = result.find(
      (row) => row.scoreFormId && row.eventId && row.roundId
    );

    return {
      scoreFormId: firstRow?.scoreFormId || null,
      eventId: firstRow?.eventId || null,
      roundId: firstRow?.roundId || null,
      categoryId: firstRow?.categoryId || null,
      form_schema: firstRow?.form_schema || [],
      overall_value: firstRow?.overall_value || null,
      scorecard_categories: scoreCardCategories,
    };
  } catch (error) {
    throw new Error(
      `Error fetching scorecard form for scoreFormId: ${scoreFormId}, eventId: ${eventId}, roundId: ${roundId}. Error: ${error.message}`
    );
  }
};

// export function getRoundById(roundId) {
//   return new Promise((resolve, reject) => {

//     const query = `
//         SELECT
//          (SELECT COUNT(*)
//                      FROM scorecard
//                      WHERE roundId = r.id
//                        AND eventId = r.eventId
//                        AND is_deleted = 0)
//                      AS TotalScorecards  ,
//         r.id AS roundId,
//         r.eventId AS eventId,
//         r.is_active,
//         r.start_date,
//         r.start_time,
//         r.end_date,
//         r.end_time,
//         r.is_one_at_a_time,
//         r.is_individual_category_assigned,
//         r.is_Completed_Submission,
//         r.is_jury_print_send_all,
//         r.is_scoring_dropdown,
//         r.is_comments_box_judging,
//         r.is_data_single_page,
//         r.is_total,
//         r.is_jury_others_score,
//         r.is_abstain,
//         r.overall_score,
//         s.id AS scorecard_id,
//         s.eventId,
//         s.roundId,
//         s.form_schema,
//         s.overall_value
//     FROM general_settings r
//     LEFT JOIN scorecard s ON r.id = s.roundId
//     WHERE r.is_deleted = 0
//     AND r.id = ?
//     `;

//     db.query(query, [roundId], (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// }// this code is not working properly, it is returning multiple rows for each roundId, need to fix it

export function getRoundById(roundId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        r.id AS roundId,
        r.eventId,
        r.is_active,
        r.start_date,
        r.start_time,
        r.end_date,
        r.end_time,
        r.is_one_at_a_time,
        r.is_individual_category_assigned,
        r.is_Completed_Submission,
        r.is_jury_print_send_all,
        r.is_scoring_dropdown,
        r.is_comments_box_judging,
        r.is_data_single_page,
        r.is_total,
        r.is_jury_others_score,
        r.is_abstain,
        r.overall_score,

        -- Scorecard count (only active)
        (
          SELECT COUNT(*) 
          FROM scorecard 
          WHERE roundId = r.id 
            AND eventId = r.eventId
            AND is_deleted = 0
        ) AS TotalScorecards,

        -- Joined scorecard (if any)
        s.id AS scorecard_id,
        s.eventId AS scorecard_eventId,
        s.roundId AS scorecard_roundId,
        s.form_schema,
        s.overall_value

      FROM general_settings r
      LEFT JOIN scorecard s ON s.roundId = r.id AND s.is_deleted = 0
      WHERE r.is_deleted = 0
        AND r.id = ?
    `;

    db.query(query, [roundId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

export function checkScorecardFormId(scoreFormId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM scorecard WHERE id = ?";
    db.query(query, [scoreFormId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkScorecardEventId(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM scorecard WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function getScorecards(eventId, roundId) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT 
        s.id AS scoreFormId,
        s.eventId,
        s.roundId,
        s.form_schema,
        sc.id AS ScoreCardCategoryId,
        sc.eventId AS ScoreCardCategoryEventId,
        sc.roundId AS ScoreCardCategoryRoundId,
        sc.scoreFormId AS ScoreCardCategoryScoreFormId,
        sc.scorecard_category AS ScoreCardCategory,
        s.categoryId AS categoryId
      FROM scorecard s 
      LEFT JOIN scorecard_categories sc ON s.id = sc.scoreFormId  
      WHERE s.is_deleted = 0 
        AND s.eventId = ? 
        AND s.roundId = ? 
    `;

    db.query(query, [eventId, roundId], (err, results) => {
      if (err) {
        return reject(err);
      }

      const scorecards = {};

      results.forEach((row) => {
        if (!scorecards[row.scoreFormId]) {
          scorecards[row.scoreFormId] = {
            scoreFormId: row.scoreFormId,
            eventId: row.eventId,
            roundId: row.roundId,
            categoryId: row.categoryId,
            form_schema: row.form_schema,
            scorecard_categories: [],
          };
        }

        if (row.ScoreCardCategory) {
          scorecards[row.scoreFormId].scorecard_categories.push({
            ScoreCardCategoryId: row.ScoreCardCategoryId,
            ScoreCardCategory: row.ScoreCardCategory,
          });
        }
      });

      resolve(Object.values(scorecards));
    });
  });
}

export function checkIfScoreFormDeleted(scoreFormId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_deleted FROM scorecard WHERE id = ?";
    db.query(query, [scoreFormId], (err, results) => {
      if (err) {
        return reject(new Error("Error querying the database: " + err.message));
      }
      if (results.length === 0) {
        return reject(new Error(`Scorecard with id ${scoreFormId} not found`));
      }

      // Return true if deleted, false otherwise
      const isDeleted = results[0].is_deleted === 1;
      resolve(isDeleted);
    });
  });
}

export async function softDeleteScorecard(scoreFormId) {
  const updateSql = "UPDATE scorecard SET is_deleted = 1 WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [scoreFormId], (err, result) => {
        if (err) {
          return reject(
            new Error("Error deleting scoreFormId: " + err.message)
          );
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error(`No scorecard found with id ${scoreFormId} to delete`);
    }

    return {
      message: "Scorecard deleted successfully",
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    throw new Error("Deletion failed: " + error.message);
  }
}

export function checkIfScoreFormCategoriesDeleted(scoreFormId) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT is_deleted FROM scorecard_categories WHERE scoreFormId = ?";
    db.query(query, [scoreFormId], (err, results) => {
      if (err) {
        return reject(new Error("Error querying the database: " + err.message));
      }
      if (results.length === 0) {
        return reject(
          new Error(
            `Scorecard category with scoreFormId ${scoreFormId} not found`
          )
        );
      }

      // Return true if deleted, false otherwise
      const isDeleted = results[0].is_deleted === 1;
      resolve(isDeleted);
    });
  });
}

export async function softDeleteCategiesScorecard(scoreFormId) {
  const updateSql =
    "UPDATE scorecard_categories SET is_deleted = 1 WHERE scoreFormId = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [scoreFormId], (err, result) => {
        if (err) {
          return reject(
            new Error(
              "Error deleting scoreFormId in categories: " + err.message
            )
          );
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error(
        `No scorecard category found with scoreFormId ${scoreFormId} to delete`
      );
    }

    return {
      message: "Scorecard categories deleted successfully",
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    throw new Error("Deletion failed: " + error.message);
  }
}

export const updateScorecardService = async (
  updates,
  scoreFormId,
  eventId,
  roundId
) => {
  try {
    for (const field in updates) {
      if (typeof updates[field] === "object") {
        updates[field] = JSON.stringify(updates[field]);
      }
    }

    const updateFields = Object.keys(updates)
      .map((field) => `${field} = ?`)
      .join(", ");
    const updateValues = Object.values(updates);
    const updateQuery = `
      UPDATE scorecard
      SET ${updateFields}
      WHERE id = ? AND eventId = ? AND roundId = ? AND is_deleted = 0;
    `;
    updateValues.push(scoreFormId, eventId, roundId);

    const result = await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) return reject(new Error("Failed to begin transaction"));

        db.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            db.rollback(() =>
              reject(new Error("Database update failed: " + err.message))
            );
          } else {
            db.commit((err) => {
              if (err) {
                db.rollback(() =>
                  reject(new Error("Transaction commit failed: " + err.message))
                );
              } else {
                resolve(result);
              }
            });
          }
        });
      });
    });

    return {
      affectedRows: result.affectedRows,
      insertId: result.insertId,
    };
  } catch (error) {
    throw new Error("Failed to update scorecard form: " + error.message);
  }
};

export const updateScorecardcategories = async (
  scoreFormId,
  eventId,
  roundId,
  scorecard_categories
) => {
  try {
    if (
      !Array.isArray(scorecard_categories) ||
      scorecard_categories.length === 0
    ) {
      throw new Error("Scorecard Categories must be a non-empty array.");
    }

    const placeholders = scorecard_categories
      .map(() => `(?, ?, ?, ?)`)
      .join(", ");
    const values = scorecard_categories.flatMap((category) => [
      scoreFormId,
      eventId,
      roundId,
      category,
    ]);

    const deleteSql = `
      DELETE FROM scorecard_categories 
      WHERE scoreFormId = ? AND eventId = ? AND roundId = ?
    `;
    const insertSql = `
      INSERT INTO scorecard_categories (scoreFormId, eventId, roundId, scorecard_category)
      VALUES ${placeholders}
    `;

    await new Promise((resolve, reject) => {
      db.beginTransaction((err) => {
        if (err) return reject(new Error("Failed to begin transaction"));

        const deleteIds = [scoreFormId, eventId, roundId];
        db.query(deleteSql, deleteIds, (deleteError) => {
          if (deleteError) {
            return db.rollback(() =>
              reject(
                new Error("Delete operation failed: " + deleteError.message)
              )
            );
          }

          db.query(insertSql, values, (insertError, result) => {
            if (insertError) {
              return db.rollback(() =>
                reject(
                  new Error("Insert operation failed: " + insertError.message)
                )
              );
            }

            db.commit((commitError) => {
              if (commitError) {
                return db.rollback(() =>
                  reject(
                    new Error(
                      "Transaction commit failed: " + commitError.message
                    )
                  )
                );
              }

              resolve(result.affectedRows);
            });
          });
        });
      });
    });
  } catch (error) {
    throw new Error("Failed to update scorecard categories: " + error.message);
  }
};

export function checkeventIdJuryAssign(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkroundIdJuryAssign(roundId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign WHERE roundId = ?";
    db.query(query, [roundId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkJuryAssignidGroup(juryAssignId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_assign_grps WHERE juryAssignId = ?";
    db.query(query, [juryAssignId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function getAssignJury(eventId, roundId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        j.id AS juryAssignId,
        j.eventId,
        j.roundId,
        j.email,
        j.first_name,
        j.last_name,
        j.is_readonly,
        j.is_auto_signin,
        j.is_assign_New,
        j.is_assign_close,
        j.is_assign_send,
        j.is_restricted,
        j.is_locked,
        jg.group_name
      FROM jury_assign AS j
      LEFT JOIN jury_assign_grps AS jg ON j.id = jg.juryAssignId
      WHERE j.is_deleted = 0 
        AND j.eventId = ? 
        AND j.roundId = ?
    `;

    const values = [eventId, roundId];

    db.query(query, values, async (error, results) => {
      if (error) {
        return reject(new Error(`Database query error: ${error.message}`));
      }

      if (results.length === 0) {
        return resolve([]);
      }

      const result = [];

      // First get total submissions in shortlist_data for this event/round
      const totalSubQuery = `
        SELECT COUNT(DISTINCT submission_id) AS total
        FROM shortlist_data
        WHERE eventId = ? AND roundId = ? AND is_deleted = 0
      `;

      let totalShortlistSubmissions = 0;

      try {
        const [shortlistTotal] = await new Promise((resolveSub, rejectSub) => {
          db.query(totalSubQuery, [eventId, roundId], (err, res) => {
            if (err) return rejectSub(err);
            resolveSub(res);
          });
        });

        totalShortlistSubmissions = shortlistTotal.total || 0;
      } catch (err) {
        return reject(err);
      }

      // Build response with group names and score stats
      for (const row of results) {
        let jury = result.find((j) => j.juryAssignId === row.juryAssignId);

        if (!jury) {
          // Get how many this jury scored
          const scoredCountQuery = `
            SELECT COUNT(DISTINCT submission_id) AS scored
            FROM jury_score
            WHERE eventId = ? AND roundId = ? AND judgeId = ? 
              AND is_deleted = 0 AND total IS NOT NULL
          `;

          let totalScoredByJudge = 0;

          try {
            const [scoredRow] = await new Promise(
              (resolveScore, rejectScore) => {
                db.query(
                  scoredCountQuery,
                  [eventId, roundId, row.juryAssignId],
                  (err, res) => {
                    if (err) return rejectScore(err);
                    resolveScore(res);
                  }
                );
              }
            );

            totalScoredByJudge = scoredRow.scored || 0;
          } catch (err) {
            return reject(err);
          }

          jury = {
            juryAssignId: row.juryAssignId,
            eventId: row.eventId,
            roundId: row.roundId,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            is_readonly: row.is_readonly || 0,
            is_auto_signin: row.is_auto_signin || 0,
            is_assign_New: row.is_assign_New || 0,
            is_assign_close: row.is_assign_close || 0,
            is_assign_send: row.is_assign_send || 0,
            is_restricted: row.is_restricted || 0,
            is_locked: row.is_locked || 0,
            group_names: row.group_name ? [row.group_name] : [],
            totalShortlistSubmissions,
            totalScoredByJudge,
          };
          result.push(jury);
        } else {
          if (row.group_name && !jury.group_names.includes(row.group_name)) {
            jury.group_names.push(row.group_name);
          }
        }
      }

      resolve(result);
    });
  });
}

export async function softDeleteJuryAssign(juryAssignId) {
  const updateSql = "UPDATE jury_assign SET is_deleted = 1 WHERE id = ?";

  return new Promise((resolve, reject) => {
    db.query(updateSql, [juryAssignId], (err, result) => {
      if (err) {
        return reject(
          new Error(
            "Error deleting juryAssignId from jury_assign: " + err.message
          )
        );
      }

      if (result.affectedRows === 0) {
        return reject(
          new Error(
            `No jury assignment found with id ${juryAssignId} to delete.`
          )
        );
      }

      resolve(result);
    });
  });
}

export async function softDeleteJuryAssignGrps(juryAssignId) {
  const updateSql =
    "UPDATE jury_assign_grps SET is_deleted = 1 WHERE juryAssignId = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [juryAssignId], (err, result) => {
        if (err) {
          return reject(
            new Error(
              "Error deleting juryAssignId from jury_assign_grps: " +
                err.message
            )
          );
        }
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error(
        `No group found with juryAssignId ${juryAssignId} to delete`
      );
    }

    return "Jury group deleted successfully";
  } catch (error) {
    throw new Error("Deletion failed: " + error.message);
  }
}

export const updatedgroupName = async (
  juryAssignId,
  eventId,
  roundId,
  group_name
) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(group_name) || group_name.length === 0) {
      return reject(new Error("group_name must be a non-empty array."));
    }

    const placeholders = group_name.map(() => `(?, ?, ?, ?)`).join(", ");
    const values = group_name.flatMap((group) => [
      juryAssignId,
      eventId,
      roundId,
      group,
    ]);

    const deleteSql = `DELETE FROM jury_assign_grps WHERE juryAssignId = ? AND eventId = ? AND roundId = ?`;

    const insertSql = `
      INSERT INTO jury_assign_grps (juryAssignId, eventId, roundId, group_name)
      VALUES ${placeholders}
    `;

    db.query(deleteSql, [juryAssignId, eventId, roundId], (deleteError) => {
      if (deleteError) {
        return reject(new Error("Failed to delete existing groups"));
      }

      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(new Error("Failed to insert new groups"));
        }

        resolve(result.affectedRows);
      });
    });
  });
};

export const updateAssignjury = async (
  updates,
  juryAssignId,
  eventId,
  roundId
) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        return reject(new Error("Failed to begin transaction"));
      }

      // Dynamically generate the update SQL query
      const updateFields = Object.keys(updates)
        .map((field) => `${field} = ?`)
        .join(", ");
      const updateValues = Object.values(updates);

      // SQL query to update the event details table
      const updateQuery = `
        UPDATE jury_assign
        SET ${updateFields}
        WHERE id = ? AND eventId = ? AND roundId = ? AND is_deleted = 0;
      `;

      // Append the necessary values for WHERE condition
      updateValues.push(juryAssignId, eventId, roundId);

      // Execute the update query
      db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          return db.rollback(() => {
            reject(new Error("Database update failed: " + err.message));
          });
        }

        // Commit the transaction if successful
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              reject(new Error("Transaction commit failed: " + err.message));
            });
          }

          resolve({
            affectedRows: result.affectedRows,
            message: "Update successful",
          });
        });
      });
    });
  });
};

const generateUniqueUrlKey = () => {
  const timestamp = Date.now();

  const randomPart = Math.floor(Math.random() * 1000000);

  const uniqueUrlKey = (timestamp + randomPart).toString().slice(0, 9);

  return uniqueUrlKey;
};

export const createbackdoor = (
  eventId,
  roundId,
  group_name,
  form_schema,
  filtering_pattern
) => {
  return new Promise((resolve, reject) => {
    const query = `
        INSERT INTO Jury_groups (eventId, roundId, group_name, form_schema, filtering_pattern) 
        VALUES (?, ?, ?, ?, ?)
      `;
    const values = [
      eventId,
      roundId,
      group_name,
      JSON.stringify(form_schema),
      filtering_pattern,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        reject(new Error(`Database insert error: ${err.message}`));
      } else if (result.insertId) {
        resolve({
          insertId: result.insertId,
          affectedRows: result.affectedRows,
        });
      } else {
        reject(
          new Error("Error while creating Jury Group: No insertId returned.")
        );
      }
    });
  });
};

export function checkadminIdEvent(adminId, eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE adminId = ? AND id = ?";
    db.query(query, [adminId, eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function getEventByUrlKey(eventId) {
  try {
    const uniqueUrlKey = generateUniqueUrlKey();

    // Step 1: Update the event with the generated unique URL
    const insertQuery = `UPDATE event_details SET unique_url = ? WHERE id = ?`;

    await new Promise((resolve, reject) => {
      db.query(insertQuery, [uniqueUrlKey, eventId], (error, updateResults) => {
        if (error) {
          reject(error);
        } else {
          resolve(updateResults);
        }
      });
    });

    // Step 2: Fetch the event details to build the backdoor URL
    const query = `SELECT id, event_url, unique_url FROM event_details WHERE id = ? AND is_deleted = 0`;

    const fetchResults = await new Promise((resolve, reject) => {
      db.query(query, [eventId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (fetchResults.length === 0) {
      throw new Error("Event not found or is deleted");
    }

    const eventUrlFromDb = fetchResults[0].event_url;
    const uniqueUrl = fetchResults[0].unique_url;

    if (!uniqueUrl) {
      throw new Error("Backdoor link not available");
    }

    const eventLink = `${eventUrlFromDb}/${uniqueUrl}`;

    return {
      eventId: eventId,
      event_url: eventLink,
    };
  } catch (error) {
    throw new Error(error.message || "Error generating the backdoor URL");
  }
}

// export function getEventByUrlKey(eventId) {
//   return new Promise((resolve, reject) => {
//     const uniqueUrlKey = generateUniqueUrlKey();

//     const query = `SELECT event_url
//                    FROM event_details
//                    WHERE id = ?
//                    AND is_deleted = 0`;

//     const insertQuery = `UPDATE event_details SET unique_url = ? WHERE id = ?`;

//     db.query(insertQuery, [uniqueUrlKey, eventId], (error, updateResults) => {
//       if (error) {
//         reject(error);
//       } else {
//         db.query(query, [eventId], (err, fetchResults) => {
//           if (err) {
//             reject(err);
//           } else if (fetchResults.length === 0) {
//             reject('Event not found or is deleted');
//           } else {
//             const eventUrl = fetchResults[0].event_url;

//             const eventLink = `${eventUrl}/event/${uniqueUrlKey}`;

//             resolve({
//               eventId: eventId,
//               event_url: eventLink
//             });
//           }
//         });
//       }
//     });
//   });
// }

// Refactored to use Promise instead of callbacks

export function getEventByUniqueUrlKey(uniqueUrlKey) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        e.id AS eventId,
        e.event_name,
        e.closing_date,
        e.closing_time,
        e.event_logo,
        e.email AS adminemail,
        e.event_banner,
        e.event_description,
        e.closing_messsage,
        e.is_social,
        e.social,
        e.social_image,
        e.is_live,
        e.is_archive,
        e.is_draft,
        e.submission_limit,
        ei.id AS industrytypeId,
        ei.industry_type,
        rd.id AS registrationFormId,
        ef.id AS entryFormId
      FROM event_details AS e
      LEFT JOIN industry_types AS ei ON e.id = ei.eventId
      LEFT JOIN registration_form AS rd ON e.id = rd.eventId
      LEFT JOIN entry_form AS ef ON e.id = ef.eventId
      WHERE e.unique_url = ? 
      AND e.is_deleted = 0
    `;

    db.query(query, [uniqueUrlKey], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("Event not found or is deleted"));
      }

      const event = {
        industry_type: [], // Ensure it's initialized
      };

      results.forEach((row) => {
        if (!event.eventId) {
          Object.assign(event, {
            eventId: row.eventId,
            registrationFormId: row.registrationFormId,
            entryFormId: row.entryFormId,
            is_live: row.is_live,
            is_archive: row.is_archive,
            is_draft: row.is_draft,
            event_name: row.event_name,
            closing_date: row.closing_date,
            closing_time: row.closing_time,
            event_logo: row.event_logo,
            event_banner: row.event_banner,
            event_description: row.event_description,
            closing_messsage: row.closing_messsage,
            is_social: row.is_social,
            social: row.social,
            social_image: row.social_image,
            submission_limit: row.submission_limit,
            adminemail: row.adminemail,
          });
        }

        if (row.industrytypeId) {
          event.industry_type.push({
            industrytypeId: row.industrytypeId,
            industry_type_name: row.industry_type,
          });
        }
      });

      const submissionQuery = `
        SELECT COUNT(DISTINCT submission_id) AS submissionCount
        FROM entry_data 
        WHERE eventId = ?
      `;

      db.query(submissionQuery, [event.eventId], (err, submissionResults) => {
        if (err) {
          return reject(
            new Error(`Error checking submissions: ${err.message}`)
          );
        }

        const submissionCount = submissionResults[0]?.submissionCount || 0;
        event.submissionsPresent = submissionCount;

        event.limitExceeded =
          (event.submission_limit > 0 &&
            submissionCount >= event.submission_limit) ||
          (event.submission_limit === 1 && submissionCount === 1);

        resolve(event);
      });
    });
  });
}

export function getEventGeneral(event_url) {
  return new Promise((resolve, reject) => {
    const eventSlug = event_url.split("/").pop();

    const query = `
      SELECT 
        e.id AS eventId,
        e.event_name,
        e.email AS adminemail,
        e.closing_date,
        e.closing_time,
        e.event_logo,
        e.time_zone,
        e.event_banner,
        e.event_description,
        e.closing_messsage,
        e.is_social,
        e.social,
        e.social_image,
        e.is_live,
        e.is_archive,
        e.is_draft,
        e.submission_limit,
        ei.id AS industrytypeId,
        ei.industry_type,
        rd.id AS registrationFormId,
        ef.id AS entryFormId
      FROM event_details AS e
      LEFT JOIN industry_types AS ei ON e.id = ei.eventId
      LEFT JOIN registration_form AS rd ON e.id = rd.eventId
      LEFT JOIN entry_form AS ef ON e.id = ef.eventId
      WHERE e.event_url LIKE CONCAT('%', ?) 
      AND e.is_deleted = 0
    `;

    db.query(query, [eventSlug], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }
      if (results.length === 0) {
        return reject(new Error("Event not found or is deleted"));
      }

      const event = {};

      results.forEach((row) => {
        if (!event.eventId) {
          event.eventId = row.eventId;
          event.registrationFormId = row.registrationFormId;
          event.entryFormId = row.entryFormId;
          event.is_live = row.is_live;
          event.is_archive = row.is_archive;
          event.time_zone = row.time_zone;
          event.is_draft = row.is_draft;
          event.event_name = row.event_name;
          // Convert closing_date to 'YYYY-MM-DD' format
          if (row.closing_date instanceof Date) {
            const yyyy = row.closing_date.getFullYear();
            const mm = String(row.closing_date.getMonth() + 1).padStart(2, "0");
            const dd = String(row.closing_date.getDate()).padStart(2, "0");
            event.closing_date = `${yyyy}-${mm}-${dd}`;
          } else {
            event.closing_date = row.closing_date;
          }
          // Convert closing_time to 'HH:mm:ss' format
          event.closing_time = row.closing_time;
          event.event_logo = row.event_logo;
          event.event_banner = row.event_banner;
          event.event_description = row.event_description;
          event.closing_messsage = row.closing_messsage;
          event.is_social = row.is_social;
          event.social = row.social;
          event.social_image = row.social_image;
          event.submission_limit = row.submission_limit;
          event.adminemail = row.adminemail;
        }

        if (row.industry_type) {
          if (!event.industry_type) {
            event.industry_type = [];
          }
          event.industry_type.push({
            industrytypeId: row.industrytypeId,
            industry_type_name: row.industry_type,
          });
        }
      });

      const submissionQuery = `
        SELECT COUNT(DISTINCT submission_id) AS submissionCount
        FROM entry_data 
        WHERE eventId = ?
      `;

      db.query(submissionQuery, [event.eventId], (err, submissionResults) => {
        if (err) {
          return reject(
            new Error(`Error checking submissions: ${err.message}`)
          );
        }

        const submissionCount = submissionResults[0].submissionCount;

        event.submissionsPresent = submissionCount;

        const limitExceeded =
          (event.submission_limit > 0 &&
            submissionCount >= event.submission_limit) ||
          (event.submission_limit === 1 && submissionCount === 1);

        event.limitExceeded = limitExceeded;

        resolve(event);
      });
    });
  });
}

export function EventEnded(uniqueUrlKey) {
  return new Promise((resolve, reject) => {
    const eventCheckQuery = `
      SELECT closing_date, closing_time, event_name, event_logo, event_banner, closing_messsage
      FROM event_details 
      WHERE unique_url = ? AND is_deleted = 0
    `;

    db.query(eventCheckQuery, [uniqueUrlKey], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length > 0) {
        const event = results[0];
        const eventClosingDateTime = new Date(
          `${event.closing_date}T${event.closing_time}:00Z`
        );
        const currentDateTime = new Date();

        if (currentDateTime > eventClosingDateTime) {
          return resolve({
            event_name: event.event_name,
            event_logo: event.event_logo,
            event_banner: event.event_banner,
            closing_date: event.closing_date,
            closing_time: event.closing_time,
            closing_message: event.closing_messsage,
          });
        }
      }

      resolve(null);
    });
  });
}

export function checkuser(userId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        return reject(new Error("Database query error while checking user"));
      }
      resolve(results.length > 0);
    });
  });
}

export function submitRegistrationDataService(
  eventId,
  registrationFormId,
  created_by,
  role,
  fields
) {
  return new Promise((resolve, reject) => {
    const validRoles = ["user"];
    if (!validRoles.includes(role)) {
      reject(new Error("Only users can submit registration data."));
      return;
    }

    if (!fields || Object.keys(fields).length === 0) {
      reject(new Error("No fields provided for submission."));
      return;
    }

    const tableName = role === "user" ? "user" : "admin";
    const checkUserQuery = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id = ?`;

    db.query(checkUserQuery, [created_by], (err, result) => {
      if (err) {
        reject(new Error(`Error checking ${role} existence: ${err.message}`));
        return;
      }

      if (result[0].count === 0) {
        reject(
          new Error(
            `${role.charAt(0).toUpperCase() + role.slice(1)} ID does not exist.`
          )
        );
        return;
      }

      const values = Object.entries(fields).map(([fieldName, fieldValue]) => [
        eventId,
        registrationFormId,
        created_by,
        role,
        fieldName,
        fieldValue,
      ]);

      const bulkQuery = `
        INSERT INTO registration_data (
          eventId, 
          registrationFormId, 
          created_by,
          role, 
          field_name, 
          field_value
        ) VALUES ?
      `;

      db.query(bulkQuery, [values], (err, result) => {
        if (err) {
          reject(
            new Error(
              `Database insert error: ${err.message} | Query: ${bulkQuery}`
            )
          );
        } else {
          resolve({
            affectedRows: result.affectedRows,
          });
        }
      });
    });
  });
}

export function getEventRoundData(eventId, roundId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        e.id AS eventId,
        e.*,     
        r.id AS roundId,  
        r.* ,
        ei.industry_type,  
        a.id AS adminId,
        a.first_name AS organizer_first_name,
        a.last_name AS organizer_last_name
      FROM event_details AS e
      INNER JOIN general_settings AS r ON e.id = r.eventId
      INNER JOIN industry_types AS ei ON e.id = ei.eventId
      INNER JOIN admin AS a ON e.adminId = a.id
      WHERE e.id = ? 
        AND r.id = ?;
    `;

    const values = [eventId, roundId];

    db.query(query, values, (error, results) => {
      if (error) {
        return reject(new Error(`Database query error: ${error.message}`));
      }

      if (results.length === 0) {
        return resolve([]);
      }

      resolve(results);
    });
  });
}

export function exportJuryAssign(eventId, roundId) {
  return new Promise((resolve, reject) => {
    try {
      const query = `
          SELECT 
            ja.id AS juryAssignId,
            ja.eventId,
            ja.roundId,
            ja.email,
            ja.first_name,
            ja.last_name,
            ja.is_active,
            GROUP_CONCAT(jg.group_name ORDER BY jg.group_name SEPARATOR ', ') AS group_names,
            e.event_name
          FROM jury_assign ja 
          LEFT JOIN jury_assign_grps jg ON ja.id = jg.juryAssignId
          LEFT JOIN event_details e ON ja.eventId = e.id
          WHERE ja.eventId = ? 
            AND ja.roundId = ? 
            AND ja.is_deleted = 0
          GROUP BY ja.id
      `;

      db.query(query, [eventId, roundId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function shortlistEntry(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        efd.submission_id,
        efd.field_name,
        efd.field_value,
        efd.eventId
      FROM entry_data AS efd
      LEFT JOIN event_details AS e ON efd.eventId = e.id
      LEFT JOIN awards_category AS ac ON efd.awardcatId = ac.id
      LEFT JOIN entry_form AS ef ON efd.entryFormId = ef.id
      WHERE efd.eventId = ? 
      AND efd.is_deleted = 0;
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("Event not found or is deleted"));
      }

      const mappedResults = results.reduce((acc, row) => {
        const eventKey = `eventId:${row.eventId}`;

        if (!acc[eventKey]) {
          acc[eventKey] = {};
        }

        const submissionKey = `submissionId:${row.submission_id}`;

        if (!acc[eventKey][submissionKey]) {
          acc[eventKey][submissionKey] = [];
        }

        acc[eventKey][submissionKey].push({
          field_name: row.field_name,
          field_value: row.field_value,
        });

        return acc;
      }, {});

      resolve(mappedResults);
    });
  });
}

//last work EntryFormSubmission

export function checkawardCatId(awardcatId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM awards_category WHERE id = ?";
    db.query(query, [awardcatId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function awardcategoryprewfixget(eventId, awardcatId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM awards_category
      WHERE eventId = ?  AND id = ?
      AND is_deleted = 0;
    `;

    db.query(query, [eventId, awardcatId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("Event not found or is deleted."));
      }

      const data = results[0];

      resolve(data);
    });
  });
}

export const fetchCaseValueFromDatabase = async (eventId, awardcatId) => {
  const fetchCaseValueQuery = `
    SELECT \`case\`
    FROM submission_id
    WHERE eventId = ? AND is_active = 1 AND is_deleted = 0;
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(fetchCaseValueQuery, [eventId, awardcatId], (err, results) => {
        if (err) {
          return reject(
            new Error(`Database query error (fetch case value): ${err.message}`)
          );
        }

        if (results.length === 0) {
          return resolve(null);
        }

        resolve(results[0].case);
      });
    });

    return result;
  } catch (err) {
    throw err;
  }
};

export const generateSubmissionValue1 = (eventId, categoryPrefix) => {
  return new Promise((resolve, reject) => {
    const fetchConfigQuery = `
      SELECT *
      FROM submission_id
      WHERE eventId = ?  AND is_deleted = 0;
    `;

    db.query(fetchConfigQuery, [eventId], (err, configResults) => {
      if (err) {
        return reject(
          new Error(`Database query error (fetch config): ${err.message}`)
        );
      }

      if (configResults.length === 0) {
        return reject(new Error("Submission configuration not found."));
      }

      const { digits, start_from, increment } = configResults[0];

      const fetchLastSubmissionQuery = `
        SELECT submission_id
        FROM entry_data
        WHERE submission_id LIKE ? AND eventId = ?
        ORDER BY submission_id DESC
        LIMIT 1;
      `;

      db.query(
        fetchLastSubmissionQuery,
        [`${categoryPrefix}-%`, eventId],
        (fetchErr, lastResults) => {
          if (fetchErr) {
            return reject(
              new Error(
                `Database query error (fetch last submission): ${fetchErr.message}`
              )
            );
          }

          let nextValue = start_from;
          if (lastResults.length > 0) {
            const lastSubmission = lastResults[0].submission_id;

            if (!lastSubmission || !lastSubmission.includes("-")) {
              return reject(new Error("Invalid submission ID format."));
            }

            const lastNumericPart = parseInt(lastSubmission.split("-")[1], 10);

            if (isNaN(lastNumericPart)) {
              return reject(
                new Error("Failed to parse numeric part of submission ID.")
              );
            }

            nextValue = lastNumericPart + increment;
          }

          const paddedValue = nextValue.toString().padStart(digits, "0");
          const submissionId = `${categoryPrefix}-${paddedValue}`;
          resolve(submissionId);
        }
      );
    });
  });
};

export const generateSubmissionValue2 = (eventId) => {
  return new Promise((resolve, reject) => {
    const fetchQuery = `
      SELECT *
      FROM submission_id
      WHERE eventId = ? AND is_active = 1 AND is_deleted = 0;
    `;

    db.query(fetchQuery, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("Submission configuration not found."));
      }

      const { digits, start_from, increment, prefix } = results[0];

      const checkSubmissionQuery = `
        SELECT submission_id
        FROM entry_data
        WHERE eventId = ? AND is_active = 1 AND is_deleted = 0
        ORDER BY id DESC LIMIT 1;
      `;

      db.query(checkSubmissionQuery, [eventId], (err, entryResults) => {
        if (err) {
          return reject(new Error(`Database query error: ${err.message}`));
        }

        let newSubmissionValue;

        if (entryResults.length === 0) {
          newSubmissionValue = start_from;
        } else {
          const lastSubmissionValue = entryResults[0].submission_id;

          const regex = /-(\d+)$/;
          const match = lastSubmissionValue.match(regex);

          if (!match) {
            return reject(new Error("Invalid last submission ID format."));
          }

          const numericValue = match[1];

          const parsedNumericValue = parseInt(numericValue, 10);
          if (isNaN(parsedNumericValue)) {
            return reject(new Error("Invalid numeric part in submission ID."));
          }

          newSubmissionValue = parsedNumericValue + increment;
        }

        const paddedValue = String(newSubmissionValue).padStart(digits, "0");

        const finalSubmissionValue = `${paddedValue}`;

        resolve(finalSubmissionValue);
      });
    });
  });
};

export function PredefineSubimissionIdGet(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *
      FROM submission_id
      WHERE eventId = ? 
      AND is_deleted = 0;
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("Event not found or is deleted."));
      }

      const data = results[0];

      resolve(data);
    });
  });
}

export const generateSubmissionValue3 = (eventId, categoryPrefix3) => {
  return new Promise((resolve, reject) => {
    const fetchConfigQuery = `
      SELECT *
      FROM submission_id
      WHERE eventId = ? AND is_active = 1 AND is_deleted = 0;
    `;

    db.query(fetchConfigQuery, [eventId], (err, configResults) => {
      if (err) {
        return reject(
          new Error(`Database query error (fetch config): ${err.message}`)
        );
      }

      if (configResults.length === 0) {
        return reject(new Error("Submission configuration not found."));
      }

      const { digits, start_from, increment } = configResults[0];

      const fetchLastSubmissionQuery = `
        SELECT submission_id
        FROM entry_data
        WHERE submission_id LIKE ? AND eventId = ?
        ORDER BY submission_id DESC
        LIMIT 1;
      `;

      db.query(
        fetchLastSubmissionQuery,
        [`${categoryPrefix3 ? categoryPrefix3 + "-" : ""}%`, eventId],
        (fetchErr, lastResults) => {
          if (fetchErr) {
            return reject(
              new Error(
                `Database query error (fetch last submission): ${fetchErr.message}`
              )
            );
          }

          let nextValue = start_from;

          if (lastResults.length > 0) {
            const lastSubmission = lastResults[0].submission_id;

            let lastNumericPart;

            if (lastSubmission.includes("-")) {
              lastNumericPart = parseInt(lastSubmission.split("-")[1], 10);
            } else {
              lastNumericPart = parseInt(lastSubmission, 10);
            }

            if (isNaN(lastNumericPart)) {
              console.error(
                "Error parsing numeric part of submission ID:",
                lastSubmission
              );
              return reject(
                new Error("Failed to parse numeric part of submission ID.")
              );
            }

            nextValue = lastNumericPart + increment;
          }

          const paddedValue = nextValue.toString().padStart(digits, "0");

          let submissionId;
          if (categoryPrefix3) {
            submissionId = `${paddedValue}`;
          } else {
            submissionId = paddedValue;
          }

          resolve(submissionId);
        }
      );
    });
  });
};

export function fetchLastSubmissionId(eventId, awardcatId) {
  return new Promise((resolve, reject) => {
     const query = `
    SELECT submission_id 
    FROM entry_data 
    WHERE eventId = ? 
    AND awardcatId = ? 
    AND isDraft = 0   -- 🔥 FIX
    ORDER BY created_at DESC 
    LIMIT 1
  `;
    db.query(query, [eventId, awardcatId], (err, result) => {
      if (err) {
        return reject(new Error("Error fetching last submission ID."));
      }
      resolve(result.length > 0 ? result[0] : null);
    });
  });
}

// export const insertEntryDataIntoDatabase = async (eventId, awardcatId, submissionId, entryFormId, created_by, role, fieldEntries) => {
//   const insertQuery = `
//     INSERT INTO entry_data (
//       eventId, awardcatId, entryFormId, submission_id, created_by, role, field_name, field_value
//     ) VALUES ?;
//   `;

//   const values = fieldEntries.map(([field_name, field_value]) => [
//     eventId,
//     awardcatId,
//     entryFormId,
//     submissionId,
//     created_by,
//     role,
//     field_name,
//     field_value,
//   ]);

//   try {
//     const result = await new Promise((resolve, reject) => {
//       db.query(insertQuery, [values], (err, result) => {
//         if (err) {
//           return reject(new Error(`Error saving entry data: ${err.message}`));
//         }

//         if (result.affectedRows === 0) {
//           return reject(new Error('No rows were inserted.'));
//         }

//         resolve(result);
//       });
//     });

//     return result;
//   } catch (err) {
//     return { error: err.message };
//   }
// };

// export function checkSubmissionId(submission_ids) {
//   return new Promise((resolve, reject) => {
//     const query = "SELECT submission_id FROM shortlist_data WHERE submission_id IN (?)";
//     db.query(query, [submission_ids], (err, results) => {
//       if (err) {
//         return reject(err);
//       }

//       const existingSubmissionIds = (results && Array.isArray(results)) ? results.map(row => row.submission_id) : [];

//       const duplicateSubmissionIds = submission_ids.filter(id => existingSubmissionIds.includes(id));

//       if (duplicateSubmissionIds.length > 0) {
//         return reject(new Error(`The following submission IDs already exist: ${duplicateSubmissionIds.join(', ')}`));
//       }

//       resolve();
//     });
//   });
// }

export function checkSubmissionId(submission_ids) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT s.submission_id, e.paymentstatus 
      FROM shortlist_data s 
      LEFT JOIN entry_data e ON s.submission_id = e.submission_id 
      WHERE s.submission_id IN (?)`;

    db.query(query, [submission_ids], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return reject(new Error("No matching submission IDs found"));
      }

      const unpaidSubmission = results.find(
        (row) => row.paymentstatus !== "unpaid"
      );
      console.log("unpaidSubmission", unpaidSubmission);
      if (unpaidSubmission) {
        return reject(
          new Error(
            `User Payment Status Unpaid for submission_id: ${unpaidSubmission.submission_id}`
          )
        );
      }

      // All paid
      resolve(results.map((row) => row.submission_id));
    });
  });
}

export function checkSubmissionIdAndDeleteIfShortlisted(
  submission_ids,
  eventId
) {
  return new Promise((resolve, reject) => {
    // Step 1: Get payment gateway status
    const paymentQuery = `SELECT status FROM payment_gateways WHERE eventid = ?`;

    db.query(paymentQuery, [eventId], (err, gatewayResults) => {
      if (err) return reject(err);

      const status = gatewayResults[0]?.status; // default to 'paid' if not found

      if (status === "free") {
        // Skip payment check, directly delete existing shortlisted (if any) and proceed
        const query = `
          SELECT DISTINCT s.submission_id 
          FROM shortlist_data s 
          WHERE s.submission_id IN (?)`;

        db.query(query, [submission_ids], async (err2, results) => {
          if (err2) return reject(err2);
          const idsToDelete = results.map((row) => row.submission_id);

          try {
            if (idsToDelete.length > 0) {
              await deleteExistingSubmissions(idsToDelete);
            }
            return resolve();
          } catch (delErr) {
            return reject(delErr);
          }
        });
      } else {
        // Paid case: check shortlist and payment status
        const query = `
          SELECT DISTINCT s.submission_id, e.paymentstatus 
          FROM shortlist_data s 
          LEFT JOIN entry_data e ON s.submission_id = e.submission_id 
          WHERE s.submission_id IN (?)`;

        db.query(query, [submission_ids], async (err3, results) => {
          if (err3) return reject(err3);

          if (results.length > 0) {
            const unpaid = results.find((row) => row.paymentstatus !== "paid");
            if (unpaid) {
              return reject(
                new Error(
                  `Submission ID ${unpaid.submission_id} is not marked as paid.`
                )
              );
            }

            const idsToDelete = results.map((row) => row.submission_id);
            try {
              await deleteExistingSubmissions(idsToDelete);
            } catch (delErr) {
              return reject(delErr);
            }
            return resolve();
          } else {
            // Check payment status in entry_data if not shortlisted
            const entryQuery = `SELECT submission_id, paymentstatus FROM entry_data WHERE submission_id IN (?)`;

            db.query(entryQuery, [submission_ids], (payErr, payResults) => {
              if (payErr) return reject(payErr);

              const unpaid = payResults.find(
                (row) => row.paymentstatus !== "paid"
              );
              if (unpaid) {
                return reject(
                  new Error(
                    `Submission ID ${unpaid.submission_id} is not marked as paid.`
                  )
                );
              }

              return resolve();
            });
          }
        });
      }
    });
  });
}

export function deleteExistingSubmissions(submissionIds) {
  return new Promise((resolve, reject) => {
    const deleteQuery = "DELETE FROM shortlist_data WHERE submission_id IN (?)";
    db.query(deleteQuery, [submissionIds], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

export const insertShortlistData = async (
  eventId,
  roundId,
  submission_ids,
  shortlist_round
) => {
  const insertQuery = `
    INSERT INTO shortlist_data (eventId, roundId, submission_id, shortlist_round)
    VALUES (?, ?, ?, ?);
  `;

  try {
    const insertResults = [];

    if (submission_ids.length === 0) {
      throw new Error("No submission_ids to insert.");
    }

    const promises = submission_ids.map((submission_id) => {
      return new Promise((resolve, reject) => {
        const values = [eventId, roundId, submission_id, shortlist_round];
        db.query(insertQuery, values, (err, result) => {
          if (err) {
            reject(
              new Error(
                `Error saving shortlist data for submission_id ${submission_id}: ${err.message}`
              )
            );
          } else if (result.affectedRows === 0) {
            reject(
              new Error(
                `No rows were inserted for submission_id ${submission_id}.`
              )
            );
          } else {
            resolve({ submission_id, result });
          }
        });
      });
    });

    const results = await Promise.all(promises);

    results.forEach(({ submission_id }) => {
      insertResults.push({
        submission_id,
      });
    });

    return insertResults;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchUniqueSubmissionIds = async (eventId) => {
  const query = `
    SELECT DISTINCT submission_id
    FROM entry_data
    WHERE eventId = ? AND is_active = 1 AND is_deleted = 0;
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export const fetchFieldsForSubmission = async (eventId, submissionId) => {
  const query = `
    SELECT field_name, field_value,paymentstatus
    FROM entry_data
    WHERE eventId = ? AND submission_id = ? AND is_active = 1 AND is_deleted = 0;
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId, submissionId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export function shortlistFetch(eventId, roundId, limit, skip) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT 
        sl.eventId, 
        sl.roundId, 
        sl.submission_id, 
        sl.shortlist_round, 
        ed.id AS entry_data_id,
        ed.submission_id AS entry_submission_id,
        ed.eventId AS entry_eventId,
        ed.awardcatId,
        ed.field_name,
        ed.field_value,
        COALESCE(SUM(js.total), 0) AS total_score
    FROM shortlist_data AS sl
    LEFT JOIN entry_data AS ed 
        ON sl.submission_id = ed.submission_id
    LEFT JOIN jury_score AS js
        ON sl.submission_id = js.submission_id
        AND sl.eventId = js.eventId
        AND sl.roundId = js.roundId
    WHERE 
        sl.eventId = ? 
        AND sl.roundId = ?
        AND sl.is_deleted = 0 
    GROUP BY 
        sl.submission_id, 
        sl.eventId, 
        sl.roundId, 
        sl.shortlist_round, 
        ed.id, 
        ed.awardcatId, 
        ed.field_name, 
        ed.field_value
    LIMIT ? OFFSET ?;
  `;

    db.query(query, [eventId, roundId, limit, skip], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return resolve([]);
      }

      const groupedResults = {};

      results.forEach((result) => {
        const {
          eventId,
          roundId,
          shortlist_round,
          total_score,
          submission_id,
          awardcatId,
          field_name,
          field_value,
        } = result;

        if (!groupedResults[submission_id]) {
          groupedResults[submission_id] = {
            eventId,
            awardId: awardcatId,
            roundId,
            shortlist_round,
            submission_id,
            score: total_score, // Assign the total score here
            fields: [],
          };
        }

        // Add field name and field value to the fields array
        groupedResults[submission_id].fields.push({
          field_name,
          field_value,
        });
      });

      resolve(Object.values(groupedResults));
    });
  });
}

export function shortlistFetchno(eventId, limit, skip) {
  return new Promise((resolve, reject) => {
    const query = `
     SELECT 
    sl.eventId, 
    sl.roundId, 
    sl.submission_id, 
    sl.shortlist_round, 
    ed.awardcatId,
    ed.field_name,
    ed.field_value,
    COALESCE(SUM(js.total), 0) AS total_score
FROM 
    shortlist_data AS sl
LEFT JOIN 
    entry_data AS ed ON sl.submission_id = ed.submission_id AND sl.eventId = ed.eventId
LEFT JOIN 
    jury_score AS js ON sl.submission_id = js.submission_id AND sl.eventId = js.eventId
WHERE 
    sl.eventId = ? 
    AND sl.is_deleted = 0
GROUP BY 
    sl.eventId, 
    sl.roundId, 
    sl.submission_id, 
    sl.shortlist_round, 
    ed.awardcatId, 
    ed.field_name, 
    ed.field_value
LIMIT ? OFFSET ?;

    `;

    db.query(query, [eventId, limit, skip], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return resolve([]);
      }

      const groupedResults = {};

      results.forEach((result) => {
        const {
          eventId,
          roundId,
          shortlist_round,
          total_score,
          submission_id,
          awardcatId,
          field_name,
          field_value,
          usertotal,
        } = result;

        if (!groupedResults[submission_id]) {
          groupedResults[submission_id] = {
            eventId,
            awardId: awardcatId,
            roundId,
            shortlist_round,
            submission_id,
            score: total_score,
            t: usertotal, // Assign the total score here
            fields: [],
          };
        }

        // Add field name and field value to the fields array
        groupedResults[submission_id].fields.push({
          field_name,
          field_value,
          usertotal: usertotal,
        });
      });
      console.log("testttss", groupedResults);
      resolve(Object.values(groupedResults));
    });
  });
}

export function checkSubmissionExists(
  eventId,
  roundId,
  juryAssignId,
  email,
  submission_id
) {
  return new Promise((resolve, reject) => {
    const checkQuery = `
      SELECT * FROM custom_allocation
      WHERE eventId = ? AND roundId = ? AND juryAssignId = ? AND email = ? AND submission_id = ?;
    `;
    db.query(
      checkQuery,
      [eventId, roundId, juryAssignId, email, submission_id],
      (err, results) => {
        if (err) {
          reject(new Error(`Error checking submission: ${err.message}`));
        } else {
          resolve(results);
        }
      }
    );
  });
}

export function checkAllocation(eventId, roundId, juryAssignId) {
  return new Promise((resolve, reject) => {
    const checkQuery = `
      SELECT * FROM custom_allocation
      WHERE eventId = ? AND roundId = ? AND juryAssignId = ?;
    `;
    db.query(checkQuery, [eventId, roundId, juryAssignId], (err, results) => {
      if (err) {
        reject(new Error(`Error checking existing allocation: ${err.message}`));
      } else {
        resolve(results);
      }
    });
  });
}

export function insertAllocation(
  eventId,
  roundId,
  juryAssignId,
  email,
  submission_ids,
  allocation
) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(submission_ids)) {
      reject(new Error("submission_ids is not an array"));
      return;
    }

    if (allocation !== "abstain") {
      const deletePromises = submission_ids.map((submission_id) => {
        return deleteAllocation(
          eventId,
          roundId,
          juryAssignId,
          email,
          submission_id
        );
      });

      Promise.all(deletePromises)
        .then((deleteResults) => {
          resolve(deleteResults);
        })
        .catch((error) => {
          reject(error);
        });

      return;
    }

    const checkPromises = submission_ids.map((submission_id) => {
      return new Promise((resolveCheck, rejectCheck) => {
        const checkQuery = `
          SELECT * FROM custom_allocation
          WHERE eventId = ? AND roundId = ? AND juryAssignId = ? AND email = ? AND submission_id = ? AND allocation = 'abstain'
        `;

        db.query(
          checkQuery,
          [eventId, roundId, juryAssignId, email, submission_id],
          (err, results) => {
            if (err) {
              rejectCheck(
                new Error(
                  `Error checking if abstain exists for submission_id ${submission_id}: ${err.message}`
                )
              );
            } else if (results.length > 0) {
              resolveCheck({
                warning: `Abstain allocation already exists for submission_id ${submission_id}`,
                submission_id: submission_id,
              });
            } else {
              resolveCheck(null);
            }
          }
        );
      });
    });

    Promise.all(checkPromises)
      .then((checkResults) => {
        const submissionsToInsert = submission_ids.filter(
          (submission_id, index) => {
            return !checkResults[index] || checkResults[index].warning;
          }
        );

        if (submissionsToInsert.length > 0) {
          const insertPromises = submissionsToInsert.map((submission_id) => {
            return new Promise((resolveInsert, rejectInsert) => {
              const insertQuery = `
                INSERT INTO custom_allocation 
                (eventId, roundId, juryAssignId, email, submission_id, allocation)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE allocation = VALUES(allocation)
              `;

              const timestamp = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

              db.query(
                insertQuery,
                [
                  eventId,
                  roundId,
                  juryAssignId,
                  email,
                  submission_id,
                  allocation,
                  timestamp,
                  timestamp,
                ],
                (err, result) => {
                  if (err) {
                    rejectInsert(
                      new Error(
                        `Error inserting allocation for submission_id ${submission_id}: ${err.message}`
                      )
                    );
                  } else {
                    resolveInsert(submission_id);
                  }
                }
              );
            });
          });
          Promise.all(insertPromises)
            .then((insertResults) => {
              resolve(insertResults);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          resolve(checkResults);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function deleteAllocation(
  eventId,
  roundId,
  juryAssignId,
  email,
  submission_id
) {
  return new Promise((resolve, reject) => {
    const deleteQuery = `
      UPDATE custom_allocation
      SET is_deleted = 1
      WHERE eventId = ? AND roundId = ? AND juryAssignId = ? AND email = ? AND submission_id = ?;
    `;
    db.query(
      deleteQuery,
      [eventId, roundId, juryAssignId, email, submission_id],
      (err, result) => {
        if (err) {
          reject(
            new Error(
              `Error deleting allocation for submission_id ${submission_id}: ${err.message}`
            )
          );
        } else {
          resolve({
            affectedRows: result.affectedRows,
            submission_id: submission_id,
          });
        }
      }
    );
  });
}

export function registrationDataFetch(eventId, search, limit, skip) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT *, created_at, updated_at
      FROM registration_data
      WHERE eventId = ? AND is_deleted = 0
    `;
    if (search) {
      query += ` AND (field_value LIKE ? OR field_value LIKE ?)`;
    }

    const searchTerm = search ? `%${search}%` : null;
    const params = [
      eventId,
      ...(searchTerm ? [searchTerm, searchTerm] : []),
      limit,
      skip,
    ];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      let countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM registration_data
        WHERE eventId = ? AND is_deleted = 0
      `;

      if (search) {
        countQuery += ` AND (field_value LIKE ? OR field_value LIKE ?)`;
      }

      const countParams = [
        eventId,
        ...(searchTerm ? [searchTerm, searchTerm] : []),
      ];

      db.query(countQuery, countParams, (errCount, countResult) => {
        if (errCount) {
          return reject(
            new Error(`Database count query error: ${errCount.message}`)
          );
        }

        const registrationMap = {};

        results.forEach((row) => {
          const createdBy = row.created_by;

          if (!registrationMap[createdBy]) {
            registrationMap[createdBy] = {
              registrationFormId: row.registrationFormId,
              eventId: row.eventId,
              created_by: createdBy,
              created_at: row.created_at,
              updated_at: row.updated_at,
              role: row.role,
              fields: [],
            };
          }

          const fieldKey = row.field_name;

          const fieldObj = {
            registrationDataId: row.id,
            [fieldKey]: row.field_value,
          };

          registrationMap[createdBy].fields.push(fieldObj);
        });

        const mappedResults = Object.values(registrationMap);
        resolve(mappedResults);
      });
    });
  });
}

export function registrationFieldsFetch(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT form_schema
      FROM registration_form
      WHERE eventId = ? 
      AND is_deleted = 0
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return resolve({ data: [], totalCount: 0 });
      }

      const mappedLabels = results.flatMap((result) => {
        const schema = JSON.parse(result.form_schema);
        return schema.map((field) => ({
          field_name: field.dataName,
          label: field.label,
        }));
      });

      const totalCount = mappedLabels.length;
      resolve({
        data: mappedLabels,
        totalCount: totalCount,
      });
    });
  });
}

export async function fetchFormSchema(eventId) {
  const query = `
    SELECT form_schema
    FROM registration_form
    WHERE eventId = ? AND is_deleted = 0
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query failed: ${err.message}`));
      }

      if (results.length === 0) {
        return resolve([]);
      }

      const formSchema = JSON.parse(results[0].form_schema);
      resolve(formSchema);
    });
  });
}
export function groupRegistrationData(formSchema, registrationData) {
  const grouped = {};
  const fieldMap = formSchema.reduce((acc, field) => {
    acc[field.dataName] = field.label;
    return acc;
  }, {});

  registrationData.forEach((registration) => {
    const { registrationFormId, field_name, field_value } = registration;

    if (!grouped[registrationFormId]) {
      grouped[registrationFormId] = {};
    }

    if (fieldMap[field_name]) {
      grouped[registrationFormId][field_name] = field_value;
    }
  });

  return Object.values(grouped);
}
export async function exportRegistrationData(eventId) {
  const query = `
    SELECT * 
    FROM registration_data 
    WHERE eventId = ? AND is_deleted = 0
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query failed: ${err.message}`));
      }
      resolve(results);
    });
  });
}

export async function generateExcelFile(formSchema, groupedRegistrationData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registration Data");

  worksheet.columns = formSchema.map((field) => ({
    header: field.label,
    key: field.dataName,
    width: 30,
  }));

  groupedRegistrationData.forEach((registration) => {
    const rowData = {};

    formSchema.forEach((schemaField) => {
      rowData[schemaField.dataName] = registration[schemaField.dataName] || "";
    });

    worksheet.addRow(rowData);
  });

  return workbook;
}

export const fetchRegisterFormSchema = async (eventId) => {
  const query = `
    SELECT form_schema
    FROM registration_form
    WHERE eventId = ? AND is_deleted = 0;
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// export function customAllocationFetch(eventId, roundId) {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT
//         sl.*,
//         ed.field_name AS entry_field_name,
//         ed.field_value AS entry_field_value,
//         rd.field_name AS reg_field_name,
//         rd.field_value AS reg_field_value
//       FROM shortlist_data AS sl
//       LEFT JOIN entry_data AS ed ON sl.submission_id = ed.submission_id AND sl.eventId = ed.eventId
//       LEFT JOIN registration_data AS rd ON sl.eventId = rd.eventId AND rd.field_name = 'email'
//       WHERE
//         sl.eventId = ?
//         AND sl.roundId = ?
//         AND sl.is_deleted = 0
//         AND (ed.field_name = 'title' OR ed.field_name = 'category');
//     `;

//     db.query(query, [eventId, roundId], (err, results) => {
//       if (err) {
//         return reject(new Error(`Database query error: ${err.message}`));
//       }

//       if (results.length === 0) {
//         return resolve([]);
//       }

//       const groupedResults = results.reduce((acc, result) => {
//         const {
//           eventId,
//           submission_id,
//           entry_field_name,
//           entry_field_value,
//           reg_field_name,
//           reg_field_value,
//           allocation
//         } = result;

//         if (!acc[submission_id]) {
//           acc[submission_id] = {
//             eventId,
//             submission_id,
//             roundId,
//             fields: [],
//             email: null,
//             allocation
//           };
//         }

//         if (entry_field_name && (entry_field_name === 'title' || entry_field_name === 'category')) {
//           acc[submission_id].fields.push({
//             field_name: entry_field_name,
//             field_value: entry_field_value,
//           });
//         }

//         if (reg_field_name === 'email') {
//           acc[submission_id].email = reg_field_value;
//         }

//         return acc;
//       }, {});

//       resolve(Object.values(groupedResults));
//     });
//   });
// }

const addFieldIfValid = (acc, submission_id, field_name, field_value) => {
  if (field_value) {
    if (field_name.startsWith("title-")) {
      acc[submission_id].title = field_value;
    }
    if (field_name === "Category") {
      acc[submission_id].category = field_value;
    }
  }
};

const addEmailIfValid = (acc, submission_id, reg_field_value) => {
  if (reg_field_value && reg_field_value.startsWith("email-")) {
    acc[submission_id].email = reg_field_value.replace("email-", "");
  }
};

// export function customAllocationFetch(eventId, roundId, juryAssignId) {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT
//         sl.*,
//         ed.field_name AS entry_field_name,
//         ed.field_value AS entry_field_value,
//         rd.field_name AS reg_field_name,
//         rd.field_value AS reg_field_value,
//         ja.id AS juryAssignId
//       FROM shortlist_data AS sl
//       LEFT JOIN entry_data AS ed
//         ON sl.submission_id = ed.submission_id
//         AND sl.eventId = ed.eventId
//         AND (ed.field_name LIKE 'title-%' OR ed.field_name = 'Category')
//       LEFT JOIN registration_data AS rd
//         ON sl.eventId = rd.eventId
//         AND rd.field_name = 'email'
//       LEFT JOIN jury_assign AS ja
//         ON sl.eventId = ja.eventId
//         AND sl.roundId = ja.roundId
//       WHERE
//         sl.eventId = ?
//         AND sl.roundId = ?
//         AND sl.is_deleted = 0;
//     `;

//     db.query(query, [eventId, roundId, juryAssignId], (err, results) => {
//       if (err) {
//         console.error("Database query error:", err.message);
//         return reject(new Error("Database query error"));
//       }

//       if (results.length === 0) {
//         return resolve([]);
//       }

//       const groupedResults = results.reduce((acc, result) => {
//         const {
//           eventId,
//           submission_id,
//           juryAssignId,
//           entry_field_name,
//           entry_field_value,
//           reg_field_value,
//           allocation
//         } = result;

//         if (!acc[submission_id]) {
//           acc[submission_id] = {
//             eventId,
//             roundId,
//             juryAssignId,
//             submission_id,
//             allocation: 'non-abstain',
//             email: null,
//           };
//         }

//         addFieldIfValid(acc, submission_id, entry_field_name, entry_field_value);

//         addEmailIfValid(acc, submission_id, reg_field_value);

//         return acc;
//       }, {});

//       resolve(Object.values(groupedResults));
//     });
//   });
// }

// export function fetchAbstained(eventId, roundId, juryAssignId) {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT
//         ca.eventId,
//         ca.roundId,
//         ca.submission_id,
//         ca.allocation,
//         ed.field_value AS title,
//         ed.field_value AS category,
//         rd.field_value AS email
//       FROM custom_allocation AS ca
//       LEFT JOIN entry_data AS ed ON ca.submission_id = ed.submission_id
//         AND ca.eventId = ed.eventId
//         AND (ed.field_name LIKE 'title-%' OR ed.field_name LIKE 'category%')
//       LEFT JOIN registration_data AS rd ON ca.eventId = rd.eventId
//         AND rd.field_name LIKE 'email%'
//       WHERE
//         ca.eventId = ?
//         AND ca.roundId = ?
//         AND ca.juryAssignId = ?
//         AND ca.is_deleted = 0
//     `;

//     db.query(query, [eventId, roundId, juryAssignId], (err, results) => {
//       if (err) {
//         console.error("Database query error:", err.message);
//         return reject(new Error("Database query error"));
//       }

//       if (results.length === 0) {
//         return resolve(["No data found"]);
//       }

//       const formattedResults = results.map(result => {
//         const {
//           eventId,
//           roundId,
//           juryAssignId,
//           submission_id,
//           allocation,
//           title,
//           category,
//           email
//         } = result;

//         const formattedData = {
//           eventId,
//           roundId,
//           juryAssignId,
//           submission_id,
//           allocation: allocation || 'non-abstain',
//           email: email || null,
//           title: title || null,
//           category: category || null,
//         };

//         return formattedData;
//       });

//       resolve(formattedResults);
//     });
//   });
// }

export function entryDataFetch(eventId, search, limit, skip) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT *, created_at, updated_at
      FROM entry_data
      WHERE eventId = ? AND is_deleted = 0
    `;
    if (search) {
      query += ` AND (field_name LIKE ? OR field_value LIKE ?)`;
    }

    const searchTerm = search ? `%${search}%` : null;
    const params = [
      eventId,
      ...(searchTerm ? [searchTerm, searchTerm] : []),
      limit,
      skip,
    ];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      let countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM entry_data
        WHERE eventId = ? AND is_deleted = 0
      `;

      if (search) {
        countQuery += ` AND (field_name LIKE ? OR field_value LIKE ?)`;
      }

      const countParams = [
        eventId,
        ...(searchTerm ? [searchTerm, searchTerm] : []),
      ];

      db.query(countQuery, countParams, (errCount, countResult) => {
        if (errCount) {
          return reject(
            new Error(`Database count query error: ${errCount.message}`)
          );
        }

        const entryDataMap = {};
        const submissionIds = []; // Array to store all submission IDs

        results.forEach((row) => {
          const submissionId = row.submission_id;

          // Initialize the entryDataMap for each submission_id if it doesn't exist
          if (!entryDataMap[submissionId]) {
            entryDataMap[submissionId] = {
              submission_id: submissionId,
              entryFormId: row.entryFormId,
              eventId: row.eventId,
              created_by: row.created_by,
              paymentstatus: row.paymentstatus,
              role: row.role,
              created_at: row.created_at,
              updated_at: row.updated_at,
              fields: [],
            };
          }

          const fieldKey = row.field_name;

          const fieldObj = {
            entryDataId: row.id,
            [fieldKey]: row.field_value,
          };

          entryDataMap[submissionId].fields.push(fieldObj);

          // Collect all submission IDs in the array
          if (!submissionIds.includes(submissionId)) {
            submissionIds.push(submissionId);
          }
        });

        const mappedResults = Object.values(entryDataMap);
        resolve({ mappedResults, submissionIds }); // Return both results and submission IDs
      });
    });
  });
}

export function entryFieldsFetch(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT form_schema
      FROM entry_form
      WHERE eventId = ? AND is_deleted = 0
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return resolve({ data: [], totalCount: 0 });
      }

      const mappedLabels = results.flatMap((result) => {
        const schema = JSON.parse(result.form_schema);
        return schema.map((field) => ({
          field_name: field.dataName,
          label: field.label,
        }));
      });

      const totalCount = mappedLabels.length;
      resolve({
        data: mappedLabels,
        totalCount: totalCount,
      });
    });
  });
}

export async function fetchEntryFormSchema(eventId) {
  const query = `
    SELECT form_schema
    FROM entry_form
    WHERE eventId = ? AND is_deleted = 0
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query failed: ${err.message}`));
      }

      if (results.length === 0) {
        return resolve([]);
      }

      const formSchema = JSON.parse(results[0].form_schema);
      resolve(formSchema);
    });
  });
}

export function checkSubIdShortlist(roundId, submission_ids) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
      return reject(new Error("Submission IDs must be a non-empty array"));
    }

    const uniqueSubmissionIds = [...new Set(submission_ids)];

    if (uniqueSubmissionIds.length !== submission_ids.length) {
      console.warn(
        "Submission IDs contain duplicates. Duplicates have been removed."
      );
    }

    const query =
      "SELECT * FROM shortlist_data WHERE submission_id IN (?) AND roundId = ? AND is_deleted = 0";

    db.query(query, [uniqueSubmissionIds, roundId], (err, results) => {
      if (err) {
        return reject(err);
      }

      const found = results.length === uniqueSubmissionIds.length;
      resolve(found);
    });
  });
}

export async function softDeleteShortlist(roundId, submission_ids) {
  if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
    return Promise.reject(
      new Error("Submission IDs must be a non-empty array")
    );
  }
  const updateSql =
    "UPDATE shortlist_data SET is_deleted = 1 WHERE submission_id IN (?) AND roundId = ? AND is_deleted = 0";

  return new Promise((resolve, reject) => {
    db.query(updateSql, [submission_ids, roundId], (err, result) => {
      if (err) {
        return reject(
          new Error(
            "Error deleting submission_ids from shortlist: " + err.message
          )
        );
      }

      if (result.affectedRows === 0) {
        return reject(
          new Error(
            "No shortlisted found with the provided submission_ids to delete."
          )
        );
      }

      resolve(result);
    });
  });
}

export async function generateMergedExcelFile(
  entryFields,
  registrationFields,
  mergedData
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Merged Data");

  const allFields = [
    ...entryFields.map((field) => ({
      header: field.label,
      key: field.field_name,
      width: 30,
    })),
    ...registrationFields.map((field) => ({
      header: field.label,
      key: field.field_name,
      width: 30,
    })),
  ];

  worksheet.columns = allFields;

  mergedData.forEach((data) => {
    const rowData = {};

    entryFields.forEach((field) => {
      rowData[field.field_name] = data.fields
        ? data.fields[field.field_name]
        : "";
    });

    registrationFields.forEach((field) => {
      rowData[field.field_name] = data.registrationData
        ? data.registrationData[field.field_name]
        : "";
    });

    worksheet.addRow(rowData);
  });

  return workbook;
}

export async function fetchData(fields) {
  const query = `SELECT ${fields.join(
    ", "
  )} FROM entry_data WHERE is_deleted = 0`;
  try {
    const [rows] = await db.execute(query);
    return rows;
  } catch (error) {
    throw new Error(`Database query error: ${error.message}`);
  }
}

export function fetchAbstained(eventId, roundId, juryAssignId, email) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ca.eventId,
        ca.roundId,
        ca.submission_id, 
        ca.allocation,
        CASE 
          WHEN ed.role = 'admin' THEN ad.email 
          ELSE COALESCE(rd.field_value, ad.email)
        END AS email, 
        ed.created_by,
        ed.role,
        ed.field_name,
        ed.field_value AS ed_field_value
      FROM custom_allocation AS ca
      LEFT JOIN entry_data AS ed ON ca.submission_id = ed.submission_id 
        AND ca.eventId = ed.eventId
      LEFT JOIN registration_data AS rd ON ca.eventId = rd.eventId
        AND rd.field_name LIKE 'email-%'
      LEFT JOIN event_details AS evd ON ca.eventId = evd.id  
      LEFT JOIN admin AS ad ON evd.adminId = ad.id AND ad.role = 'admin'  
      WHERE 
        ca.eventId = ? 
        AND ca.roundId = ? 
        AND ca.juryAssignId = ? 
        AND ca.is_deleted = 0
        AND ca.email = ? 
        AND ed.is_deleted = 0
    `;

    const values = [eventId, roundId, juryAssignId, email];

    db.query(query, values, (err, results) => {
      if (err) {
        return reject(
          new Error(`Error fetching abstained data. ${err.message}`)
        );
      }

      if (results.length === 0) {
        return resolve([]);
      }

      const groupedResults = results.reduce((acc, row) => {
        const { submission_id, email, allocation, field_name, ed_field_value } =
          row;

        if (!acc[submission_id]) {
          acc[submission_id] = {
            eventId: row.eventId,
            roundId: row.roundId,
            submission_id: row.submission_id,
            allocation: allocation,
            title: null,
            category: null, // Ensure category starts as null
            email: email,
          };
        }

        // If the field name starts with "title-", assign it to title
        if (field_name && field_name.toLowerCase().startsWith("title-")) {
          acc[submission_id].title = ed_field_value;
        }

        // If the field name starts with "Category", assign it to category
        if (field_name && field_name.toLowerCase().startsWith("category-")) {
          acc[submission_id].category = ed_field_value;
        }

        return acc;
      }, {});

      // Get the final result after grouping
      const finalResults = Object.values(groupedResults);
      resolve(finalResults);
    });
  });
}

export function customAllocationFetch(eventId, roundId) {
  return new Promise((resolve, reject) => {
    const query = `
SELECT 
  ca.eventId,
  ca.roundId,
  ca.submission_id,
  ed.field_name,
  ed.field_value,
  ed.status,
  rd.field_name AS email_field_name, 
  rd.field_value AS email_field_value,
  ad.email AS admin_email 
FROM shortlist_data AS ca
LEFT JOIN entry_data AS ed ON ca.submission_id = ed.submission_id 
  AND ca.eventId = ed.eventId
  AND (ed.field_name LIKE 'title-%' OR ed.field_name LIKE 'category-%')  
LEFT JOIN registration_data AS rd ON ca.eventId = rd.eventId 
  AND rd.field_name = 'email'
LEFT JOIN jury_assign AS ja ON ca.eventId = ja.eventId 
  AND ca.roundId = ja.roundId   
LEFT JOIN event_details AS evd ON ca.eventId = evd.id
LEFT JOIN admin AS ad ON evd.adminId = ad.id 
WHERE 
  ca.eventId = ?
  AND ca.roundId = ? 
  AND ca.is_deleted = 0

    `;

    db.query(query, [eventId, roundId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error${err.message}`));
      }

      const groupedResults = results.reduce((acc, row) => {
        const { submission_id, admin_email } = row;

        if (!acc[submission_id]) {
          acc[submission_id] = {
            eventId: row.eventId,
            roundId: row.roundId,
            submission_id: submission_id,
            allocation: row.status,
            title: null,
            category: null,
            email: row.email_field_value || admin_email,
          };
        }

        if (row.field_name && row.field_name.startsWith("title")) {
          acc[submission_id].title = row.field_value;
        }

        if (row.field_name && row.field_name.startsWith("category-")) {
          acc[submission_id].category = row.field_value;
        }

        if (
          row.email_field_name &&
          row.email_field_name === "email" &&
          row.email_field_value
        ) {
          acc[submission_id].email = row.email_field_value;
        }

        return acc;
      }, {});

      const finalResults = Object.values(groupedResults).map((group) => {
        return {
          ...group,
          title: group.title,
          category: group.category,
          email: group.email,
        };
      });
      // console.log("Final Results:", finalResults);
      resolve(finalResults);
    });
  });
}

export function adminData(created_by, role) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT 
        id AS created_by,
        role,
        first_name,
        last_name,
        email,
        country,
        created_at,
        updated_at
        FROM admin
        WHERE id = ? 
        AND role = "admin"
        AND is_deleted = 0
      `;

    const values = [created_by, role];

    db.query(query, values, (err, result) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (result.length === 0) {
        return reject(new Error("No admin found with the given criteria."));
      }

      resolve(result[0]);
    });
  });
}

export const registerUserUpdate = (
  eventId,
  registrationFormId,
  created_by,
  role,
  updates
) => {
  return new Promise((resolve, reject) => {
    const validUpdates = updates.filter(
      (update) => update.field_name && update.field_value
    );

    if (validUpdates.length === 0) {
      return reject(new Error("No valid updates provided"));
    }

    const bulkQuery = `
      UPDATE registration_data
      SET field_value = CASE id
        ${validUpdates
          .map(
            (update) =>
              `WHEN ${update.registrationDataId} THEN '${update.field_value}'`
          )
          .join(" ")}
        ELSE field_value END
      WHERE eventId = ? 
        AND registrationFormId = ? 
        AND created_by = ? 
        AND role = ? 
        AND field_name IN (${validUpdates
          .map((update) => `'${update.field_name}'`)
          .join(", ")})
        AND id IN (${validUpdates
          .map((update) => update.registrationDataId)
          .join(", ")})
    `;

    db.query(
      bulkQuery,
      [eventId, registrationFormId, created_by, role],
      (err, result) => {
        if (err) {
          return reject(new Error(`Database error: ${err.message}`));
        }

        if (result.affectedRows > 0) {
          resolve(result);
        } else {
          reject(new Error("No updates performed"));
        }
      }
    );
  });
};

export function insertJudgeAssignment(eventId, roundId, judge_email) {
  const sql = `
      INSERT INTO jury_assignments (eventId, roundId, judge_email)
      VALUES (?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [eventId, roundId, judge_email], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve({ juryAssignId: result.insertId });
    });
  });
}

export function registrationDataFetchById(eventId, created_by, role) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT *, created_at, updated_at
      FROM registration_data
      WHERE eventId = ? 
      AND created_by = ? 
      AND role = ? 
      AND is_deleted = 0
      ORDER BY updated_at DESC
    `;

    const params = [eventId, created_by, role];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("No matching registration data found."));
      }

      const registrationMap = {};
      let mostRecentUpdatedAt = null;

      results.forEach((row) => {
        const uniqueKey = `${row.registrationFormId}-${row.created_by}`;

        if (!registrationMap[uniqueKey]) {
          registrationMap[uniqueKey] = {
            registrationFormId: row.registrationFormId,
            eventId: row.eventId,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            role: row.role,
            fields: [],
          };
        }

        const fieldKey = row.field_name;

        const fieldObj = {
          registrationDataId: row.id,
          [fieldKey]: row.field_value,
        };

        registrationMap[uniqueKey].fields.push(fieldObj);

        if (!mostRecentUpdatedAt || row.updated_at > mostRecentUpdatedAt) {
          mostRecentUpdatedAt = row.updated_at;
        }
      });

      const latestRegistration = Object.values(registrationMap).find(
        (registration) => registration.updated_at === mostRecentUpdatedAt
      );

      resolve(latestRegistration);
    });
  });
}

export function entryDataFetchById(eventId, submission_id) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT *, created_at, updated_at
      FROM entry_data
      WHERE eventId = ? 
      AND submission_id = ? 
      AND is_deleted = 0
      ORDER BY updated_at DESC
    `;

    const params = [eventId, submission_id];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (results.length === 0) {
        return reject(new Error("No matching entry data found."));
      }

      const entryMap = {};
      let mostRecentUpdatedAt = null;

      results.forEach((row) => {
        const uniqueKey = `${row.submission_id}-${row.created_by}`;

        if (!entryMap[uniqueKey]) {
          entryMap[uniqueKey] = {
            submission_id: row.submission_id,
            eventId: row.eventId,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            role: row.role,
            fields: [],
          };
        }

        const fieldKey = row.field_name;

        const fieldObj = {
          entryDataId: row.id,
          [fieldKey]: row.field_value,
        };

        entryMap[uniqueKey].fields.push(fieldObj);

        if (!mostRecentUpdatedAt || row.updated_at > mostRecentUpdatedAt) {
          mostRecentUpdatedAt = row.updated_at;
        }
      });

      const latestEntry = Object.values(entryMap).find(
        (entry) => entry.updated_at === mostRecentUpdatedAt
      );

      resolve(latestEntry);
    });
  });
}

export const entrantsDataUpdate = (
  eventId,
  entryFormId,
  submission_id,
  updates
) => {
  return new Promise((resolve, reject) => {
    const validUpdates = updates.filter(
      (update) => update.field_name && update.field_value
    );

    if (validUpdates.length === 0) {
      return reject(new Error("No valid updates provided"));
    }

    validUpdates.forEach((update) => {
      const query = `UPDATE entry_data
        SET field_value = ?
        WHERE eventId = ? AND entryFormId = ? AND submission_id = ? AND field_name = ? AND id = ?`;
      const values = [
        update.field_value,
        eventId,
        entryFormId,
        submission_id,
        update.field_name,
        update.entryDataId,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          reject(new Error(`Database error: ${err.message}`));
        }
        if (result.affectedRows > 0) {
          resolve(result);
        } else {
          reject(new Error("No updates performed"));
        }
      });
    });
  });
};

export const createJuryGroup = async (eventId, roundId, name, formula) => {
  const connection = await connection1.getConnection();
  await connection.beginTransaction();

  try {
    // Insert Jury Group
    const [juryGroupResult] = await connection.execute(
      "INSERT INTO jury_groups (eventId,roundId,group_name,formula) VALUES (?,?,?,?)",
      [eventId, roundId, name, formula]
    );
    const juryGroupId = juryGroupResult.insertId;

    return { connection, juryGroupId };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

export const insertAwardCategories = async (
  connection,
  juryGroupId,
  awardCategories
) => {
  if (awardCategories && awardCategories.length > 0) {
    const awardCategoryValues = awardCategories.map((category) => [
      juryGroupId,
      category,
    ]);
    await connection.query(
      "INSERT INTO jury_group_award_categories (jury_group_id, award_category) VALUES ?",
      [awardCategoryValues]
    );
  }
};

export const insertSubmissionFields = async (
  connection,
  juryGroupId,
  submissionFields
) => {
  let submissionFieldIds = {};
  if (submissionFields && submissionFields.length > 0) {
    for (const field of submissionFields) {
      const [submissionFieldResult] = await connection.execute(
        "INSERT INTO jury_group_submission_fields (jury_group_id, submission_field) VALUES (?, ?)",
        [juryGroupId, field]
      );
      submissionFieldIds[field] = submissionFieldResult.insertId;
    }
  }
  return submissionFieldIds;
};

export const insertSubmissionFieldValues = async (
  connection,
  juryGroupId,
  submissionFieldIds,
  submissionValues
) => {
  if (submissionValues && Object.keys(submissionValues).length > 0) {
    for (const field in submissionValues) {
      if (submissionFieldIds[field]) {
        await connection.execute(
          "INSERT INTO jury_group_submission_field_values (jury_group_id, submission_field_id, value) VALUES (?, ?, ?)",
          [juryGroupId, submissionFieldIds[field], submissionValues[field]]
        );
      }
    }
  }
};

export const insertEntrantFields = async (
  connection,
  juryGroupId,
  entrantFields
) => {
  let entrantFieldIds = {};
  if (entrantFields && entrantFields.length > 0) {
    for (const field of entrantFields) {
      const [entrantFieldResult] = await connection.execute(
        "INSERT INTO jury_group_entrant_fields (jury_group_id, entrant_field) VALUES (?, ?)",
        [juryGroupId, field]
      );
      entrantFieldIds[field] = entrantFieldResult.insertId;
    }
  }
  return entrantFieldIds;
};

export const insertEntrantFieldValues = async (
  connection,
  juryGroupId,
  entrantFieldIds,
  entrantValues
) => {
  if (entrantValues && Object.keys(entrantValues).length > 0) {
    for (const field in entrantValues) {
      if (entrantFieldIds[field]) {
        await connection.execute(
          "INSERT INTO jury_group_entrant_field_values (jury_group_id, entrant_field_id, value) VALUES (?, ?, ?)",
          [juryGroupId, entrantFieldIds[field], entrantValues[field]]
        );
      }
    }
  }
};

export const insertSubmissionIds = async (
  connection,
  juryGroupId,
  submissionIds
) => {
  if (submissionIds && submissionIds.length > 0) {
    const submissionIdValues = submissionIds.map((id) => [juryGroupId, id]);
    await connection.query(
      "INSERT INTO jury_group_submission_ids (jury_group_id, submission_id) VALUES ?",
      [submissionIdValues]
    );
  }
};

export const commitTransaction = async (connection) => {
  await connection.commit();
};

export const rollbackTransaction = async (connection) => {
  await connection.rollback();
};

export const releaseConnection = (connection) => {
  connection.release();
};

export const GetAlljudgeGroup = async (eventId, roundId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id as juryGroupId,
      group_name AS name,
      formula
      FROM jury_groups
      WHERE eventId = ? AND roundId = ?;
    `;
    const values = [eventId, roundId];
    db.query(query, values, (err, results) => {
      if (err) {
        console.log("get all groups err", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

export function checkgroupId(juryGroupId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM jury_groups WHERE id = ?";
    db.query(query, [juryGroupId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export const GroupGetById = async (juryGroupId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
          jg.id AS juryGroupId,
          jg.group_name AS name,
          jg.formula,
          jg.eventId,
          jg.roundId,
          jg.created_at,
          jg.updated_at,
          COALESCE(
              (
                  SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                          'award_category_id', jgac.id,
                          'award_category', jgac.award_category
                      )
                  )
                  FROM jury_group_award_categories jgac
                  WHERE jgac.jury_group_id = jg.id
              ),
              JSON_ARRAY()
          ) AS award_categories,
          COALESCE(
              (
                  SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                          'entrant_field_id', jgef.id,
                          'entrant_field', jgef.entrant_field,
                          'entrant_value', jgev.value
                      )
                  )
                  FROM jury_group_entrant_fields jgef
                  LEFT JOIN jury_group_entrant_field_values jgev 
                      ON jgef.id = jgev.entrant_field_id
                  WHERE jgef.jury_group_id = jg.id
              ),
              JSON_ARRAY()
          ) AS entrant_fields,
          COALESCE(
              (
                  SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                          'submission_field_id', jgsf.id,
                          'submission_field', jgsf.submission_field,
                          'submission_value', jgsfv.value
                      )
                  )
                  FROM jury_group_submission_fields jgsf
                  LEFT JOIN jury_group_submission_field_values jgsfv 
                      ON jgsf.id = jgsfv.submission_field_id
                  WHERE jgsf.jury_group_id = jg.id
              ),
              JSON_ARRAY()
          ) AS submission_fields,
          COALESCE(
              (
                  SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                          'submission_id', jgsi.submission_id
                      )
                  )
                  FROM jury_group_submission_ids jgsi
                  WHERE jgsi.jury_group_id = jg.id
              ),
              JSON_ARRAY()
          ) AS submission_ids

      FROM jury_groups jg
      WHERE jg.id = ?
      GROUP BY jg.id;
    `;

    db.query(query, [juryGroupId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          results[0].award_categories = JSON.parse(results[0].award_categories);
          results[0].entrant_fields = JSON.parse(results[0].entrant_fields);
          results[0].submission_fields = JSON.parse(
            results[0].submission_fields
          );
          try {
            results[0].submission_ids = JSON.parse(results[0].submission_ids);
          } catch (e) {
            results[0].submission_ids = [];
          }
        }
        resolve(results[0]);
      }
    });
  });
};

export const deleteJuryGroupById = async (juryGroupId) => {
  const queries = [
    `DELETE FROM jury_group_submission_field_values WHERE jury_group_id = ?`,
    `DELETE FROM jury_group_submission_fields WHERE jury_group_id = ?`,
    `DELETE FROM jury_group_submission_ids WHERE jury_group_id = ?`,
    `DELETE FROM jury_group_entrant_field_values WHERE entrant_field_id IN (SELECT id FROM jury_group_entrant_fields WHERE jury_group_id = ?)`,
    `DELETE FROM jury_group_entrant_fields WHERE jury_group_id = ?`,
    `DELETE FROM jury_group_award_categories WHERE jury_group_id = ?`,
    `DELETE FROM jury_groups WHERE id = ?`,
  ];

  const values = [
    juryGroupId,
    juryGroupId,
    juryGroupId,
    juryGroupId,
    juryGroupId,
    juryGroupId,
    juryGroupId,
  ];

  try {
    await Promise.all(
      queries.map(
        (query, index) =>
          new Promise((resolve, reject) => {
            db.query(query, values[index], (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
          })
      )
    );
    return { message: "Jury group deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export function checkBackdoor(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT unique_url FROM event_details WHERE id = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else if (results.length === 0 || !results[0].unique_url) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export function backdoorGet(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT id,
    event_url, 
    unique_url
    FROM event_details 
    WHERE id = ?          
    AND is_deleted = 0`;

    db.query(query, [eventId], (error, fetchResults) => {
      if (error) {
        reject(error);
      } else if (fetchResults.length === 0) {
        reject("Event not found or is deleted");
      } else {
        const eventUrl = fetchResults[0].event_url;
        const uniqueUrl = fetchResults[0].unique_url;

        if (!uniqueUrl) {
          reject("Backdoor link not available");
        } else {
          resolve({
            event_url: `${eventUrl}/${uniqueUrl}`,
          });
        }
      }
    });
  });
}

export async function deletebackdoor(eventId) {
  const updateSql = "UPDATE event_details SET unique_url = NULL WHERE id = ?";

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(updateSql, [eventId], (err, result) => {
        if (err) return reject(new Error("Error deleting the backdoor"));
        resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error(resposne.eventnotfound);
    }

    return "Backdoor deleted successfully.";
  } catch (error) {
    throw error;
  }
}

export function getEntryData(eventId, selectedColumns) {
  return new Promise((resolve, reject) => {
    const placeholders = selectedColumns.map(() => "?").join(",");
    const query = `
      SELECT submission_id, field_name, field_value 
      FROM entry_data 
      WHERE eventId = ? 
      AND field_name IN (${placeholders}) 
      AND is_deleted = 0
    `;

    connection.query(query, [eventId, ...selectedColumns], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });
}

export async function generateExcel(data, selectedColumns, selectedLabels) {
  // Organize data by submission_id
  const dataMap = {};
  data.forEach(({ submission_id, field_name, field_value }) => {
    if (!dataMap[submission_id]) {
      dataMap[submission_id] = { submission_id };
    }
    dataMap[submission_id][field_name] = field_value;
  });

  // Convert object into an array of rows
  const formattedData = Object.values(dataMap);

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Entry Data");

  // Define headers dynamically using labels
  const headers = ["submission_id", ...selectedLabels];
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: 25,
  }));

  // Add data to worksheet
  formattedData.forEach((row) => {
    const rowData = headers.map((header) => {
      if (header === "submission_id") {
        return row.submission_id;
      }
      // Map field_name to label for data
      const fieldName = selectedColumns[selectedLabels.indexOf(header)];
      return row[fieldName] || "";
    });
    worksheet.addRow(rowData);
  });

  // Return the buffer
  return workbook.xlsx.writeBuffer();
}

export function getEventsByAdmin(adminId, sortBy = "newest") {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM event_details 
      WHERE adminId = ? AND is_deleted = 0
      ORDER BY created_at ${sortBy === "oldest" ? "ASC" : "DESC"}
    `;

    db.query(query, [adminId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }
      resolve(results);
    });
  });
}

export function getAllAdmins() {
  return new Promise((resolve, reject) => {
    const query = `
              SELECT 
            a.id AS adminId,
            a.first_name,
            a.last_name,
            a.email,
            a.mobile_number,
            a.role,
            a.special_role,
            a.is_blocked,
            COUNT(ed.id) AS total_events
        FROM admin AS a
        LEFT JOIN event_details AS ed ON a.id = ed.adminId
        WHERE a.is_deleted = 0
          AND (a.role = 'admin' OR a.role = 'super_admin') 
        GROUP BY a.id;
    `;

    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error("No Admin found"));
      }
      resolve({
        admins: results,
      });
    });
  });
}
export async function adminblocking(adminId, block) {
  const updateSql = "UPDATE admin SET is_blocked = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    db.query(updateSql, [block, adminId], (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return reject(new Error(resposne.blockingError));
      }

      if (result.affectedRows === 0) {
        return reject(new Error(resposne.adminNotFound));
      }

      resolve(resposne.adminBlocked);
    });
  });
}

export function checkblock(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_blocked FROM admin WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          const isBlocked = results[0].is_blocked;
          resolve(isBlocked);
        } else {
          resolve(false);
        }
      }
    });
  });
}

export function checkjuryMail(eventId, roundId, email) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM jury_assign WHERE eventId = ? AND roundId= ? AND email = ? AND is_deleted = 0";
    db.query(query, [eventId, roundId, email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function getJuryProgress(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        e.id AS eventId,
        a.id AS awardId,
        a.category_name, 
        COUNT(DISTINCT ed.submission_id) AS totalSubmissionsInAward,
        COUNT(DISTINCT js.awardId) AS totalAwardIdsInJuryScore
      FROM 
        event_details AS e
      LEFT JOIN 
        awards_category AS a ON e.id = a.eventId
      LEFT JOIN 
        jury_score AS js ON js.awardId = a.id
      LEFT JOIN 
        entry_data AS ed ON ed.awardcatId = a.id
      WHERE 
        e.id = ? 
        AND a.is_deleted = 0
      GROUP BY 
        e.id, a.id, a.category_name;
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error("No results found"));
      }
      resolve(results);
    });
  });
}

export async function coupongetAdmin(couponId, baseTotalPrice, eventId) {
  const selectSql = `
    SELECT 
      id AS coupon_id,
      coupon_name,
      coupon_code,
      percent_off,
      coupon_amount,
      start_date,
      end_date
    FROM coupons
    WHERE coupon_code = ? 
      AND eventId = ? 
      AND is_deleted = 0 
      AND is_active = 1
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [couponId, eventId], (fetchError, results) => {
        if (fetchError) {
          console.log("fetchError", fetchError);
          return reject(fetchError);
        }
        resolve(results);
      });
    });

    if (result.length === 0) {
      throw new Error("No active coupon found for this couponCode and eventId");
    }

    const coupon = result[0];

    // Get current timestamp
    const currentTimestamp = new Date();

    // Check if coupon is within the valid date range
    if (
      new Date(coupon.start_date) > currentTimestamp ||
      new Date(coupon.end_date) < currentTimestamp
    ) {
      throw new Error("Coupon is expired or not yet valid");
    }

    let discount = 0;

    // Apply percentage discount first
    if (coupon.percent_off) {
      discount = (baseTotalPrice * coupon.percent_off) / 100;
      baseTotalPrice -= discount; // Reduce base total before applying fixed discount
    }

    // Apply fixed coupon amount discount
    if (coupon.coupon_amount) {
      discount += coupon.coupon_amount;
      baseTotalPrice -= coupon.coupon_amount;
    }

    // Ensure subtotal doesn't go negative
    const subtotal = Math.max(0, baseTotalPrice);

    return {
      coupon_id: coupon.coupon_id,
      coupon_name: coupon.coupon_name,
      coupon_code: coupon.coupon_code,
      discount: discount.toFixed(2),
      subtotal: subtotal.toFixed(2),
    };
  } catch (error) {
    console.log("Error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export const fetchfiledssss = async (eventId, submissionId) => {
  const query = `
    SELECT paymentstatus
    FROM entry_data
    WHERE eventId = ? AND submission_id = ? AND is_active = 1 AND is_deleted = 0;
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId, submissionId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export const fetchFieldsForSubmissiontest = async (eventId, submissionId) => {
  const query = `
    SELECT paymentstatus
    FROM entry_data
    WHERE eventId = ? AND submission_id = ?;
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [eventId, submissionId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export const getGeneralSettingsByEventId = (eventId, callback) => {
  const query = "SELECT * FROM general_settings WHERE eventId = ?";
  connection.query(query, [eventId], (err, results) => {
    if (err) {
      console.error("Error fetching general settings:", err.stack);
      return callback(err, null);
    }
    callback(null, results);
  });
};
export const insertEntryDataIntoDatabase = async (
  eventId,
  awardcatId,
  submissionId,
  entryFormId,
  created_by,
  role,
  fieldEntries,
  isDraft = 0 // 🔥 NEW PARAM (default 0 = submit)
) => {
  try {
    // 🔥 If draft → skip payment check (optimization)
    let paymentStatus = "unpaid";

    if (!isDraft) {
      const checkPaymentStatusQuery = `SELECT status FROM orders WHERE awardId = ? AND status = 'paid' LIMIT 1`;
      const isPaid = await new Promise((resolve, reject) => {
        db.query(checkPaymentStatusQuery, [awardcatId], (err, results) => {
          if (err) {
            return reject(
              new Error(`Error checking payment status: ${err.message}`)
            );
          }
          resolve(results.length > 0);
        });
      });

      paymentStatus = isPaid ? "paid" : "unpaid";
    }
    console.log(isDraft,"isDraft")
    // 🔥 DELETE OLD DRAFT (only if draft save)
    if (!isDraft) {
      await new Promise((resolve, reject) => {
        db.query(
          `DELETE FROM entry_data WHERE eventId=? AND entryFormId=? AND created_by=? AND isDraft=1`,
          [eventId, entryFormId, created_by],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // 🔥 UPDATED INSERT QUERY (added isDraft column)
    const insertQuery = `
      INSERT INTO entry_data (
        eventId, awardcatId, entryFormId, submission_id, created_by, role, field_name, field_value, paymentStatus, isDraft
      ) VALUES ?;
    `;

    const values = fieldEntries.map(([field_name, field_value]) => [
      eventId,
      awardcatId,
      entryFormId,
      isDraft ? null : submissionId, // ❌ no submissionId for draft
      created_by,
      role,
      field_name,
      field_value,
      paymentStatus,
      isDraft ? 1 : 0, // 🔥 MAIN FLAG
    ]);

    const result = await new Promise((resolve, reject) => {
      db.query(insertQuery, [values], (err, result) => {
        if (err) {
          return reject(new Error(`Error saving entry data: ${err.message}`));
        }

        if (result.affectedRows === 0) {
          return reject(new Error("No rows were inserted."));
        }

        resolve(result);
      });
    });

    return result;
  } catch (err) {
    return { error: err.message };
  }
};
// export const insertEntryDataIntoDatabase = async (
//   eventId,
//   awardcatId,
//   submissionId,
//   entryFormId,
//   created_by,
//   role,
//   fieldEntries
// ) => {
//   try {
//     // Check if awardcatId has a paid status in the orders table
//     const checkPaymentStatusQuery = `SELECT status FROM orders WHERE awardId = ? AND status = 'paid' LIMIT 1`;
//     const isPaid = await new Promise((resolve, reject) => {
//       db.query(checkPaymentStatusQuery, [awardcatId], (err, results) => {
//         if (err) {
//           return reject(
//             new Error(`Error checking payment status: ${err.message}`)
//           );
//         }
//         resolve(results.length > 0);
//       });
//     });

//     // Prepare the insertion query
//     const insertQuery = `
//       INSERT INTO entry_data (
//         eventId, awardcatId, entryFormId, submission_id, created_by, role, field_name, field_value, paymentStatus
//       ) VALUES ?;
//     `;

//     const values = fieldEntries.map(([field_name, field_value]) => [
//       eventId,
//       awardcatId,
//       entryFormId,
//       submissionId,
//       created_by,
//       role,
//       field_name,
//       field_value,
//       isPaid ? "paid" : "unpaid",
//     ]);

//     const result = await new Promise((resolve, reject) => {
//       db.query(insertQuery, [values], (err, result) => {
//         if (err) {
//           return reject(new Error(`Error saving entry data: ${err.message}`));
//         }

//         if (result.affectedRows === 0) {
//           return reject(new Error("No rows were inserted."));
//         }

//         resolve(result);
//       });
//     });

//     return result;
//   } catch (err) {
//     return { error: err.message };
//   }
// };

export function Couponget(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM coupons WHERE eventId = ? AND is_deleted = 0
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(new Error("Database Error: " + err.message));
      }
      if (results.length === 0) {
        return reject(new Error("No Data Available"));
      }
      resolve(results);
    });
  });
}

export const checkScorecardExistsNot = (
  scoreFormId,
  eventId,
  roundId,
  categoryId
) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id FROM scorecard 
      WHERE id = ? AND categoryId = ? AND is_deleted = 0 AND eventId = ? AND roundId = ?
    `;

    db.query(
      query,
      [scoreFormId, categoryId, eventId, roundId],
      (err, results) => {
        if (err) {
          return reject(new Error(`Database query error: ${err.message}`));
        }

        if (results.length > 0) {
          return resolve({ exists: true, categoryId });
        }

        // If no scorecard found, look for another scorecard in the same round
        const altQuery = `
        SELECT categoryId FROM scorecard 
        WHERE roundId = ? AND is_deleted = 0 LIMIT 1
      `;

        db.query(altQuery, [roundId], (altErr, altResults) => {
          if (altErr) {
            return reject(new Error(`Database query error: ${altErr.message}`));
          }

          if (altResults.length > 0) {
            return resolve({
              exists: false,
              categoryId: altResults[0].categoryId,
            });
          } else {
            return resolve({ exists: false, categoryId: null }); // No alternative found
          }
        });
      }
    );
  });
};

export function CouponDelete(couponId) {
  return new Promise((resolve, reject) => {
    const checkQuery = "SELECT * FROM coupons WHERE id = ? AND is_deleted = 0";

    db.query(checkQuery, [couponId], (err, rows) => {
      if (err) {
        return reject(new Error("Database Error: " + err.message));
      }

      if (rows.length === 0) {
        return resolve(false);
      }

      const deleteQuery =
        "UPDATE coupons SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

      db.query(deleteQuery, [couponId], (err, result) => {
        if (err) {
          return reject(new Error("Delete Failed: " + err.message));
        }

        resolve(result.affectedRows > 0);
      });
    });
  });
}

export function CouponUpdate(couponId, data) {
  return new Promise((resolve, reject) => {
    const checkQuery = "SELECT * FROM coupons WHERE id = ? AND is_deleted = 0";

    db.query(checkQuery, [couponId], (err, rows) => {
      if (err) return reject(new Error("Database error: " + err.message));
      if (rows.length === 0) return resolve(false);

      const fields = [];
      const values = [];

      for (const key in data) {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }

      if (fields.length === 0)
        return reject(new Error("No valid fields provided for update."));

      const updateQuery = `
        UPDATE coupons 
        SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      values.push(couponId);

      db.query(updateQuery, values, (err, result) => {
        if (err) return reject(new Error("Update failed: " + err.message));
        resolve(result.affectedRows > 0);
      });
    });
  });
}

export const getPaymentGateway = (eventId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        *
      FROM payment_gateways
      WHERE eventid = ?
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export const getShortlistedEntries = (
  eventId,
  awardIds = [],
  judgeIds = [],
  roundId = null,
  callback
) => {
  const awardPlaceholders = awardIds.map(() => "?").join(",");
  const values = [eventId, ...awardIds];

  let sql = `
    SELECT DISTINCT 
      js.submission_id,
      js.judgeId,
      jn.email AS judgeEmail,
      js.awardId,
      js.roundId,
      js.eventId,
      js.total,
      js.abstain,
      js.comment,
      js.status,
      js.is_confirmed,
      js.created_at,
      js.updated_at
    FROM jury_score js
    JOIN entry_data ed 
      ON js.submission_id = ed.submission_id
      AND js.eventId = ed.eventId
      AND js.awardId = ed.awardcatId
    LEFT JOIN jury_assign jn 
      ON js.judgeId = jn.id
      AND js.eventId = jn.eventId
      AND js.roundId = jn.roundId
    WHERE js.eventId = ?
      AND js.awardId IN (${awardPlaceholders})
      AND js.is_deleted = 0
      AND ed.is_deleted = 0
  `;

  if (roundId !== null) {
    sql += ` AND js.roundId = ?`;
    values.push(roundId);
  }

  if (judgeIds.length > 0) {
    const judgePlaceholders = judgeIds.map(() => "?").join(",");
    sql += ` AND js.judgeId IN (${judgePlaceholders})`;
    values.push(...judgeIds);
  }

  db.query(sql, values, async (err, juryData) => {
    if (err) return callback(err);

    // Get all unique submission IDs to fetch entry_data
    // Get all unique submission IDs to fetch entry_data
    const submissionIds = juryData.map((j) => j.submission_id);

    // Check for empty submissionIds
    if (submissionIds.length === 0) {
      return callback(null, []); // or return just juryData if needed
    }

    const entrySql = `
  SELECT submission_id, field_name, field_value 
  FROM entry_data 
  WHERE submission_id IN (${submissionIds.map(() => "?").join(",")}) 
    AND eventId = ? 
    AND is_deleted = 0
`;

    db.query(
      entrySql,
      [...submissionIds, eventId],
      (entryErr, entryResults) => {
        if (entryErr) return callback(entryErr);

        const entryMap = {};
        entryResults.forEach(({ submission_id, field_name, field_value }) => {
          const cleanField = field_name.split("-")[0];
          if (!entryMap[submission_id]) entryMap[submission_id] = {};
          entryMap[submission_id][cleanField] = field_value;
        });

        const mergedData = juryData.map((jury) => ({
          ...jury,
          ...(entryMap[jury.submission_id] || {}),
        }));

        callback(null, mergedData);
      }
    );
  });
};

export const getJuryEmailsByEventAndRound = (eventId, roundId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id AS judgeId, email 
      FROM jury_assign 
      WHERE eventId = ? 
        AND roundId = ? 
    `;
    db.query(query, [eventId, roundId], (err, results) => {
      if (err) return reject(err);

      resolve(results);
    });
  });
};
// export const entrydatagetSubmission = (eventId, awardIds) => {
//   return new Promise((resolve, reject) => {
//     if (!Array.isArray(awardIds) || awardIds.length === 0) {
//       return resolve([]);
//     }

//     const query = `
//       SELECT id AS entrydataid, eventId, awardcatId, submission_id, field_name, field_value
//       FROM entry_data
//       WHERE eventId = ?
//         AND awardcatId IN (?)
//     `;

//     db.query(query, [eventId, awardIds], (err, results) => {
//       if (err) return reject(err);

//       // Deduplicate by submission_id
//       const uniqueSubmissions = {};
//       results.forEach(row => {
//         if (!uniqueSubmissions[row.submission_id]) {
//           uniqueSubmissions[row.submission_id] = row;
//         }
//       });

//       resolve(Object.values(uniqueSubmissions));
//     });
//   });
// };

export const entrydatagetSubmission = (eventId, awardIds) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(awardIds) || awardIds.length === 0) {
      return resolve([]);
    }

    const query = `
      SELECT id AS entrydataid, eventId, awardcatId, submission_id, field_name, field_value
      FROM entry_data 
      WHERE eventId = ? 
        AND awardcatId IN (?)
    `;

    db.query(query, [eventId, awardIds], (err, results) => {
      if (err) return reject(err);

      // ✅ No deduplication here — just return all rows
      resolve(results);
    });
  });
};
export const getJuryScore = (eventId, awardIds, roundId, judgeIds) => {
  return new Promise((resolve, reject) => {
    if (
      !Array.isArray(awardIds) ||
      awardIds.length === 0 ||
      !Array.isArray(judgeIds) ||
      judgeIds.length === 0
    ) {
      return resolve([]);
    }

    const query = `
      SELECT 
        id AS juryscoreid, 
        eventId, 
        awardId, 
        roundId, 
        judgeId, 
        submission_id, 
        comment,
        total
      FROM jury_score 
      WHERE eventId = ? 
        AND awardId IN (?) 
        AND roundId = ? 
        AND judgeId IN (?)
    `;

    db.query(query, [eventId, awardIds, roundId, judgeIds], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const getJuryEmailsByIds = (judgeIds) => {
  return new Promise((resolve, reject) => {
    if (!judgeIds?.length) return resolve([]);

    const query = `SELECT id as judgeId, email FROM jury_assign WHERE id IN (?)`;

    db.query(query, [judgeIds], (err, results) => {
      if (err) {
        console.error("Error fetching jury emails by IDs:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

export function eventdetails(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE id = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
        console.log("event details", results);
      }
    });
  });
}

export function eventaddititonalemail(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM additional_emails WHERE eventId = ?";
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
        console.log("event details", results);
      }
    });
  });
}

export function eventscoreget(roundId, eventId) {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT overall_score FROM general_settings WHERE id = ? AND eventId = ? AND is_deleted = 0 LIMIT 1";
    db.query(query, [roundId, eventId], (err, results) => {
      if (err) return reject(err);
      const score = results[0]?.overall_score || "";
      console.log("event details", score); // ← should log "{Total Score}"
      resolve(score);
    });
  });
}

export function countSubmissions(eventId, awardcatId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(DISTINCT submission_id) AS total_submissions
      FROM entry_data
      WHERE eventId = ? AND awardcatId = ? AND is_deleted = 0 AND is_active = 1
    `;

    db.query(query, [eventId, awardcatId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].total_submissions || 0);
    });
  });
}

export function getSubmissionLimit(eventId, awardcatId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT limit_submission 
      FROM awards_category 
      WHERE id = ? AND eventId = ? AND is_deleted = 0
    `;

    db.query(query, [awardcatId, eventId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) {
        return resolve(null); // not found
      }

      return resolve(results[0].limit_submission);
    });
  });
}

export function checkawardCatIdNew(awardcatId) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT id, start_date, end_date 
        FROM awards_category 
        WHERE id = ? AND is_deleted = 0
      `;

    db.query(query, [awardcatId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve({ exists: false });

      const { start_date, end_date } = results[0];

      // If both dates exist, do the date check
      if (start_date && end_date) {
        const today = new Date();
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (today < start || today > end) {
          return resolve({
            exists: true,
            submissionAllowed: false,
          });
        }
      }

      // No dates provided or within valid range
      return resolve({
        exists: true,
        submissionAllowed: true,
      });
    });
  });
}
export function UserCatgeoryFormList(eventId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        a.id AS awardId,
        a.category_name,
        a.category_prefix,
        a.belongs_group,
        a.limit_submission,
        a.start_date,
        a.end_date,
        a.payment_price,
        e.id AS eventId,
        COUNT(DISTINCT ed.submission_id) AS total_submissions
      FROM awards_category a 
      LEFT JOIN event_details e ON a.eventId = e.id  
      LEFT JOIN entry_data ed ON ed.awardcatId = a.id 
        AND ed.eventId = a.eventId 
        AND ed.is_deleted = 0
      WHERE 
        a.is_deleted = 0 
        AND a.eventId = ?
        AND (
          (a.start_date IS NULL OR a.end_date IS NULL) 
          OR (CURRENT_DATE() BETWEEN a.start_date AND a.end_date)
        )
      GROUP BY a.id
      HAVING 
        a.limit_submission IS NULL 
        OR total_submissions IS NULL 
        OR total_submissions < a.limit_submission
    `;

    db.query(query, [eventId], (err, awards) => {
      if (err) {
        return reject(err);
      }
      return resolve(awards);
    });
  });
}

export function checkIfEventPlanExists(eventId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT id FROM payment_gateways WHERE eventid = ? LIMIT 1`;

    db.query(query, [eventId], (err, results) => {
      if (err) return reject(err);

      if (!results || results.length === 0) {
        return reject(
          new Error("You have not added an event plan. Please update it.")
        );
      }

      return resolve(); // event plan exists
    });
  });
}

export const updateMediaSubmissionId = (created_by, eventId, submissionId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE media_files
      SET submission_id = ?
      WHERE user_id = ? AND event_id = ? AND submission_id IS NULL
    `;

    console.log("created_by", created_by, "eventId", eventId, "submissionId", submissionId);

    db.query(query, [submissionId, created_by, eventId], (err, result) => {
      if (err) {
        return reject(new Error("❌ Error updating media_files: " + err.message));
      }

      resolve({
        message: `✅ Updated ${result.affectedRows} media file(s) with submission_id`,
        submissionId,
      });
    });
  });
};


export const getDraftEntry = async (req, res) => {
  const { eventId, entryFormId } = req.query;
  const userId = req.user.id;

  try {
    // 🔥 STEP 1: Get latest draft awardcatId
    const getAwardQuery = `
      SELECT awardcatId 
      FROM entry_data 
      WHERE eventId = ? 
      AND entryFormId = ? 
      AND created_by = ? 
      AND isDraft = 1
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    db.query(getAwardQuery, [eventId, entryFormId, userId], (err, awardResult) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!awardResult.length) {
        return res.status(200).json({
          status: true,
          data: null,
          message: "No draft found",
        });
      }

      const awardcatId = awardResult[0].awardcatId;

      // 🔥 STEP 2: Fetch draft fields using awardcatId
      const getFieldsQuery = `
        SELECT field_name, field_value 
        FROM entry_data 
        WHERE eventId = ? 
        AND entryFormId = ? 
        AND awardcatId = ? 
        AND created_by = ? 
        AND isDraft = 1
      `;

      db.query(
        getFieldsQuery,
        [eventId, entryFormId, awardcatId, userId],
        (err, results) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }

          const formatted = {};
          results.forEach((row) => {
            formatted[row.field_name] = row.field_value;
          });

          return res.status(200).json({
            status: true,
            awardcatId, // 🔥 IMPORTANT (frontend ko bhej)
            data: formatted,
          });
        }
      );
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

