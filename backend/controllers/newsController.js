const https = require("https");

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

exports.getNews = async (req, res) => {
  try {
    const query = req.query.q || "technology startup job market";
    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "News API key missing. Set GNEWS_API_KEY in backend .env to fetch news.",
      });
    }

    const encoded = encodeURIComponent(query);
    const url = `https://gnews.io/api/v4/search?q=${encoded}&lang=en&max=6&token=${apiKey}`;
    const data = await fetchJson(url);

    const articles = (data.articles || []).map((article) => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
    }));

    res.json({ articles });
  } catch (err) {
    console.error("NEWS FETCH ERROR:", err);
    res.status(500).json({ error: "Could not fetch news ❌" });
  }
};
