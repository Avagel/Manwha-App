const { chromium } = require("playwright");
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
const { redisClient } = require("../redisClient");
require("dotenv").config();
const { connectDB, db } = require("../mongo");

// let db;
connectDB();

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

exports.getLatest = async (req, response) => {
  const cached = await redisClient.get("latest");
  if (cached && JSON.parse(cached).length > 0) {
    return response.json(JSON.parse(cached));
  }

  // search the url and get the html
  try {
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

    // await redisClient.setEx("latest", 3600, JSON.stringify(mangaList));
    response.json(mangaList);
  } catch (err) {
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err, // only send safe info
    });
  }
};

exports.getPopular = async (req, response) => {
  // search the url and get the html
  const cached = await redisClient.get("popular");
  if (cached) {
    return response.json(JSON.parse(cached));
  }
  try {
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
    await redisClient.setEx("popular", 3600, JSON.stringify(mangaList));

    response.json(mangaList);
  } catch (err) {
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err, // only send safe info
    });
  }
};

exports.getFilter = async (req, response) => {
  const { genre, status, type, order } = req.body;

  const cached = await redisClient.get("filter");
  // if (cached && JSON.parse(cached).length > 0) {
  //   console.log("Cached",JSON.parse(cached))
  //   return response.json(JSON.parse(cached));
  // }
  // search the url and get the html
  const mangaList = [];
  let pg = 1;
  while (true) {
    try {
      const res = await axios.get(
        `https://asuracomic.net/series?page=${pg}&genres=${genre}&status=${status}&types=${type}&order=${order}`
      );
      console.log("viewing page " + pg);
      const html = res.data;
      const $ = cheerio.load(html);
      let found = false;

      $("a").each((index, element) => {
        const title = $(element).find("span.block").text();
        const img = $(element).find("img").attr("src");
        const link = $(element).attr("href");
        if (img === undefined) return;
        if (img.indexOf("https") === -1) return;
        // console.log("Title: ", title);
        if (link && link.startsWith("series/")) {
          mangaList.push({ img, title, link });
          found = true;
          // filter only the ones you need (so you don't get menu/footer links)
        }
      });
      if (found == false) break;

      await redisClient.setEx("filter", 3600, JSON.stringify(mangaList));

      pg++;
    } catch (err) {
      return response.status(500).json({
        message: "Failed to scrape page",
        error: err, // only send safe info
      });
    }
  }

  response.json(mangaList);
};
exports.getSearch = async (req, response) => {
  const { search } = req.body;
  console.log("searching", search);
  const cached = await redisClient.get(search);
  if (cached && JSON.parse(cached).length > 0) {
    console.log("Cached", JSON.parse(cached));
    return response.json(JSON.parse(cached));
  }
  // search the url and get the html
  const mangaList = [];

  try {
    const res = await axios.get(
      `https://asuracomic.net/series?page=1&name=${search}`
    );
    const html = res.data;
    const $ = cheerio.load(html);

    $("a").each((index, element) => {
      const title = $(element).find("span.block").text();
      const img = $(element).find("img").attr("src");
      const link = $(element).attr("href");
      if (img === undefined) return;
      if (img.indexOf("https") === -1) return;
      // console.log("Title: ", title);
      if (link && link.startsWith("series/")) {
        mangaList.push({ img, title, link });
        // filter only the ones you need (so you don't get menu/footer links)
      }
    });

    await redisClient.setEx(search, 3600, JSON.stringify(mangaList));
  } catch (err) {
    console.log("error", err);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err, // only send safe info
    });
  }
  response.json(mangaList);
};

exports.getManwhaDetails = async (req, response) => {
  const { link } = req.body;
  //get the the chapter count and rating
  const cached = await redisClient.get(link);
  if (cached) {
    console.log("Serving from Redis cache");
    return response.json(JSON.parse(cached));
  }

  try {
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
    await redisClient.setEx(link, 3600, JSON.stringify(data));
    response.json(data);
  } catch (err) {
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err, // only send safe info
    });
  }
};

exports.getManhwaPages = async (req, response) => {
  const { link } = req.body;
  const cached = await redisClient.get(link);
  if (cached) {
    return response.json(JSON.parse(cached));
  }

  try {
    const url = "https://asuracomic.net/series/" + link;
    const selector = ".w-full.mx-auto.center";
    const images = [];
    const res = await scrapePage(url, selector);
    const $ = cheerio.load(res);

    $(selector).each((_, element) => {
      const img = $(element).find("img").attr("src");
      images.push(img);
    });

    redisClient.setEx(link, 3600, JSON.stringify(images));
    response.json(images);
  } catch (err) {
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err, // only send safe info
    });
  }
};
exports.addUser = async (req, res) => {
  const { UUID } = req.body;
  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  try {
    await db.collection("users").insertOne({ UUID });
    await db.collection("library").insertOne({ UUID, manhwas: [] });
    await db.collection("history").insertOne({ UUID, history: [] });
    res.json("sucessful");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.checkUser = async (req, res) => {
  const { UUID } = req.body;
  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  try {
    const result = await db.collection("users").findOne({ UUID });
    if (!result) {
      return res.json({ message: "No User found for this UUID" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.addToLibrary = async (req, res) => {
  const { UUID, data } = req.body;

  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  try {
    const result = await db
      .collection("library")
      .updateOne({ UUID }, { $push: { manhwas: data } });
    if (!result) {
      return res.json({ message: "No library found for this UUID" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.addToHistory = async (req, res) => {
  const { UUID, data } = req.body;
  let result;

  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  try {
    const collection = db.collection("history");

    // First check if the link already exists
    const existing = await collection.findOne({
      UUID,
      "history.manhwaName": data.manhwaName,
    });

    if (existing) {
      // Update that entry inside the array
      result = await collection.updateOne(
        { UUID, "history.manhwaName": data.manhwaName },
        { $set: { "history.$": data } }
      );
    } else {
      // Push a new entry into the array
      result = await collection.updateOne(
        { UUID },
        { $push: { history: data } },
        { upsert: true } // creates doc if UUID doesn't exist
      );
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.fetchLibrary = async (req, res) => {
  const { UUID } = req.body;
  console.log(UUID);

  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  // fetch the user’s library by UUID
  try {
    const result = await db.collection("library").findOne(
      { UUID },
      { projection: { manhwas: 1, _id: 0 } } // only return "manhwas" field
    );
    console.log("fetch library result: ", result);

    if (!result) {
      return res.json({ message: "No library found for this UUID" });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.fetchHistory = async (req, res) => {
  const { UUID } = req.body;
  console.log(UUID);

  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  // fetch the user’s library by UUID
  try {
    const result = await db.collection("history").findOne({ UUID });
    console.log("fetch history result: ", result);

    if (!result) {
      return res.json({ message: "No history found for this UUID" });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.removeFromLibrary = async (req, res) => {
  const { UUID, link } = req.body;
  console.log(UUID);
  console.log(link);

  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  try {
    const check = await db.collection("library").findOne({ UUID });
    console.log("checkk", check);
    const result = await db.collection("library").updateOne(
      { UUID: UUID }, // user's library
      { $pull: { manhwas: { link: link } } }
    );
    if (!result) {
      return res.json({ message: "No library found for this UUID" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.removeFromHistory = async (req, res) => {
  const { UUID, link } = req.body;
  console.log(UUID);
  console.log(link);

  if (!db) {
    const isConnected = await connectDB();
    if (!isConnected) {
      return res.json({ error: "Database connection failed" });
    }
  }

  try {
    const check = await db.collection("history").findOne({ UUID });
    console.log("checkk", check);
    const result = await db.collection("history").updateOne(
      { UUID: UUID }, // user's library
      { $pull: { history: { link: link } } }
    );
    if (!result) {
      return res.json({ message: "No history found for this UUID" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
