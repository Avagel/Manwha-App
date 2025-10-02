const axios = require("axios");
const cheerio = require("cheerio");
const { redisClient } = require("../redisClient");
require("dotenv").config();
const { connectDB, getCollection, db } = require("../mongo");

// Remove Playwright entirely and use enhanced axios approach
const scrapingClient = axios.create({
  timeout: 20000,
  maxRedirects: 5,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "DNT": "1",
    "Referer": "https://www.google.com/",
  }
});

// Add request interceptor to rotate User-Agents
scrapingClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 Making request to: ${config.url}`);
    
    // Rotate User-Agent
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    config.headers['User-Agent'] = randomUserAgent;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced scraping function with retry logic
async function robustScrape(url, options = {}) {
  const { maxRetries = 3, delay = 2000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Scraping attempt ${attempt}/${maxRetries} for: ${url}`);
      
      const response = await scrapingClient.get(url);
      
      if (response.status === 200) {
        console.log(`✅ Successfully scraped: ${url}`);
        return response.data;
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`All scraping attempts failed: ${error.message}`);
      }
      
      // Wait before retry with exponential backoff
      const waitTime = delay * attempt;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Rotate headers for next attempt
      scrapingClient.defaults.headers['User-Agent'] = getRandomUserAgent();
    }
  }
}

function getRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
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
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime = Date.now();
    return robustScrape(url);
  };
}

const rateLimitedScrape = createRateLimiter(8); // 8 requests per minute

// Your existing functions updated to use the new scraper
exports.getLatest = async (req, response) => {
  const cached = await redisClient.get("latest");
  if (cached && JSON.parse(cached).length > 0) {
    console.log('✅ Serving latest from cache');
    return response.json(JSON.parse(cached));
  }

  try {
    console.log('🔄 Fetching latest manga from Asura Comic...');
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
        index 
      });
    });

    console.log(`✅ Found ${mangaList.length} latest manga`);
    
    await redisClient.setEx("latest", 3600, JSON.stringify(mangaList));
    response.json(mangaList);
    
  } catch (err) {
    console.error('❌ Error in getLatest:', err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message
    });
  }
};

exports.getPopular = async (req, response) => {
  const cached = await redisClient.get("popular");
  if (cached) {
    console.log('✅ Serving popular from cache');
    return response.json(JSON.parse(cached));
  }

  try {
    console.log('🔄 Fetching popular manga from Asura Comic...');
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
        index 
      });
    });

    console.log(`✅ Found ${mangaList.length} popular manga`);
    
    await redisClient.setEx("popular", 3600, JSON.stringify(mangaList));
    response.json(mangaList);
    
  } catch (err) {
    console.error('❌ Error in getPopular:', err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message
    });
  }
};

// Update getManhwaPages to work without Playwright
exports.getManhwaPages = async (req, response) => {
  const { link } = req.body;
  const cached = await redisClient.get(link);
  if (cached) {
    return response.json(JSON.parse(cached));
  }

  try {
    const url = "https://asuracomic.net/series/" + link;
    const html = await rateLimitedScrape(url);
    const $ = cheerio.load(html);
    const images = [];

    // Try multiple selectors for images
    $("img").each((_, element) => {
      const img = $(element).attr("src");
      if (img && (img.includes("chapter") || img.includes("manga") || img.includes("wp-content"))) {
        images.push(img);
      }
    });

    // Also try data-src attributes (common for lazy loading)
    $("img[data-src]").each((_, element) => {
      const img = $(element).attr("data-src");
      if (img && (img.includes("chapter") || img.includes("manga") || img.includes("wp-content"))) {
        images.push(img);
      }
    });

    // Remove duplicates and filter valid URLs
    const uniqueImages = [...new Set(images)].filter(img => 
      img && img.startsWith('http') && (img.includes('.jpg') || img.includes('.png') || img.includes('.webp'))
    );

    console.log(`✅ Found ${uniqueImages.length} images for ${link}`);
    
    if (uniqueImages.length > 0) {
      await redisClient.setEx(link, 3600, JSON.stringify(uniqueImages));
    }
    
    response.json(uniqueImages);
  } catch (err) {
    console.error('❌ Error in getManhwaPages:', err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message
    });
  }
};

// Keep all your other functions exactly the same
exports.getFilter = async (req, response) => {
  const { genre, status, type, order } = req.body;
  const cacheKey = `filter:${genre}:${status}:${type}:${order}`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached && JSON.parse(cached).length > 0) {
    console.log('✅ Serving filter results from cache');
    return response.json(JSON.parse(cached));
  }

  const mangaList = [];
  let pg = 1;
  let hasMorePages = true;
  const maxPages = 3; // Reduced to avoid hitting rate limits

  try {
    while (hasMorePages && pg <= maxPages) {
      console.log(`📄 Scraping filter page ${pg}...`);
      
      const html = await rateLimitedScrape(
        `https://asuracomic.net/series?page=${pg}&genres=${genre || ''}&status=${status || ''}&types=${type || ''}&order=${order || ''}`
      );
      
      const $ = cheerio.load(html);
      let foundItems = false;

      $("a").each((index, element) => {
        const title = $(element).find("span.block").text().trim();
        const img = $(element).find("img").attr("src");
        const link = $(element).attr("href");
        
        if (!img || !img.includes("https")) return;
        if (!link || !link.startsWith("series/")) return;
        
        const exists = mangaList.some(item => item.link === link);
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
      }
    }

    console.log(`✅ Filter search completed: ${mangaList.length} total items`);
    
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(mangaList));
    response.json(mangaList);
    
  } catch (err) {
    console.error('❌ Error in getFilter:', err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message
    });
  }
};

exports.getSearch = async (req, response) => {
  const { search } = req.body;
  console.log(`🔍 Searching for: ${search}`);
  
  const cacheKey = `search:${search}`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached && JSON.parse(cached).length > 0) {
    console.log('✅ Serving search from cache');
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
      
      const exists = mangaList.some(item => item.link === link);
      if (!exists) {
        mangaList.push({ img, title, link });
      }
    });

    console.log(`✅ Search found ${mangaList.length} results for "${search}"`);
    
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(mangaList));
    response.json(mangaList);
    
  } catch (err) {
    console.error('❌ Error in getSearch:', err.message);
    return response.status(500).json({
      message: "Failed to scrape page",
      error: err.message
    });
  }
};

// Keep all your database functions exactly as they were
exports.getManwhaDetails = async (req, response) => {
  // ... your existing getManwhaDetails code
};

exports.addUser = async (req, res) => {
  // ... your existing addUser code
};

exports.checkUser = async (req, res) => {
  // ... your existing checkUser code
};

exports.addToLibrary = async (req, res) => {
  // ... your existing addToLibrary code
};

exports.addToHistory = async (req, res) => {
  // ... your existing addToHistory code
};

exports.fetchLibrary = async (req, res) => {
  // ... your existing fetchLibrary code
};

exports.fetchHistory = async (req, res) => {
  // ... your existing fetchHistory code
};

exports.removeFromLibrary = async (req, res) => {
  // ... your existing removeFromLibrary code
};

exports.removeFromHistory = async (req, res) => {
  // ... your existing removeFromHistory code
};