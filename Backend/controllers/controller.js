const { chromium } = require("playwright");
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
let db;

async function scrapePage(url, selector) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Block unnecessary resources for faster load
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["stylesheet", "font", "media"].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Go to the page
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for a key selector to be sure content is loaded
  await page.waitForSelector(selector);

  // Get the rendered HTML
  const content = await page.content();

  await browser.close();
  return content;
}

exports.getLibrary = (req, res) => {};
exports.getHistory = (req, res) => {};
exports.getLatest = async (req, response) => {
  // search the url and get the html
  const res = await axios.get("https://asuracomic.net/");
  const html = res.data;
  const $ = cheerio.load(html);
  const mangaList = [];

  $(".w-full.p-1").each((index, element) => {
    const title = $(element).find("span a").contents().first().text();
    const img = $(element).find("img").attr("src");
    const link = $(element).find("a").attr("href");
    if (img === undefined) return;
    if (img.indexOf("https") === -1) return;
    // console.log("Title: ", title);
    mangaList.push({ img, title, link });
  });
  console.log(mangaList);

  response.json(mangaList);
};

exports.getPopular = async (req, response) => {
  // search the url and get the html
  const res = await axios.get("https://asuracomic.net/");
  const html = res.data;
  const $ = cheerio.load(html);
  const mangaList = [];

  $(".flex.py-3").each((index, element) => {
    const title = $(element).find("span a").contents().first().text();
    const img = $(element).find("img").attr("src");
    const link = $(element).find("a").attr("href");
    if (img === undefined) return;
    if (img.indexOf("https") === -1) return;
    // console.log("Title: ", title);
    mangaList.push({ img, title, link });
  });
  console.log(mangaList);

  response.json(mangaList);
};

exports.getManwhaDetails = async (req, response) => {
  const { link } = req.body;
  //get the the chapter count and rating
  const res = await axios.get("https://asuracomic.net/" + link);
  const html = res.data;
  const $ = cheerio.load(html);

  const data = {};
  let genres = [];
  let chapters = [];
  //{name,date,link}
  //data = {summary,rating,genres:[],chapters:[]}

  //get the summary
  $("span.font-medium.text-sm").each((index, element) => {
    const summary = $(element).find("p").text();
    data.summary = summary;
  });

  //get rating
  $("span.ml-1.text-xs").each((index, element) => {
    const rating = $(element).text();
    data.rating = rating;
  });

  //get status
  $("h3.text-sm.capitalize").each((index, element) => {
    const status = $(element).text();
    if (status.toLocaleLowerCase() == "manhwa") return;
    data.status = status;
  });

  //get genres
  $("button.text-white.cursor-pointer").each((index, element) => {
    const gen = $(element).text();
    genres.push(gen);
  });
  data.genres = genres;

  $(".group").each((index, element) => {
    const title = $(element).find("h3.text-sm").text();
    const link = $(element).find("a").attr("href");
    const date = $(element).find("h3.text-xs").text();
    chapters.push({ title, link, date });
  });

  data.chapters = chapters;

  response.json(data);
};

exports.getManhwaPages = async (req, response) => {
  const { link } = req.body;
  const url = "https://asuracomic.net/series/" + link;
  const selector = ".w-full.mx-auto.center";
  const images = [];

  const res = await scrapePage(url, selector);
  const $ = cheerio.load(res);

  $(selector).each((_, element) => {
    const img = $(element).find("img").attr("src");
    images.push(img);
  });
  response.json(images);
};
async function connectDB() {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI);
    db = client.db(); // default DB name from URI
    console.log("✅ MongoDB Connected");
    return { status: true, message: "Connected" };
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    return { status: false, message: err.message };
  }
}
exports.addUser = async (req, res) => {
  const { UUID } = req.body;
  if (db == undefined) {
    const isConnected = await connectDB();
    if (isConnected.status) {
      console.log("Connected");
      await db.collection("users").insertOne({ UUID });
      await db.collection("library").insertOne({ UUID, mahwas: [] });
      await db.collection("history").insertOne({ UUID, history: [] });
      res.json("Successfil");
    } else {
      res.json(isConnected.message);
    }
  } else {
    await db.collection("users").insertOne({ UUID });
    await db.collection("library").insertOne({ UUID, mahwas: [] });
    await db.collection("history").insertOne({ UUID, history: [] });
    res.json("Successfil");
  }
};
exports.checkUser = async (req, res) => {
  const { UUID } = req.body;
  if (db == undefined) {
    const isConnected = await connectDB();
    if (isConnected.status) {
      const result = await db.collection("users").findOne({ UUID });
      res.json(result);
    } else {
      res.json(isConnected.message);
    }
  } else {
    const result = await db.collection("users").findOne({ UUID });
    res.json(result);
  }
};
exports.addToLibrary = async (req, res) => {
  const { UUID, data } = req.body;
  if (db == undefined) {
    const isConnected = await connectDB();

    if (isConnected) {
      const result = db
        .collection("library")
        .updateOne({ UUID }, { $push: { manhwas: data } });
      res.json(result);
    } else {
      res.json(isConnected.message);
    }
  } else {
    const result = db
      .collection("library")
      .updateOne({ UUID }, { $push: { manhwas: data } });
    res.json(result);
  }
};
exports.addToHistory = async (req, res) => {
  const { UUID, data } = req.body;
  if (db == undefined) {
    const isConnected = await connectDB();

    if (isConnected) {
      const result = db
        .collection("history")
        .updateOne({ UUID }, { $push: { history: data } });
      res.json(result);
    } else {
      res.json(isConnected.message);
    }
  } else {
    const result = db
      .collection("history")
      .updateOne({ UUID }, { $push: { history: data } });
    res.json(result);
  }
};
exports.fetchLibrary = async (req, res) => {
  const { UUID } = req.body;
  if (db == undefined) {
    const isConnected = await connectDB();
    if (isConnected) {
      const result = db.collection("library").find({ UUID }, { manhwas: true });
      res.json(result);
    } else {
      res.json(isConnected.message);
    }
  } else {
    const result = db.collection("library").find({ UUID }, { manhwas: true });
    res.json(result);
  }
};
exports.fetchHistory = async (req, res) => {
  const { UUID } = req.body;
  if (db == undefined) {
    const isConnected = await connectDB();
    if (isConnected) {
      const result = db.collection("history").find({ UUID }, { history: true });
      res.json(result);
    } else {
      res.json(isConnected.message);
    }
  } else {
    const result = db.collection("history").find({ UUID }, { history: true });
    res.json(result);
  }
};
