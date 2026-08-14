"use client";

import { useState } from "react";

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
        <button className="notification-button">🔔</button>

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