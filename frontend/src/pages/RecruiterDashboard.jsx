import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function RecruiterDashboard() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get("jobs/"),
          api.get("applications/recruiter/"),
        ]);

        setJobs(jobsResponse.data.results || jobsResponse.data);
        setApplications(
          applicationsResponse.data.results ||
            applicationsResponse.data
        );
      } catch (error) {
        console.log("DASHBOARD ERROR:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-teal-600 font-semibold">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <p className="text-teal-600 font-semibold mb-1">
            Recruiter Panel
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            Recruiter Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your jobs and track applicants.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
            <p className="text-gray-500 text-sm">
              Total Jobs
            </p>

            <h2 className="text-3xl font-bold text-teal-600 mt-2">
              {jobs.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <p className="text-gray-500 text-sm">
              Total Applicants
            </p>

            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {applications.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
            <p className="text-gray-500 text-sm">
              Shortlisted
            </p>

            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {
                applications.filter(
                  (app) => app.status === "SHORTLISTED"
                ).length
              }
            </h2>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recent Applicants
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                View applications submitted for your jobs.
              </p>
            </div>

            <Link
              to="/recruiter/applicants"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              View All
            </Link>
          </div>

          {applications.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">
              No applicants yet.
            </p>
          ) : (
            <div className="space-y-3">

              {applications.slice(0, 5).map((application) => (
                <div
                  key={application.id}
                  className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {application.applicant_name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {application.job_title}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold w-fit">
                    {application.status}
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default RecruiterDashboard;