import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { Zap } from "lucide-react";

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
        <div
          style={{
            height: "4px",
            backgroundColor: "#f59e0b",
            borderRadius: "4px 4px 0 0",
            margin: "-2.5rem -2.5rem 2rem -2.5rem",
          }}
        />

        <div style={styles.logo}>
          <Zap size={28} fill="#f59e0b" color="#f59e0b" />
          SportSpace
        </div>
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
    backgroundColor: "#f9fafb",
  },
  card: {
    backgroundColor: "white",
    padding: "2.5rem",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
    border: "1px solid #e5e7eb",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#0a0f1e",
    marginBottom: "0.5rem",
    letterSpacing: "-0.5px",
  },
  title: {
    textAlign: "center",
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#0a0f1e",
    marginBottom: "0.25rem",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "2rem",
    fontSize: "0.875rem",
    lineHeight: "1.6",
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "0.875rem",
    backgroundColor: "#fef2f2",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #fecaca",
  },
  success: {
    color: "#16a34a",
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "0.875rem",
    backgroundColor: "#f0fdf4",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #bbf7d0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.875rem 1rem",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "1.75rem",
    textAlign: "center",
    letterSpacing: "0.75rem",
    outline: "none",
    fontWeight: "700",
    color: "#0a0f1e",
  },
  button: {
    padding: "0.85rem",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0a0f1e",
    color: "white",
    fontSize: "0.95rem",
    cursor: "pointer",
    fontWeight: "700",
    letterSpacing: "0.3px",
  },
  resend: {
    textAlign: "center",
    marginTop: "1.25rem",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#f59e0b",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.875rem",
  },
};

export default VerifyOTP;
