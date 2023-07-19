const express = require("express");
const router = express.Router();

const db = require("../queries/organizations");

router.get("/organizations", db.getOrganizations);
router.get("/organizations/:id", db.getOrganizationsById);
router.post("/organizations", db.createOrganization);
router.put("/organizations/:id", db.updateOrganization);
// router.delete("/organizations/:id");

module.exports = router;
