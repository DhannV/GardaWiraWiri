import React, { useState } from "react";
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

  // Dummy Data Layanan Khas Garda Wira-Wiri
  const services = [
    {
      id: 1,
      title: "Nemenin Olahraga & Kegiatan",
      category: "Lifestyle",
      description:
        "Butuh teman jogging, badminton, atau gym biar makin termotivasi? Rekan jasa kami siap menemani aktivitas sehat Anda.",
      price: 130000,
    },
    {
      id: 2,
      title: "Garda Food & Belanja Harian",
      category: "Life-Admin",
      description:
        "Bantu belikan makanan idaman, belanja bulanan di pasar/supermarket, hingga mengantarkan barang titipan titipan penting Anda.",
      price: 650000,
    },
    {
      id: 3,
      title: "Pengurusan Dokumen & Antrean",
      category: "Life-Admin",
      description:
        "Malas mengantre dokumen, tiket, atau urusan administrasi lainnya? Biarkan tim kami yang berdiri mengantre untuk Anda.",
      price: 100000,
    },
    {
      id: 4,
      title: "Tugas Kustom / Spy - Mata-Mata",
      category: "Concierge",
      description:
        "Membutuhkan pengawasan khusus, pengecekan lokasi secara rahasia, atau tugas personal yang membutuhkan privasi tingkat tinggi.",
      price: 360000,
    },
    {
      id: 5,
      title: "Mengubur Bangkai Hewan",
      category: "Urgent",
      description:
        "Layanan cepat tanggap untuk membantu Anda membersihkan dan menguburkan bangkai hewan di sekitar area rumah dengan layak.",
      price: 100000,
    },
    {
      id: 6,
      title: "Concierge Pendamping Acara",
      category: "Concierge",
      description:
        "Menemani ke kondangan, pameran, menghadiri nobar, hingga membantu membagikan brosur bisnis Anda secara profesional.",
      price: 200000,
    },
  ];

  const categories = [
    "Semua",
    "Life-Admin",
    "Lifestyle",
    "Concierge",
    "Urgent",
  ];

  // Filter logika untuk pencarian dan kategori
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      selectedCategory === "Semua" || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2939] py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* FIX: Tombol Kembali Sekarang Sudah Menjadi Minimalis Sesuai Gambar */}
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

        {/* HEADER & FILTER AREA */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-[#7DCDB4]/15 text-[#00B5B7] text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Pilih Jasa Sesuai Kebutuhan Anda
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Layanan On-Demand{" "}
            <span className="text-[#1A67B2]">Garda Wira-Wiri</span>
          </h2>

          {/* Search Bar ala Premium */}
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

        {/* SERVICE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Wadah Gambar / Ilustrasi */}
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#1A67B2]/5 to-[#00B5B7]/5 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                {/* Efek Lingkaran Estetik Latar Belakang */}
                <div className="absolute w-24 h-24 bg-[#7DCDB4]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                {/* Konten Placeholder Gambar */}
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono relative z-10">
                  [ Ilustrasi Pengerjaan Tugas ]
                </div>

                {/* Badge Kategori */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1C2939] text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-gray-100 uppercase tracking-wider">
                  {service.category}
                </span>
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
                      Mulai dari
                    </span>
                    <span className="text-lg font-extrabold text-[#1C2939]">
                      Rp {service.price.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Tombol Pilih Jasa */}
                  <button className="w-full bg-[#1A67B2] group-hover:bg-[#00B5B7] text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm shadow-[#1A67B2]/5">
                    Pilih Jasa
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* State Jika Pencarian Kosong */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">
              Layanan yang Anda cari tidak ditemukan. Coba kata kunci lain atau
              hubungi custom tugas satuan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
