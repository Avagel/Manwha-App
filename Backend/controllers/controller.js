const { chromium } = require("playwright");
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
const { redisClient } = require("../redisClient");
require("dotenv").config();
const { connectDB, getCollection, db } = require("../mongo");

// let db;
connectDB();
const scrapingClient = axios.create({
  timeout: 15000,
  maxRedirects: 5,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "sec-ch-ua":
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    DNT: "1",
    Pragma: "no-cache",
  },
});

// Add request interceptor to log requests
scrapingClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);
// Add response interceptor to handle errors
scrapingClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Response received: ${response.status} from ${response.config.url}`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `❌ Server responded with error: ${error.response.status} for ${error.config.url}`
      );
    } else if (error.request) {
      console.error(`❌ No response received for: ${error.config.url}`);
    } else {
      console.error(`❌ Request setup error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

async function scrapePage(url, selector) {
  let browser;
  try {
    console.log(`🚀 Launching browser for: ${url}`);

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const context = await browser.newContext();

    // Set realistic viewport and user agent
    await context.setViewportSize({ width: 1920, height: 1080 });
    await context.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Block unnecessary resources for faster loading
    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      // Only allow document, script, xhr, fetch, and image
      if (["stylesheet", "font", "media", "imageset"].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log(`📄 Navigating to: ${url}`);

    // Go to the page with better options
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for the selector with timeout
    console.log(`⏳ Waiting for selector: ${selector}`);
    await page.waitForSelector(selector, { timeout: 15000 });

    // Additional wait for network stability
    await page.waitForTimeout(2000);

    // Get the rendered HTML
    const content = await page.content();
    console.log(`✅ Successfully scraped page: ${url}`);

    return content;
  } catch (error) {
    console.error(`❌ Error scraping page ${url}:`, error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔌 Browser closed");
    }
  }
}
// Enhanced scraping with fallback strategy
async function robustScrape(url, options = {}) {
  const { usePlaywright = false, selector = "body", maxRetries = 2 } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Scraping attempt ${attempt}/${maxRetries} for: ${url}`);

      if (usePlaywright || attempt > 1) {
        // Use Playwright for JavaScript-heavy sites or as fallback
        return await scrapePage(url, selector);
      } else {
        // Try axios first (faster)
        const response = await scrapingClient.get(url);
        return response.data;
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
  
}
async function ensureDatabaseConnection() {
  if (!db) {
    console.log("🔄 Establishing database connection...");
    const result = await connectDB();
    if (!result.status) {
      throw new Error("Database connection failed: " + result.message);
    }
  }
  return true;
}

// Rate limiting helper
function createRateLimiter(requestsPerMinute) {
  const queue = [];
  let lastRequestTime = 0;

  return async (url) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minTimeBetweenRequests = 60000 / requestsPerMinute;

    if (timeSinceLastRequest < minTimeBetweenRequests) {
      const waitTime = minTimeBetweenRequests - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();
    return robustScrape(url);
  };
}

// Create rate-limited scraper (10 requests per minute)
const rateLimitedScrape = createRateLimiter(10);

exports.getLatest = async (req, response) => {
  const cached = await redisClient.get("latest");
  if (cached && JSON.parse(cached).length > 0) {
    console.log("✅ Serving latest from cache");
    return response.json(JSON.parse(cached));
  }

  try {
    console.log("🔄 Fetching latest manga from Asura Comic...");
    const html = await rateLimitedScrape("https://asuracomic.net/");
    const $ = cheerio.load(html);
    const mangaList = [];

    $(".w-full.p-1").each((index, element) => {
      const title = $(element).find("span a").contents().first().text().trim();
      const img = $(element).find("img").attr("src");
      const link = $(element).find("a").attr("href");

      if (!img || !img.includes("https")) return;

      mangaList.push({
        img,
        title,
        link,
        index,
      });
    });

    console.log(`✅ Found ${mangaList.length} latest manga`);

    await redisClient.setEx("latest", 3600, JSON.stringify(mangaList));
    response.json(mangaList);
  } catch (err) {
    console.error("❌ Error in getLatest:", err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message,
    });
  }
};

exports.getPopular = async (req, response) => {
  const cached = await redisClient.get("popular");
  if (cached) {
    console.log("✅ Serving popular from cache");
    return response.json(JSON.parse(cached));
  }

  try {
    console.log("🔄 Fetching popular manga from Asura Comic...");
    const html = await rateLimitedScrape("https://asuracomic.net/");
    const $ = cheerio.load(html);
    const mangaList = [];

    $(".flex.py-3").each((index, element) => {
      const title = $(element).find("span a").contents().first().text().trim();
      const img = $(element).find("img").attr("src");
      const link = $(element).find("a").attr("href");

      if (!img || !img.includes("https")) return;

      mangaList.push({
        img,
        title,
        link,
        index,
      });
    });

    console.log(`✅ Found ${mangaList.length} popular manga`);

    await redisClient.setEx("popular", 3600, JSON.stringify(mangaList));
    response.json(mangaList);
  } catch (err) {
    console.error("❌ Error in getPopular:", err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message,
    });
  }
};

exports.getFilter = async (req, response) => {
  const { genre, status, type, order } = req.body;

  // Create a unique cache key based on filters
  const cacheKey = `filter:${genre}:${status}:${type}:${order}`;
  const cached = await redisClient.get(cacheKey);

  if (cached && JSON.parse(cached).length > 0) {
    console.log("✅ Serving filter results from cache");
    return response.json(JSON.parse(cached));
  }

  const mangaList = [];
  let pg = 1;
  let hasMorePages = true;
  const maxPages = 5; // Limit pages to avoid infinite loops

  try {
    while (hasMorePages && pg <= maxPages) {
      console.log(`📄 Scraping filter page ${pg}...`);

      const html = await rateLimitedScrape(
        `https://asuracomic.net/series?page=${pg}&genres=${
          genre || ""
        }&status=${status || ""}&types=${type || ""}&order=${order || ""}`
      );

      const $ = cheerio.load(html);
      let foundItems = false;

      $("a").each((index, element) => {
        const title = $(element).find("span.block").text().trim();
        const img = $(element).find("img").attr("src");
        const link = $(element).attr("href");

        if (!img || !img.includes("https")) return;
        if (!link || !link.startsWith("series/")) return;

        // Avoid duplicates
        const exists = mangaList.some((item) => item.link === link);
        if (!exists) {
          mangaList.push({ img, title, link });
          foundItems = true;
        }
      });

      if (!foundItems) {
        hasMorePages = false;
        console.log(`⏹️ No more items found on page ${pg}, stopping.`);
      } else {
        console.log(`✅ Found ${mangaList.length} items so far...`);
        pg++;

        // Be respectful - wait between pages
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Filter search completed: ${mangaList.length} total items`);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(mangaList));
    response.json(mangaList);
  } catch (err) {
    console.error("❌ Error in getFilter:", err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message,
    });
  }
};

exports.getSearch = async (req, response) => {
  const { search } = req.body;
  console.log(`🔍 Searching for: ${search}`);

  const cacheKey = `search:${search}`;
  const cached = await redisClient.get(cacheKey);

  if (cached && JSON.parse(cached).length > 0) {
    console.log("✅ Serving search from cache");
    return response.json(JSON.parse(cached));
  }

  const mangaList = [];

  try {
    const html = await rateLimitedScrape(
      `https://asuracomic.net/series?page=1&name=${encodeURIComponent(search)}`
    );

    const $ = cheerio.load(html);

    $("a").each((index, element) => {
      const title = $(element).find("span.block").text().trim();
      const img = $(element).find("img").attr("src");
      const link = $(element).attr("href");

      if (!img || !img.includes("https")) return;
      if (!link || !link.startsWith("series/")) return;

      // Avoid duplicates
      const exists = mangaList.some((item) => item.link === link);
      if (!exists) {
        mangaList.push({ img, title, link });
      }
    });

    console.log(`✅ Search found ${mangaList.length} results for "${search}"`);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(mangaList));
    response.json(mangaList);
  } catch (err) {
    console.error("❌ Error in getSearch:", err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message,
    });
  }
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
    const res = await scrapingClient.get("https://asuracomic.net/" + link);
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

  try {
    await ensureDatabaseConnection();
    await getCollection("users").insertOne({ UUID });
    await getCollection("library").insertOne({ UUID, manhwas: [] });
    await getCollection("history").insertOne({ UUID, history: [] });
    res.json("sucessful");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.checkUser = async (req, res) => {
  const { UUID } = req.body;

  try {
    await ensureDatabaseConnection();
    const result = await getCollection("users").findOne({ UUID });
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

  try {
    await ensureDatabaseConnection();
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

  try {
    await ensureDatabaseConnection();
    const collection = getCollection("history");

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

  // fetch the user’s library by UUID
  try {
    await ensureDatabaseConnection();
    const result = await getCollection("library").findOne(
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

  // fetch the user’s library by UUID
  try {
    await ensureDatabaseConnection();
    const result = await getCollection("history").findOne({ UUID });
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

  try {
    await ensureDatabaseConnection();
    const check = await getCollection("library").findOne({ UUID });
    console.log("checkk", check);
    const result = await getCollection("library").updateOne(
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

  try {
    await ensureDatabaseConnection();
    const check = await getCollection("history").findOne({ UUID });
    console.log("checkk", check);
    const result = await getCollection("history").updateOne(
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
