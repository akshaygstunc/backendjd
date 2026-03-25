import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import admin from './routes/adminRoutes.js'
import user from './routes/userRoutes.js'
import judge from './routes/judgeRoutes.js'
import { fileURLToPath } from "url";
import resposne from "./middleware/resposne.js";
import { getEventByUniqueUrlKey, getEventGeneral } from "./service/adminService.js";
import authenticate from "./middleware/authentication.js"
import { validatefilterCategory } from "./validation/AdminValidation.js";
import { Awardsget } from "./controller/adminController.js";

import paymentRoutes from './routes/paymnetRoutes.js'
import connection from "./database/connection.js";
import uploadRoutes from "./aws/uploadRoutes.js";
import templateRoutes from "./routes/template.routes.js"
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();


import Stripe from 'stripe';
import { decrypt } from "./utils/cryptoHelper.js";
// ✅ Register webhook route with raw body BEFORE express.json()

// ⚠️ Register this BEFORE express.json() to handle raw body for Stripe
app.post('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.body.toString('utf8');
  console.log("Received webhook event:", rawBody);

  let event;
  let metadata;

  try {
    const parsed = JSON.parse(rawBody);
    metadata = parsed?.data?.object?.metadata;
    const eventid = metadata?.eventid;
    const userid = metadata?.userid;

    if (!eventid) {
      return res.status(400).json({ error: 'Missing eventid in metadata' });
    }

    // 👉 Get webhook & encrypted secret key from DB
    const paymentGatewayData = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT webhook, api_secret FROM payment_gateways WHERE eventid = ? AND gateway_type = 'stripe' AND is_active = 1",
        [eventid],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (!paymentGatewayData.length || !paymentGatewayData[0].webhook || !paymentGatewayData[0].api_secret) {
      return res.status(404).json({ error: 'Stripe configuration not found for eventid' });
    }

    const endpointSecret = paymentGatewayData[0].webhook;

    // 🔐 Decrypt Stripe secret key
    let decryptedSecretKey;
    try {
      decryptedSecretKey = decrypt(paymentGatewayData[0].api_secret);
    } catch (decryptionError) {
      console.error("Decryption failed:", decryptionError);
      return res.status(500).json({ error: "Failed to decrypt Stripe secret key" });
    }

    // ✅ Initialize Stripe with decrypted key
    const stripe = new Stripe(decryptedSecretKey, {
      apiVersion: '2023-10-16',
    });

    // ✅ Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        // ✅ Update orders table
        await new Promise((resolve, reject) => {
          connection.query(
            "UPDATE orders SET status = 'paid', amount = ? WHERE order_id = ?",
            [paymentIntent.amount, orderId],
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });

        console.log(`✅ Order ${orderId} updated to 'paid'`);

        // ✅ Update entry_data table
        await new Promise((resolve, reject) => {
          connection.query(
            `UPDATE entry_data SET paymentstatus = 'paid' WHERE eventId = ? AND created_by = ?`,
            [eventid, userid],
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });

        console.log(`✅ entry_data updated to 'paid' for eventid ${eventid}, user ${userid}`);
      }
    }

    res.json({ received: true });

  } catch (err) {
    console.error(`⚠️ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});



// Allow large JSON bodies
app.use(express.json({ limit: "10mb" }));

// Allow urlencoded forms with many fields (>100)
app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 10000
}));

app.use(cors({ origin: true }));





const port = process.env.PORT || 6000;

app.use("/api", uploadRoutes);

app.use('/api/admin', admin)

app.use('/api/user', user)

app.use('/api/judge', judge)

app.use("/api/payments", paymentRoutes);




//--------template routes///////

app.use("/api/templates", templateRoutes);


app.get('/event/:uniqueUrlKey', async (req, res) => {
  const { uniqueUrlKey } = req.params;

  try {
    const result = await getEventByUniqueUrlKey(uniqueUrlKey);

    if (result) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: 'Event not found or is deleted',
      });
    }
  } catch (error) {
    console.log('Error during event fetch:', error);
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
});

app.get('/general', async (req, res) => {
  const { event_url } = req.query;

  try {
    const result = await getEventGeneral(event_url);

    if (result) {
      return res.status(200).json({
        status: resposne.successTrue,
        message: resposne.fetchSuccess,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: resposne.successFalse,
        message: 'Event not found or is deleted',
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: resposne.successFalse,
      message: error.message,
    });
  }
});

app.get('/api/allAwards', authenticate, validatefilterCategory, Awardsget)//* --------  DONE


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server is running on Port:${port}`);
});