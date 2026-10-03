import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data.results || response.data);
      } catch (error) {
        console.log("JOB ERROR:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading jobs...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-xl shadow"
            >
              <h2 className="text-xl font-bold mb-2">
                {job.title}
              </h2>

              <p className="text-gray-600 mb-2">
                {job.company_name}
              </p>

              <p className="mb-2">
                📍 {job.location}
              </p>

              <p className="mb-4">
                💼 {job.job_type}
              </p>

              <Link
                to={`/jobs/${job.id}`}
                className="inline-block bg-black text-white px-4 py-2 rounded"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Jobs;