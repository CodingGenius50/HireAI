import { useEffect, useState } from "react";
import api from "../api/axios";

function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    skills: "",
    salary_min: "",
    salary_max: "",
    location: "",
    job_type: "FULL_TIME",
    deadline: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);

      const response = await api.get(`jobs/?page=${page}`);

      if (response.data.results) {
        setJobs(response.data.results);
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
      } else {
        setJobs(response.data);
        setNextPage(null);
        setPreviousPage(null);
      }

      setCurrentPage(page);
    } catch (error) {
      console.log("JOBS ERROR:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      skills: "",
      salary_min: "",
      salary_max: "",
      location: "",
      job_type: "FULL_TIME",
      deadline: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`jobs/${editingId}/`, form);

        alert("Job updated successfully!");
      } else {
        await api.post("jobs/", form);

        alert("Job posted successfully!");
      }

      resetForm();

      // Always return to first page after creating/updating
      fetchJobs(1);
    } catch (error) {
      console.log("JOB SAVE ERROR:", error.response?.data);
      alert("Job save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.id);

    setForm({
      title: job.title || "",
      description: job.description || "",
      skills: job.skills || "",
      salary_min: job.salary_min || "",
      salary_max: job.salary_max || "",
      location: job.location || "",
      job_type: job.job_type || "FULL_TIME",
      deadline: job.deadline || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`jobs/${id}/`);

      alert("Job deleted successfully!");

      fetchJobs(currentPage);
    } catch (error) {
      console.log("JOB DELETE ERROR:", error.response?.data);
      alert("Job delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-blue-700 font-semibold">
          Loading jobs...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="mb-8">
          <p className="text-blue-700 font-semibold mb-1">
            Recruiter Panel
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            Job Management
          </h1>

          <p className="text-gray-500 mt-2">
            Create and manage your job postings.
          </p>
        </div>

        {/* Job Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {editingId ? "Edit Job" : "Post a New Job"}
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Junior Backend Developer"
                className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Dhaka"
                className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              placeholder="Write job description..."
              className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Required Skills
            </label>

            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Python, Django, DRF, PostgreSQL"
              className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Salary
              </label>

              <input
                type="number"
                name="salary_min"
                value={form.salary_min}
                onChange={handleChange}
                className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Salary
              </label>

              <input
                type="number"
                name="salary_max"
                value={form.salary_max}
                onChange={handleChange}
                className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Type
              </label>

              <select
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Application Deadline
            </label>

            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Job"
                : "Post Job"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>
        </form>

        {/* Job List */}

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            My Job Postings
          </h2>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <p className="text-gray-500">
                No job postings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {job.title}
                      </h3>

                      <p className="text-blue-700 font-medium mt-1">
                        {job.location}
                      </p>

                      <p className="text-sm text-gray-500 mt-2">
                        {job.job_type} • Deadline: {job.deadline}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Skills: {job.skills}
                      </p>
                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() => handleEdit(job)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(job.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Pagination */}

          {(previousPage || nextPage) && (
            <div className="flex justify-center items-center gap-4 mt-8">

              <button
                onClick={() => fetchJobs(currentPage - 1)}
                disabled={!previousPage}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-5 py-2 bg-white border border-blue-200 rounded-lg font-semibold text-blue-700">
                Page {currentPage}
              </span>

              <button
                onClick={() => fetchJobs(currentPage + 1)}
                disabled={!nextPage}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default JobManagement;