const https = require("https");

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            resolve({
              statusCode: response.statusCode || 500,
              data: JSON.parse(data || "{}"),
            });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });

// Get news with optional query params
exports.getNews = async (req, res) => {
  try {
    const { 
      q = "technology", 
      limit = 6,
      from = null,  // date filter (YYYY-MM-DD)
      to = null     // date filter
    } = req.query;
    
    const apiKey = process.env.NEWS_API_KEY || process.env.GNEWS_API_KEY;
    const useRealTime = process.env.USE_REAL_TIME_API === 'true';

    if (!apiKey) {
      return res.json({
        success: true,
        source: "fallback",
        articles: [],
        message: "News provider is not configured",
      });
    }

    let url;
    
    // Use Currents API for real-time news (updates every 60 seconds)
    if (useRealTime) {
      // Currents API - Real-time news
      url = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}&language=en&limit=${limit}`;
      
      if (q && q !== "technology") {
        url = `https://api.currentsapi.services/v1/search?apiKey=${apiKey}&keywords=${encodeURIComponent(q)}&language=en&limit=${limit}`;
      }
      
      if (from && to) {
        url += `&start_date=${from}&end_date=${to}`;
      }
      
      const { statusCode, data } = await fetchJson(url);
      
      if (statusCode >= 400 || !data?.news) {
        throw new Error(data?.message || "Failed to fetch real-time news");
      }
      
      const articles = data.news.map((article) => ({
        id: article.id || Math.random().toString(36).substr(2, 9),
        title: article.title,
        description: article.description || "Click to read full article",
        content: article.content || article.description,
        source: article.author || article.source || "Unknown",
        url: article.url,
        image: article.image || "https://via.placeholder.com/400x200?text=News",
        publishedAt: article.published || new Date().toISOString(),
        category: article.category?.join(", ") || q,
      }));
      
      return res.json({
        success: true,
        source: "currents-api (real-time)",
        articles,
      });
    }
    
    // Fallback to GNews (if real-time API key not set)
    let searchQuery = q;
    switch (q) {
      case "technology":
        url = `https://gnews.io/api/v4/top-headlines?category=technology&lang=en&max=${limit}&token=${apiKey}`;
        break;
      case "startup":
        url = `https://gnews.io/api/v4/search?q=startup&lang=en&max=${limit}&token=${apiKey}`;
        break;
      case "job market":
        url = `https://gnews.io/api/v4/search?q=jobs hiring career&lang=en&max=${limit}&token=${apiKey}`;
        break;
      default:
        url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=${limit}&token=${apiKey}`;
        break;
    }
    
    if (from && to) {
      url += `&from=${from}&to=${to}`;
    }
    
    const { statusCode, data } = await fetchJson(url);
    
    if (statusCode >= 400) {
      return res.status(statusCode).json({
        success: false,
        error: data?.errors?.[0] || "Failed to fetch news from provider",
      });
    }
    
    const articles = Array.isArray(data?.articles)
      ? data.articles.map((article, index) => ({
          id: index.toString(),
          title: article.title,
          description: article.description,
          content: article.content || article.description,
          source: article.source?.name || "Unknown",
          url: article.url,
          image: article.image || "https://via.placeholder.com/400x200?text=News",
          publishedAt: article.publishedAt,
          category: q,
        }))
      : [];
    
    res.json({
      success: true,
      source: "gnews",
      articles,
    });
  } catch (err) {
    console.error("NEWS ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch news",
      message: err.message,
    });
  }
};

// NEW: Get similar news based on clicked article
exports.getSimilarNews = async (req, res) => {
  try {
    const { 
      title, 
      category, 
      source,
      excludeId 
    } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Title is required"
      });
    }
    
    const apiKey = process.env.NEWS_API_KEY || process.env.GNEWS_API_KEY;
    
    // Extract keywords from title
    const keywords = title
      .split(" ")
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(" ");
    
    let url;
    const useRealTime = process.env.USE_REAL_TIME_API === 'true';
    
    if (useRealTime) {
      url = `https://api.currentsapi.services/v1/search?apiKey=${apiKey}&keywords=${encodeURIComponent(keywords)}&language=en&limit=5`;
    } else {
      url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=5&token=${apiKey}`;
    }
    
    const { statusCode, data } = await fetchJson(url);
    
    if (statusCode >= 400) {
      return res.status(statusCode).json({
        success: false,
        error: "Failed to fetch similar news"
      });
    }
    
    const articles = useRealTime 
      ? data.news?.map(article => ({
          id: article.id,
          title: article.title,
          description: article.description,
          source: article.author || article.source,
          url: article.url,
          image: article.image,
          publishedAt: article.published
        })) || []
      : data.articles?.map(article => ({
          id: Math.random().toString(),
          title: article.title,
          description: article.description,
          source: article.source?.name,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt
        })) || [];
    
    // Filter out the clicked article
    const filteredArticles = articles.filter(
      article => article.title !== title && article.id !== excludeId
    );
    
    res.json({
      success: true,
      source: useRealTime ? "real-time" : "gnews",
      articles: filteredArticles.slice(0, 5)
    });
    
  } catch (err) {
    console.error("SIMILAR NEWS ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch similar news"
    });
  }
};

// NEW: Get news by specific category
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category = "general", limit = 6 } = req.query;
    const apiKey = process.env.NEWS_API_KEY || process.env.GNEWS_API_KEY;
    const useRealTime = process.env.USE_REAL_TIME_API === 'true';
    
    let url;
    
    if (useRealTime) {
      url = `https://api.currentsapi.services/v1/latest-news?apiKey=${apiKey}&language=en&limit=${limit}`;
      if (category !== "general") {
        url = `https://api.currentsapi.services/v1/search?apiKey=${apiKey}&keywords=${encodeURIComponent(category)}&language=en&limit=${limit}`;
      }
    } else {
      url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=${limit}&token=${apiKey}`;
    }
    
    const { statusCode, data } = await fetchJson(url);
    
    if (statusCode >= 400) {
      return res.status(statusCode).json({
        success: false,
        error: "Failed to fetch category news"
      });
    }
    
    const articles = useRealTime
      ? data.news?.map(article => ({
          id: article.id,
          title: article.title,
          description: article.description,
          source: article.author,
          url: article.url,
          image: article.image,
          publishedAt: article.published,
          category: category
        })) || []
      : data.articles?.map(article => ({
          id: Math.random().toString(),
          title: article.title,
          description: article.description,
          source: article.source?.name,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
          category: category
        })) || [];
    
    res.json({
      success: true,
      source: useRealTime ? "real-time" : "gnews",
      articles
    });
    
  } catch (err) {
    console.error("CATEGORY NEWS ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch category news"
    });
  }
};