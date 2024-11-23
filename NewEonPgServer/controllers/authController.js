// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {UserModel} = require("../models/pages/Authentication/UserModel"); 
const {BranchModel} = require("../models/pages/Authentication/BranchModel"); 
const { CounterModel } = require("../models/pages/Authentication/CounterModel");
const { FinYearModel } = require("../models/pages/Authentication/FinYearModel");
const secretKey = process.env.SECRET_KEY;

const register = async (req, res) => {
  const { username, password, IsAdmin, bIsGroup, bActive, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const upperCaseUsername = username.toUpperCase();

  try {
    const user = await UserModel.createUser(
      upperCaseUsername,
      hashedPassword,
      IsAdmin,
      bIsGroup,
      bActive,
      name
    );
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findUserByUsername(username);

    if (!user) {
      return res.status(400).json({ error: "User does not exist !" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.vPassword);

    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Incorrect Passsword" });
    }

    if (user.bActive === false) {
      return res.status(400).json({ error: "User is disabled" });
    }

    const newToken = jwt.sign({ userId: user.nUserID }, secretKey, {
      expiresIn: "1h",
    });

    await UserModel.updateUserToken(user.nUserID, newToken);

    res.json({ user: user, token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBranches = async (req, res) => {
  const { username } = req.body;
  try {
    const Branches = await BranchModel.findBranchByUsername(username);
    res.status(201).json(Branches);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
const getCounters = async (req, res) => {
  const { vBranchCode, vUID, nBranchID, nUserID } = req.body;
  try {
    const Counters = await CounterModel.findCounterByBranchAndUser(
      vBranchCode,
      vUID,
      nBranchID,
      nUserID
    );
    res.status(201).json(Counters);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const getFinYear = async (req, res) => {
  try {
    const FinYears = await FinYearModel.finYearFetch();
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
