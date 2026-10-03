import { useEffect, useState } from "react";
import api from "../api/axios";

function CompanyManagement() {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await api.get("companies/");
const data = response.data;

const companyData = data.results
  ? data.results[0]
  : data[0];

setCompany(companyData);

if (companyData) {
  setForm({
    name: companyData.name || "",
    description: companyData.description || "",
    website: companyData.website || "",
  });
}
    } catch (error) {
      console.log("COMPANY ERROR:", error.response?.data);
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
 const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    let response;

    if (company?.id) {
      response = await api.patch(
        `companies/${company.id}/`,
        form
      );
    } else {
      response = await api.post(
        "companies/",
        form
      );
    }

    setCompany(response.data);

    setForm({
      name: response.data.name || "",
      description: response.data.description || "",
      website: response.data.website || "",
    });

    alert("Company information saved successfully!");
  } catch (error) {
    console.log("COMPANY SAVE ERROR:", error);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);

    alert("Company save failed.");
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-blue-700 font-semibold">
          Loading company...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <p className="text-blue-700 font-semibold mb-1">
            Recruiter Panel
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            Company Profile
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your company information.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8"
        >

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-blue-200 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            className="w-full border border-blue-200 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Website
          </label>

          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full border border-blue-200 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {saving ? "Saving..." : "Save Company Information"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default CompanyManagement;