const https = require("https");

// 🔹 Helper
const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });

// 🔹 Main Controller
exports.getNews = async (req, res) => {
  try {
    const q = req.query.q || "technology";
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "❌ GNEWS_API_KEY missing",
      });
    }

    let url = "";

    // ✅ DIFFERENT API LOGIC
    if (q === "technology") {
      // 🔥 Tech → headlines
      url = `https://gnews.io/api/v4/top-headlines?category=technology&lang=en&max=6&token=${apiKey}`;
    } else if (q === "startup") {
      // 🚀 Startup → search
      url = `https://gnews.io/api/v4/search?q=startup&lang=en&max=6&token=${apiKey}`;
    } else if (q === "job market") {
      // 💼 Jobs → search
      url = `https://gnews.io/api/v4/search?q=jobs hiring career&lang=en&max=6&token=${apiKey}`;
    } else {
      // fallback
      url = `https://gnews.io/api/v4/top-headlines?category=technology&lang=en&max=6&token=${apiKey}`;
    }

    console.log("🌐 Fetching:", url);

    const data = await fetchJson(url);

    if (!data.articles) {
      return res.status(500).json({
        error: "GNews API failed ❌",
        details: data,
      });
    }

    const articles = data.articles.map((article) => ({
      title: article.title,
      description: article.description,
      source: article.source?.name || "Unknown",
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
    }));

    res.json({ articles });
  } catch (err) {
    console.error("❌ NEWS ERROR:", err.message);
    res.status(500).json({
      error: "Failed to fetch news ❌",
    });
  }
};