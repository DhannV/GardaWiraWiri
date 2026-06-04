import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 🌐 State untuk menampung project asli dari database backend
  const [backendProjects, setBackendProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");

  // 1. Ambil data project nyata dari backend saat komponen di-load
  useEffect(() => {
    const fetchOpenProjects = async () => {
      try {
        // Mengambil project dengan status 'open' sesuai spesifikasi BE
        const response = await fetch(
          "https://gardawirawiri.onrender.com/api/v1/projects?status=open",
        );
        const result = await response.json();

        if (result.success && result.data) {
          // Sesuaikan mapping data jika backend membungkus dalam pagination array (ex: result.data.projects atau result.data)
          const projectsData = Array.isArray(result.data)
            ? result.data
            : result.data.projects || [];
          setBackendProjects(projectsData);
        }
      } catch (error) {
        console.error("Gagal memuat project dari backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenProjects();
  }, []);

  // 2. Dummy Data Layanan Khas Garda Wira-Wiri (Tetap dipertahankan)

  // 3. Transformasi project backend agar strukturnya seragam dengan kartu UI frontend
  const formattedBackendProjects = backendProjects.map((proj) => ({
    id: proj.id,
    title: proj.title,
    category: proj.category, // Tetap gunakan 'kebersihan', 'antar_jemput', dll
    description: proj.description,
    priceMin: Number(proj.budgetMin) || 0,
    priceMax: Number(proj.budgetMax) || 0,
    location: proj.location,
    isRealProject: true,
  }));

  // Gabungkan proyek asli backend di posisi teratas, diikuti oleh layanan dummy
  const allServices = [...formattedBackendProjects];

  const categories = [
    "Semua",
    "antar_jemput",
    "belanja",
    "pindahan",
    "kebersihan",
    "perbaikan",
    "titip_antrian",
    "administrasi",
    "lainnya",
  ];

  // 4. Logika Filter Pencarian & Kapsul Kategori
  const filteredServices = allServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "Semua" || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 5. 🚨 FUNGSI VALIDASI AKSES: Wajib Login sebagai Freelancer
  const handleActionProject = (service) => {
    setAuthMessage("");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role"); // 'client', 'freelancer', atau 'admin'

    if (!token) {
      setAuthMessage(
        "⚠️ Akses Ditolak: Anda harus login terlebih dahulu untuk mengambil tugas!",
      );
      return;
    }

    if (role !== "freelancer") {
      setAuthMessage(
        "Gagal: Menu ini hanya dapat diambil oleh akun dengan Role Freelancer.",
      );
      return;
    }

    // Jika lolos pengecekan role freelancer, arahkan ke halaman pengisian Bid (Langkah berikutnya)
    if (service.isRealProject) {
      navigate(`/dashboard-freelancer/bid/${service.id}`);
    } else {
      alert(
        `Anda memilih layanan retail: ${service.title}. Fitur pemesanan langsung segera hadir.`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2939] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* TOMBOL KEMBALI */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              navigate("/");
            }}
            className="flex items-center text-sm text-gray-500 hover:text-[#1A67B2] transition-colors gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Beranda
          </button>
        </div>

        {/* HEADER AREA */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-[#7DCDB4]/15 text-[#00B5B7] text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Pilih Jasa Sesuai Kebutuhan Anda
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Layanan On-Demand{" "}
            <span className="text-[#1A67B2]">Garda Wira-Wiri</span>
          </h2>

          {/* NOTIFIKASI VALIDASI ROLE */}
          {authMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold border max-w-md mx-auto animate-bounce ${authMessage.includes("") ? "bg-red-50 border-red-200 text-red-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}
            >
              {authMessage}
            </div>
          )}

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Mau dibantu urusan apa hari ini?..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:border-[#1A67B2] text-sm"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-100 px-5 py-3.5 rounded-2xl shadow-sm font-medium text-sm hover:text-[#1A67B2] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Kategori Kapsul */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-[#1A67B2] text-white shadow-md shadow-[#1A67B2]/10"
                    : "bg-white border border-gray-100 text-gray-500 hover:border-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-20 text-sm font-semibold text-slate-400">
            Mengambil data penugasan terbaru dari Garda Wira-Wiri...
          </div>
        ) : (
          /* SERVICE CARDS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group ${
                  service.isRealProject
                    ? "border-sky-200 ring-2 ring-sky-500/5"
                    : "border-gray-100/80"
                }`}
              >
                {/* Wadah Gambar / Ilustrasi */}
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#1A67B2]/5 to-[#00B5B7]/5 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                  <div className="absolute w-24 h-24 bg-[#7DCDB4]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-400 font-medium relative z-10 p-4 text-center">
                    {service.isRealProject ? (
                      <>
                        <span className="text-lg mb-1">📍</span>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                          {service.location || "Malang"}
                        </span>
                      </>
                    ) : (
                      "[ Ilustrasi Pengerjaan Tugas ]"
                    )}
                  </div>

                  {/* Badge Kategori */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1C2939] text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-gray-100 uppercase tracking-wider">
                    {service.category}
                  </span>

                  {/* Tag Penanda Project Client Nyata */}
                  {service.isRealProject && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                      Tugas Client
                    </span>
                  )}
                </div>

                {/* Konten Teks Kartu */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-base text-[#1C2939] group-hover:text-[#1A67B2] transition-colors line-clamp-1">
                      {service.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Harga dan Aksi */}
                  <div className="pt-2 border-t border-gray-50 space-y-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                        {service.isRealProject
                          ? "Estimasi Budget"
                          : "Mulai dari"}
                      </span>
                      <span className="text-base font-extrabold text-[#1C2939]">
                        {service.isRealProject
                          ? `Rp ${service.priceMin.toLocaleString("id-ID")} - ${service.priceMax.toLocaleString("id-ID")}`
                          : `Rp ${service.priceMin.toLocaleString("id-ID")}`}
                      </span>
                    </div>

                    {/* Tombol Ambil Jasa / Ambil Tugas */}
                    <button
                      onClick={() => handleActionProject(service)}
                      className={`w-full text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm ${
                        service.isRealProject
                          ? "bg-[#1A67B2] hover:bg-[#00B5B7] shadow-amber-500/10"
                          : "bg-[#1A67B2] group-hover:bg-[#00B5B7] shadow-[#1A67B2]/5"
                      }`}
                    >
                      {service.isRealProject
                        ? "Ambil Tugas (Bid)"
                        : "Pilih Jasa"}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State Jika Pencarian Kosong */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">
              Layanan atau tugas project aktif tidak ditemukan. Coba gunakan
              kata kunci lain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
