import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const { token } = useParams(); // 🔑 URL se token aayega
  const navigate = useNavigate();

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
      successMsg.textContent = '✅ Password reset successful! Redirecting to login...';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || "Error resetting password");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && password && confirmPassword) {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f2ef] to-[#e9e5df] flex overflow-hidden">
      
      {/* LEFT SECTION - We Connect Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a66c2] to-[#004182] relative overflow-hidden">
        
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
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 text-white">
          <div className="mb-12 transform -translate-y-2 animate-slideDown">
            <Logo />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 leading-tight animate-slideLeft bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Reset Password
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-white mb-6 animate-slideLeft animation-delay-200"></div>
          
          <p className="text-xl mb-12 text-blue-100 animate-slideLeft animation-delay-200 leading-relaxed">
            Create a new password for your account.
          </p>
          
          <div className="space-y-6 animate-fadeIn animation-delay-400">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure Your Account</h3>
                <p className="text-blue-100 text-sm">Choose a strong password to keep your account safe</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Password Requirements</h3>
                <p className="text-blue-100 text-sm">Minimum 6 characters for a strong password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Reset Password Form */}
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
            
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0a66c2] to-[#004182] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0a66c2] to-[#004182] bg-clip-text text-transparent mb-2">
                Create New Password
              </h2>
              <p className="text-gray-500 text-sm">
                Your new password must be different from previously used passwords
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 animate-shake">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* New Password Input */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                New Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
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

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/20 transition-all duration-200"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0a66c2] text-sm font-semibold hover:text-[#004182] transition-colors"
                  type="button"
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mb-4">
                <div className="flex gap-1 mb-2">
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    /[!@#$%^&*]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                </div>
                <p className="text-xs text-gray-500">
                  {password.length < 6 && "Weak - Use at least 6 characters"}
                  {password.length >= 6 && password.length < 8 && "Medium - Add more characters for strength"}
                  {password.length >= 8 && /[!@#$%^&*]/.test(password) && "Strong - Good password!"}
                  {password.length >= 8 && !/[!@#$%^&*]/.test(password) && "Medium - Add special characters for strength"}
                </p>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={handleReset}
              disabled={!password || !confirmPassword || isLoading}
              className={`w-full py-3 rounded-xl font-bold transition-all duration-200 transform ${
                password && confirmPassword && !isLoading
                  ? "bg-gradient-to-r from-[#0a66c2] to-[#004182] text-white hover:shadow-lg hover:-translate-y-0.5 hover:shadow-[#0a66c2]/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-[#0a66c2] font-bold hover:text-[#004182] transition-colors ml-1 hover:underline"
                >
                  Back to Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6 animate-fadeIn animation-delay-600">
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

export default ResetPassword;