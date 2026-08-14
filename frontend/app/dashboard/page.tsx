export default function Dashboard() {
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


      {/* Statistics Cards */}
      <div className="stats-grid">

        {/* Total Workers */}
        <div className="stat-card">
          <div className="stat-title">
            Total Workers
          </div>

          <div className="stat-value">
            1,250
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
            213
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
            186
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
            ₹8.45L
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

            <tr>
              <td>Rahul Kumar</td>
              <td>Electrical Repair</td>
              <td>Completed</td>
              <td>₹2,500</td>
            </tr>

            <tr>
              <td>Arun Kumar</td>
              <td>Plumbing Work</td>
              <td>Pending</td>
              <td>₹1,800</td>
            </tr>

            <tr>
              <td>Suresh Reddy</td>
              <td>AC Maintenance</td>
              <td>Completed</td>
              <td>₹3,200</td>
            </tr>

            <tr>
              <td>Ravi Sharma</td>
              <td>House Painting</td>
              <td>Confirmed</td>
              <td>₹6,500</td>
            </tr>

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
                <td>420</td>
              </tr>

              <tr>
                <td>Total Bookings</td>
                <td>534</td>
              </tr>

              <tr>
                <td>Pending Payments</td>
                <td>17</td>
              </tr>

              <tr>
                <td>Active Disputes</td>
                <td>8</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}