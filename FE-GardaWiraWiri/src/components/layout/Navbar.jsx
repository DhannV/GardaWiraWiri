import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import logo from "../../assets/images/logo/LogoGarda.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    /* PERUBAHAN UTAMA: Menggunakan 'fixed top-0 left-0 right-0 z-50'
       Ini akan mengunci posisi navbar agar selalu diam di paling atas layar.
    */
    <nav className="w-full py-5 px-6 md:px-12 bg-white/95 backdrop-blur-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Area Logo */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Garda Wira-Wiri" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-tight text-[#1C2939]">
            Garda <span className="text-[#1A67B2]">Wira-Wiri</span>
          </span>
        </div>

        {/* Menu Navigasi (Desktop) */}
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
          <a href="#hero" className="hover:text-[#1A67B2] transition-colors">
            Home
          </a>
          <a
            href="#features"
            className="hover:text-[#1A67B2] transition-colors"
          >
            Fitur
          </a>
          <a
            href="#services"
            className="hover:text-[#1A67B2] transition-colors"
          >
            Layanan
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#1A67B2] transition-colors"
          >
            Cara Kerja
          </a>
        </div>

        {/* Tombol Aksi (Desktop) */}
        <div className="hidden md:block">
          <button className="bg-[#1A67B2] hover:bg-[#00B5B7] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 group">
            Hubungi Kami
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Tombol Hamburger (Mobile) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex flex-col justify-center items-center relative focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            <span
              className={`block absolute h-0.5 w-6 bg-[#1C2939] transform transition-all duration-300 ease-in-out ${
                isOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
              }`}
            ></span>
            <span
              className={`block absolute h-0.5 w-6 bg-[#1C2939] transform transition-all duration-200 ease-in-out ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`block absolute h-0.5 w-6 bg-[#1C2939] transform transition-all duration-300 ease-in-out ${
                isOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Menu Mobile Drawer */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out origin-top z-40 ${
          isOpen
            ? "opacity-100 scale-y-100 visible"
            : "opacity-0 scale-y-95 invisible"
        }`}
      >
        <div className="flex flex-col p-6 space-y-4 font-medium text-gray-600">
          <a
            href="#hero"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#1A67B2] transition-colors py-2.5 border-b border-gray-50 text-base"
          >
            Home
          </a>
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#1A67B2] transition-colors py-2.5 border-b border-gray-50 text-base"
          >
            Fitur
          </a>
          <a
            href="#services"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#1A67B2] transition-colors py-2.5 border-b border-gray-50 text-base"
          >
            Layanan
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="hover:text-[#1A67B2] transition-colors py-2.5 text-base"
          >
            Cara Kerja
          </a>

          <button className="w-full bg-[#1A67B2] hover:bg-[#00B5B7] text-white px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-sm">
            Hubungi Kami
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
