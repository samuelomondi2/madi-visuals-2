"use client";

import { useState } from "react";
import Footer from "./components/footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) throw new Error();

      setStatus("success");
      setEmail(""); // optional clear input
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <div style={styles.page}>
        <div style={styles.card}>
          
          <h1 style={styles.title}>Forgot Password?</h1>

          <p style={styles.subtitleStrong}>No worries!</p>

          <p style={styles.subtitle}>
            Enter your email address below, and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                ...styles.button,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                opacity: status === "loading" ? 0.7 : 1,
                cursor: status === "loading" ? "not-allowed" : "pointer",
              }}
            >
              {status === "loading" && <span style={styles.spinner}></span>}
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {status === "success" && (
            <p style={styles.success}>
              Check your email
              <br/>
              We just sent an email to you with a link to reset your password!
            </p>
          )}

          {status === "error" && (
            <p style={styles.error}>
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
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
    padding: "40px",
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.3)",
    boxShadow: "0 0 40px rgba(212,175,55,0.15)",
    textAlign: "center",
    color: "#fff",
  },
  title: {
    fontSize: "28px",
    fontWeight: 600,
    marginBottom: "10px",
  },
  subtitleStrong: {
    marginBottom: "5px",
    fontWeight: 500,
  },
  subtitle: {
    fontSize: "14px",
    color: "#aaa",
    lineHeight: 1.5,
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(212,175,55,0.2)",
    background: "#111",
    color: "#fff",
    outline: "none",
  },
  button: {
    background: "linear-gradient(90deg, #C9A227, #FFD700)",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    color: "#000",
    fontWeight: 700,
  },
  success: {
    marginTop: "15px",
    color: "#4CAF50",
    fontSize: "14px",
  },
  error: {
    marginTop: "15px",
    color: "#ff4d4f",
    fontSize: "14px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(0,0,0,0.2)",
    borderTop: "2px solid #000",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
};