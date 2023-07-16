require('dotenv').config();

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.DOCKER_USER,
    host: 'localhost',
    database:  process.env.DOCKER_DB,
    password: process.env.DOCKER_PASSWORD,
    port: 5432
})

const getUsers = (req, res) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (err, results) => {
        if (err) {
            throw err
        }
        res.status(200).json(results.rows)    
    })
}

module.exports = {
    getUsers
}