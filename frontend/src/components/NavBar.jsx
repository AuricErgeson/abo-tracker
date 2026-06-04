import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const onLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const linkCls = (path) =>
    `text-sm tracking-tight transition-colors duration-150 ${
      location.pathname === path ? "text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between gap-4">
        <Link to="/dashboard" data-testid="nav-logo" className="heading text-xl tracking-tight">
          Abo<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/dashboard" data-testid="nav-dashboard" className={linkCls("/dashboard")}>
            Subscriptions
          </Link>
          <Link to="/profile" data-testid="nav-profile" className={linkCls("/profile")}>
            {profile?.full_name?.split(" ")[0] || "Profile"}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            data-testid="nav-logout-btn"
            className="btn-ghost px-0"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
