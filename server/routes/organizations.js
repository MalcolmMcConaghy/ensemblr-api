const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");

const db = require("../queries/organizations");

router.get("/organizations", authMiddleware, db.getOrganizations);
router.get("/organizations/:id", authMiddleware, db.getOrganizationsById);
router.post("/organizations", authMiddleware, db.createOrganization);
router.put("/organizations/:id", authMiddleware, db.updateOrganization);
// router.delete("/organizations/:id");

module.exports = router;
