const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const navRoutes = require("./routes/navRoutes");
const MasterProfileRoutes = require("./routes/pages/Master/MasterProfiles/indexRoutesMP");
const PartyProfileRoutes = require("./routes/pages/Master/PartyProfiles/indexRoutesPartyProfiles");
const SystemSetupRoutes = require("./routes/pages/Master/SystemSetup/indexRoutesSystemSetup");
const MasterMiscellaneousRoutes = require("./routes/pages/Master/Miscellaneous/index");
const TransactionsRoutes = require("./routes/pages/Transactions/index");
const OpeningBalancesRoutes = require("./routes/pages/Miscellaneous/Opening Balances/currencyOpeningBalance");
const DashboardRoutes = require("./routes/pages/Dashboard/index");
const aiRoutes = require('./routes/aiRoutes');
const { csrfMiddleware, getCsrfToken, getCsrfMetrics } = require('./middleware/csrfMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');

const app = express();
const port = process.env.PORT || 5002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS with more specific options
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://192.168.1.107:3000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:15101',
            'https://webeon.onrender.com'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token']
}));

// Parse cookies before CSRF middleware
app.use(cookieParser());

// Security configuration with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3000", "http://192.168.1.107:3000", "http://127.0.0.1:3000","https://web-eon.vercel.app"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(csrfMiddleware);

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/nav", navRoutes);
app.use("/pages/Master/MasterProfiles", MasterProfileRoutes);
app.use("/pages/Master/PartyProfiles", PartyProfileRoutes);
app.use("/pages/Master/SystemSetup", SystemSetupRoutes);
app.use("/pages/Master/Miscellaneous", MasterMiscellaneousRoutes);
app.use("/pages/Transactions", TransactionsRoutes);
app.use("/pages/Miscellaneous/OpeningBalances", OpeningBalancesRoutes);
app.use("/api/dashboard", DashboardRoutes);

app.use(rateLimitMiddleware);

app.use('/api/ai', aiRoutes);

// Test route for security headers
app.get("/test-security", (req, res) => {
  res.json({ message: "Security headers test endpoint" });
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

// CSRF endpoints
app.get('/api/csrf-token', getCsrfToken);
app.get('/api/csrf-metrics', getCsrfMetrics);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
