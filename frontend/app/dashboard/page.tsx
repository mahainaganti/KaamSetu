"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardStats, type DashboardData } from "@/lib/api";
import { statusVariant } from "@/lib/badge";

function formatRevenue(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "—";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

const QUICK_ACTIONS = [
  { href: "/workers/new", icon: "👷", label: "Register a Worker" },
  { href: "/jobs/new", icon: "💼", label: "Post a Job" },
  { href: "/bookings/new", icon: "📅", label: "Create a Booking" },
  { href: "/payments/new", icon: "💳", label: "Record a Payment" },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        setData(await getDashboardStats());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const stats = data?.stats;
  const recentBookings = data?.recent_bookings ?? [];

  const primaryStats = [
    { title: "Total Workers", value: stats?.total_workers, icon: "👷", tone: "indigo", description: "Registered workers" },
    { title: "Available Workers", value: stats?.available_workers, icon: "✅", tone: "success", description: "Currently available" },
    { title: "Open Jobs", value: stats?.open_jobs, icon: "💼", tone: "warning", description: "Jobs waiting for workers" },
  ];

  const overviewStats = [
    { label: "Total Employers", value: stats?.total_employers, icon: "🏢" },
    { label: "Total Bookings", value: stats?.total_bookings, icon: "📅" },
    { label: "Pending Payments", value: stats?.pending_payments, icon: "⏳" },
    { label: "Active Disputes", value: stats?.active_disputes, icon: "⚠️" },
    { label: "Total Ratings", value: stats?.total_ratings, icon: "⭐" },
    { label: "Average Rating", value: stats?.average_rating != null ? `${stats.average_rating} / 5.0` : undefined, icon: "📊" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of your KaamSetu platform.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid">
        {primaryStats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <span className={`stat-icon stat-icon-${stat.tone}`}>{stat.icon}</span>
            </div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value">{loading ? "…" : (stat.value?.toLocaleString("en-IN") ?? "—")}</div>
            <div className="stat-description">{stat.description}</div>
          </div>
        ))}

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon stat-icon-info">💰</span>
          </div>
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">{loading ? "…" : formatRevenue(stats?.total_revenue)}</div>
          <div className="stat-description">Completed payments</div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="table-container">
          <div className="table-header">Recent Bookings</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="loading-row">Loading recent bookings...</td></tr>
                ) : recentBookings.length === 0 ? (
                  <tr><td colSpan={4}>
                    <div className="empty-state">
                      <span className="empty-state-icon">📅</span>
                      <span className="empty-state-title">No bookings yet</span>
                      <span className="empty-state-description">Recent bookings will show up here.</span>
                    </div>
                  </td></tr>
                ) : recentBookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>{booking.worker_name || "—"}</td>
                    <td>{booking.job_title || "—"}</td>
                    <td><span className={`badge ${statusVariant(booking.booking_status)}`}>{booking.booking_status || "—"}</span></td>
                    <td>{booking.amount != null ? `₹${booking.amount.toLocaleString("en-IN")}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">Quick Actions</div>
          <div className="quick-actions">
            {QUICK_ACTIONS.map((action) => (
              <Link href={action.href} className="quick-action" key={action.href}>
                <span className="quick-action-icon">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="section-mt stats-grid">
        {overviewStats.map((item) => (
          <div className="stat-card" key={item.label}>
            <div className="stat-card-top">
              <span className="stat-icon stat-icon-indigo">{item.icon}</span>
            </div>
            <div className="stat-title">{item.label}</div>
            <div className="stat-value">{loading ? "…" : (item.value?.toLocaleString?.("en-IN") ?? item.value ?? "—")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
