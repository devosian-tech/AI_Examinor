import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../components/index.css';

const images = [
  "/images/image-1.jpeg",
  "/images/image-2.jpg",
  "/images/image-3.jpg",
  "/images/image-4.jpg"
];

const API_URL = "http://localhost:8000";

export default function Auth() {
  const [index, setIndex] = useState(0);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && !formData.agreeToTerms) {
        setError("Please agree to the terms and conditions");
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.user_id);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Navigate to upload page
      navigate("/upload");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={images[index]} className="slider-image" alt="Slideshow" />

        <div className="overlay-text">
          <h2>Learn Smarter,</h2>
          <h2>Not Harder</h2>
        </div>
      </div>

      <div className="auth-right">
        <h1>{isLogin ? "Sign In" : "Create an account"}</h1>

        {error && (
          <div style={{ 
            padding: "12px", 
            marginBottom: "20px", 
            background: "#fee", 
            color: "#c33", 
            borderRadius: "8px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="name-group">
              <input
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <input
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          )}

          <input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />

          {!isLogin && (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              />
              I agree to Terms
            </label>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create account"}
          </button>
        </form>

        <p className="toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}>
            {isLogin ? " Sign Up" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
}   