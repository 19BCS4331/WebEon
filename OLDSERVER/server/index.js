const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;
const db = require("./queries");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/branches", db.getBranches);
app.get("/counters", db.getCounters);
app.get("/finyear", db.getFinYear);
app.get("/users", db.getUsers);
app.post("/Login", db.LoginUser);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
