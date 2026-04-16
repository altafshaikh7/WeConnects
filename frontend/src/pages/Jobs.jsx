import { useEffect, useState } from "react";
import axios from "axios";

function Jobs() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API}/news?q=job%20market`);
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error("Jobs news error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [API]);

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-semibold mb-4">Jobs</h1>
          <p className="text-sm text-gray-600 mb-4">
            Stay current with the latest job market trends and hiring news.
          </p>

          {loading ? (
            <p className="text-sm text-gray-500">Loading jobs news...</p>
          ) : (
            <div className="grid gap-4">
              {articles.map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block border rounded-xl p-4 hover:shadow-lg transition"
                >
                  <h2 className="font-semibold mb-2 text-lg">{article.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {article.description}
                  </p>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>{article.source}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Jobs;
