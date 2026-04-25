import { useState, useEffect } from "react";
import Logo from "../components/logo";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const navigate = useNavigate();

  // Animation on mount - SAME AS LOGIN PAGE
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 🔥 API CALL
  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    setShowLoadingOverlay(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      console.log(res.data);
      
      setTimeout(() => {
        setShowLoadingOverlay(false);
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
      setIsLoading(false);
      setShowLoadingOverlay(false);
    }
  };

  const handleGoogleSignup = () => {
    setShowLoadingOverlay(true);
    setTimeout(() => {
      window.open("http://localhost:5000/api/auth/google", "_self");
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && name && email && password) {
      handleSignup();
    }
  };

  // Professional quotes array
  const quotes = [
    {
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      role: "Management Consultant"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      role: "Leader"
    },
    {
      text: "Your network is your net worth.",
      author: "Porter Gale",
      role: "Author"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      role: "Apple Founder"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Loading Overlay - SAME AS LOGIN PAGE */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a66c2] to-[#004182] z-50 flex flex-col items-center justify-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-ping"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-pulse">
              We Connect
            </h1>
            
            <div className="w-64 md:w-96 mx-auto relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-1 bg-white/30 rounded-full w-full"></div>
              </div>
              <div className="relative h-1 overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300 to-white animate-loading-line"></div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Main Signup Page - FIXED HEIGHT, NO SCROLLING */}
      <div className="h-screen w-screen bg-gradient-to-br from-[#f3f2ef] to-[#e9e5df] flex overflow-hidden">
        
        {/* LEFT SECTION - We Connect Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a66c2] to-[#004182] relative overflow-hidden h-full">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/20 animate-particle"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 5}s`
                }}
              ></div>
            ))}
          </div>
          
          <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-orb-1"></div>
          <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-orb-2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <svg className="absolute bottom-0 left-0 w-full opacity-20" preserveAspectRatio="none" viewBox="0 0 1440 120">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" 
              fill="white" className="animate-wave-1"></path>
            <path d="M0,96L80,90.7C160,85,320,75,480,80C640,85,800,107,960,112C1120,117,1280,107,1360,101.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" 
              fill="white" className="animate-wave-2" opacity="0.5"></path>
          </svg>
          
          <div className="absolute top-20 right-20 w-40 h-40 border-4 border-white/10 rounded-2xl animate-float-shape-1"></div>
          <div className="absolute bottom-32 left-20 w-32 h-32 border-4 border-white/10 rounded-full animate-float-shape-2"></div>
          <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-white/5 rounded-lg animate-float-shape-3"></div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/10 rounded-full animate-rotate-ring"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-white/5 rounded-full animate-rotate-ring-reverse"></div>
          
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent animate-light-ray"></div>
            <div className="absolute top-0 left-1/3 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-light-ray delay-2000"></div>
            <div className="absolute top-0 left-2/3 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-light-ray delay-4000"></div>
          </div>
          
          {/* Content - Fixed height, no scroll */}
          <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 text-white h-full overflow-hidden">
            <div className="mb-8 transform -translate-y-2 animate-slideDown">
              <Logo />
            </div>
            
            <h1 className="text-5xl font-bold mb-3 leading-tight animate-slideLeft bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Join We Connect
            </h1>
            
            <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-white mb-5 animate-slideLeft animation-delay-200"></div>
            
            <p className="text-lg mb-6 text-blue-100 animate-slideLeft animation-delay-200 leading-relaxed">
              Start your professional journey with millions of talented individuals.
            </p>
            
            {/* Features Grid - Compact */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 group cursor-pointer transform transition-all duration-300 hover:translate-x-2 animate-slideRight animation-delay-300">
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Connect Professionally</h3>
                  <p className="text-blue-100 text-xs">Build meaningful connections with professionals</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group cursor-pointer transform transition-all duration-300 hover:translate-x-2 animate-slideRight animation-delay-400">
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Grow Your Career</h3>
                  <p className="text-blue-100 text-xs">Discover opportunities and advance your journey</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group cursor-pointer transform transition-all duration-300 hover:translate-x-2 animate-slideRight animation-delay-500">
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Find Jobs</h3>
                  <p className="text-blue-100 text-xs">Access exclusive job postings from top companies</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group cursor-pointer transform transition-all duration-300 hover:translate-x-2 animate-slideRight animation-delay-600">
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Stay Connected</h3>
                  <p className="text-blue-100 text-xs">Share insights and engage with your network</p>
                </div>
              </div>
            </div>
            
            {/* Quotes Section - Compact */}
            <div className="animate-fadeIn animation-delay-700">
              <div className="backdrop-blur-sm bg-white/10 rounded-xl p-3 transform transition-all duration-500 hover:scale-105">
                <div className="text-2xl mb-1 opacity-50">"</div>
                <p className="text-xs font-light leading-relaxed mb-2 transition-all duration-500">
                  {quotes[currentQuote].text}
                </p>
                <div className="border-t border-white/20 pt-2">
                  <p className="font-semibold text-xs">{quotes[currentQuote].author}</p>
                  <p className="text-xs text-blue-200">{quotes[currentQuote].role}</p>
                </div>
                <div className="flex gap-1.5 justify-center mt-2">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuote(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentQuote === index 
                          ? "w-5 bg-white" 
                          : "w-1.5 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Signup Form - FIXED HEIGHT, NO SCROLL */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 h-full overflow-hidden">
          <div className="w-full max-w-md">
            
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 text-center animate-fadeIn">
              <Logo />
            </div>

            {/* Card with Animation */}
            <div 
              className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transition-all duration-500 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              } hover:shadow-3xl`}
            >
              
              {/* Header */}
              <div className="mb-5 text-center">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0a66c2] to-[#004182] bg-clip-text text-transparent mb-1">
                  Create Account
                </h2>
                <p className="text-gray-500 text-xs">
                  Join the world's largest professional network
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 animate-shake">
                  <p className="text-red-600 text-xs text-center">{error}</p>
                </div>
              )}

              {/* Name Input */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
                />
              </div>

              {/* Email Input */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
                />
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (6+ characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-3 py-2 text-sm pr-20 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#0a66c2] text-xs font-semibold hover:text-[#004182] transition-colors"
                    type="button"
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-xl p-2 mb-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  By clicking <span className="font-semibold">Agree & Join</span>, you agree to the{" "}
                  <button className="text-[#0a66c2] hover:underline font-medium">
                    User Agreement
                  </button>
                  ,{" "}
                  <button className="text-[#0a66c2] hover:underline font-medium">
                    Privacy Policy
                  </button>
                  , and{" "}
                  <button className="text-[#0a66c2] hover:underline font-medium">
                    Cookie Policy
                  </button>
                  .
                </p>
              </div>

              {/* Signup Button */}
              <button
                onClick={handleSignup}
                disabled={!name || !email || !password || isLoading}
                className={`w-full py-2 rounded-xl font-bold text-sm transition-all duration-200 transform ${
                  name && email && password && !isLoading
                    ? "bg-gradient-to-r from-[#0a66c2] to-[#004182] text-white hover:shadow-lg hover:-translate-y-0.5 hover:shadow-[#0a66c2]/30"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Agree & Join"
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500">or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  className="w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                  Continue with Google
                </span>
              </button>

              {/* Bottom Link */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">
                  Already on We Connect?{" "}
                  <button
                    onClick={() => navigate("/")}
                    className="text-[#0a66c2] font-bold hover:text-[#004182] transition-colors ml-1 hover:underline text-xs"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500 mt-4 animate-fadeIn animation-delay-800">
              Looking to create a page for your organization?{" "}
              <button className="text-[#0a66c2] font-medium hover:underline">
                Get help
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes loadingLine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        
        @keyframes orb-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -30px) scale(1.1);
          }
        }
        
        @keyframes orb-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 30px) scale(1.15);
          }
        }
        
        @keyframes wave-1 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-30px) translateY(-10px);
          }
        }
        
        @keyframes wave-2 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(30px) translateY(10px);
          }
        }
        
        @keyframes float-shape-1 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -10px) rotate(5deg);
          }
          75% {
            transform: translate(-10px, 10px) rotate(-5deg);
          }
        }
        
        @keyframes float-shape-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-15px, -15px) scale(1.05);
          }
        }
        
        @keyframes float-shape-3 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(15px, -10px) rotate(10deg);
          }
        }
        
        @keyframes rotate-ring {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes rotate-ring-reverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
        
        @keyframes light-ray {
          0% {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(-50%) translateY(100%);
            opacity: 0;
          }
        }
        
        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.05);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }
        
        .animate-slideLeft {
          animation: slideLeft 0.6s ease-out;
        }
        
        .animate-slideRight {
          animation: slideRight 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animate-loading-line {
          animation: loadingLine 1.5s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-orb-1 {
          animation: orb-1 8s ease-in-out infinite;
        }
        
        .animate-orb-2 {
          animation: orb-2 10s ease-in-out infinite;
        }
        
        .animate-wave-1 {
          animation: wave-1 6s ease-in-out infinite;
        }
        
        .animate-wave-2 {
          animation: wave-2 8s ease-in-out infinite;
        }
        
        .animate-float-shape-1 {
          animation: float-shape-1 12s ease-in-out infinite;
        }
        
        .animate-float-shape-2 {
          animation: float-shape-2 15s ease-in-out infinite;
        }
        
        .animate-float-shape-3 {
          animation: float-shape-3 10s ease-in-out infinite;
        }
        
        .animate-rotate-ring {
          animation: rotate-ring 20s linear infinite;
        }
        
        .animate-rotate-ring-reverse {
          animation: rotate-ring-reverse 25s linear infinite;
        }
        
        .animate-light-ray {
          animation: light-ray 8s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
        
        .delay-4000 {
          animation-delay: 4s;
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
}

export default Signup;
