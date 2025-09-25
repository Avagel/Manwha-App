const {
  getLatest,
  getPopular,
  getManwhaDetails,
  getManhwaPages,
  addUser,
  checkUser,
  fetchHistory,
  addToHistory,
  addToLibrary,
  fetchLibrary,
} = require("./controllers/controller");

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

app.get("/manhwa/latest", getLatest);
app.get("/manhwa/popular", getPopular);
app.post("/manhwa/details", getManwhaDetails);
app.post("/manhwa/pages", getManhwaPages);
app.post("/user/add", addUser);
app.post("/user/check", checkUser);
app.post("/history/fetch", fetchHistory);
app.post("/history/add", addToHistory);
app.post("/library/add", addToLibrary);
app.post("/library/fetch", fetchLibrary);

app.listen(port, () => {
  console.log("Server successfully running on port: " + port);
});
