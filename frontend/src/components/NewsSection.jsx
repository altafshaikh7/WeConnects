import { useEffect, useState } from "react";
import axios from "axios";

const categories = [
  { key: "technology", label: "Tech News" },
  { key: "startup", label: "Startup Updates" },
  { key: "job market", label: "Job Market Trends" },
];

function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("technology");
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API}/news?q=${encodeURIComponent(activeCategory)}`
        );
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error("News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [API, activeCategory]);

  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">News</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`rounded-full px-3 py-1 text-sm transition border
              ${activeCategory === category.key
                ? "bg-[#0a66c2] text-white border-[#0a66c2]"
                : "bg-gray-100 text-gray-700 border-gray-200"}`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading news...</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border p-3 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
              <p className="text-xs text-gray-600 mb-2">
                {article.description}
              </p>
              <div className="text-[11px] text-gray-500 flex justify-between">
                <span>{article.source}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default NewsSection;
