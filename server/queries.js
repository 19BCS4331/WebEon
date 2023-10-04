const Pool = require("pg").Pool;
const jwt = require("jsonwebtoken");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TestDB",
  password: "J1c2m@raekat",
  port: 5432,
});

const getBranches = (request, response) => {
  pool.query(
    "SELECT name FROM branches ORDER BY branchid ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getCounters = (request, response) => {
  pool.query(
    "SELECT name FROM counters ORDER BY counterid ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getFinYear = (request, response) => {
  pool.query(
    "SELECT value FROM finyear ORDER BY finyearid ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY userid ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const LoginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Retrieve the hashed password from the database for the given username
    const result = await pool.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      // User not found
      res.status(401).json({ error: "User Not Found !" });
      return;
    }
    const user = result.rows[0];
    const foundPass = user.password;

    // Compare the entered password with the hashed password
    //   const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (foundPass !== password) {
      // Passwords do not match
      res.status(401).json({ error: "Incorrect Password !" });
      return;
    }

    const token = jwt.sign({ userId: user.userid }, "J1c2m@raekat", {
      expiresIn: "1h", // Token expiration time
    });
    // Authentication successful
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  getBranches,
  getCounters,
  getFinYear,
  getUsers,
  LoginUser,
};
