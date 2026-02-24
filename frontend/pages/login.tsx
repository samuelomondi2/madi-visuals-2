import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // console.log("Login response:", data);

      if (remember) {
        localStorage.setItem("token", data.token);
      } else {
        sessionStorage.setItem("token", data.token);
      }

      // console.log("Redirecting to dashboard...");
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>✦</div>

        <h1 style={styles.title}>Welcome Back</h1>
        {/* <p style={styles.subtitle}>
          Don’t have an account yet?{" "}
          <span
            style={styles.signup}
            onClick={() => router.push("/register")}
          >
            Sign up
          </span>
        </p> */}

        <br/>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          {/* Remember + Forgot Row */}
          <div style={styles.optionsRow}>
            <label style={styles.rememberLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={styles.checkbox}
              />
              Remember me
            </label>

            <span
              style={styles.forgot}
              onClick={() => router.push("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>

        {/* <div style={styles.divider}>
          <span style={styles.line} />
          <span style={styles.or}>OR</span>
          <span style={styles.line} />
        </div>

        <div style={styles.socialContainer}>
          <button style={styles.socialButton}></button>
          <button style={styles.socialButton}>G</button>
          <button style={styles.socialButton}>X</button>
        </div> */}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at center, #111 0%, #000 70%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
  },
  card: {
    width: "400px",
    background: "#0c0c0c",
    padding: "45px",
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.3)",
    boxShadow: "0 0 40px rgba(212,175,55,0.15)",
    textAlign: "center",
    color: "#fff",
  },
  logo: {
    fontSize: "26px",
    marginBottom: "15px",
    color: "#D4AF37",
  },
  title: {
    margin: "10px 0 5px",
    fontSize: "26px",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: "14px",
    color: "#999",
    marginBottom: "30px",
  },
  signup: {
    color: "#D4AF37",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    backgroundColor: "#111",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "10px",
    padding: "14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#ccc",
    cursor: "pointer",
  },
  checkbox: {
    accentColor: "#D4AF37",
    cursor: "pointer",
  },
  forgot: {
    color: "#D4AF37",
    cursor: "pointer",
  },
  loginButton: {
    background: "linear-gradient(90deg, #C9A227, #FFD700)",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    color: "#000",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "5px",
    letterSpacing: "1px",
  },
  error: {
    color: "#ff4d4f",
    fontSize: "13px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "30px 0 15px",
  },
  line: {
    flex: 1,
    height: "1px",
    backgroundColor: "rgba(212,175,55,0.2)",
  },
  or: {
    margin: "0 10px",
    fontSize: "12px",
    color: "#D4AF37",
    letterSpacing: "1px",
  },
  socialContainer: {
    display: "flex",
    gap: "12px",
  },
  socialButton: {
    flex: 1,
    backgroundColor: "#111",
    border: "1px solid rgba(212,175,55,0.3)",
    padding: "12px",
    borderRadius: "10px",
    color: "#D4AF37",
    cursor: "pointer",
    fontWeight: 600,
  },
};
