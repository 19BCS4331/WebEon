const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const navRoutes = require("./routes/navRoutes");
const MasterProfileRoutes = require("./routes/pages/Master/MasterProfiles/indexRoutesMP");
const PartyProfileRoutes = require("./routes/pages/Master/PartyProfiles/indexRoutesPartyProfiles");
const SystemSetupRoutes = require("./routes/pages/Master/SystemSetup/indexRoutesSystemSetup");

const app = express();
const port = process.env.PORT || 5002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/nav", navRoutes);
app.use("/pages/Master/MasterProfiles", MasterProfileRoutes);
app.use("/pages/Master/PartyProfiles", PartyProfileRoutes);
app.use("/pages/Master/SystemSetup", SystemSetupRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
