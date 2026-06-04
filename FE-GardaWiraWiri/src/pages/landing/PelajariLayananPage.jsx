import React, { useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  Search,
  Calendar,
  HeartHandshake,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Pastikan mengimpor Navbar dinamis kita yang sudah diperbarui sebelumnya jika ingin dipasang
// import Navbar from "../components/Navbar";

export default function PelajariLayananPage() {
  const navigate = useNavigate();

  // 🔥 Ambil data login untuk pengecekan tombol
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const rawRole =
    typeof window !== "undefined" ? localStorage.getItem("user_role") : "";
  const role = rawRole ? rawRole.trim().toLowerCase() : "";

  // Scroll otomatis ke atas saat halaman dibuka
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const layananUtama = [
    {
      icon: <FileText className="w-8 h-8 text-[#1A67B2]" />,
      title: "Manajemen Administrasi Harian",
      description:
        "Kami mengurus semua tumpukan berkas, penataan dokumen digital, pembayaran tagihan rutin, hingga korespondensi email penting Anda.",
      features: [
        "Penyusunan laporan bulanan",
        "Reminder & auto-payment tagihan",
        "Pengarsipan dokumen cloud secure",
      ],
    },
    {
      icon: <Calendar className="w-8 h-8 text-[#00B5B7]" />,
      title: "Personal Concierge & Scheduling",
      description:
        "Atur jadwal hidup Anda tanpa pusing. Mulai dari pemesanan tiket perjalanan, reservasi tempat pertemuan bisnis, hingga pengaturan janji temu medis.",
      features: [
        "Manajemen kalender 24/7",
        "Booking akomodasi & transportasi",
        "Asisten pengingat agenda harian",
      ],
    },
    {
      icon: <Search className="w-8 h-8 text-[#1A67B2]" />,
      title: "Riset & Pengadaan Kebutuhan",
      description:
        "Butuh mencari vendor terbaik untuk event atau membandingkan harga jasa kurir pengiriman internasional? Biarkan tim profesional kami yang melakukan riset mendalam untuk Anda.",
      features: [
        "Perbandingan harga & vendor",
        "Riset informasi spesifik",
        "Pembelian kado/kebutuhan korporat",
      ],
    },
  ];

  const keunggulan = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "Kerahasiaan Data Terjamin",
      desc: "Semua data administrasi dan pribadi Anda dilindungi dengan enkripsi ketat dan perjanjian hukum (NDA) yang aman.",
    },
    {
      icon: <Clock className="w-6 h-6 text-sky-500" />,
      title: "Efisiensi Waktu Maksimal",
      desc: "Hemat hingga 15+ jam per minggu. Alihkan tugas repetitif ke kami dan fokuslah pada pertumbuhan bisnis Anda.",
    },
    {
      icon: <UserCheck className="w-6 h-6 text-indigo-500" />,
      title: "Didukung Freelancer Terpilih",
      desc: "Setiap tugas dikerjakan oleh tenaga ahli (freelancer) yang telah melalui proses kurasi dan verifikasi latar belakang ketat.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#1C2939] font-sans antialiased">
      {/* <Navbar /> */}

      {/* 🚀 HERO SECTION LAYANAN */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-white via-sky-50/30 to-slate-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-[#00B5B7]/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-[#1A67B2]/10 text-[#1A67B2] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Eksplorasi Detail Jasa
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Sederhanakan Urusan Anda, <br />
            Serahkan Pada{" "}
            <span className="text-[#00B5B7]">Garda Wira-Wiri</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kami hadir sebagai partner strategis untuk menangani tugas-tugas
            administratif dan operasional harian Anda. Pilih dari ekosistem
            layanan lengkap kami di bawah ini.
          </p>
        </div>
      </section>

      {/* 📦 GRID DAFTAR LAYANAN */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {layananUtama.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-gray-50">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="space-y-2.5 mb-8">
                  {item.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs font-medium text-gray-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔥 KONDISI 1: Hanya tampilkan tombol request jika user BELUM LOGIN */}
              {!token && (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-slate-50 hover:bg-[#1A67B2] text-gray-700 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  Mulai Request Tugas
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 🤝 SECTION WHY CHOOSE US */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800 mb-4">
              Mengapa Klien Mempercayakan Tugas Kepada Kami?
            </h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Sistem kerja Garda Wira-Wiri dirancang modular demi kenyamanan,
              fleksibilitas tinggi, dan keamanan mutlak bagi setiap profil
              klien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {keunggulan.map((point, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  {point.icon}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-800 mb-1.5">
                    {point.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 CALL TO ACTION (CTA) SECTION */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-br from-[#1A67B2] to-[#124d87] rounded-[2.5rem] p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

          <HeartHandshake className="w-12 h-12 text-[#00B5B7] mx-auto mb-6" />
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Siap Mendelegasikan Pekerjaan Anda?
          </h2>
          <p className="text-sm md:text-base text-sky-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            {!token
              ? "Daftar sebagai Client sekarang, buat proyek pertamamu, dan biarkan jejaring freelancer Garda Wira-Wiri yang menyelesaikan urusan administrasi Anda."
              : "Kelola seluruh tugas dan progres pekerjaan Anda langsung dari bilah kontrol dashboard."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* 🔥 KONDISI 2: Jika BELUM LOGIN munculkan "Daftar", jika SUDAH LOGIN ganti dengan "Buka Dashboard" sesuai rolenya */}
            {!token ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#00B5B7] hover:bg-white text-white hover:text-[#1A67B2] px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-md active:scale-95"
              >
                Daftar / Masuk Akun
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate(
                    role === "client"
                      ? "/dashboard-client"
                      : "/dashboard-freelancer/bid/all",
                  )
                }
                className="bg-[#00B5B7] hover:bg-white text-white hover:text-[#1A67B2] px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-md active:scale-95"
              >
                Buka Panel Dashboard
              </button>
            )}

            <button
              onClick={() => navigate("/")}
              className="bg-transparent hover:bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
