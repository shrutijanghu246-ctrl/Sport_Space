import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { Zap } from "lucide-react";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    sport: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/register", formData);
      // Navigate to OTP page with userId
      navigate("/verify-otp", { state: { userId: res.data.userId } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join your college sports platform</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="member">Member</option>
            <option value="captain">Captain</option>
            <option value="coach">Coach</option>
          </select>
          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Select Sport</option>
            <option value="Athletics">Athletics</option>
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Badminton">Badminton</option>
            <option value="Table Tennis">Table Tennis</option>
            <option value="Chess">Chess</option>
            <option value="Swimming">Swimming</option>
            <option value="Kabaddi">Kabaddi</option>
            <option value="Kho Kho">Kho Kho</option>
            <option value="Tennis">Tennis</option>
            <option value="Hockey">Hockey</option>
            <option value="Wrestling">Wrestling</option>
            <option value="Weightlifting">Weightlifting</option>
          </select>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#f59e0b", fontWeight: "600" }}>
            Login here
          </Link>
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
    padding: "2rem 1.5rem",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
    border: "1px solid #e5e7eb",
    margin: "1rem",
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
    letterSpacing: "-0.3px",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "2rem",
    fontSize: "0.9rem",
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
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
    transition: "background 0.15s",
    marginTop: "0.25rem",
  },
  link: {
    textAlign: "center",
    marginTop: "1.25rem",
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "1rem 0",
    color: "#9ca3af",
    fontSize: "0.8rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e5e7eb",
  },
};

export default RegisterPage;
