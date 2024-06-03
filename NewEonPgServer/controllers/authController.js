// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const branchModel = require("../models/branchModel");
const counterModel = require("../models/counterModel");
const finYearModel = require("../models/finYearModel");
const secretKey = process.env.SECRET_KEY;

const register = async (req, res) => {
  const { username, password, IsAdmin } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const upperCaseUsername = username.toUpperCase();

  try {
    const user = await userModel.createUser(
      upperCaseUsername,
      hashedPassword,
      IsAdmin
    );
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.findUserByUsername(username);

    if (!user) {
      return res.status(400).json({ error: "User does not exist !" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.vPassword);

    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Incorrect Passsword" });
    }

    const newToken = jwt.sign({ userId: user.nUserID }, secretKey, {
      expiresIn: "1h",
    });

    await userModel.updateUserToken(user.nUserID, newToken);

    res.json({ userID: user.nUserID, username: user.vUID, token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBranches = async (req, res) => {
  const { username } = req.body;
  try {
    const Branches = await branchModel.findBranchByUsername(username);
    res.status(201).json(Branches);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
const getCounters = async (req, res) => {
  const { vBranchCode, vUID } = req.body;
  try {
    const Counters = await counterModel.findCounterByBranchAndUser(
      vBranchCode,
      vUID
    );
    res.status(201).json(Counters);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const getFinYear = async (req, res) => {
  try {
    const FinYears = await finYearModel.finYearFetch();
    res.status(201).json(FinYears);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  register,
  login,
  getBranches,
  getCounters,
  getFinYear,
};
