import { useEffect, useState } from "react";
import api from "../api/axios";

function RecruiterApplicants() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("applications/recruiter/");
      setApplications(response.data.results || response.data);
    } catch (error) {
      console.log("APPLICANTS ERROR:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`applications/${id}/status/`, {
        status: status,
      });

      alert("Application status updated!");
      fetchApplications();
    } catch (error) {
      console.log("STATUS UPDATE ERROR:", error.response?.data);
      alert("Status update failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-blue-700 font-semibold">
          Loading applicants...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <p className="text-blue-700 font-semibold mb-1">
            Recruiter Panel
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            Applicants
          </h1>

          <p className="text-gray-500 mt-2">
            Review applicants and update application status.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No applicants yet
            </h2>
          </div>
        ) : (
          <div className="space-y-5">

            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {application.applicant_name}
                    </h2>

                    <p className="text-blue-700 font-medium mt-1">
                      {application.job_title}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      Applied:{" "}
                      {new Date(
                        application.applied_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">

                    <select
                      value={application.status}
                      onChange={(e) =>
                        updateStatus(
                          application.id,
                          e.target.value
                        )
                      }
                      className="border border-blue-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="SHORTLISTED">
                        Shortlisted
                      </option>
                      <option value="REJECTED">Rejected</option>
                      <option value="HIRED">Hired</option>
                    </select>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default RecruiterApplicants;