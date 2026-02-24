import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logout from "./components/logout";

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
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
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  );
}
