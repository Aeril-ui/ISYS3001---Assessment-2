const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.type("text").send("Greenhill ordering is running.");
});

app.listen(port, () => {
  console.log(`Greenhill ordering listening on port ${port}`);
});
