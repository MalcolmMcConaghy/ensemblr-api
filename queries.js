require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DOCKER_USER,
  host: "localhost",
  database: process.env.DOCKER_DB,
  password: process.env.DOCKER_PASSWORD,
  port: 5432,
});

const jwtSecret = process.env.TOKEN_SECRET;

const CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY =
  "CREATE TABLE IF NOT EXISTS organizations (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE)";

const CREATE_USERS_TABLE_IF_NOT_EXISTS_QUERY =
  "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)";

const getOrganizations = async (req, res) => {
  await pool.query(CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY);
  pool.query("SELECT * from organizations", (err, results) => {
    if (err) throw err;
    res.status(200).json({ data: results.rows });
  });
};

const getOrganizationsById = async (req, res) => {
  const id = parseInt(req.params.id);

  pool.query(
    "SELECT * FROM organizations WHERE id = $1",
    [id],
    (err, results) => {
      if (err) throw err;
      res.status(200).json({ data: results.rows });
    }
  );
};

const createOrganization = async (req, res) => {
  const { name } = req.body;
  await pool.query(CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY);
  pool.query(
    "INSERT INTO organizations (name) VALUES ($1) RETURNING *",
    [name],
    (err, results) => {
      if (err) throw err;
      res
        .status(201)
        .json({ data: `Organization added with ID: ${results.rows[0].id}` });
    }
  );
};

const updateOrganization = (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  pool.query(
    "UPDATE organizations SET name = $1 WHERE id = $2",
    [name, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json({ data: `Organization modified with ID: ${id}` });
    }
  );
};

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
            data: `User created with ID: ${results.rows[0].id}`,
          });
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getOrganizations,
  getOrganizationsById,
  createOrganization,
  updateOrganization,
  registerUser,
};
