import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, ShieldCheck, AlertCircle, Clock } from "lucide-react";

export default function FreelancerBidPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State Data Project & Input Form
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // State Form disesuaikan dengan dokumentasi API Postman
  const [proposedPrice, setProposedPrice] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [estimatedDays, setEstimatedDays] = useState(1); // Default 1 hari

  // State Status Aksi
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // 1. Ambil detail project berdasarkan ID dari URL
  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const response = await fetch(
          `https://gardawirawiri.onrender.com/api/v1/projects/${projectId}`,
        );
        const result = await response.json();

        if (result.success) {
          setProject(result.data);
        } else {
          setStatusMessage({
            type: "error",
            text: "Gagal memuat detail project. Tugas mungkin sudah ditutup.",
          });
        }
      } catch (error) {
        console.error("Error fetching project detail:", error);
        setStatusMessage({
          type: "error",
          text: "Terjadi kesalahan koneksi saat mengambil data project.",
        });
      } finally {
        setLoadingProject(false);
      }
    };

    if (projectId) {
      fetchProjectDetail();
    }
  }, [projectId]);

  // 2. Fungsi Kirim Penawaran (BID) dengan Skema Baru
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    // Validasi input sisi client
    if (!proposedPrice || Number(proposedPrice) <= 0) {
      setStatusMessage({
        type: "error",
        text: "Silakan masukkan nominal penawaran harga yang valid.",
      });
      return;
    }
    if (coverLetter.trim().length < 10) {
      setStatusMessage({
        type: "error",
        text: "Berikan pesan penawaran minimal 10 karakter agar client tertarik.",
      });
      return;
    }
    if (Number(estimatedDays) <= 0) {
      setStatusMessage({
        type: "error",
        text: "Estimasi hari pengerjaan minimal 1 hari.",
      });
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      // ✨ FIX PAYLOAD: Struktur objek data wajib mengikuti spec Postman 100% cocok!
      const payload = {
        projectId: projectId, // camelCase sesuai Postman
        proposedPrice: Number(proposedPrice), // bertipe Number integer murni
        coverLetter: coverLetter.trim(), // string penawaran
        estimatedDays: Number(estimatedDays), // durasi pengerjaan
      };

      const response = await fetch(
        "https://gardawirawiri.onrender.com/api/v1/bids",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload), // Kirim payload
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setStatusMessage({
          type: "success",
          text: "Penawaran (Bid) Anda berhasil diajukan!",
        });
        setTimeout(() => {
          navigate("/services");
        }, 2000);
      } else {
        // Tampilkan pesan error spesifik jika dilempar oleh validasi backend
        setStatusMessage({
          type: "error",
          text:
            result.message ||
            "Gagal mengirim penawaran. Periksa kembali kecocokan data Anda.",
        });
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      setStatusMessage({
        type: "error",
        text: "Koneksi bermasalah. Gagal terhubung ke server.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-semibold text-gray-400">
        Sedang menyinkronkan ID Project dan memuat detail tugas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2939] py-12 px-6 md:px-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Tombol Kembali */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-[#1A67B2] gap-2 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Daftar Layanan
        </button>

        {/* Ringkasan Tugas */}
        {project && (
          <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-bold bg-sky-50 text-[#1A67B2] px-2.5 py-1 rounded-md uppercase tracking-wide border border-sky-100">
                  ID Project: {projectId.substring(0, 8)}...
                </span>
                <h2 className="text-xl font-extrabold text-[#1C2939] mt-2">
                  {project.title}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">
                  Estimasi Budget Client
                </span>
                <span className="text-base font-black text-[#00B5B7]">
                  Rp {Number(project.budgetMin).toLocaleString("id-ID")} - Rp{" "}
                  {Number(project.budgetMax).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 bg-slate-50 p-4 rounded-xl leading-relaxed border border-gray-100">
              {project.description}
            </p>

            <div className="flex gap-6 text-xs text-gray-400 font-medium pt-2">
              <div>
                Lokasi:{" "}
                <span className="text-slate-700 font-bold">
                  {project.location || "Malang, Jawa Timur"}
                </span>
              </div>
              <div>
                Kategori:{" "}
                <span className="text-slate-700 font-bold uppercase">
                  {project.category}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Pengisian Bid */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold">Ajukan Penawaran Kerja</h3>
            <p className="text-xs text-gray-400">
              Masukkan nominal harga terbaik, durasi pengerjaan, dan pesan
              meyakinkan Anda.
            </p>
          </div>

          {/* Notifikasi Status */}
          {statusMessage.text && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                statusMessage.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmitBid} className="space-y-5">
            {/* Grid untuk Budget & Estimasi Hari */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input proposedPrice */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Harga Penawaran Anda (Rp)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    Rp
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 120000"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A67B2] focus:bg-white text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Input estimatedDays */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Estimasi Waktu Kerja (Hari)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A67B2] focus:bg-white text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Input coverLetter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                Surat Pengantar / Pesan Penawaran (Cover Letter)
              </label>
              <textarea
                rows="5"
                required
                placeholder="Halo, saya berpengalaman di bidang ini... (jelaskan keahlian atau rute yang Anda pahami agar client yakin)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full p-4 bg-slate-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A67B2] focus:bg-white text-sm leading-relaxed"
              />
            </div>

            {/* Syarat Keamanan */}
            <div className="flex items-start gap-2.5 bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl text-[11px] text-emerald-800 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Dana client akan diamankan di escrow system Garda Wira-Wiri.
                Pembayaran dicairkan penuh ke dompet Anda setelah tugas
                dinyatakan selesai oleh client.
              </span>
            </div>

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#1A67B2] hover:bg-[#155391] shadow-[#1A67B2]/20"
              }`}
            >
              {isSubmitting ? "Mengajukan Bid..." : "Kirim Penawaran Terbaik"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
