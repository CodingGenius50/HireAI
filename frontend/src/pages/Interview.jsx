import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

function Interview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("application");

  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // GENERATE INTERVIEW
  // =====================================================

  useEffect(() => {
    if (!applicationId) {
      setError("Application ID is missing.");
      setLoading(false);
      return;
    }

    generateInterview();
  }, [applicationId]);

  const generateInterview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "applications/interview/generate/",
        {
          application_id: applicationId,
        }
      );

      setInterviewId(response.data.interview_id);

      setQuestions(response.data.questions);

      setAnswers(
        new Array(response.data.questions.length).fill(null)
      );
    } catch (error) {
      console.log(
        "INTERVIEW GENERATE ERROR:",
        error.response?.data
      );

      setError(
        error.response?.data?.error ||
          "Failed to generate interview."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SELECT ANSWER
  // =====================================================

  const selectAnswer = (questionIndex, optionIndex) => {
    const updatedAnswers = [...answers];

    updatedAnswers[questionIndex] = optionIndex;

    setAnswers(updatedAnswers);
  };

  // =====================================================
  // SUBMIT INTERVIEW
  // =====================================================

  const submitInterview = async () => {
    if (answers.some((answer) => answer === null)) {
      alert("Please answer all 5 questions.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.put(
        "applications/interview/submit/",
        {
          interview_id: interviewId,
          answers: answers,
        }
      );

      setResult(response.data);
    } catch (error) {
      console.log(
        "INTERVIEW SUBMIT ERROR:",
        error.response?.data
      );

      setError(
        error.response?.data?.error ||
          "Failed to submit interview."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

          <h2 className="text-xl font-semibold text-slate-800">
            AI is preparing your interview...
          </h2>

          <p className="text-slate-500 mt-2">
            Generating 5 questions based on your CV and the job.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RESULT
  // =====================================================

  if (result) {
    const shortlisted =
      result.status === "SHORTLISTED";

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">

        <div className="max-w-2xl mx-auto">

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                shortlisted
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <span
                className={`text-4xl ${
                  shortlisted
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {shortlisted ? "✓" : "×"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Interview Completed
            </h1>

            <p className="text-slate-500 mt-2">
              Your AI interview has been evaluated.
            </p>

            {/* SCORE */}

            <div className="mt-8 bg-slate-50 rounded-xl p-6">

              <p className="text-sm text-slate-500">
                Your Interview Score
              </p>

              <p className="text-5xl font-bold text-blue-600 mt-2">
                {Number(result.score).toFixed(0)}
                <span className="text-2xl text-slate-400">
                  /100
                </span>
              </p>

              <p className="text-slate-600 mt-3">
                {result.correct_answers} /{" "}
                {result.total_questions} answers correct
              </p>

            </div>

            {/* STATUS */}

            <div
              className={`mt-6 rounded-xl px-5 py-4 font-semibold ${
                shortlisted
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {shortlisted
                ? "🎉 You have been shortlisted!"
                : "Unfortunately, you were not shortlisted."}
            </div>

            {/* FEEDBACK */}

            <p className="text-slate-600 mt-5">
              {result.feedback}
            </p>

            <button
              onClick={() =>
                navigate("/my-applications")
              }
              className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Back to My Applications
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow">

          <div className="text-5xl text-red-500 mb-4">
            !
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Interview Error
          </h2>

          <p className="text-red-600 mt-3">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/my-applications")
            }
            className="mt-6 px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg"
          >
            Back to Applications
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // INTERVIEW QUESTIONS
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">
                🤖
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                AI Technical Interview
              </h1>

              <p className="text-slate-500 mt-1">
                Answer all 5 questions carefully.
              </p>
            </div>

          </div>

          <div className="mt-5 flex gap-3">

            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              5 Questions
            </div>

            <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
              4 Options Each
            </div>

          </div>

        </div>

        {/* QUESTIONS */}

        <div className="space-y-6">

          {questions.map((question, questionIndex) => (

            <div
              key={questionIndex}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >

              <div className="flex gap-3">

                <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  {questionIndex + 1}
                </div>

                <h2 className="text-lg font-semibold text-slate-900 leading-relaxed">
                  {question.question}
                </h2>

              </div>

              {/* OPTIONS */}

              <div className="mt-5 space-y-3">

                {question.options.map(
                  (option, optionIndex) => {

                    const selected =
                      answers[questionIndex] ===
                      optionIndex;

                    return (
                      <button
                        key={optionIndex}
                        onClick={() =>
                          selectAnswer(
                            questionIndex,
                            optionIndex
                          )
                        }
                        className={`w-full text-left p-4 rounded-xl border-2 transition ${
                          selected
                            ? "border-blue-600 bg-blue-50 text-blue-800"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(
                              65 + optionIndex
                            )}
                          </div>

                          <span>
                            {option}
                          </span>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          ))}

        </div>

        {/* SUBMIT */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div>

              <p className="font-semibold text-slate-800">
                Ready to submit?
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Make sure you have answered all 5 questions.
              </p>

            </div>

            <button
              onClick={submitInterview}
              disabled={submitting}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold transition"
            >
              {submitting
                ? "Evaluating..."
                : "Submit Interview"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Interview;