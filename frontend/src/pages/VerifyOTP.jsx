import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  //userId passed from RegisterPages via navigation state
  const userId = location.state?.userId;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/verify-otp", { userId, otp });
      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setMessage("");
      setError("");
      await axiosInstance.post("/auth/resend-otp", { userId });
      setMessage("OTP resent! Check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  if (!userId) {
    navigate("/register");
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🏅 SportSpace</h1>
        <h2 style={styles.title}>Verify your email</h2>
        <p style={styles.subtitle}>
          We've sent a 6-digit OTP to your email. Enter it below to activate
          your account.
        </p>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <form onSubmit={handleVerify} style={styles.form}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={styles.input}
            maxLength={6}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p style={styles.resend}>
          Didn't receive OTP?{" "}
          <button onClick={handleResend} style={styles.resendBtn}>
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  logo: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  title: {
    textAlign: "center",
    fontSize: "1.5rem",
    marginBottom: "0.25rem",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
    lineHeight: "1.5",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  success: {
    color: "#22c55e",
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1.5rem",
    textAlign: "center",
    letterSpacing: "0.5rem",
  },
  button: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  resend: {
    textAlign: "center",
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "#666",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
};

export default VerifyOTP;
