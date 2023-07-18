require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000 || process.env.PORT;

const db = require("./queries");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.get("/api/v1/organizations", db.getOrganizations);
app.get("/api/v1/organizations/:id", db.getOrganizationsById);
app.post("/api/v1/organizations", db.createOrganization);
app.put("/api/v1/organizations/:id", db.updateOrganization);
app.delete("/api/v1/organizations/:id");

app.post("/api/v1/register", db.registerUser);

app.listen(PORT, () => {
  console.log(`App running on localhost:${PORT}`);
});
