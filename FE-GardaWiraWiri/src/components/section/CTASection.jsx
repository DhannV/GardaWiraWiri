import React from "react";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto bg-[#1A67B2] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
        {/* Dekorasi Latar Belakang */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B5B7]/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7DCDB4]/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        {/* Konten Utama */}
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Siap Menyederhanakan <br className="hidden md:block" /> Hidup Anda
            Hari Ini?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Jangan biarkan urusan administrasi menyita waktu berharga Anda.
            Biarkan kami yang mengurusnya.
          </p>
          <button className="bg-white text-[#1A67B2] hover:bg-[#F8FAFC] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg mt-4">
            Hubungi Konsultan Kami
          </button>
        </div>
      </div>
    </section>
  );
}
