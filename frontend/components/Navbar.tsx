"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className="logo">
          <span className="logo-icon">K</span>
          <span>KaamSetu</span>
        </div>
      </div>

      <div className="navbar-right">
        <ThemeToggle />

        <button className="icon-button notification-button" aria-label="Notifications" title="Notifications">
          🔔
          <span className="notification-dot" />
        </button>

        <div className="profile">
          <div className="profile-avatar">M</div>

          <div className="profile-info">
            <span className="profile-name">User</span>
            <span className="profile-role">Employer</span>
          </div>
        </div>
      </div>
    </nav>
  );
}