import React from "react";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Sangat membantu! Jadwal meeting dan urusan dokumen kantor saya sekarang jauh lebih rapi. Benar-benar life-saver.",
      name: "Budi Santoso",
      role: "Pengusaha",
    },
    {
      quote:
        "Garda Wira-Wiri mengurus semua perpanjangan surat kendaraan dan tagihan rumah tangga saya. Saya jadi punya lebih banyak waktu untuk keluarga.",
      name: "Siti Rahma",
      role: "Ibu Rumah Tangga",
    },
  ];

  return (
    <section id="testimonials" className="bg-[#F8FAFC] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1C2939] mb-16">
          Apa Kata Mereka?
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testi, index) => (
            <div
              key={index}
              className="bg-white p-10 rounded-2xl shadow-sm border border-gray-50"
            >
              {/* Tanda Kutip Dekoratif */}
              <div className="text-[#7DCDB4] text-5xl font-serif mb-4 leading-none">
                "
              </div>
              <p className="text-gray-600 text-lg italic mb-8 leading-relaxed">
                {testi.quote}
              </p>
              <div>
                <h4 className="font-bold text-[#1C2939]">{testi.name}</h4>
                <p className="text-sm text-[#00B5B7]">{testi.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
