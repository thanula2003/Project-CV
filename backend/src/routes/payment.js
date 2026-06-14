// backend/src/routes/payment.js

import express from "express";
import crypto from "crypto";

const router = express.Router();

/**
 * IMPORTANT:
 * Read env INSIDE handlers so it's always available
 * after app.js loads dotenv
 */

function getEnv() {
  const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
  const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

  console.log("PayHere Merchant ID:", MERCHANT_ID);
  console.log("PayHere Secret length:", MERCHANT_SECRET?.length);

  if (!MERCHANT_ID || !MERCHANT_SECRET) {
    throw new Error("Missing PAYHERE env variables");
  }

  return { MERCHANT_ID, MERCHANT_SECRET };
}

// POST /api/payment/payhere/hash
router.post("/payhere/hash", (req, res, next) => {
  try {
    const { MERCHANT_ID, MERCHANT_SECRET } = getEnv();

    const { order_id, amount, currency } = req.body;

    if (!order_id || !amount || !currency) {
      return res.status(400).json({
        error: "order_id, amount, and currency are required.",
      });
    }

    const amountFormatted = parseFloat(amount).toFixed(2);

    const hashedSecret = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(
        MERCHANT_ID +
          order_id +
          amountFormatted +
          currency +
          hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    res.json({
      hash,
      merchant_id: MERCHANT_ID,
      amount: amountFormatted,
    });
  } catch (err) {
    next(err);
  }
});

// PayHere notify
router.post(
  "/payhere/notify",
  express.urlencoded({ extended: true }),
  (req, res, next) => {
    try {
      const { MERCHANT_ID, MERCHANT_SECRET } = getEnv();

      const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
      } = req.body;

      const hashedSecret = crypto
        .createHash("md5")
        .update(MERCHANT_SECRET)
        .digest("hex")
        .toUpperCase();

      const localSig = crypto
        .createHash("md5")
        .update(
          merchant_id +
            order_id +
            payhere_amount +
            payhere_currency +
            status_code +
            hashedSecret
        )
        .digest("hex")
        .toUpperCase();

      if (localSig === md5sig && status_code === "2") {
        console.log(`✅ Payment confirmed for order ${order_id}`);
      } else {
        console.log(
          `⚠️ Payment mismatch/failure for order ${order_id}`
        );
      }

      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);



export default router;