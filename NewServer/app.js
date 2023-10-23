const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/master", require("./routes/masterRoutes"));
app.use("/api/nav", require("./routes/navRoutes"));

module.exports = app;
