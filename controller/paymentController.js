import Razorpay from "razorpay";
import crypto  from "crypto";
import connection from "../database/connection.js";
import dotenv from 'dotenv';
import { checkeventId, Couponget } from "../service/adminService.js";
dotenv.config();
import { encrypt, decrypt } from "../utils/cryptoHelper.js";
import { validateRazorpayKeys, validateStripeKeys } from "../utils/gatewayValidator.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order
// export default createOrderss = (req, res) => {
//   const { amount, currency = "INR" } = req.body;

//   razorpay.orders.create(
//     { amount: amount * 100, currency, payment_capture: 1 },
//     (error, order) => {
//       if (error) return res.status(500).json({ success: false, error: error.message });

//       connection.query(
//         "INSERT INTO orders (order_id, amount, currency, status) VALUES (?, ?, ?, ?)",
//         [order.id, amount, currency, "created"],
//         (dbError) => {
//           if (dbError) return res.status(500).json({ success: false, error: dbError.message });

//           res.json({ success: true, order });
//         }
//       );
//     }
//   );
// };

// ✅ Verify Payment
// export const verifyPayment = (req, res) => {
//   const userid = req.user.id;
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;

//   console.log("Received payment verification request:", req.body);

//   const generated_signature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest("hex");

//   if (generated_signature !== razorpay_signature) {
//     console.error("Signature mismatch: Payment verification failed.");
//     return res.status(400).json({ success: false, message: "Payment verification failed" });
//   }

//   // Update orders table (Ensure status column is VARCHAR)
//   connection.query(
//     "UPDATE orders SET status = ? WHERE order_id = ?",
//     ["paid", razorpay_order_id],
//     (error, result) => {
//       if (error) {
//         console.error("Error updating orders table:", error.message);
//         return res.status(500).json({ success: false, error: error.message });
//       }

//       console.log("Orders table updated successfully:", result);

//       // Corrected SQL Query Syntax
//       connection.query(
//         "UPDATE entry_data SET paymentstatus = ? WHERE created_by = ? AND eventid = ?",
//         ["paid", userid, eventId],
//         (error, result) => {
//           if (error) {
//             console.error("Error updating entry_data table:", error.message);
//             return res.status(500).json({ success: false, error: error.message });
//           }

//           console.log("Entry data updated successfully:", result);
//           res.json({ success: true, message: "Payment verified successfully" });
//         }
//       );
//     }
//   );
// };

export const verifyPayment = (req, res) => {
  const userid = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;

  console.log("Received payment verification request:", req.body);

  const getGatewayQuery = `
    SELECT api_secret FROM payment_gateways 
    WHERE eventid = ? AND gateway_type = 'razorpay' AND is_active = 1 LIMIT 1
  `;

  connection.query(getGatewayQuery, [eventId], (err, results) => {
    if (err || !results.length) {
      console.error("Failed to get Razorpay secret:", err);
      return res.status(500).json({ success: false, message: "Payment gateway secret not found" });
    }

    let decryptedSecret;
    try {
      decryptedSecret = decrypt(results[0].api_secret);
    } catch (decryptionError) {
      console.error("Decryption Error:", decryptionError.message);
      return res.status(500).json({ success: false, message: "Decryption failed" });
    }

    const generated_signature = crypto
      .createHmac("sha256", decryptedSecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Generated Signature:", generated_signature);
    console.log("Provided Signature:", razorpay_signature);

    if (generated_signature !== razorpay_signature) {
      console.error("Signature mismatch: Payment verification failed.");
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Update orders table
    connection.query(
      "UPDATE orders SET status = ? WHERE order_id = ?",
      ["paid", razorpay_order_id],
      (error, result) => {
        if (error) {
          console.error("Error updating orders table:", error.message);
          return res.status(500).json({ success: false, error: error.message });
        }

        console.log("Orders table updated successfully:", result);

        connection.query(
          "UPDATE entry_data SET paymentstatus = ? WHERE created_by = ? AND eventid = ?",
          ["paid", userid, eventId],
          (error, result) => {
            if (error) {
              console.error("Error updating entry_data table:", error.message);
              return res.status(500).json({ success: false, error: error.message });
            }

            console.log("Entry data updated successfully:", result);
            res.json({ success: true, message: "Payment verified successfully" });
          }
        );
      }
    );
  });
};


// export const verifyPayment1 = (req, res) => {
//   const userid = req.user.id;
//  const { amount, currency = "INR" ,awardId,eventId} = req.body;
// console.log("verifybody"  ,req.body)
//     razorpay.orders.create(
//       { amount: amount * 100, currency, payment_capture: 1 },
//       (error, order) => {
//         if (error) return res.status(500).json({ success: false, error: error.message });
  
//         connection.query(
//           "INSERT INTO orders (order_id, amount, currency, status,awardId,eventid,userid) VALUES (?, ?, ?, ?, ?, ?,?)",
//           [order.id, amount, currency, "created",awardId,eventId,userid],
//           (dbError) => {
//             if (dbError) return res.status(500).json({ success: false, error: dbError.message });
  
//             res.json({ success: true, order });
//           }
//         );
//       }
//     );
//   };

export const verifyPayment1 = async (req, res) => {
  const userid = req.user.id;
  const { amount, currency = "INR", awardId, eventId } = req.body;

  if (!amount || !awardId || !eventId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: amount, awardId or eventId.",
    });
  }

  console.log("verifybody", req.body);

  // Step 1: Get payment gateway config from DB
  const getGatewayQuery = `
    SELECT api_key, api_secret 
    FROM payment_gateways 
    WHERE eventid = ? AND gateway_type = 'razorpay' AND is_active = 1
    LIMIT 1
  `;

  connection.query(getGatewayQuery, [eventId], (err, results) => {
    if (err || !results.length) {
      console.error("Gateway Fetch Error:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to retrieve payment gateway credentials.",
      });
    }

    // Step 2: Decrypt credentials
    let decryptedKey, decryptedSecret;
    try {
      decryptedKey = decrypt(results[0].api_key);
      decryptedSecret = decrypt(results[0].api_secret);
    } catch (decryptionError) {
      console.error("Decryption Error:", decryptionError);
      return res.status(500).json({
        success: false,
        message: "Failed to decrypt payment credentials.",
      });
    }

    // Step 3: Initialize Razorpay dynamically
    const razorpay = new Razorpay({
      key_id: decryptedKey,
      key_secret: decryptedSecret,
    });

    // Step 4: Create Razorpay order
    razorpay.orders.create(
      { amount: amount * 100, currency, payment_capture: 1 },
      (error, order) => {
        if (error) {
          console.error("Razorpay Order Creation Error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order.",
            error: error.message,
          });
        }

        // Step 5: Save order to database
        const insertQuery = `
          INSERT INTO orders (order_id, amount, currency, status, awardId, eventid, userid)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(
          insertQuery,
          [order.id, amount, currency, "created", awardId, eventId, userid],
          (dbError) => {
            if (dbError) {
              console.error("Database Insertion Error:", dbError);
              return res.status(500).json({
                success: false,
                message: "Failed to save order in the database.",
                error: dbError.message,
              });
            }

            return res.status(200).json({
              success: true,
              message: "Order created successfully.",
              order,
            });
          }
        );
      }
    );
  });
};

  export function EventPaymentGet(eventId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          o.*, 
          u.id AS user_id, 
          u.first_name	 AS firstname, 
          u.last_name AS lastname,
          u.email AS user_email
        FROM orders o
        LEFT JOIN user u ON o.userid = u.id
        WHERE o.eventid = ? AND o.is_deleted = 0
      `;
  
      connection.query(query, [eventId], (err, results) => {
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
  

  export const PaymentgetforEvent = async (req, res) => {
    const { role } = req.user;
  
    if (role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Unauthorized access.",
      });
    }
  
    const { eventId } = req.params;
  
    if (!eventId) {
      return res.status(400).json({ status: false, message: "Provide Event ID." });
    }
  
    // Ensure eventId exists in the database
    const eventIdCheck = await checkeventId(eventId);
    if (!eventIdCheck) {
      return res.status(404).json({
        status: false,
        message: "Invalid Event ID.",
      });
    }
  
    try {
      const result = await EventPaymentGet(eventId);
  
      return res.status(200).json({
        status: true,
        message: "Coupons retrieved successfully.",
        data: result,  // Return actual coupon data
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  };


  export function getOrderUserData(eventId) {
    return new Promise((resolve, reject) => {
      // Query to get column names dynamically
      const columnQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME IN ('orders', 'user') 
        AND TABLE_SCHEMA = DATABASE()
      `;
  
      connection.query(columnQuery, (err, columnResults) => {
        if (err) {
          return reject(new Error("Database Error: " + err.message));
        }
  
        const columnNames = columnResults.map(row => row.COLUMN_NAME);
  
        // Query to fetch actual order data filtered by eventId
        const dataQuery = `
          SELECT 
            o.id AS order_id, o.order_id, o.amount, o.currency, o.status, o.created_at, 
            o.awardId, o.eventid, o.is_deleted, o.userid,
            u.first_name, u.last_name, u.email, u.mobile_number
          FROM orders o
          LEFT JOIN user u ON o.userid = u.id
          WHERE o.eventid = ? AND o.is_deleted = 0
        `;
  
        connection.query(dataQuery, [eventId], (err, dataResults) => {
          if (err) {
            return reject(new Error("Database Error: " + err.message));
          }
  
          resolve({
            columns: columnNames,
            data: dataResults
          });
        });
      });
    });
  }
  
  export const getOrderUserKeys = async (req, res) => {
    const eventId = req.params.eventId;
    if (!eventId) {
      return res.status(400).json({ success: false, message: "Event ID is required" });
    }
    try {
      const columns = await getOrderUserData(eventId);
      return res.status(200).json({
        success: true,
        message: "Column names fetched successfully",
        data: columns,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
  export const saveGatewayDetails = (userid, eventid, gateway_type, api_key, api_secret, webhook, status,currency_type,tax_type,vat_percentage) => {
    return new Promise((resolve, reject) => {
      const encryptedApiKey = api_key ? encrypt(api_key) : null;
      const encryptedApiSecret = api_secret ? encrypt(api_secret) : null;
  
      const deleteSql = `DELETE FROM payment_gateways WHERE userid = ? AND eventid = ?`;
      const insertSql = `
        INSERT INTO payment_gateways (userid, eventid, gateway_type, api_key, api_secret, webhook, status,currency_type,tax_type,vat_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      connection.query(deleteSql, [userid, eventid], (deleteErr) => {
        if (deleteErr) return reject(new Error("Error deleting previous record: " + deleteErr.message));
  
        connection.query(
          insertSql,
          [userid, eventid, gateway_type || null, encryptedApiKey, encryptedApiSecret, webhook || null, status,currency_type,tax_type,vat_percentage || null],
          (insertErr, result) => {
            if (insertErr) return reject(new Error("Error inserting new record: " + insertErr.message));
            resolve(result);
          }
        );
      });
    });
  };
  
  export const savePaymentGateway = async (req, res) => {
    const userid = req.user.id;
    const { gateway_type, api_key, api_secret, eventid, webhook, status,currency_type,tax_type,vat_percentage } = req.body;
  
    // If status is NOT 'free', check for required fields
    if (status !== "free") {
      if (!gateway_type || !api_key || !api_secret || !eventid,!currency_type,!tax_type) {
        return res.status(400).json({ status: false, message: "All required fields are not provided." });
      }
  
      let isValid = false;
  
      if (gateway_type === "stripe") {
        isValid = await validateStripeKeys(api_key, api_secret); // Validate both keys
      } else if (gateway_type === "razorpay") {
        isValid = await validateRazorpayKeys(api_key, api_secret);
      }
  
      if (!isValid) {
        return res.status(400).json({ status: false, message: "Invalid gateway credentials." });
      }
    }
  
    try {
      await saveGatewayDetails(userid, eventid, gateway_type, api_key, api_secret, webhook, status,currency_type,tax_type,vat_percentage);
      return res.status(200).json({ status: true, message: "Payment gateway saved successfully." });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  };
  