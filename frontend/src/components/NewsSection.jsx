import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const categories = [
  { key: "technology", label: "Tech News" },
  { key: "startup", label: "Startup Updates" },
  { key: "job market", label: "Job Market Trends" },
  { key: "business", label: "Business" },
  { key: "ai", label: "AI/ML" },
  { key: "crypto", label: "Crypto" },
];

function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("technology");
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [similarArticles, setSimilarArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

  // Fetch news based on category
  const fetchNews = useCallback(async (category, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await axios.get(
        `${API}/news?q=${encodeURIComponent(category)}&limit=8`
      );
      setArticles(res.data.articles || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API]);

  // Fetch similar articles based on clicked article
  const fetchSimilarArticles = async (article) => {
    try {
      const res = await axios.get(`${API}/news/similar`, {
        params: {
          title: article.title,
          category: article.category || activeCategory,
          excludeId: article.id
        }
      });
      return res.data.articles || [];
    } catch (err) {
      console.error("Similar articles error:", err);
      return [];
    }
  };

  // Handle article click
  const handleArticleClick = async (article, e) => {
    // Don't open modal if clicking on links inside
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    
    // Open original article in new tab
    window.open(article.url, '_blank');
    
    // Fetch and show similar articles
    setSelectedArticle(article);
    setLoading(true);
    
    const similar = await fetchSimilarArticles(article);
    setSimilarArticles(similar);
    setShowModal(true);
    setLoading(false);
  };

  // Real-time auto-refresh (every 5 minutes)
  useEffect(() => {
    fetchNews(activeCategory);
    
    // Auto-refresh every 5 minutes for real-time updates
    const interval = setInterval(() => {
      fetchNews(activeCategory, true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [activeCategory, fetchNews]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchNews(activeCategory, true);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        {/* Header with refresh indicator */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>📰</span>Latest News
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {refreshing && <span className="ml-2 text-blue-500 inline-flex items-center gap-1">⟳ Refreshing...</span>}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            title="Refresh news"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`rounded-full px-3 py-1 text-sm transition border
                ${activeCategory === category.key
                  ? "bg-[#0a66c2] text-white border-[#0a66c2]"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {loading && !refreshing ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="block rounded-xl border p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article, index) => (
              <div
                key={article.id || index}
                onClick={(e) => handleArticleClick(article, e)}
                className="block rounded-xl border p-3 hover:shadow-lg transition-all cursor-pointer group hover:border-[#0a66c2]"
              >
                {/* Image if available */}
                {article.image && !article.image.includes('placeholder') && (
                  <div className="mb-2 overflow-hidden rounded-lg">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                
                <h3 className="font-semibold text-sm mb-1 group-hover:text-[#0a66c2] transition line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {article.description || "Click to read full article..."}
                </p>
                
                <div className="text-[11px] text-gray-500 flex justify-between items-center flex-wrap gap-1">
                  <div className="flex gap-2 flex-wrap">
                    <span className="font-medium">📌 {article.source}</span>
                    {article.category && (
                      <span className="bg-gray-100 px-1 rounded">#{article.category}</span>
                    )}
                  </div>
                  <span>📅 {new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                
                {/* Similar articles indicator */}
                <div className="mt-2 text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition">
                  🔍 Click to find similar stories →
                </div>
              </div>
            ))}
            
            {articles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No articles found</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-2 text-blue-600 text-sm hover:underline"
                >
                  Try refreshing
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Real-time indicator */}
        <div className="mt-4 pt-3 border-t text-[10px] text-gray-400 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Real-time updates every 5 minutes
          </span>
          <span>{articles.length} articles loaded</span>
        </div>
      </div>

      {/* Similar Articles Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>📚</span> Similar Stories
                </h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  Based on: "{selectedArticle?.title.substring(0, 60)}..."
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition ml-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body - Similar Articles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Finding similar articles...</p>
                </div>
              ) : similarArticles.length > 0 ? (
                similarArticles.map((article, idx) => (
                  <a
                    key={article.id || idx}
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border p-3 hover:shadow-md transition hover:bg-gray-50 group"
                  >
                    <div className="flex gap-3">
                      {article.image && !article.image.includes('placeholder') && (
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 group-hover:text-[#0a66c2] transition line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {article.description || "Click to read full article"}
                        </p>
                        <div className="mt-2 text-[10px] text-gray-500">
                          {article.source}
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No similar articles found</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for "{selectedArticle?.title.substring(0, 40)}..." on Google</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
              💡 Tip: Click any article to find similar stories automatically
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles for line-clamp and animations */}
      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}

export default NewsSection;