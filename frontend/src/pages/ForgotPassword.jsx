import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
      successMsg.textContent = '📩 Reset link sent! Check your email';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || "Error sending reset link");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && email) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f2ef] to-[#e9e5df] flex overflow-hidden">
      
      {/* LEFT SECTION - EXACT SAME AS LOGIN PAGE */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a66c2] to-[#004182] relative overflow-hidden">
        
        {/* Animated Background Patterns */}
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
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 text-white">
          <div className="mb-12 transform -translate-y-2 animate-slideDown">
            <Logo />
          </div>
          
          <h1 className="text-6xl font-bold mb-4 leading-tight animate-slideLeft bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            We Connect
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-white mb-6 animate-slideLeft animation-delay-200"></div>
          
          <p className="text-xl mb-12 text-blue-100 animate-slideLeft animation-delay-200 leading-relaxed">
            Enter your email to receive a password reset link.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 group cursor-pointer transform transition-all duration-300 hover:translate-x-2">
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Connect Professionally</h3>
                <p className="text-blue-100 text-sm">Build meaningful connections with industry professionals</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group cursor-pointer transform transition-all duration-300 hover:translate-x-2">
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Grow Your Career</h3>
                <p className="text-blue-100 text-sm">Discover opportunities and advance your professional journey</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group cursor-pointer transform transition-all duration-300 hover:translate-x-2">
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Find Jobs</h3>
                <p className="text-blue-100 text-sm">Access exclusive job postings from top companies</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 group cursor-pointer transform transition-all duration-300 hover:translate-x-2">
              <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Stay Connected</h3>
                <p className="text-blue-100 text-sm">Share insights and engage with your network</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center animate-fadeIn">
            <Logo />
          </div>

          {/* Card with Animation */}
          <div 
            className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 transition-all duration-500 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            } hover:shadow-3xl`}
          >
            
            {/* Header - Fixed Icon */}
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0a66c2] to-[#004182] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM12 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0a66c2] to-[#004182] bg-clip-text text-transparent mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-500 text-sm">
                Don't worry! Enter your email to receive a reset link
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 animate-shake">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="relative mb-6 group">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#0a66c2] w-5 h-5 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 text-[#0a66c2] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-600">
                We'll send a password reset link to this email address. The link will expire in 1 hour.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!email || loading}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-200 transform flex items-center justify-center gap-2 ${
                email && !loading
                  ? "bg-gradient-to-r from-[#0a66c2] to-[#004182] text-white hover:shadow-lg hover:-translate-y-0.5 hover:shadow-[#0a66c2]/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-[#0a66c2] font-bold hover:text-[#004182] transition-colors ml-1 hover:underline inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6 animate-fadeIn animation-delay-600 inline-flex items-center justify-center gap-1 w-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L9.172 14.828M12 5.636L5.636 12M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need help?{" "}
            <button className="text-[#0a66c2] font-medium hover:underline">
              Contact Support
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
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
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
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
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
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
    </div>
  );
}

export default ForgotPassword;