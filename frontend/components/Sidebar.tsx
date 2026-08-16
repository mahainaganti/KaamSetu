"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Workers", path: "/workers", icon: "👷" },
    { name: "Employers", path: "/employers", icon: "🏢" },
    { name: "Jobs", path: "/jobs", icon: "💼" },
    { name: "Bookings", path: "/bookings", icon: "📅" },
    { name: "Payments", path: "/payments", icon: "💳" },
    { name: "Ratings", path: "/ratings", icon: "⭐" },
    { name: "Duty Status", path: "/duty", icon: "🟢" },
    { name: "Need Help Now", path: "/help/new", icon: "🚨" },
    { name: "My Offers", path: "/offers", icon: "📨" },
    { name: "Dispatch Board", path: "/dispatch", icon: "📡" },
    { name: "Disputes", path: "/disputes", icon: "⚠️" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-title">MENU</div>

      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}