"use client";

import { useEffect, useState } from "react";
import { getDashboardStats, type DashboardData } from "@/lib/api";

function formatRevenue(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "—";
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const dashboardData = await getDashboardStats();
        setData(dashboardData);
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

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          Dashboard
        </h1>

        <p className="page-description">
          Overview of your KaamSetu platform.
        </p>
      </div>

      {error && (
        <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">

        {/* Total Workers */}
        <div className="stat-card">
          <div className="stat-title">
            Total Workers
          </div>

          <div className="stat-value">
            {loading ? "..." : (stats?.total_workers?.toLocaleString("en-IN") ?? "—")}
          </div>

          <div className="stat-description">
            Registered workers
          </div>
        </div>


        {/* Available Workers */}
        <div className="stat-card">
          <div className="stat-title">
            Available Workers
          </div>

          <div className="stat-value">
            {loading ? "..." : (stats?.available_workers?.toLocaleString("en-IN") ?? "—")}
          </div>

          <div className="stat-description">
            Currently available
          </div>
        </div>


        {/* Open Jobs */}
        <div className="stat-card">
          <div className="stat-title">
            Open Jobs
          </div>

          <div className="stat-value">
            {loading ? "..." : (stats?.open_jobs?.toLocaleString("en-IN") ?? "—")}
          </div>

          <div className="stat-description">
            Jobs waiting for workers
          </div>
        </div>


        {/* Total Revenue */}
        <div className="stat-card">
          <div className="stat-title">
            Total Revenue
          </div>

          <div className="stat-value">
            {loading ? "..." : formatRevenue(stats?.total_revenue)}
          </div>

          <div className="stat-description">
            Completed payments
          </div>
        </div>

      </div>


      {/* Recent Bookings */}
      <div className="table-container">

        <div className="table-header">
          Recent Bookings
        </div>

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
              <tr>
                <td colSpan={4}>Loading recent bookings...</td>
              </tr>
            ) : recentBookings.length === 0 ? (
              <tr>
                <td colSpan={4}>No recent bookings found.</td>
              </tr>
            ) : (
              recentBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.worker_name || "—"}</td>
                  <td>{booking.job_title || "—"}</td>
                  <td>{booking.booking_status || "—"}</td>
                  <td>{booking.amount != null ? `₹${booking.amount.toLocaleString("en-IN")}` : "—"}</td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>


      {/* Platform Overview */}
      <div style={{ marginTop: "30px" }}>

        <div className="table-container">

          <div className="table-header">
            Platform Overview
          </div>

          <table>

            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Total Employers</td>
                <td>{loading ? "..." : (stats?.total_employers?.toLocaleString("en-IN") ?? "—")}</td>
              </tr>

              <tr>
                <td>Total Bookings</td>
                <td>{loading ? "..." : (stats?.total_bookings?.toLocaleString("en-IN") ?? "—")}</td>
              </tr>

              <tr>
                <td>Pending Payments</td>
                <td>{loading ? "..." : (stats?.pending_payments?.toLocaleString("en-IN") ?? "—")}</td>
              </tr>

              <tr>
                <td>Active Disputes</td>
                <td>{loading ? "..." : (stats?.active_disputes?.toLocaleString("en-IN") ?? "—")}</td>
              </tr>

              <tr>
                <td>Total Ratings</td>
                <td>{loading ? "..." : (stats?.total_ratings?.toLocaleString("en-IN") ?? "—")}</td>
              </tr>

              <tr>
                <td>Average Rating</td>
                <td>{loading ? "..." : (stats?.average_rating != null ? `${stats.average_rating} / 5.0` : "—")}</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}