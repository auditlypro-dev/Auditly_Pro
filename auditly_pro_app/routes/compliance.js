const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const SHOPIFY_API_SECRET =
    process.env.SHOPIFY_API_SECRET;

// Verify Shopify HMAC using the RAW request body
function verifyShopifyHmac(req) {

    const hmacHeader =
        req.get("X-Shopify-Hmac-Sha256");

    if (!hmacHeader) {
        return false;
    }

    const rawBody =
        req.body;

    if (!Buffer.isBuffer(rawBody)) {
        return false;
    }

    const calculatedHmac =
        crypto
            .createHmac(
                "sha256",
                SHOPIFY_API_SECRET
            )
            .update(rawBody)
            .digest("base64");

    return crypto.timingSafeEqual(
        Buffer.from(calculatedHmac),
        Buffer.from(hmacHeader)
    );
}


// Handle Shopify compliance webhooks
async function handleComplianceWebhook(req, res) {

    if (!verifyShopifyHmac(req)) {

        console.warn(
            "❌ Invalid Shopify webhook HMAC"
        );

        return res
            .status(401)
            .send("Unauthorized");
    }

    const topic =
        req.get("X-Shopify-Topic");

    let payload = {};

    try {

        payload =
            JSON.parse(
                req.body.toString("utf8")
            );

    } catch (error) {

        console.error(
            "❌ Invalid webhook JSON"
        );

        return res
            .status(400)
            .send("Invalid JSON");
    }


    console.log(
        "✅ Shopify compliance webhook received:",
        topic
    );


    // ------------------------------------------
    // CUSTOMER DATA REQUEST
    // ------------------------------------------

    if (
        topic ===
        "customers/data_request"
    ) {

        console.log(
            "📋 Customer data request received:",
            payload.shop_domain
        );

        // Auditly Pro does not currently
        // store customer/order records.
        // Nothing needs to be exported.

        return res
            .status(200)
            .send("OK");
    }


    // ------------------------------------------
    // CUSTOMER REDACT
    // ------------------------------------------

    if (
        topic ===
        "customers/redact"
    ) {

        console.log(
            "🗑️ Customer redaction request received:",
            payload.shop_domain
        );

        // Auditly Pro does not currently
        // store customer/order records.
        // Nothing needs to be deleted here.

        return res
            .status(200)
            .send("OK");
    }


    // ------------------------------------------
    // SHOP REDACT
    // ------------------------------------------

    if (
        topic ===
        "shop/redact"
    ) {

        console.log(
            "🗑️ Shop redaction request received:",
            payload.shop_domain
        );

        // Shop-level data is stored in Supabase.
        // Actual shop deletion will be handled
        // in the next step.

        return res
            .status(200)
            .send("OK");
    }


    // Unknown compliance topic
    return res
        .status(200)
        .send("OK");
}


module.exports =
    router.post(
        "/",
        express.raw({
            type: "application/json"
        }),
        handleComplianceWebhook
    );
