const path = require("path");
const express = require("express");
const session = require("express-session");
const config = require("./config");
const { getDb } = require("./db");
const { seedIfEmpty } = require("./seed");
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/member");
const coordinatorRoutes = require("./routes/coordinator");

const db = getDb();
seedIfEmpty(db);

const app = express();
const port = config.port;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (req.session.user.role === "coordinator") {
    return res.redirect("/coordinator");
  }
  return res.redirect("/member");
});

app.use(authRoutes);
app.use("/member", memberRoutes);
app.use("/coordinator", coordinatorRoutes);

app.listen(port, () => {
  console.log(`Greenhill ordering listening on port ${port}`);
});
