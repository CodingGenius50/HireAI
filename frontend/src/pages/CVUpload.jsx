import { useEffect, useState } from "react";
import api from "../api/axios";

function CVUpload() {
  const [file, setFile] = useState(null);
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const [score, setScore] = useState("");
const [scoring, setScoring] = useState(false);

const [match, setMatch] = useState("");
const [matching, setMatching] = useState(false);
const [jobs, setJobs] = useState([]);
const [selectedJob, setSelectedJob] = useState("");
  const fetchCV = async () => {
    try {
      const response = await api.get("cv/cvcheck/");
      setCv(response.data);
    } catch (error) {
      console.log("CV GET ERROR:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };
  const fetchJobs = async () => {
  try {
    const response = await api.get("jobs/");
    setJobs(response.data.results || response.data);
  } catch (error) {
    console.log("JOBS ERROR:", error.response?.data);
  }
};
  useEffect(() => {
    fetchCV();
    fetchJobs();
  }, []);

  // =========================
  // CV UPLOAD
  // =========================

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CV file.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF and DOCX files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await api.put("cv/cvcheck/", formData);

      setCv(response.data);
      setFile(null);
      setAnalysis("");

      alert("CV uploaded successfully!");
    } catch (error) {
      console.log("CV UPLOAD ERROR:", error.response?.data);
      alert("CV upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // AI CV ANALYSIS
  // =========================

  const handleAnalyze = async () => {
    setAnalyzing(true);

    try {
      const response = await api.get("cv/analyze/");

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.log("AI ANALYZE ERROR:", error.response?.data);

      if (error.response?.status === 400) {
        alert("Please upload a CV first.");
      } else {
        alert("CV analysis failed.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScore = async () => {
  setScoring(true);

  try {
    const response = await api.get("cv/score/");
    setScore(response.data.score);
  } catch (error) {
    console.log("AI SCORE ERROR:", error.response?.data);
    alert("Resume scoring failed.");
  } finally {
    setScoring(false);
  }
};

const handleMatch = async () => {
  setMatching(true);

  try {
    if (!selectedJob) {
      alert("Please select a job first.");
      setMatching(false);
      return;
    }

    const response = await api.get(`cv/match/?job_id=${selectedJob}`);
    setMatch(response.data.match);
  } catch (error) {
    console.log("AI MATCH ERROR:", error.response?.data);
    alert("Job matching failed.");
  } finally {
    setMatching(false);
  }
};

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-teal-700 font-semibold">
            Loading your CV...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-10 px-6">

      <div className="max-w-5xl mx-auto">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="mb-8">

          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
            🤖 HireAI Career Profile
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            My CV
          </h1>

          <p className="text-gray-600 mt-2">
            Upload your CV and use HireAI's AI-powered recruitment features.
          </p>

        </div>

        {/* =========================
            CURRENT CV
        ========================= */}

        {cv?.file && (
          <div className="bg-white rounded-2xl shadow-md border border-teal-200 p-6 mb-6 hover:shadow-lg transition">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
                  📄
                </div>

                <div>

                  <p className="text-sm text-teal-600 font-semibold">
                    CURRENT CV
                  </p>

                  <p className="font-bold text-gray-800">
                    Your CV is uploaded
                  </p>

                  {cv.uploaded_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Uploaded:{" "}
                      {new Date(cv.uploaded_at).toLocaleDateString()}
                    </p>
                  )}

                </div>

              </div>

              <a
                href={cv.file}
                target="_blank"
                rel="noreferrer"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow-sm text-center"
              >
                View CV →
              </a>

            </div>

          </div>
        )}

        {/* =========================
            UPLOAD CV
        ========================= */}

        <form
          onSubmit={handleUpload}
          className="bg-white rounded-2xl shadow-md border border-teal-200 p-8 mb-8"
        >

          <div className="border-2 border-dashed border-teal-300 rounded-2xl p-10 text-center bg-teal-50 hover:bg-teal-100 hover:border-teal-500 transition">

            <div className="w-20 h-20 mx-auto bg-teal-200 rounded-full flex items-center justify-center text-4xl mb-5">
              ☁️
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Upload Your CV
            </h2>

            <p className="text-gray-500 mt-2 mb-6">
              PDF or DOCX • Maximum 5 MB
            </p>

            <label className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition shadow-md">

              Choose CV File

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />

            </label>

            {file && (
              <div className="mt-5 bg-white border border-teal-200 rounded-xl px-4 py-3 inline-block">

                <span className="text-teal-700 font-semibold">
                  ✓ {file.name}
                </span>

              </div>
            )}

          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition shadow-md"
          >
            {uploading ? "Uploading..." : "Upload / Replace CV"}
          </button>

        </form>

        {/* =========================
            AI TOOLS TITLE
        ========================= */}

        <div className="mb-5">

          <h2 className="text-2xl font-bold text-gray-800">
            AI Recruitment Tools
          </h2>

          <p className="text-gray-500 mt-1">
            Analyze and evaluate your CV with HireAI.
          </p>

        </div>

        {/* =========================
            AI CARDS
        ========================= */}

        <div className="grid md:grid-cols-3 gap-5">

          {/* AI ANALYSIS */}

          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">

            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              🤖
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              AI CV Analysis
            </h3>

            <p className="text-gray-500 text-sm mt-2 leading-6">
              Get AI-based analysis of your skills, education,
              strengths and weaknesses.
            </p>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !cv?.file}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold transition"
            >
              {analyzing ? "Analyzing..." : "Analyze CV →"}
            </button>

          </div>

          {/* RESUME SCORE */}

          <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">

            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              📊
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              Resume Score
            </h3>

            <p className="text-gray-500 text-sm mt-2 leading-6">
              Get an AI-generated score with strengths,
              weaknesses and suggestions.
            </p>

           <button
  onClick={handleScore}
  disabled={scoring || !cv?.file}
  className="mt-5 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold transition"
>
  {scoring ? "Calculating..." : "Get Score →"}
</button>

          </div>

          {/* JOB MATCH */}

          <div className="bg-white border border-violet-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">

            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              🎯
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              Job Match
            </h3>

            <p className="text-gray-500 text-sm mt-2 leading-6">
              Compare your CV with a selected job and
              see the matching score.
            </p>
 <select
  value={selectedJob}
  onChange={(e) => setSelectedJob(e.target.value)}
  className="w-full mt-4 border border-violet-200 rounded-lg p-2.5 text-gray-700"
>
  <option value="">Select a Job</option>

  {jobs.map((job) => (
    <option key={job.id} value={job.id}>
      {job.title}
    </option>
  ))}
</select>
            <button
  onClick={handleMatch}
  disabled={matching || !cv?.file}
  className="mt-5 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold transition"
>
  {matching ? "Matching..." : "Match Job →"}
</button>

          </div>

        </div>

        {/* =========================
            AI ANALYSIS RESULT
        ========================= */}

        {analysis && (
          <div className="mt-8 bg-white border border-blue-200 rounded-2xl shadow-md p-7">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                🤖
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  AI CV Analysis Result
                </h2>

                <p className="text-sm text-gray-500">
                  Generated by HireAI AI Assistant
                </p>
              </div>

            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

              <p className="text-gray-700 whitespace-pre-line leading-7">
                {analysis}
              </p>

            </div>

          </div>
        )}

        {score && (
  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-6">
    <h2 className="text-xl font-bold text-orange-700 mb-3">
      📊 Resume Score
    </h2>

    <p className="text-gray-700 whitespace-pre-line leading-7">
      {score}
    </p>
  </div>
)}

{match && (
  <div className="mt-6 bg-violet-50 border border-violet-200 rounded-2xl p-6">
    <h2 className="text-xl font-bold text-violet-700 mb-3">
      🎯 Job Match Result
    </h2>

    <p className="text-gray-700 whitespace-pre-line leading-7">
      {match}
    </p>
  </div>
)}

      </div>

    </div>
  );
}

export default CVUpload;