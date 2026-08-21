import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.success) {
        navigate("/dashboard");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left branding section */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            📚
          </div>

          <h1>Study Tracker</h1>

          <p>
            Organize your studies, track your progress,
            and achieve your goals.
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              Manage your study sessions
            </div>

            <div>
              <span>✓</span>
              Track your daily progress
            </div>

            <div>
              <span>✓</span>
              Achieve your academic goals
            </div>
          </div>
        </div>
      </div>

      {/* Login section */}
      <div className="login-section">
        <div className="login-card">
          <div className="mobile-logo">📚</div>

          <h2>Welcome Back! 👋</h2>

          <p className="login-subtitle">
            Login to continue your study journey
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="register-link">
            Don't have an account?
            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;