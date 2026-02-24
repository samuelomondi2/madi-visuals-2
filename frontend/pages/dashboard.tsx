import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logout from "./logout";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to get token from either storage
  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("https://madi-visuals-2.onrender.com/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) setMessage(data.message);
        else router.push("/login"); // invalid response → redirect
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p>{message}</p>

      {/* Add the logout button */}
      <div style={{ marginTop: "2rem" }}>
        <Logout />
      </div>
    </div>
  );
}