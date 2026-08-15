import Link from "next/link";

const LINKS = [
  { href: "/workers", icon: "👷", title: "Browse Workers", description: "Find verified, available workers near you." },
  { href: "/jobs", icon: "💼", title: "View Jobs", description: "See open jobs waiting to be filled." },
  { href: "/bookings", icon: "📅", title: "Manage Bookings", description: "Track scheduled and completed work." },
  { href: "/ratings", icon: "⭐", title: "Read Ratings", description: "See feedback from past bookings." },
];

export default function Home() {
  return (
    <div className="page-container">
      <div className="hero">
        <span className="hero-eyebrow">KaamSetu</span>
        <h1 className="hero-title">Connecting workers with opportunity</h1>
        <p className="hero-description">Find trusted, verified workers for any job — or post a job and get matched fast.</p>
        <div className="hero-actions">
          <Link href="/workers" className="primary-button">Find a Worker</Link>
          <Link href="/jobs/new" className="btn-secondary">Post a Job</Link>
        </div>
      </div>

      <div className="landing-grid">
        {LINKS.map((link) => (
          <Link href={link.href} className="landing-card" key={link.href}>
            <div className="landing-card-icon">{link.icon}</div>
            <div className="landing-card-title">{link.title}</div>
            <div className="landing-card-description">{link.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
