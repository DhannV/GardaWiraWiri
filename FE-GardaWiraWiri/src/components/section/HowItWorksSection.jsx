import React from "react";
import { Search, UserCheck, Handshake, CheckCircle } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Konsultasi",
      desc: "Hubungi kami dan ceritakan kebutuhan administrasi atau tugas harian Anda.",
    },
    {
      num: "02",
      title: "Pendelegasian",
      desc: "Tim kami akan mengambil alih tugas tersebut dengan cepat dan tepat sasaran.",
    },
    {
      num: "03",
      title: "Beres & Laporan",
      desc: "Tugas selesai. Anda akan menerima laporan lengkap tanpa perlu pusing.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1C2939] mb-16">
          Cara Kerja Kami
        </h2>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Garis Penghubung Latar Belakang (Hanya tampil di Desktop) */}
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-100 z-0 w-2/3 mx-auto"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white border-4 border-[#F8FAFC] shadow-sm flex items-center justify-center text-[#1A67B2] font-bold text-xl mb-6">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-[#1C2939] mb-3">
                {step.title}
              </h3>
              <p className="text-gray-500 max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
