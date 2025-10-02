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
  removeFromLibrary,
  removeFromHistory,
  getFilter,
  getSearch,
} = require("./controllers/controller");

const express = require("express");
const cors = require("cors");
const { redisClient } = require("./redisClient");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

app.get("/manhwa/latest", getLatest);
app.get("/manhwa/popular", getPopular);
app.post("/manhwa/details", getManwhaDetails);
app.post("/manhwa/pages", getManhwaPages);
app.post("/manhwa/filter", getFilter);
app.post("/manhwa/search", getSearch);

app.post("/user/check", checkUser);
app.post("/user/add", addUser);

app.post("/history/fetch", fetchHistory);
app.post("/history/add", addToHistory);
app.post("/history/remove", removeFromHistory);

app.post("/library/fetch", fetchLibrary);
app.post("/library/add", addToLibrary);
app.post("/library/remove", removeFromLibrary);

const startServer = async () => {
  // ✅ connect once at startup

  app.listen(port || 3000, () => {
    console.log("Server running on port: " + port);
  });
};

const { getCollection } = require("./mongo");


// Add this to your mongo.js and run once, then remove it

startServer();
