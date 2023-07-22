require("dotenv").config();

const parseJwt = require("../utils/parseJWT");

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

const CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY =
  "CREATE TABLE IF NOT EXISTS organizations (id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE, user_id int, CONSTRAINT Fk_user_id FOREIGN KEY (user_id) REFERENCES users (user_id))";

const getOrganizations = async (req, res) => {
  const token = req.cookies.token;
  const user = parseJwt(token);

  await pool.query(CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY);
  pool.query(
    "SELECT * from organizations WHERE user_id= $1",
    [user.id],
    (err, results) => {
      if (err) throw err;
      res.status(200).json({ data: results.rows });
    }
  );
};

const getOrganizationsById = async (req, res) => {
  const id = parseInt(req.params.id);
  const token = req.cookies.token;
  const user = parseJwt(token);

  pool.query(
    "SELECT * FROM organizations WHERE id = $1 AND user_id= $2",
    [id, user.id],
    (err, results) => {
      if (err) throw err;
      res.status(200).json({ data: results.rows });
    }
  );
};

const createOrganization = async (req, res) => {
  const { name } = req.body;
  const token = req.cookies.token;

  const data = await pool.query(`SELECT * FROM organizations WHERE name= $1;`, [
    name,
  ]);

  const organization = data.rows[0];
  if (organization)
    return res.status(409).json({ error: "Organization already exists" });

  const user = parseJwt(token);

  await pool.query(CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY);
  pool.query(
    "INSERT INTO organizations (name, user_id) VALUES ($1, $2) RETURNING *",
    [name, user.id],
    (err, results) => {
      if (err) throw err;
      res.status(201).json({
        data: `Organization added with ID: ${results.rows[0].organization_id}. Owner ID: ${results.rows[0].user_id}`,
      });
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

const testDecodeJwt = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.sendStatus(403);
  }
  const user = parseJwt(token);

  pool.query("SELECT * FROM users WHERE id = $1", [user.id], (err, results) => {
    if (err) throw err;
    res.status(200).json({ data: results.rows });
  });
};

module.exports = {
  getOrganizations,
  getOrganizationsById,
  createOrganization,
  updateOrganization,
  testDecodeJwt,
};
