// ==========================================
// Auditly Pro v3 - Main Server
// ==========================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const apiRoutes = require("./routes/api");
const billingRoutes = require("./routes/billing");
const complianceRoutes = require("./routes/compliance");

const app = express();

const PORT = process.env.PORT || 10000;

// ==========================================
// Middleware
// ==========================================

app.use(cors());

// ==========================================
// Shopify Compliance Webhooks
// IMPORTANT:
// This MUST come before express.json()
// so HMAC verification receives the
// original raw request body.
// ==========================================

app.use(
    "/webhooks/compliance",
    complianceRoutes
);

// ==========================================
// Normal Application Middleware
// ==========================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ==========================================
// Routes
// ==========================================

app.use(
    "/auth",
    authRoutes
);

app.use(
    "/dashboard",
    dashboardRoutes
);

app.use(
    "/api",
    apiRoutes
);

app.use(
    "/billing",
    billingRoutes
);

// ==========================================
// Auditly Pro App Home
// GET /
// ==========================================

app.get("/", (req, res) => {

    const queryString =
        req.originalUrl.includes("?")
            ? req.originalUrl.substring(
                req.originalUrl.indexOf("?")
            )
            : "";

    res.redirect(
        `/dashboard${queryString}`
    );

});

// ==========================================
// Start Server
// ==========================================

app.listen(
    PORT,
    () => {

        console.log("--------------------------------");
        console.log(
            "🚀 Auditly Pro v3 Server Started"
        );
        console.log(
            "Port:",
            PORT
        );
        console.log("--------------------------------");

    }
);
