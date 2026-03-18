import express from "express";
import {getOrderUserKeys, PaymentgetforEvent, savePaymentGateway, verifyPayment, verifyPayment1} from '../controller/paymentController.js'
import { getCoupon } from "../controller/adminController.js";
import authenticate from '../middleware/authentication.js'
import connection from "../database/connection.js";
import Stripe from  'stripe';
import { decrypt } from "../utils/cryptoHelper.js";


const router = express.Router();

router.post("/create-order",authenticate, verifyPayment1);
router.post("/verify-payment",authenticate, verifyPayment);


router.get("/getOrder/:eventId",authenticate, PaymentgetforEvent);


router.get("/orderlistforevent/:eventId", getOrderUserKeys);


router.post("/save-payment-gateway",authenticate, savePaymentGateway);


router.post('/create-orders',authenticate, async (req, res) => {
  const  userid  = req.user.id;
  const { amount, awardId, eventid ,currency} = req.body;
  const orderId = `order_${Date.now()}`;

  try {
    const insertQuery = `
      INSERT INTO orders (order_id, amount, currency, status, created_at, awardId, eventid, is_deleted, userid)
      VALUES (?, ?, ?, 'created', NOW(), ?, ?, 0, ?)
    `;
    await connection.query(insertQuery, [orderId, amount,currency, awardId, eventid, userid]);

    res.json({ orderId });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});


function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

router.post('/stripe-payment-intent', authenticate, async (req, res) => {
  const userid = req.user.id;
  const { amount, orderId, eventid, currency } = req.body;

  try {
    const rows = await queryAsync(`
      SELECT api_secret FROM payment_gateways 
      WHERE eventid = ? AND gateway_type = 'stripe' AND is_active = 1
    `, [eventid]);

    if (!rows.length) return res.status(404).json({ error: 'Stripe credentials not found' });

    const encryptedSecret = rows[0].api_secret;
    const stripeSecret = decrypt(encryptedSecret);

    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency, // now coming from req.body
      description: `Payment for order ID ${orderId}`,
      metadata: { orderId, eventid, userid }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe Payment Error:', err);
    res.status(500).json({ error: 'Stripe Payment Error' });
  }
});



router.get('/stripe-publishable-key', (req, res) => {
  const { eventid } = req.query;

  connection.query(
    'SELECT api_key FROM payment_gateways WHERE eventid = ? AND gateway_type = "stripe" AND is_active = 1 LIMIT 1',
    [eventid],
    (error, results) => {
      if (error) return res.status(500).json({ error: 'DB Error' });

      if (results.length === 0) return res.status(404).json({ error: 'Public key not found' });

      const decryptedKey = decrypt(results[0].api_key);
      return res.json({ publicKey: decryptedKey });
    }
  );
});


router.get('/razorpay-publishable-key', (req, res) => {
  const { eventid } = req.query;

  connection.query(
    'SELECT api_key FROM payment_gateways WHERE eventid = ? AND gateway_type = "razorpay" AND is_active = 1 LIMIT 1',
    [eventid],
    (error, results) => {
      if (error) return res.status(500).json({ error: 'DB Error' });

      if (results.length === 0) return res.status(404).json({ error: 'Public key not found' });

      const decryptedKey = decrypt(results[0].api_key);
      return res.json({ publicKey: decryptedKey });
    }
  );
});

// // Create order and return orderId
// router.post('/create-orders', async (req, res) => {
//   const { amount, awardId, eventid, userid } = req.body;

//   const orderId = `order_${Date.now()}`;

//   const insertQuery = `
//     INSERT INTO orders (order_id, amount, currency, status, created_at, awardId, eventid, is_deleted, userid)
//     VALUES (?, 200, 'INR', 'created', NOW(), 1, 1, 0, 1)
//   `;

//   await connection.query(insertQuery, [orderId, amount, awardId, eventid, userid]);

//   res.json({ orderId });
// });
// // router.post('/stripe-payment-intent', async (req, res) => {
// //   const { amount, orderId } = req.body;

// //   try {
// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount:200, // in paisa
// //       currency: 'INR',
// //       description: 'Payment for order ID ' + orderId, // ✅ add this line
// //       metadata: { orderId,
// //         eventid:"1"
// //        },
// //     });

// //     res.json({ clientSecret: paymentIntent.client_secret });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: 'Stripe Payment Error' });
// //   }
// // });


// router.post('/stripe-payment-intent', async (req, res) => {
//   const { amount, orderId, eventid } = req.body;

//   try {
//     // Step 1: Fetch Stripe secret key dynamically
//     const [rows] = await connection.query(`
//       SELECT api_secret FROM payment_gateways 
//       WHERE eventid = ? AND gateway_type = 'stripe' AND is_active = 1
//     `, [eventid]);

//     if (!rows.length) {
//       return res.status(404).json({ error: 'Stripe credentials not found' });
//     }

//     // Step 2: Decrypt the Stripe secret key (if encrypted)
//     const encryptedSecret = rows[0].api_secret;
//     const stripeSecret = decrypt(encryptedSecret); // your decryption function

//     // Step 3: Create a Stripe instance with dynamic key
//     const stripe = new Stripe(stripeSecret, {
//       apiVersion: '2023-10-16', // always good to lock in an API version
//     });

//     // Step 4: Create payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount, // make sure this is in paisa (e.g., ₹2.00 = 200)
//       currency: 'INR',
//       description: `Payment for order ID ${orderId}`,
//       metadata: {
//         orderId,
//         eventid,
//       },
//     });

//     res.json({ clientSecret: paymentIntent.client_secret });
//   } catch (err) {
//     console.error('Stripe Payment Error:', err);
//     res.status(500).json({ error: 'Stripe Payment Error' });
//   }
// });

export default router