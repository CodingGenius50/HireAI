import { useEffect, useState } from "react";
import api from "../api/axios";

function CVUpload() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    education: "",
    skills: "",
    experience: "",
  });

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      const response = await api.get("cv/cvcheck/");

      setForm({
        name: response.data.name || "",
        email: response.data.email || "",
        education: response.data.education || "",
        skills: response.data.skills || "",
        experience: response.data.experience || "",
      });
    } catch (error) {
      console.log("CV GET ERROR:", error.response?.data);
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

  const generateCV = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.education ||
      !form.skills ||
      !form.experience
    ) {
      alert("Please complete all 5 required fields.");
      return;
    }

    try {
      setSaving(true);

      await api.put("cv/cvcheck/", form);

      alert("Professional CV information saved successfully!");
      setShowPreview(true);
    } catch (error) {
      console.log("CV SAVE ERROR:", error.response?.data);
      alert("Failed to save CV.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your CV...
      </div>
    );
  }

 const downloadPDF = async () => {
  try {
    const response = await api.get("cv/generate-pdf/", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/pdf",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${form.name.replace(/\s+/g, "_")}_CV.pdf`
    );

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log("PDF ERROR:", error.response?.data);
    alert("Failed to generate CV PDF.");
  }
};

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Builder */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Professional CV
          </h1>

          <p className="text-gray-500 mt-2 mb-8">
            Complete these 5 essential fields to create your professional CV.
          </p>

          <form onSubmit={generateCV} className="space-y-6">

            <div>
              <label className="block font-medium mb-2">
                Full Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Education *
              </label>

              <textarea
                name="education"
                value={form.education}
                onChange={handleChange}
                placeholder="Example: BSc in Computer Science and Engineering, NITER"
                rows="3"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Skills *
              </label>

              <textarea
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="Example: Python, Django, REST API, PostgreSQL, Git"
                rows="3"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Experience *
              </label>

              <textarea
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="Example: Fresher / Internship / Job experience"
                rows="4"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900">
                Professional CV Template
              </h3>

              <p className="text-sm text-blue-700 mt-1">
                HireAI will automatically organize your information into a
                professional CV format.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700
              text-white font-semibold py-3 rounded-lg transition"
            >
              {saving ? "Saving..." : "Generate Professional CV"}
            </button>

          </form>
        </div>

        {/* CV Preview */}
        {showPreview && (
          <div className="mt-10 bg-white shadow-lg border">

            <div className="p-10">

              <div className="border-b-2 border-gray-800 pb-5">

                <h1 className="text-4xl font-bold text-gray-900">
                  {form.name}
                </h1>

                <p className="text-gray-600 mt-2">
                  {form.email}
                </p>

              </div>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 border-b pb-2">
                  PROFESSIONAL SUMMARY
                </h2>

                <p className="mt-3 text-gray-700 leading-7">
                  Motivated and detail-oriented professional with a strong
                  academic background and practical technical skills.
                  Passionate about learning, problem solving, and applying
                  technology to real-world challenges.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 border-b pb-2">
                  EDUCATION
                </h2>

                <p className="mt-3 text-gray-700 whitespace-pre-line">
                  {form.education}
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 border-b pb-2">
                  TECHNICAL SKILLS
                </h2>

                <p className="mt-3 text-gray-700">
                  {form.skills}
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 border-b pb-2">
                  EXPERIENCE
                </h2>

                <p className="mt-3 text-gray-700 whitespace-pre-line">
                  {form.experience}
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 border-b pb-2">
                  CAREER OBJECTIVE
                </h2>

                <p className="mt-3 text-gray-700 leading-7">
                  To build a successful career by continuously improving
                  technical and professional skills while contributing
                  effectively to an innovative organization.
                </p>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-blue-700 border-b pb-2">
                  REFERENCES
                </h2>

                <p className="mt-3 text-gray-700">
                  References available upon request.
                </p>
              </section>

            </div>

            <div className="border-t bg-gray-50 p-5 text-center">
              <button
  onClick={downloadPDF}
  className="bg-blue-600 hover:bg-blue-700
  text-white font-semibold px-8 py-3 rounded-lg"
>
  Download Professional CV
</button>
            </div>

          </div>
        )}
      
      </div>
    </div>
  );
}

export default CVUpload;