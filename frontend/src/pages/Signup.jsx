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

  const navigate = useNavigate();

  // Animation on mount
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
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
      successMsg.textContent = '✅ Signup Successful! Redirecting to login...';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.open("http://localhost:5000/api/auth/google", "_self");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && name && email && password) {
      handleSignup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f2ef] to-[#e9e5df] flex overflow-hidden">
      
      {/* LEFT SECTION - We Connect Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a66c2] to-[#004182] relative overflow-hidden">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 right-10 w-20 h-20 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/3 left-10 w-16 h-16 bg-white/5 rounded-full animate-bounce delay-700"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 text-white">
          <div className="mb-12 transform -translate-y-2 animate-slideDown">
            <Logo />
          </div>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight animate-slideLeft">
            Join We Connect
          </h1>
          <p className="text-xl mb-12 text-blue-100 animate-slideLeft animation-delay-200">
            Start your professional journey with millions of talented individuals.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-12 animate-fadeIn animation-delay-400">
            <div>
              <div className="text-3xl font-bold">500M+</div>
              <div className="text-sm text-blue-200">Professionals</div>
            </div>
            <div>
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm text-blue-200">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold">40M+</div>
              <div className="text-sm text-blue-200">Jobs Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10M+</div>
              <div className="text-sm text-blue-200">Companies</div>
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-fadeIn animation-delay-600">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl">
                👩‍💼
              </div>
              <div>
                <p className="font-semibold">Priya Sharma</p>
                <p className="text-xs text-blue-200">Senior Software Engineer</p>
              </div>
            </div>
            <p className="text-sm italic">
              "We Connect helped me land my dream job at Google. The networking opportunities are unparalleled!"
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Signup Form */}
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
            }`}
          >
            
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0a66c2] to-[#004182] bg-clip-text text-transparent mb-2">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm">
                Join the world's largest professional network
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 animate-shake">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Name Input */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
              />
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (6+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0a66c2] text-sm font-semibold hover:text-[#004182] transition-colors"
                  type="button"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Must be at least 6 characters
              </p>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
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
              className={`w-full py-3 rounded-xl font-bold transition-all duration-200 transform ${
                name && email && password && !isLoading
                  ? "bg-gradient-to-r from-[#0a66c2] to-[#004182] text-white hover:shadow-lg hover:-translate-y-0.5 hover:shadow-[#0a66c2]/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Agree & Join"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                Continue with Google
              </span>
            </button>

            {/* Bottom Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already on We Connect?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-[#0a66c2] font-bold hover:text-[#004182] transition-colors ml-1 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6 animate-fadeIn animation-delay-800">
            Looking to create a page for your organization?{" "}
            <button className="text-[#0a66c2] font-medium hover:underline">
              Get help
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
        
        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

export default Signup;