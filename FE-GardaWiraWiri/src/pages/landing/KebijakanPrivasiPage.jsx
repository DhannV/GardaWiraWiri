import React, { useEffect } from "react";
import {
  Shield,
  Eye,
  Lock,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KebijakanPrivasi() {
  const navigate = useNavigate();

  // Memastikan halaman langsung otomatis scroll ke paling atas saat dibuka
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const poinKebijakan = [
    {
      icon: <Eye className="w-5 h-5 text-[#1A67B2]" />,
      title: "1. Informasi yang Kami Kumpulkan",
      content:
        "Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar sebagai Klien atau Freelancer, termasuk namun tidak terbatas pada nama lengkap, alamat email, nomor telepon, dokumen verifikasi identitas (jika diperlukan), serta informasi profil profesional Anda.",
    },
    {
      icon: <Shield className="w-5 h-5 text-[#00B5B7]" />,
      title: "2. Penggunaan Informasi Anda",
      content:
        "Informasi yang kami kumpulkan digunakan untuk mengelola akun Anda, memproses transaksi, memfasilitasi kerja sama antara Klien dan Freelancer di dalam platform Garda Wira-Wiri, serta memberikan layanan bantuan pelanggan yang optimal.",
    },
    {
      icon: <Lock className="w-5 h-5 text-[#1A67B2]" />,
      title: "3. Perlindungan & Keamanan Data",
      content:
        "Garda Wira-Wiri menerapkan standar keamanan digital yang ketat untuk melindungi data pribadi Anda dari akses tanpa izin, perubahan, pengungkapan, atau penghancuran yang tidak sah. Kami mengamankan komunikasi data menggunakan teknologi enkripsi standar industri.",
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#00B5B7]" />,
      title: "4. Pembaruan Kebijakan Ini",
      content:
        "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mengikuti perkembangan layanan kami atau regulasi hukum yang berlaku. Perubahan akan diinformasikan melalui pembaruan tanggal di bagian atas halaman ini.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#1C2939] font-sans antialiased pb-24">
      {/* 🛡️ HEADER UTAMA */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-white via-sky-50/20 to-slate-50 overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/15 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 left-0 w-64 h-64 bg-[#00B5B7]/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl mx-auto px-6">
          {/* Tombol Kembali ke Beranda */}
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1A67B2] hover:text-[#00B5B7] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Beranda
          </button>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-gray-900">
            Kebijakan Privasi
          </h1>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <span>Terakhir Diperbarui: 5 Juni 2026</span>
          </p>
        </div>
      </section>

      {/* 📄 KONTEN KEBIJAKAN PRIVASI */}
      <main className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm space-y-8">
          {/* Kata Pengantar singkat */}
          <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-100/40 text-sm text-gray-600 leading-relaxed">
            Selamat datang di <strong>Garda Wira-Wiri</strong>. Kami sangat
            menghargai privasi Anda dan berkomitmen penuh untuk melindungi data
            pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami
            mengumpulkan, menggunakan, menyimpan, dan melindungi data Anda saat
            berinteraksi di platform kami.
          </div>

          <hr className="border-gray-100" />

          {/* List Poin Kebijakan */}
          <div className="space-y-8">
            {poinKebijakan.map((poin, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {poin.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-gray-800 tracking-tight">
                    {poin.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {poin.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {/* Hubungi Kami Section */}
          <div className="pt-4 text-center sm:text-left">
            <h4 className="font-bold text-sm text-gray-800 mb-2">
              Punya Pertanyaan Mengenai Privasi Anda?
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Jika Anda memiliki pertanyaan, kekhawatiran, atau ingin mengajukan
              penghapusan data akun Anda dari sistem kami, silakan hubungi tim
              kepatuhan data kami.
            </p>
            <button
              onClick={() => window.open("https://wa.me/your-number", "_blank")}
              className="inline-flex items-center gap-2 bg-[#1A67B2] hover:bg-[#00B5B7] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Hubungi Tim Privasi Kami
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
