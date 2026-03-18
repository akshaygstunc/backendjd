import db from "../database/connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const saltRounds = 10;
import resposne from "../middleware/resposne.js";
dotenv.config();
import nodemailer from "nodemailer";
export function userRegister(first_name, last_name, email, password, company, mobile_number, country) {
  return new Promise((resolve, reject) => {
    const insertSql = `
        INSERT INTO user (first_name,last_name, email, password,company, mobile_number,country) 
        VALUES (?, ?, ?, ?, ?, ? ,?)
      `;

    const values = [first_name, last_name, email, password, company, mobile_number, country];

    db.query(insertSql, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const userId = result.insertId;
        if (userId) {
          resolve(userId);
        } else {
          reject(new Error(resposne.userfailed));
        }
      }
    });
  });
}

export function checkemail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function checkVerified(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_verified FROM user WHERE email = ?"; 
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 && results[0].is_verified === 1); 
      }
    });
  });
}

export function checkphone(mobile_number) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user WHERE mobile_number = ?";
    db.query(query, [mobile_number], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export function loginUser(email, password) {
  const userQuery = "SELECT * FROM user WHERE email = ?";

  return new Promise((resolve, reject) => {
    db.query(userQuery, [email], async (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length === 0) {
        const error = { error: resposne.invaliduser };
        return resolve(error);
      }

      const user = results[0];

      if (!password || !user.password) {
        const error = { error: resposne.missingPass };
        return resolve(error);
      }

      try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          const error = { error: resposne.invalidpassword };
          return resolve(error);
        }

        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
          },
          process.env.JWT_SECRET,
        );

        resolve({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
          },
        });
      } catch (err) {
        return reject(err);
      }
    });
  });
}

export function generateOTP() {
  let OTP = "123456";
  return OTP;
}

export function storeOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const deleteSql = `
      DELETE FROM user_otp WHERE email = ?
    `
    const insertSql = `
      INSERT INTO user_otp (email, otp)
      VALUES (?, ?)
    `
    db.beginTransaction((err) => {
      if (err) {
        return reject(err)
      }

      db.query(deleteSql, [email], (error) => {
        if (error) {
          return db.rollback(() => {
            reject(error)
          })
        }

        db.query(insertSql, [email, otp], (error, result) => {
          if (error) {
            return db.rollback(() => {
              reject(error)
            })
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err)
              })
            }

            const successMessage = resposne.otpsend
            resolve(successMessage)
          })
        })
      })
    })
  })
}

export function verifyOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const selectSql = `
      SELECT * FROM user_otp WHERE email = ? AND otp = ?
    `
    const updateSql = `
      UPDATE user_otp SET is_verified = 1 WHERE email = ? AND otp = ?
    `

    db.query(selectSql, [email, otp], (error, results) => {
      if (error) {
        reject(error)
      } else if (results.length === 0) {
        reject(new Error(resposne.invalidOtp))
      } else {
        db.query(
          updateSql,
          [email, otp],
          (updateError, updateResult) => {
            if (updateError) {
              reject(updateError)
            } else {
              resolve(resposne.otpverified)
            }
          }
        )
      }
    })
  })
}

export function checkemailOtp(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user_otp WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0 ? true : false);
      }
    });
  });
}

export async function changePassword({ email, password }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM user_otp WHERE email = ? AND is_verified = 1";
    const updateSql = "UPDATE user SET password = ? WHERE email = ?";

    db.query(selectSql, [email], async (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length === 0) {
        return reject(new Error("OTP not verified"));
      }

      try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.query(updateSql, [hashedPassword, email], (updateError) => {
          if (updateError) {
            return reject(updateError);
          }

          resolve("Password changed successfully");
        });
      } catch (hashError) {
        reject(hashError);
      }
    });
  });
}

export async function changeforgetPassword({ email, newPassword }) {
  return new Promise((resolve, reject) => {
    const selectSql =
      "SELECT * FROM user_otp WHERE email = ? AND is_verified = 1"
    const updateSql = "UPDATE user SET password = ? WHERE email = ?"

    db.query(selectSql, [email], async (error, results) => {
      if (error) {
        return reject(error)
      }

      if (results.length === 0) {
        return reject(new Error(resposne.otpnotverified))
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

        db.query(updateSql, [hashedPassword, email], (updateError) => {
          if (updateError) {
            return reject(updateError)
          }

          resolve(resposne.passChanged)
        })
      } catch (hashError) {
        reject(hashError)
      }
    })
  })
}


export function checkeventId(eventId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM event_details WHERE id = ?"
    db.query(query, [eventId], (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results.length > 0 ? true : false)
      }
    })
  })
}

export async function getCouponCodes(eventId) {

  const query = `
      SELECT 
      coupon_code
      FROM coupons 
      WHERE is_deleted = 0 AND eventId = ?
    `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, [eventId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    return {
      CouponCodes: results.length ? results : [],
    };
  } catch (err) {
    throw new Error(`Error fetching coupon codes: ${err.message}`);
  }
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

      const mappedLabels = results.flatMap(result => {
        const schema = JSON.parse(result.form_schema);
        return schema.map(field => ({
          field_name: field.dataName,
          label: field.label
        }));
      });

      const totalCount = mappedLabels.length;
      resolve({
        data: mappedLabels,
        totalCount: totalCount
      });
    });
  });
}

export function entryDataFetch(eventId, search, limit, skip, submission_id) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT *, created_at, updated_at
      FROM entry_data
      WHERE eventId = ? AND is_deleted = 0
    `;
    
    if (submission_id) {
      query += ` AND submission_id = ?`;  
    }

    if (search) {
      query += ` AND (field_name LIKE ? OR field_value LIKE ?)`;  
    }

    const searchTerm = search ? `%${search}%` : null;
    const params = [eventId, ...(submission_id ? [submission_id] : []), ...(searchTerm ? [searchTerm, searchTerm] : []), limit, skip];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }

      if (submission_id) {
        const result = {
          submission_id: results[0]?.submission_id,
          created_at: results[0]?.created_at,
          updated_at: results[0]?.updated_at,
          fields: []
        };

        results.forEach(row => {
          const fieldObj = {
            entryDataId: row.id,
            [row.field_name]: row.field_value
          };

          result.fields.push(fieldObj);  
        });

        return resolve(result);  
      }

      const entryDataMap = {};

      results.forEach(row => {
        const createdBy = row.created_by;

        if (!entryDataMap[createdBy]) {
          entryDataMap[createdBy] = {
            entryFormId: row.entryFormId,
            eventId: row.eventId,
            submission_id: row.submission_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            fields: []
          };
        }

        const fieldObj = {
          entryDataId: row.id,
          [row.field_name]: row.field_value 
        };

        entryDataMap[createdBy].fields.push(fieldObj); 
      });

      const mappedResults = Object.values(entryDataMap);
      resolve(mappedResults);  
    });
  });
}

export function verifyUser(email) {
  return new Promise((resolve, reject) => {
    const updateSql = `
      UPDATE user SET is_verified = 1 WHERE email = ?
    `;
    
    db.query(updateSql, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.affectedRows > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}


// export const entryFieldsFetchUser = (userId) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT DISTINCT 
//         ed.id AS eventId, 
//         ed.event_name, 
//         ed.event_url, 
//         ed.closing_date, 
//         ed.event_logo, 
//         ed.is_completed
//       FROM entry_data e
//       JOIN event_details ed ON e.eventId = ed.id
//       WHERE e.created_by = ? 
//         AND e.is_deleted = 0
//         AND e.paymentstatus != 'paid'
//       ORDER BY ed.closing_date DESC
//     `;

//     db.query(query, [userId], (err, results) => {
//       if (err) {
//         return reject(new Error(`Database query error: ${err.message}`));
//       }
//       resolve(results);
//     });
//   });
// };

export const entryFieldsFetchUser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT 
        ed.id AS eventId, 
        ed.event_name, 
        ed.event_url, 
        ed.closing_date, 
        ed.event_logo, 
        ed.is_completed
      FROM entry_data e
      JOIN event_details ed ON e.eventId = ed.id
      LEFT JOIN payment_gateways pg ON pg.eventid = ed.id
      WHERE e.created_by = ?
      ORDER BY ed.closing_date DESC
    `;
   // AND e.is_deleted = 0
        // AND e.paymentstatus != 'paid'
        // AND (pg.status IS NULL OR pg.status != 'free')
    db.query(query, [userId], (err, results) => {
      if (err) {
        return reject(new Error(`Database query error: ${err.message}`));
      }
      resolve(results);
    });
  });
};


export async function addPayment(
  userId,
  eventId,
  awardId,
  couponId,
  payment_price,
  payment_status,
  company_name,
  gst_number
) {
  const insertSql = `
    INSERT INTO payment_details (
            userId,
            eventId,
            awardId,
            couponId,
            payment_price,
            payment_status,
            company_name,
            gst_number
    ) 
    VALUES (?,?, ?, ?, ?, ?, ?, ?) 
  `;

  const values = [
    userId,
    eventId,
    awardId,
    couponId,
    payment_price,
    payment_status,
    company_name,
    gst_number
  ];

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(insertSql, values, (insertError, result) => {
        if (insertError) {
          return reject(
            console.error(
              `Database insert error: ${insertError.message}`
            ),
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

export function getMyEvents(userId) {
  return new Promise((resolve, reject) => {
    const awardsQuery = `
      SELECT 
        ed.eventID,
        ed.awardcatId AS awardId, 
        ac.category_name,
        e.event_name,
        COUNT(DISTINCT ed.submission_id) AS total_submissions_per_award,
        (SELECT COUNT(DISTINCT ed2.awardcatId) 
          FROM entry_data ed2 
          WHERE ed2.eventId = ed.eventId) AS total_submissions_per_event
      FROM entry_data ed
      LEFT JOIN awards_category ac ON ed.awardcatId = ac.id
      LEFT JOIN event_details e ON ed.eventId = e.id
      WHERE ed.created_by = ?
      GROUP BY ed.eventID, ed.awardcatId, ac.category_name, e.event_name
    `;

    db.query(awardsQuery, [userId], (awardsErr, awardsResults) => {
      if (awardsErr) {
        return reject({
          message: "Error fetching award details",
          error: awardsErr
        });
      }

      const groupedAwards = {};

      awardsResults.forEach(row => {
        if (!groupedAwards[row.eventID]) {
          groupedAwards[row.eventID] = {
            event_name: row.event_name,
            total_submissions_per_event: row.total_submissions_per_event,
            awards: []
          };
        }

        groupedAwards[row.eventID].awards.push({
          awardId: row.awardId,
          total_submissions_per_award: row.total_submissions_per_award
        });
      });

      const finalResult = Object.keys(groupedAwards).map(eventId => ({
        eventId: parseInt(eventId, 10),
        event_name: groupedAwards[eventId].event_name,
        total_submissions_per_event: groupedAwards[eventId].total_submissions_per_event,
        awards: groupedAwards[eventId].awards
      }));

      resolve(finalResult);
    });
  });
}



export async function eventPriceGet(created_by, role) {
  const selectSql = `
    SELECT 
      u.id AS userId, 
      ed.eventId, 
      ed.awardcatId, 
      ed.submission_id, 
      ac.category_name, 
      ac.payment_price
    FROM user u
    LEFT JOIN entry_data ed ON u.id = ed.created_by AND u.role = ed.role
    LEFT JOIN awards_category ac ON ed.awardcatId = ac.id
    WHERE ed.is_deleted = 0
      AND u.id = ?
      AND u.role = ?
      AND u.is_deleted = 0
  `;

  try {
    const result = await new Promise((resolve, reject) => {
      db.query(selectSql, [created_by, role], (fetchError, results) => {
        if (fetchError) {
          console.log("fetchError", fetchError);
          return reject(fetchError);
        }
        resolve(results);
      });
    });

    if (result.length === 0) {
      throw new Error("No data found");
    }

    const groupedResults = {};

    result.forEach(row => {
      if (!groupedResults[row.eventId]) {
        groupedResults[row.eventId] = {
          eventId: row.eventId,
          totalPrice: 0,
          awards: [],
        };
      }

      const existingAward = groupedResults[row.eventId].awards.find(award => award.submissionId === row.submission_id);

      if (!existingAward) {
        groupedResults[row.eventId].awards.push({
          awardId: row.awardcatId,
          awardCategoryName: row.category_name,
          paymentPrice: row.payment_price,
          submissionId: row.submission_id
        });
        groupedResults[row.eventId].totalPrice += row.payment_price;
      }
    });

    const finalResults = Object.values(groupedResults);

    return finalResults;

  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export const getUserSubmissionData = (eventId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        ac.id AS category_id,
        ac.category_name,
        COUNT(DISTINCT e.submission_id) AS total_submissions,  -- Unique submissions count
        COALESCE(SUM(DISTINCT ac.payment_price), 0) AS total_payment -- Sum price only once per submission
      FROM entry_data e
      LEFT JOIN awards_category ac ON e.awardcatId = ac.id
      WHERE e.eventId = ? 
      AND e.created_by = ? 
      AND e.is_deleted = 0
      AND e.paymentstatus != 'paid'
      GROUP BY ac.id, ac.category_name;
    `;

    db.query(query, [eventId, userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export const PaymentType = (eventId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        pg.id AS payment_gateway_id,
        pg.gateway_type,
        pg.api_key,
        pg.api_secret,
        pg.currency_type,
        pg.tax_type,
        pg.vat_percentage
      FROM payment_gateways pg
      WHERE pg.eventid = ?
    `;

    db.query(query, [eventId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

export const getPendingOrderDetails = async (eventid, userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT en.id AS entry_id, en.submission_id, en.paymentstatus,  
              u.first_name, u.last_name, u.email, 
              e.event_name AS event_name, e.event_logo AS logo 
       FROM entry_data en
       JOIN user u ON en.created_by = u.id
       JOIN event_details e ON en.eventid = e.id
       WHERE en.eventid = ? AND en.paymentstatus = 'unpaid' AND en.created_by = ?`, 
      [eventid, userId],
      (error, results) => {
        if (error) {
          console.error("❌ Database Error in getPendingOrderDetails:", error);
          reject(error);
        } else if (results.length === 0) {
          console.warn(`⚠️ No unpaid entries found for eventId: ${eventid}, userId: ${userId}`);
          resolve(null);  // ✅ Return `null` if no matching data
        } else {
          console.log("✅ Query Success - Pending Order Details:", results);
          resolve(results[0]); // Return the first matching record
        }
      }
    );
  });
};



// Send Pending Payment Email
export const sendPendingPaymentEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Replace with your SMTP server
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // SMTP username
      pass: process.env.SMTP_PASS, // SMTP password
    },
  });
console.log("order", order)
  const emailHTML = `
    <div>
<img src="https://judgify-api.phanomprofessionals.com/uploads/${order.logo}" alt="Event Logo" width="100">
      <h2>${order.event_name}</h2>
      <p><a href="https://awardsuite.in/">Click here to complete the payment</a></p>
      <h2>Nomination Details </h2>
      <p>Submission ID: ${order.submission_id}</p>
      <p>Entry ID: ${order.entry_id}</p>
       <p>Payment Status ${order.paymentstatus}</p>
      <p>If you have any questions, feel free to reach out.</p>
      <br>
      <p>Best regards,<br>Your Team</p>
    </div>
  `;

  const mailOptions = {
    from: "online@awardsuite.in",
    to: order.email,
    subject: "Pending Payment Notification",
    html: emailHTML,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response); // Debugging
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export function GetUserSubmission(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(DISTINCT submission_id) AS total_events
      FROM entry_data
      WHERE created_by = ? AND is_deleted = 0
    `;

    db.query(query, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      console.log("result", result);
      resolve(result[0]); // result[0].total_submissions will give the count
    });
  });
}

export function UserPaymentsGet(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.id,
        o.order_id,
        o.amount,
        o.currency,
        o.status,
        o.created_at,
        o.awardId,
        o.eventid,
        o.userid,
        u.first_name,
        u.last_name,
        e.id AS eventId,
        e.event_name
      FROM orders o
      JOIN user u ON o.userid = u.id
      JOIN  event_details e ON o.eventid = e.id
      WHERE o.userid = ? AND o.is_deleted = 0
    `;

    db.query(query, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      console.log("result", result);
      resolve(result); // return full array, not just result[0]
    });
  });
}

export function UserProfileget(userId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        * 
      FROM user 
      WHERE id = ?
    `;

    db.query(query, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      console.log("result", result);
      resolve(result); // return full array, not just result[0]
    });
  });
}

// export function GetUserSubmissionList(userId) {
//   return new Promise((resolve, reject) => {
//     // Step 1: Fetch all submission data
//     const submissionQuery = `
//       SELECT submission_id, field_name, field_value, eventId
//       FROM entry_data
//       WHERE created_by = 29 AND is_deleted = 0
//       ORDER BY eventId, submission_id
//     `;
//     db.query(submissionQuery, [userId], (err, submissionResults) => {
//       if (err) {
//         return reject(err);
//       }

//       if (submissionResults.length === 0) {
//         return resolve({
//           status: true,
//           message: "No Submissions Found",
//           data: [],
//         });
//       }

//       // Step 2: Group submissions by eventId and submission_id
//       const eventMap = {};

//       submissionResults.forEach(({ submission_id, field_name, field_value, eventId }) => {
//         if (!eventMap[eventId]) {
//           eventMap[eventId] = {};
//         }
//         if (!eventMap[eventId][submission_id]) {
//           eventMap[eventId][submission_id] = {};
//         }
//         eventMap[eventId][submission_id][field_name] = field_value;
//       });

//       const eventIds = Object.keys(eventMap);

//       // Step 3: Fetch form schemas for all eventIds
//       const formQuery = `
//         SELECT eventId, form_schema
//         FROM entry_form
//         WHERE eventId IN (?)
//         AND is_deleted = 0
//       `;

//       db.query(formQuery, [eventIds], (formErr, formResults) => {
//         if (formErr) {
//           return reject(formErr);
//         }

//         const formMap = {};
//         formResults.forEach(({ eventId, form_schema }) => {
//           try {
//             const parsedSchema = JSON.parse(form_schema);

//             // Extract only dataName and label from each form field
//             const cleanedSchema = parsedSchema.map((field) => ({
//               dataName: field.dataName,
//               label: field.label,
//             }));

//             formMap[eventId] = cleanedSchema;
//           } catch (jsonErr) {
//             console.error(`Invalid JSON for eventId ${eventId}`, jsonErr);
//             formMap[eventId] = [];
//           }
//         });

//         // Step 4: Prepare the final structured response
//         const finalData = eventIds.map((eventId) => ({
//           eventId,
//           headers: formMap[eventId] || [],
//           submissions: Object.entries(eventMap[eventId]).map(([submission_id, fields]) => ({
//             submission_id,
//             fields,
//           })),
//         }));

//         resolve(
//          finalData);
//       });
//     });
//   });
// }

// export function GetUserSubmissionList(userId) {
//   return new Promise((resolve, reject) => {
//     // Step 1: Fetch all submission data
//     const submissionQuery = `
//       SELECT submission_id, field_name, field_value, eventId
//       FROM entry_data
//       WHERE created_by = ? AND is_deleted = 0
//       ORDER BY eventId, submission_id
//     `;

//     db.query(submissionQuery, [userId], (err, submissionResults) => {
//       if (err) {
//         return reject(err);
//       }

//       if (submissionResults.length === 0) {
//         return resolve({
//           status: true,
//           message: "No Submissions Found",
//           data: [],
//         });
//       }

//       // Step 2: Group submissions by eventId and submission_id
//       const eventMap = {};

//       submissionResults.forEach(({ submission_id, field_name, field_value, eventId }) => {
//         if (!eventMap[eventId]) {
//           eventMap[eventId] = {};
//         }
//         if (!eventMap[eventId][submission_id]) {
//           eventMap[eventId][submission_id] = {};
//         }
//         eventMap[eventId][submission_id][field_name] = field_value;
//       });

//       const eventIds = Object.keys(eventMap);

//       // Step 3: Fetch form schemas + event_name + is_ediit_entry
//       const formQuery = `
//         SELECT ef.eventId, ef.form_schema, ed.event_name, ed.is_ediit_entry,ed.is_withdrawal
//         FROM entry_form ef
//         JOIN event_details ed ON ef.eventId = ed.id
//         WHERE ef.eventId IN (?) AND ef.is_deleted = 0 AND ed.is_deleted = 0
//       `;

//       db.query(formQuery, [eventIds], (formErr, formResults) => {
//         if (formErr) {
//           return reject(formErr);
//         }

//         const formMap = {};
//         const eventInfoMap = {}; // for event_name and is_ediit_entry

//         formResults.forEach(({ eventId, form_schema, event_name, is_ediit_entry, is_withdrawal }) => {
//           try {
//             const parsedSchema = JSON.parse(form_schema);

//             // Extract only dataName and label from each form field
//             const cleanedSchema = parsedSchema.map((field) => ({
//               dataName: field.dataName,
//               label: field.label,
//             }));

//             formMap[eventId] = cleanedSchema;
//             eventInfoMap[eventId] = { event_name, is_ediit_entry, is_withdrawal };
//           } catch (jsonErr) {
//             console.error(`Invalid JSON for eventId ${eventId}`, jsonErr);
//             formMap[eventId] = [];
//             eventInfoMap[eventId] = { event_name, is_ediit_entry, is_withdrawal };
//           }
//         });

//         // Step 4: Prepare the final structured response
//         const finalData = eventIds.map((eventId) => ({
//           eventId,
//           event_name: eventInfoMap[eventId]?.event_name || '',
//           is_ediit_entry: eventInfoMap[eventId]?.is_ediit_entry || 0,
//           is_withdrawal: eventInfoMap[eventId]?.is_withdrawal || 0,
//           headers: formMap[eventId] || [],
//           submissions: Object.entries(eventMap[eventId]).map(([submission_id, fields]) => ({
//             submission_id,
//             fields,
//           })),
//         }));

//         return resolve(finalData);
//       });
//     });
//   });
// }
export function GetUserSubmissionList(userId) {
  return new Promise((resolve, reject) => {
    // Step 1: Fetch all submission data
    const submissionQuery = `
      SELECT submission_id, field_name, field_value, eventId
      FROM entry_data
      WHERE created_by = ? AND is_deleted = 0
      ORDER BY eventId, submission_id
    `;

    db.query(submissionQuery, [userId], (err, submissionResults) => {
      if (err) return reject(err);

      if (submissionResults.length === 0) {
        return resolve({
          status: true,
          message: "No Submissions Found",
          data: [],
        });
      }

      // Group data by eventId and submission_id
      const eventMap = {};
      submissionResults.forEach(({ submission_id, field_name, field_value, eventId }) => {
        if (!eventMap[eventId]) eventMap[eventId] = {};
        if (!eventMap[eventId][submission_id]) eventMap[eventId][submission_id] = {};
        eventMap[eventId][submission_id][field_name] = field_value;
      });

      const eventIds = Object.keys(eventMap);

      // Step 2: Fetch form schema and event details + form_id
      const formQuery = `
        SELECT ef.id AS form_id, ef.eventId, ef.form_schema, ed.event_name, ed.is_ediit_entry, ed.is_withdrawal
        FROM entry_form ef
        JOIN event_details ed ON ef.eventId = ed.id
        WHERE ef.eventId IN (?) AND ef.is_deleted = 0 AND ed.is_deleted = 0
      `;

      db.query(formQuery, [eventIds], (formErr, formResults) => {
        if (formErr) return reject(formErr);

        const formMap = {};
        const eventInfoMap = {};

        formResults.forEach(({ eventId, form_schema, event_name, is_ediit_entry, is_withdrawal, form_id }) => {
          try {
            const parsedSchema = JSON.parse(form_schema);
            formMap[eventId] = parsedSchema.map(({ dataName, label }) => ({ dataName, label }));
            eventInfoMap[eventId] = { event_name, is_ediit_entry, is_withdrawal, form_id };
          } catch (e) {
            formMap[eventId] = [];
            eventInfoMap[eventId] = { event_name, is_ediit_entry, is_withdrawal, form_id };
          }
        });

        // Step 3: Fetch related media files (only those with submission_id NOT NULL)
        const mediaQuery = `
          SELECT id, field_name, file_key, file_name, mime_type, event_id, form_id, user_id, submission_id
          FROM media_files
          WHERE user_id = ? AND submission_id IS NOT NULL
        `;

        db.query(mediaQuery, [userId], (mediaErr, mediaResults) => {
          if (mediaErr) return reject(mediaErr);

          const mediaMap = {};
          for (const media of mediaResults) {
            const { submission_id, event_id } = media;

            // Add full S3 URL inside each media object
            const fullMedia = {
              ...media,
              file_url: `https://awardsuite-mediabucket.s3.ap-south-1.amazonaws.com/${media.field_name}`,
            };

            if (!mediaMap[event_id]) mediaMap[event_id] = {};
            if (!mediaMap[event_id][submission_id]) mediaMap[event_id][submission_id] = [];
            mediaMap[event_id][submission_id].push(fullMedia);
          }

          // Step 4: Final structure
          const finalData = eventIds.map((eventId) => ({
            eventId,
            form_id: eventInfoMap[eventId]?.form_id || null,
            event_name: eventInfoMap[eventId]?.event_name || '',
            is_ediit_entry: eventInfoMap[eventId]?.is_ediit_entry || 0,
            is_withdrawal: eventInfoMap[eventId]?.is_withdrawal || 0,
            headers: formMap[eventId] || [],
            submissions: Object.entries(eventMap[eventId]).map(([submission_id, fields]) => ({
              submission_id,
              fields,
              media_files: mediaMap[eventId]?.[submission_id] || [],
            })),
          }));

          return resolve({
            status: true,
            message: "Data Fetched Successfully",
            data: finalData,
          });
        });
      });
    });
  });
}





export function deleteShortlistData(eventId, submissionId) {
  return new Promise((resolve, reject) => {
    const deleteShortlistQuery = `
      DELETE FROM shortlist_data
      WHERE eventId = ? AND submission_id = ?
    `;

    const deleteEntryQuery = `
      DELETE FROM entry_data
      WHERE eventId = ? AND submission_id = ?
    `;

    // Delete from shortlist_data first
    db.query(deleteShortlistQuery, [eventId, submissionId], (err1, shortlistResult) => {
      if (err1) return reject(err1);

      // Then delete from entry_data
      db.query(deleteEntryQuery, [eventId, submissionId], (err2, entryResult) => {
        if (err2) return reject(err2);

        const shortlistDeleted = shortlistResult.affectedRows;
        const entryDataDeleted = entryResult.affectedRows;

        // If both are 0 → nothing deleted
        if (shortlistDeleted === 0 && entryDataDeleted === 0) {
          return reject(new Error("No matching records found to delete"));
        }

        // If any one deleted → success
        resolve({
          message: "Records deleted successfully",
          shortlistDeleted,
          entryDataDeleted
        });
      });
    });
  });
}

