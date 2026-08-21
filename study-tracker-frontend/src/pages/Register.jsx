import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await register(name, email, password);

      if (data.success) {
        setMessage(data.message);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
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

            <div className="feature-item">
              <span>✓</span>
              <p>Manage your study sessions</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Track your daily progress</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Achieve your academic goals</p>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-container">

        <div className="login-card">

          <div className="login-header">
            <h2>Create Account! ✨</h2>

            <p>
              Start your study journey today
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* NAME */}
            <div className="form-group">
              <label>Name</label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">✉️</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* SUCCESS MESSAGE */}
            {message && (
              <p className="success-message">
                {message}
              </p>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="register-link">
            Already have an account?

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;