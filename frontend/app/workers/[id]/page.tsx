import { getWorker } from "@/lib/api";

export default async function WorkerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const worker = await getWorker(id);

  return (
    <div className="page-container">

      {/* Page Header */}

      <div className="page-header">

        <h1 className="page-title">
          Worker Details
        </h1>

        <p className="page-description">
          Complete information about this worker.
        </p>

      </div>


      {/* Worker Information */}

      <div className="table-container">

        <div className="table-header">
          Worker Information
        </div>


        <table>

          <tbody>

            <tr>
              <th>Worker ID</th>
              <td>{worker.worker_id}</td>
            </tr>


            <tr>
              <th>Full Name</th>
              <td>{worker.full_name}</td>
            </tr>


            <tr>
              <th>Phone</th>
              <td>{worker.phone}</td>
            </tr>


            <tr>
              <th>Gender</th>
              <td>{worker.gender}</td>
            </tr>


            <tr>
              <th>Preferred Language</th>
              <td>{worker.preferred_language}</td>
            </tr>


            <tr>
              <th>Experience</th>
              <td>{worker.experience_years} years</td>
            </tr>


            <tr>
              <th>Location ID</th>
              <td>{worker.location_id}</td>
            </tr>


            <tr>
              <th>Travel Radius</th>
              <td>{worker.travel_radius_km} km</td>
            </tr>


            <tr>
              <th>Availability</th>
              <td>{worker.availability_status}</td>
            </tr>


            <tr>
              <th>Verification</th>
              <td>{worker.verification_status}</td>
            </tr>


            <tr>
              <th>Average Rating</th>
              <td>⭐ {worker.average_rating}</td>
            </tr>


            <tr>
              <th>Created At</th>
              <td>{worker.created_at}</td>
            </tr>


            <tr>
              <th>Updated At</th>
              <td>{worker.updated_at}</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}