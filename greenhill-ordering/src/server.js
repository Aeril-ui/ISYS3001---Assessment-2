const express = require("express");
const config = require("./config");

const app = express();
const port = config.port;

app.get("/", (req, res) => {
  res.type("text").send("Greenhill ordering is running.");
});

app.listen(port, () => {
  console.log(`Greenhill ordering listening on port ${port}`);
});
