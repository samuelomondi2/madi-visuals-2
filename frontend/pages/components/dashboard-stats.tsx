'use client';

import { useEffect, useState } from "react";

interface Stats {
  today_bookings: number;
  today_revenue: number;
  total_bookings: number;
  total_revenue: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`
      );
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (!stats) return <p>Failed to load stats</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Today's Bookings" value={stats.today_bookings} />
      <StatCard title="Today's Revenue" value={`$${stats.today_revenue}`} />
      <StatCard title="Total Bookings" value={stats.total_bookings} />
      <StatCard title="Total Revenue" value={`$${stats.total_revenue}`} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-neutral-800">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="text-xl font-bold text-[#D4AF37]">{value}</p>
    </div>
  );
}