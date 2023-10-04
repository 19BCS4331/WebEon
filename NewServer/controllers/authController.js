const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Branch = require("../models/Branch");
const Counter = require("../models/Counter");
const Finyear = require("../models/Finyear");
const { SECRET_KEY } = process.env;

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ msg: "User does not exist !" });
    }

    // Assuming your User model has a "password" field as plain text

    if (user.password !== password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    await User.update({ last_login: new Date() }, { where: { username } });

    const payload = {
      user: {
        id: user.userid,
      },
    };

    jwt.sign(
      payload,
      SECRET_KEY,
      {
        expiresIn: 3600, // 1 hour
      },
      (error, token) => {
        if (error) throw error;
        res.json({ userid: user.userid, token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

const logout = async (req, res) => {
  const { userid } = req.body;

  try {
    // Update the last_logout column with the current timestamp
    await User.update({ last_logout: new Date() }, { where: { userid } });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const branch = async (req, res) => {
  try {
    const branches = await Branch.findAll();
    res.json(branches);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const counter = async (req, res) => {
  try {
    const counters = await Counter.findAll();
    res.json(counters);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const finyear = async (req, res) => {
  try {
    const finyear = await Finyear.findAll();
    res.json(finyear);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = { login, logout, branch, counter, finyear };
