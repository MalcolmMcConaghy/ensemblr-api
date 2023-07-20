const express = require("express");
const router = express.Router();

const db = require("../queries/admin");

router.post("/admin/register", db.registerUser);
router.post("/admin/login", db.login);
router.get("/admin/logout", db.logout);

module.exports = router;
