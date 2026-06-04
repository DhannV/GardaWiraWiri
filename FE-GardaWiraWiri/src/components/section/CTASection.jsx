import React from "react";
import { ArrowRight, Sparkles, Briefcase, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  // Ambil token untuk cek status login
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const rawRole =
    typeof window !== "undefined" ? localStorage.getItem("user_role") : "";
  const role = rawRole ? rawRole.trim().toLowerCase() : "";

  return (
    <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#1A67B2] via-[#165694] to-[#124170] rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
        {/* Dekorasi Latar Belakang (Dibuat lebih dinamis & glow) */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00B5B7]/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse duration-400"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7DCDB4]/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Konten Utama */}
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Badge Kecil Interaktif */}

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Pekerjaan Menumpuk? <br className="hidden md:block" />
            Waktunya Mendelegasikan Tugas Anda!
          </h2>

          <p className="text-sky-100/90 text-base md:text-lg leading-relaxed mb-10 max-w-2xl">
            {!token
              ? "Bergabunglah ke dalam ekosistem Garda Wira-Wiri. Selesaikan tumpukan administrasi harian Anda sebagai Klien, atau mulailah menghasilkan pendapatan sebagai Freelancer terpercaya."
              : "Sesi Anda telah aktif. Jangan biarkan produktivitas Anda menurun, mari kelola dan buat proyek baru Anda sekarang."}
          </p>

          {/* AREA TOMBOL YANG RELEVAN & DINAMIS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {!token ? (
              <>
                {/* OPSI 1: Daftar Jadi Klien */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto bg-white text-[#1A67B2] hover:text-white hover:bg-[#00B5B7] px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 group active:scale-95"
                >
                  <UserCheck className="w-4 h-4" />
                  Gabung Jadi Klien
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* OPSI 2: Daftar Jadi Freelancer */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Briefcase className="w-4 h-4 text-sky-300" />
                  Mulai Kerja (Freelancer)
                </button>
              </>
            ) : (
              /* KONDISI USER SUDAH LOGIN */
              <button
                onClick={() =>
                  navigate(
                    role === "client"
                      ? "/services"
                      : "/dashboard-freelancer/bid/all",
                  )
                }
                className="w-full sm:w-auto bg-[#00B5B7] hover:bg-white text-white hover:text-[#1A67B2] px-10 py-4 rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 group active:scale-95"
              >
                {role === "client"
                  ? "Buat / Cari Project Baru"
                  : "Lihat Dashboard Lowongan"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
