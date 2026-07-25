// backend/src/routes/payment.js

import express from "express";
import crypto from "crypto";

const router = express.Router();

/**
 * IMPORTANT:
 * Read env INSIDE handlers so it's always available
 * after app.js loads dotenv
 */
// ── PayPal config ──────────────────────────────────────────────

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing PAYPAL env variables");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "PayPal auth failed");
  return data.access_token;
}

// POST /api/payment/paypal/create-order
router.post("/paypal/create-order", async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId || `cv-${Date.now()}`,
            description: "ATS Friendly CV - Watermark-free PDF",
            // IMPORTANT: amount is fixed server-side, never trust client input
            amount: { currency_code: "USD", value: "0.30" },
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("PayPal create order error:", data);
      return res.status(500).json({ error: "Failed to create PayPal order" });
    }
    res.json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/payment/paypal/capture-order
router.post("/paypal/capture-order", async (req, res, next) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ error: "orderID is required" });

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("PayPal capture error:", data);
      return res.status(500).json({ error: "Failed to capture PayPal order" });
    }

    console.log(`PayPal order ${orderID} status: ${data.status}`);
    res.json({ status: data.status, details: data });
  } catch (err) {
    next(err);
  }
});

// ── PayHere config ──────────────────────────────────────────────

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