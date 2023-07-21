require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.TOKEN_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorised" });

  console.log(token);

  try {
    jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorised" });
  }
};

module.exports = authMiddleware;
