import toast from "react-hot-toast";
import { useState } from "react";

export default function EmailNotifier() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          toast.success(data.message);
        } catch (err) {
          toast.error("Failed to update email credentials");
        } finally {
          setLoading(false);
        }
      };

    return (
        <div className="max-w-md mx-auto p-4 bg-[#1a1a1a] rounded mt-6">
            <h2 className="text-xl font-semibold text-[#D4AF37] mb-4">Admin Email Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-black/50 border border-neutral-700"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-black/50 border border-neutral-700"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-[#D4AF37] text-black hover:opacity-90"
                }`}
            >
                {loading ? "Saving..." : "Save"}
            </button>
            </form>
        </div>
    );
}