import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get("applications/my/");

        setApplications(
          response.data.results || response.data
        );
      } catch (error) {
        console.log(
          "APPLICATIONS ERROR:",
          error.response?.data
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-amber-100 text-amber-700";

      case "INTERVIEW_QUALIFIED":
        return "bg-purple-100 text-purple-700";

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

  // =====================================================
  // STATUS TEXT
  // =====================================================

  const getStatusText = (status) => {
    switch (status) {
      case "APPLIED":
        return "APPLIED";

      case "INTERVIEW_QUALIFIED":
        return "INTERVIEW ELIGIBLE";

      case "SHORTLISTED":
        return "SHORTLISTED";

      case "REJECTED":
        return "REJECTED";

      case "HIRED":
        return "HIRED";

      default:
        return status;
    }
  };

  // =====================================================
  // START AI INTERVIEW
  // =====================================================

  const startInterview = (applicationId) => {
    navigate(
      `/interview?application=${applicationId}`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-amber-600 font-semibold">
          Loading applications...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-amber-50 py-10 px-6">

      <div className="max-w-5xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="text-amber-600 font-semibold mb-1">
            Career Dashboard
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            My Applications
          </h1>

          <p className="text-gray-500 mt-2">
            Track your applications and complete your AI
            technical interviews.
          </p>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {applications.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-10 text-center">

            <div className="text-5xl mb-4">
              📄
            </div>

            <h2 className="text-xl font-semibold text-gray-700">
              No applications yet
            </h2>

            <p className="text-gray-500 mt-2">
              Apply for a job to see your applications here.
            </p>

          </div>

        ) : (

          /* =================================================
             APPLICATION LIST
          ================================================= */

          <div className="space-y-5">

            {applications.map(
              (application) => (

                <div
                  key={application.id}
                  className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6"
                >

                  {/* =================================================
                     APPLICATION HEADER
                  ================================================= */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-bold text-gray-800">
                        {application.job_title}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        Applicant:{" "}
                        {application.applicant_name}
                      </p>

                      <p className="text-sm text-gray-400 mt-2">
                        Applied:{" "}
                        {new Date(
                          application.applied_at
                        ).toLocaleDateString()}
                      </p>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusStyle(
                        application.status
                      )}`}
                    >
                      {getStatusText(
                        application.status
                      )}
                    </span>

                  </div>

                  {/* =================================================
                     AI INTERVIEW
                     APPLIED এবং INTERVIEW_QUALIFIED
                     দুই status-এই দেখাবে
                  ================================================= */}

                  {(application.status === "APPLIED" ||
                    application.status ===
                      "INTERVIEW_QUALIFIED") && (

                    <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-5">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2">

                            <span className="text-2xl">
                              🤖
                            </span>

                            <h3 className="font-bold text-purple-800">
                              AI Interview Available
                            </h3>

                          </div>

                          <p className="text-sm text-purple-600 mt-2">

                            Your application has been
                            submitted successfully. You can
                            now take the AI technical interview
                            based on your CV and this job.

                          </p>

                          <p className="text-xs text-purple-500 mt-2">

                            • 5 AI-generated questions
                            <br />
                            • 4 options for each question
                            <br />
                            • Interview result will determine
                            the next stage

                          </p>

                        </div>

                        {/* START BUTTON */}

                        <button
                          onClick={() =>
                            startInterview(
                              application.id
                            )
                          }
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition shadow-sm whitespace-nowrap"
                        >
                          Start AI Interview →
                        </button>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                     SHORTLISTED
                  ================================================= */}

                  {application.status ===
                    "SHORTLISTED" && (

                    <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">

                      <div className="flex items-center gap-2">

                        <span className="text-xl">
                          🎉
                        </span>

                        <p className="text-blue-700 font-semibold">
                          Congratulations!
                        </p>

                      </div>

                      <p className="text-sm text-blue-600 mt-2">

                        You passed the AI technical interview
                        and have been shortlisted for recruiter
                        review.

                      </p>

                    </div>
                  )}

                  {/* =================================================
                     REJECTED
                  ================================================= */}

                  {application.status ===
                    "REJECTED" && (

                    <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-5">

                      <div className="flex items-center gap-2">

                        <span className="text-xl">
                          ℹ️
                        </span>

                        <p className="text-red-700 font-semibold">
                          Interview Result
                        </p>

                      </div>

                      <p className="text-sm text-red-600 mt-2">

                        You did not pass the AI technical
                        interview for this application.

                      </p>

                    </div>
                  )}

                  {/* =================================================
                     HIRED
                  ================================================= */}

                  {application.status ===
                    "HIRED" && (

                    <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-5">

                      <div className="flex items-center gap-2">

                        <span className="text-xl">
                          🎉
                        </span>

                        <p className="text-emerald-700 font-semibold">
                          Congratulations — You are Hired!
                        </p>

                      </div>

                      <p className="text-sm text-emerald-600 mt-2">

                        The recruiter has selected you for
                        this position.

                      </p>

                    </div>
                  )}

                </div>

              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default MyApplications;