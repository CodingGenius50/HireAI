import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`jobs/${id}/`);
        setJob(response.data);
      } catch (error) {
        console.log(
          "JOB DETAILS ERROR:",
          error.response?.data
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();

    if (!cvFile) {
      alert("Please upload your CV before applying.");
      return;
    }

    const fileName = cvFile.name.toLowerCase();

    if (
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".docx")
    ) {
      alert("Only PDF and DOCX files are allowed.");
      return;
    }

    if (cvFile.size > 5 * 1024 * 1024) {
      alert("CV file must be less than 5 MB.");
      return;
    }

    try {
      setApplying(true);

      const formData = new FormData();

      formData.append("job", job.id);
      formData.append("cover_letter", coverLetter);
      formData.append("cv", cvFile);

      await api.post(
        "applications/apply/",
        formData
      );

      alert(
        "Application submitted successfully!"
      );

      setShowApplyForm(false);
      setCoverLetter("");
      setCvFile(null);

    } catch (error) {
      console.log(
        "APPLICATION ERROR:",
        error.response?.data
      );

      const errorData = error.response?.data;

      if (error.response?.status === 400) {
        alert(
          errorData?.detail ||
          errorData?.error ||
          "You have already applied for this job."
        );
      } else if (error.response?.status === 401) {
        alert(
          "Please login before applying for a job."
        );
      } else {
        alert(
          "Application failed. Please try again."
        );
      }

    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-blue-600 font-semibold">
          Loading job details...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500 font-semibold">
          Job not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="max-w-4xl mx-auto">

        {/* JOB DETAILS */}

        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">

          {/* HEADER */}

          <div className="bg-blue-600 px-8 py-8 text-white">

            <p className="text-blue-100 font-semibold text-sm">
              Job Opportunity
            </p>

            <h1 className="text-3xl font-bold mt-1">
              {job.title}
            </h1>

            <p className="text-blue-100 mt-2">
              {job.company_name ||
                job.company?.name ||
                "Company"}
            </p>

          </div>

          <div className="p-8">

            {/* JOB INFO */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-medium">
                  Location
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {job.location || "Not specified"}
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-sm text-indigo-600 font-medium">
                  Salary
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {job.salary_min &&
                  job.salary_max
                    ? `${job.salary_min} - ${job.salary_max}`
                    : "Negotiable"}
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-sm text-sky-600 font-medium">
                  Deadline
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {job.deadline || "Not specified"}
                </p>
              </div>

            </div>

            {/* EMPLOYMENT TYPE */}

            <div className="mt-5">

              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                {job.job_type ||
                  job.employment_type ||
                  "FULL TIME"}
              </span>

            </div>

            {/* DESCRIPTION */}

            <div className="mt-8">

              <h2 className="text-xl font-bold text-slate-900">
                Job Description
              </h2>

              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-5">

                <p className="text-slate-600 leading-7 whitespace-pre-line">
                  {job.description}
                </p>

              </div>

            </div>

            {/* SKILLS */}

            <div className="mt-7">

              <h2 className="text-xl font-bold text-slate-900">
                Required Skills
              </h2>

              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-5">

                <p className="text-slate-700 leading-7">
                  {job.skills || "Not specified"}
                </p>

              </div>

            </div>

            {/* APPLY BUTTON */}

            {!showApplyForm && (
              <div className="flex justify-center mt-8 pt-6 border-t border-slate-200">

                <button
                  onClick={() =>
                    setShowApplyForm(true)
                  }
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
                >
                  Apply for this Job →
                </button>

              </div>
            )}

          </div>

        </div>

        {/* APPLICATION FORM */}

        {showApplyForm && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">

            {/* FORM HEADER */}

            <div className="bg-blue-50 border-b border-blue-100 px-8 py-6">

              <p className="text-blue-600 font-semibold text-sm">
                Job Application
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Apply for {job.title}
              </h2>

              <p className="text-slate-500 mt-1">
                Upload your CV to submit your application.
              </p>

            </div>

            <form
              onSubmit={handleApply}
              className="p-8 space-y-6"
            >

              {/* CV UPLOAD */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  CV / Resume
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <label
                  htmlFor="cv-upload"
                  className={`block cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
                    cvFile
                      ? "border-green-400 bg-green-50"
                      : "border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400"
                  }`}
                >

                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      setCvFile(
                        e.target.files[0] || null
                      )
                    }
                    className="hidden"
                  />

                  {cvFile ? (
                    <>
                      <div className="text-3xl mb-2">
                        ✅
                      </div>

                      <p className="font-bold text-green-700">
                        CV Selected
                      </p>

                      <p className="text-sm text-green-600 mt-1 break-all">
                        {cvFile.name}
                      </p>

                      <p className="text-xs text-green-500 mt-2">
                        Click here to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">
                        📄
                      </div>

                      <p className="font-bold text-blue-700">
                        Click here to choose your CV
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        PDF or DOCX • Maximum 5 MB
                      </p>
                    </>
                  )}

                </label>

              </div>

              {/* COVER LETTER */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Cover Letter
                  <span className="text-slate-400 font-normal">
                    {" "}(Optional)
                  </span>
                </label>

                <textarea
                  value={coverLetter}
                  onChange={(e) =>
                    setCoverLetter(e.target.value)
                  }
                  rows="5"
                  placeholder="Write a short cover letter..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />

              </div>

              {/* AI INFO */}

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">

                <p className="text-indigo-700 font-semibold">
                  🤖 AI Recruitment Process
                </p>

                <p className="text-sm text-indigo-600 mt-1">
                  After applying, your CV will be reviewed
                  by our AI recruitment system. If you
                  qualify, an AI interview will become
                  available in your application dashboard.
                </p>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-center gap-3 pt-2">

                <button
                  type="submit"
                  disabled={applying}
                  className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold transition"
                >
                  {applying
                    ? "Submitting..."
                    : "Submit Application"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowApplyForm(false);
                    setCoverLetter("");
                    setCvFile(null);
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}

      </div>

    </div>
  );
}

export default JobDetails;