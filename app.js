const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const homeRouter = require("./routes/homeRouter");
const registerRouter = require("./routes/registerRouter");
const loginRouter = require("./routes/loginRouter");
const userDashboardRouter = require("./routes/userDashboard")
const createSpaceRouter = require("./routes/create-space")
const joinSpaceRouter = require("./routes/join-space")

app.use("/", homeRouter);
app.use("/", registerRouter);
app.use("/", loginRouter);
app.use("/", userDashboardRouter)
app.use("/", createSpaceRouter)
app.use("/", joinSpaceRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
