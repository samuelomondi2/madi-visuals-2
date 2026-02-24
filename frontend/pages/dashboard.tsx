'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("https://madi-visuals-2.onrender.com/api/contact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      // Map backend fields to dashboard interface
      const mapped = data.contacts.map((msg: any) => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        message: msg.message,
        status: msg.status,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
      }));

      setMessages(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Delete a message
  const handleDelete = async (id: number) => {
    const token = getToken();
    try {
      const res = await fetch(`https://madi-visuals-2.onrender.com/api/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete message");
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  // Toggle status
  const toggleStatus = async (id: number, currentStatus: "pending" | "resolved") => {
    const token = getToken();
    const newStatus = currentStatus === "pending" ? "resolved" : "pending";

    try {
      const res = await fetch(`https://madi-visuals-2.onrender.com/api/contact/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setMessages(
        messages.map((msg) =>
          msg.id === id ? { ...msg, status: newStatus } : msg
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading contact messages...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Contact Messages Dashboard</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Name</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Email</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Phone</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Message</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Date</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id} style={{ borderBottom: "1px solid #444" }}>
                <td style={{ padding: "0.5rem" }}>{msg.name}</td>
                <td style={{ padding: "0.5rem" }}>{msg.email}</td>
                <td style={{ padding: "0.5rem" }}>{msg.phone}</td>
                <td style={{ padding: "0.5rem" }}>{msg.message}</td>
                <td style={{ padding: "0.5rem" }}>{msg.status}</td>
                <td style={{ padding: "0.5rem" }}>{new Date(msg.createdAt).toLocaleString()}</td>
                <td style={{ padding: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => toggleStatus(msg.id, msg.status)}
                    style={{ padding: "4px 8px", cursor: "pointer" }}
                  >
                    {msg.status === "pending" ? "Mark Resolved" : "Mark Pending"}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    style={{ padding: "4px 8px", cursor: "pointer", color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleLogout} style={{ padding: "8px 16px" }}>
          Logout
        </button>
      </div>
    </div>
  );
}