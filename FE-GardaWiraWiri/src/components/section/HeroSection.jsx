import React from "react";
import { ArrowRight } from "lucide-react";
import logo from "../../assets/images/logo/LogoGarda.png";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
    >
      {/* Teks Kiri */}
      <div className="space-y-6">
        <span className="inline-block bg-[#7DCDB4]/15 text-[#00B5B7] text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full">
          Modern Life-Admin & Concierge
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1C2939] leading-tight">
          Sederhanakan Hidup Anda Bersama{" "}
          <span className="text-[#00B5B7]">Garda Wira-Wiri</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg">
          Kami mengurus semua urusan administrasi harian dan kebutuhan personal
          Anda, sehingga Anda bisa fokus pada hal yang paling penting.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => {
              navigate("/pelajari-layanan");
              setIsOpen(false);
            }}
            className="bg-[#1A67B2] hover:bg-[#00B5B7] text-white px-7 py-3.5 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-[#1A67B2]/20"
          >
            Pelajari Layanan
          </button>
        </div>
      </div>

      {/* Gambar Kanan (Minimalis) */}
      <div className="hidden md:flex justify-center relative">
        {/* Ornamen latar belakang abstrak untuk kesan modern */}
        <div className="absolute w-72 h-72 bg-[#7DCDB4]/20 rounded-full -top-10 -right-10 blur-3xl z-0"></div>
        <div className="absolute w-60 h-60 bg-[#1A67B2]/10 rounded-full -bottom-10 -left-10 blur-3xl z-0"></div>

        {/* Kotak Gambar Utama */}
        <div className="w-full max-w-md aspect-[4/3] flex items-center justify-center relative z-10">
          <img src={logo} alt="Logo Garda Wira-Wiri" className="w-70 h-70" />
        </div>
      </div>
    </section>
  );
}
