import { useState } from "react";
import API from "../api/api.js";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react"; // lucide-react icons (install kar lena: npm i lucide-react)

import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await API.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950/60 to-black p-4">
      <div
        className="
          relative w-full max-w-md 
          bg-white/5 backdrop-blur-2xl 
          border border-white/10 rounded-2xl md:rounded-3xl 
          shadow-2xl shadow-indigo-950/40 
          p-8 md:p-10 
          transition-all duration-300 hover:shadow-indigo-900/30
        "
      >
        {/* Optional subtle glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mb-4 border border-indigo-400/30">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">
            Welcome Back
          </h2>
          <p className="text-gray-400 mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="
                w-full pl-11 pr-4 py-3.5 
                bg-white/5 border border-white/10 rounded-xl 
                text-white placeholder-gray-500 
                focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 
                transition-all duration-200
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="
                w-full pl-11 pr-12 py-3.5 
                bg-white/5 border border-white/10 rounded-xl 
                text-white placeholder-gray-500 
                focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 
                transition-all duration-200
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3.5 
              bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 
              hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 
              text-white font-semibold rounded-xl 
              shadow-lg shadow-indigo-700/30 
              transform hover:scale-[1.02] active:scale-[0.98] 
              transition-all duration-300 
              flex items-center justify-center gap-2 
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 space-y-2">
          <Link
            to="/forgot-password"
            className="text-indigo-400 hover:text-indigo-300 transition-colors block"
          >
            Forgot password?
          </Link>

          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}