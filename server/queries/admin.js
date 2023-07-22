require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.TOKEN_SECRET;

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

const CREATE_USERS_TABLE_IF_NOT_EXISTS_QUERY =
  "CREATE TABLE IF NOT EXISTS users (user_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    await pool.query(CREATE_USERS_TABLE_IF_NOT_EXISTS_QUERY);

    const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]);

    const user = data.rows[0];
    if (user) return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await pool.query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
        [name, email, hashedPassword],
        (err, results) => {
          if (err) throw err;
          res.status(201).json({
            data: `User created with ID: ${results.rows[0].user_id}`,
          });
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Internal server error in insert" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error on query" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]);

    const user = data.rows[0];
    if (!user)
      return res.status(401).json({ message: "Invalidate email", user: user });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalidate password" });

    const token = jwt.sign({ id: user.user_id, name: user.name }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ data: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ data: { name: "", email: "" } });
};

module.exports = {
  registerUser,
  login,
  logout,
};
