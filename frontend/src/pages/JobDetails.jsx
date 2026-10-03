import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`jobs/${id}/`);
        setJob(response.data);
      } catch (error) {
        console.log("JOB DETAILS ERROR:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);
  const handleApply = async () => {
  setApplying(true);

  try {
    await api.post("applications/", {
      job: job.id,
      cover_letter: "",
    });

    alert("Application submitted successfully!");
  } catch (error) {
    const errorData = error.response?.data;

    if (error.response?.status === 400) {
      alert("You have already applied for this job.");
    } else {
      console.log("APPLICATION ERROR:", errorData);
      alert("Application failed. Please try again.");
    }
  } finally {
    setApplying(false);
  }
};
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <p className="text-indigo-600 font-semibold">
          Loading job...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <p className="text-red-500">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <p className="text-indigo-200 mb-2">
              {job.company_name}
            </p>

            <h1 className="text-3xl font-bold">
              {job.title}
            </h1>
          </div>

          <div className="p-8">

            <div className="grid md:grid-cols-2 gap-4 mb-8">

              <div className="bg-indigo-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-indigo-700">
                  {job.location}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Job Type</p>
                <p className="font-semibold text-purple-700">
                  {job.job_type}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-semibold text-blue-700">
                  {job.salary_min} - {job.salary_max}
                </p>
              </div>

              <div className="bg-pink-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="font-semibold text-pink-700">
                  {job.deadline}
                </p>
              </div>

            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Job Description
            </h2>

            <p className="text-gray-600 leading-7 mb-8">
              {job.description}
            </p>

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Required Skills
            </h2>

            <div className="bg-gray-50 p-4 rounded-xl mb-8">
              <p className="text-gray-700">
                {job.skills}
              </p>
            </div>

            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition"
            >
              {applying ? "Applying..." : "Apply for this Job"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;