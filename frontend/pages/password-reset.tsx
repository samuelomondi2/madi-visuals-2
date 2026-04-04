"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token || typeof token !== "string") {
      setError("Invalid reset link");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset failed");
        setStatus("error");
        return;
      }

      setStatus("success");

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      setError("Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Password</h1>

        <p style={styles.subtitle}>
          Enter your new password below.
        </p>

        <form onSubmit={handleReset} style={styles.form}>
          
          {/* Password */}
          <div style={styles.inputWrapper}>
            <input
              type={visible ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              style={styles.iconButton}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          {status === "success" && (
            <p style={styles.success}>
              Password reset successful! Redirecting...
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              ...styles.button,
              opacity: status === "loading" ? 0.7 : 1,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {status === "loading" && <span style={styles.spinner}></span>}
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
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
      padding: "40px",
      borderRadius: "18px",
      border: "1px solid rgba(212,175,55,0.3)",
      boxShadow: "0 0 40px rgba(212,175,55,0.15)",
      color: "#fff",
      textAlign: "center",
    },
    title: {
      fontSize: "26px",
      marginBottom: "10px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#aaa",
      marginBottom: "20px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid rgba(212,175,55,0.2)",
      background: "#111",
      color: "#fff",
    },
    inputWrapper: {
      position: "relative",
    },
    iconButton: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      color: "#D4AF37",
      cursor: "pointer",
    },
    button: {
      background: "linear-gradient(90deg, #C9A227, #FFD700)",
      border: "none",
      padding: "14px",
      borderRadius: "10px",
      color: "#000",
      fontWeight: 700,
    },
    error: {
      color: "#ff4d4f",
      fontSize: "13px",
    },
    success: {
      color: "#4CAF50",
      fontSize: "13px",
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