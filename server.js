const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 


const secretKey = "NotReallySecret";

// In-memory storage
let storedUser = { userHandle: "", password: "" };
let highscores = [];

// Signup endpoint
app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;


  if (!userHandle || !password) {
    return res.status(400).send("Invalid request body / Undefined fields");
  }


  if (userHandle.length < 6 || password.length < 6) {
    return res.status(400).send("Invalid request body with fields less than 6 characters");
  }

  storedUser = { userHandle, password };

  return res.status(201).send("User registered successfully");
});

// Login endpoint
app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;


  if (!userHandle || !password) {
    return res.status(400).send("Bad Request");
  }


  const validFields = new Set(["userHandle", "password"]);
  const extraFields = Object.keys(req.body).some(key => !validFields.has(key));
  if (extraFields) {
    return res.status(400).send("Bad Request");
  }


  if (typeof userHandle !== "string" || typeof password !== "string") {
    return res.status(400).send("Invalid request body");
  }


  if (userHandle.trim() === "" || password.trim() === "") {
    return res.status(400).send("password or userHandle cannot be empty");
  }


  if (userHandle === storedUser.userHandle && password === storedUser.password) {
    const token = jwt.sign({ userHandle }, secretKey);
    return res.status(200).json({ jsonWebToken: token });
  }

  return res.status(401).send("Unauthorized, incorrect username or password");
});

// High-scores POST endpoint
app.post("/high-scores", (req, res) => {
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).send("Unauthorized, no token field provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, secretKey);
  } catch (error) {
    return res.status(401).send("Unauthorized, invalid token");
  }

  const { level, userHandle, score, timestamp } = req.body;

  if (level === undefined || userHandle === undefined || score === undefined || timestamp === undefined) {
    return res.status(400).send("Invalid request body");
  }

  highscores.push({ level, userHandle, score, timestamp });
  return res.status(201).send("High score posted successfully");
});

// High-scores GET endpoint
app.get("/high-scores", (req, res) => {
  const { page = 1, level } = req.query;
  const pageSize = 20;


  if (!level) {
    return res.status(400).send("Level is required");
  }


  const filteredScores = highscores
    .filter(score => score.level === level)
    .sort((a, b) => b.score - a.score);


  const startIndex = (page - 1) * pageSize;
  const paginatedScores = filteredScores.slice(startIndex, startIndex + pageSize);

  return res.status(200).json(paginatedScores);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};