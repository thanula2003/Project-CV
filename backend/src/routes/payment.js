// backend/src/routes/payment.js

import express from "express";
import crypto from "crypto";

const router = express.Router();

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;


console.log("MERCHANT_ID:", MERCHANT_ID);
console.log("MERCHANT_SECRET:", MERCHANT_SECRET);
// POST /api/payment/payhere/hash
router.post("/payhere/hash", (req, res, next) => {
  try {
    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured. PAYHERE_MERCHANT_ID or PAYHERE_MERCHANT_SECRET missing." });
    }

    const { order_id, amount, currency } = req.body;
    if (!order_id || !amount || !currency) {
      return res.status(400).json({ error: "order_id, amount, and currency are required." });
    }

    const amountFormatted = parseFloat(amount).toFixed(2);

    const hashedSecret = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(MERCHANT_ID + order_id + amountFormatted + currency + hashedSecret)
      .digest("hex")
      .toUpperCase();

    res.json({ hash, merchant_id: MERCHANT_ID, amount: amountFormatted });
  } catch (err) { next(err); }
});

// POST /api/payment/payhere/notify — PayHere server-to-server callback
router.post("/payhere/notify", express.urlencoded({ extended: true }), (req, res, next) => {
  try {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;

    const hashedSecret = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const localSig = crypto
      .createHash("md5")
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
      .digest("hex")
      .toUpperCase();

    if (localSig === md5sig && status_code === "2") {
      console.log(`✅ Payment confirmed for order ${order_id}`);
      // TODO: mark CV as paid in MongoDB, e.g.:
      // await CV.findByIdAndUpdate(order_id, { paid: true });
    } else {
      console.log(`⚠️  Payment notification mismatch or failure for order ${order_id} (status_code: ${status_code})`);
    }

    res.sendStatus(200);
  } catch (err) { next(err); }
});



export default router;