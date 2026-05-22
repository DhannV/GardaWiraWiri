import React from "react";
import { Shield, Clock, Users, TrendingUp } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "Efisien & Cepat",
      desc: "Kami merespons dan menyelesaikan tugas administrasi Anda dengan standar waktu yang ketat.",
    },
    {
      title: "Aman & Terpercaya",
      desc: "Kerahasiaan data dan dokumen pribadi Anda adalah prioritas utama kami.",
    },
    {
      title: "Dukungan Personal",
      desc: "Setiap klien mendapatkan pendekatan khusus sesuai dengan gaya hidup dan kebutuhannya.",
    },
    {
      title: "Laporan Transparan",
      desc: "Dapatkan pembaruan status secara real-time untuk setiap tugas yang kami kerjakan.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        {/* Teks Kiri */}
        <div className="md:w-1/3 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C2939] leading-tight">
            Kenapa Memilih{" "}
            <span className="text-[#00B5B7]">Garda Wira-Wiri?</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Kami tidak hanya sekadar membantu, kami memastikan setiap detail
            urusan Anda tertangani dengan profesionalitas tinggi.
          </p>
        </div>

        {/* Grid Fitur Kanan */}
        <div className="md:w-2/3 grid sm:grid-cols-2 gap-x-12 gap-y-16">
          {features.map((feature, index) => (
            <div key={index} className="relative">
              {/* Ornamen Titik Akses */}
              <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#7DCDB4]"></div>
              <h3 className="text-xl font-bold text-[#1C2939] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
