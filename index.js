const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const db = require("./queries");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/api/v1/organizations", db.getOrganizations);
app.get("/api/v1/organizations/:id", db.getOrganizationsById);
app.post("/api/v1/organizations", db.createOrganization);
app.put("/api/v1/organizations/:id", db.updateOrganization);
app.delete("/api/v1/organizations/:id");

app.listen(port, () => {
  console.log(`App running on localhost:${port}`);
});
