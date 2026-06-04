import React, { useState } from "react";
import logo from "../../assets/images/logo/LogoGarda.png";

// Sesuaikan daftar ini dengan ENUM yang ada pada database / backend kamu
const VALID_CATEGORIES = [
  "antar_jemput",
  "belanja",
  "pindahan",
  "kebersihan",
  "perbaikan",
  "titip_antrian",
  "administrasi",
  "lainnya",
];

const CreateProject = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: VALID_CATEGORIES[0],
    budgetMin: "",
    budgetMax: "",
    location: "Malang, Jawa Timur",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState([]); // Menyimpan detail error 422 dari backend

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorDetails([]);

    const clientToken = localStorage.getItem("token");

    if (!clientToken) {
      setMessage(
        " Anda belum login atau sesi telah berakhir. Silakan login kembali.",
      );
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budgetMin: Number(formData.budgetMin),
      budgetMax: Number(formData.budgetMax),
      location: formData.location,
      deadline: formData.deadline
        ? new Date(formData.deadline).toISOString()
        : null,
    };

    try {
      const response = await fetch(
        "https://gardawirawiri.onrender.com/api/v1/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clientToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.status === 201 || result.success) {
        setMessage(
          " Project berhasil dibuat! Menunggu tawaran (bid) dari freelancer.",
        );
        setFormData({
          title: "",
          description: "",
          category: VALID_CATEGORIES[0],
          budgetMin: "",
          budgetMax: "",
          location: "Malang, Jawa Timur",
          deadline: "",
        });
      } else if (response.status === 422) {
        // Jika backend mengirimkan array pesan error validasi (ex: Joi / Zod)
        setMessage(
          `Gagal Validasi (422): ${result.message || "Periksa kembali aturan input."}`,
        );
        if (result.errors) {
          setErrorDetails(result.errors); // Memasukkan detail field mana yang salah
        }
      } else {
        setMessage(
          `Gagal: ${result.message || "Terjadi kesalahan pada sistem."}`,
        );
      }
    } catch (error) {
      setMessage("Terjadi kesalahan jaringan / server mati.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-xl mb-4 flex justify-start">
        <a
          href="/dashboard-client"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1A67B2] transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Dashboard
        </a>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 w-full max-w-xl border border-slate-100">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <img src={logo} alt="Logo Garda Wira-Wiri" className="w-10 h-10" />
            <span>
              Garda <span className="text-[#1A67B2]">Wira-Wiri</span>
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-[#00B5B7] tracking-tight">
          Buat Lowongan Project Baru
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 font-medium">
          Isi detail tugas wira-wiri agar freelancer terbaik bisa mengajukan
          penawaran
        </p>

        {/* NOTIFIKASI RESPONS */}
        {message && (
          <div
            className={`p-3.5 rounded-xl mb-3 text-xs font-semibold border ${message.includes("") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
          >
            {message}
          </div>
        )}

        {/* MENAMPILKAN DETAIL FIELD YANG MENYEBABKAN ERROR 422 */}
        {errorDetails.length > 0 && (
          <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <p className="font-bold">Detail Perbaikan Input:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {errorDetails.map((err, idx) => (
                <li key={idx}>{err.message || err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Tugas / Nama Project
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all"
              placeholder="Gunakan judul yang jelas (Min. 10 karakter)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kategori Kebutuhan
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm text-slate-700 font-medium"
            >
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "lainnya"
                    ? "Lainnya (Tulis di deskripsi)"
                    : cat
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Lengkap Tugas
            </label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all"
              placeholder="Tulis instruksi lengkap dan detail rute pengiriman (Min. 30 karakter)..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimasi Budget Min (Rp)
              </label>
              <input
                type="number"
                name="budgetMin"
                required
                value={formData.budgetMin}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B5B7] outline-none text-sm"
                placeholder="ex: 80000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estimasi Budget Maks (Rp)
              </label>
              <input
                type="number"
                name="budgetMax"
                required
                value={formData.budgetMax}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B5B7] outline-none text-sm"
                placeholder="ex: 150000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lokasi Penugasan
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B5B7] outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batas Pengiriman (Deadline)
              </label>
              <input
                type="datetime-local"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B5B7] outline-none text-sm text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#1A67B2] hover:bg-[#00B5B7] text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:bg-slate-300"
          >
            {loading ? "Sedang Memproses..." : "Publikasikan Tugas Wira-Wiri"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
