require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DOCKER_USER,
  host: "localhost",
  database: process.env.DOCKER_DB,
  password: process.env.DOCKER_PASSWORD,
  port: 5432,
});

const CREATE_ORGANIZATIONS_TABLE_IF_NOT_EXISTS_QUERY =
  "CREATE TABLE IF NOT EXISTS organizations (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL)";

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

module.exports = {
  getOrganizations,
  getOrganizationsById,
  createOrganization,
  updateOrganization,
};
