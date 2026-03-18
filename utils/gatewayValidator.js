// utils/gatewayValidator.js
import Stripe from "stripe";
import Razorpay from "razorpay";

export const validateStripeKeys = async (apiKey, apiSecret) => {
  try {
    const stripe = new Stripe(apiSecret); // Use secret key here
    const balance = await stripe.balance.retrieve();

    if (apiKey.startsWith('pk_') && apiSecret.startsWith('sk_') && balance.object === 'balance') {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
export const validateRazorpayKeys = async (key_id, key_secret) => {
  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const payments = await razorpay.payments.all({ count: 1 });
    return Array.isArray(payments.items);
  } catch {
    return false;
  }
};
