import React from "react";
import { Home, Users, CheckCircle2, Heart } from "lucide-react";

export default function ServicesSection() {
  // Data contoh layanan
  const services = [
    {
      id: 1,
      title: "Personal Concierge",
      desc: "Bantuan harian untuk mengurus kebutuhan pribadi dan rumah tangga Anda.",
    },
    {
      id: 2,
      title: "Life-Admin Support",
      desc: "Manajemen jadwal, pembayaran tagihan, dan pengarsipan dokumen digital.",
    },
    {
      id: 3,
      title: "Corporate Errands",
      desc: "Solusi administrasi kilat untuk mendukung operasional bisnis atau kantor Anda.",
    },
  ];

  return (
    <section id="services" className="bg-[#F8FAFC] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Judul Bagian */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-[#1C2939] md:text-4xl">
            Layanan Terbaik Kami
          </h2>
          <p className="text-gray-500">
            Solusi modern yang dirancang khusus untuk meringankan beban
            rutinitas harian Anda.
          </p>
        </div>

        {/* Grid Kartu Layanan */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Ikon Dekoratif Kecil */}
              <div className="w-12 h-12 rounded-xl bg-[#1A67B2]/10 flex items-center justify-center text-[#1A67B2] font-bold text-lg mb-6 group-hover:bg-[#00B5B7] group-hover:text-white transition-colors duration-300">
                0{service.id}
              </div>
              <h3 className="text-xl font-bold text-[#1C2939] mb-3">
                {service.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
