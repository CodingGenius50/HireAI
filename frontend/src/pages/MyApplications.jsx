import { useEffect, useState } from "react";
import api from "../api/axios";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("applications/my/");
        setApplications(response.data.results || response.data);
      } catch (error) {
        console.log("APPLICATIONS ERROR:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-amber-100 text-amber-700";

      case "SHORTLISTED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "HIRED":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-amber-600 font-semibold">
          Loading applications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <p className="text-amber-600 font-semibold mb-1">
            Career Dashboard
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            My Applications
          </h1>

          <p className="text-gray-500 mt-2">
            Track the status of your job applications.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No applications yet
            </h2>

            <p className="text-gray-500 mt-2">
              Apply for a job to see your applications here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {application.job_title}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Applicant: {application.applicant_name}
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      Applied:{" "}
                      {new Date(
                        application.applied_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusStyle(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyApplications;