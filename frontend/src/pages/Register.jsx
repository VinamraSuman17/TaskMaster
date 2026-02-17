import { useState } from "react";
import API from "../api/api.js";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Mail, Lock, Loader2 } from "lucide-react";

import { toast } from "react-hot-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", {
        email,
        password,
      });

      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.detail ||
          err.response?.data?.message ||
          "Registration failed. Try again.";
      setError(msg);
      toast.error(msg);
      console.error("Register Error:", err);
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
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-2xl md:rounded-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full mb-4 border border-purple-400/30">
            <UserPlus className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300">
            Create Account
          </h2>
          <p className="text-gray-400 mt-2">Join the Task Scheduler</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
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
                focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
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
              placeholder="Create password"
              className="
                w-full pl-11 pr-12 py-3.5 
                bg-white/5 border border-white/10 rounded-xl 
                text-white placeholder-gray-500 
                focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
                transition-all duration-200
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error Display */}
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
              bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 
              hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 
              text-white font-semibold rounded-xl 
              shadow-lg shadow-purple-700/30 
              transform hover:scale-[1.02] active:scale-[0.98] 
              transition-all duration-300 
              flex items-center justify-center gap-2 
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}