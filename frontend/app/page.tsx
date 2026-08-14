import Link from "next/link";

export default function Home() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome to KaamSetu</h1>

        <p className="page-description">
          Find trusted workers or post a job.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <Link href="/workers">
          <button className="primary-button">
            Find a Worker
          </button>
        </Link>

        <Link href="/jobs/new">
          <button className="primary-button">
            Post a Job
          </button>
        </Link>
      </div>
    </div>
  );
}