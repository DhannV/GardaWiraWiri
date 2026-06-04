import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import logo from "../../assets/images/logo/LogoGarda.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C2939] text-gray-400 py-16 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Kolom 1: Tentang & Brand */}
        <div className="md:col-span-2 space-y-4">
          <span className="text-2xl font-bold tracking-tight text-white block">
            Garda <span className="text-[#00B5B7]">Wira-Wiri</span>
          </span>
          <p className="text-sm max-w-sm leading-relaxed text-gray-400">
            Modern Life-Admin & Concierge. Kami hadir untuk menyederhanakan
            hidup Anda dengan mengurus segala urusan administrasi harian dan
            kebutuhan personal secara profesional.
          </p>
        </div>

        {/* Kolom 2: Tautan Cepat */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Navigasi
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="#hero"
                className="hover:text-white transition-colors duration-200"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#features"
                className="hover:text-white transition-colors duration-200"
              >
                Fitur
              </a>
            </li>
            <li>
              <a
                href="#services"
                className="hover:text-white transition-colors duration-200"
              >
                Layanan
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="hover:text-white transition-colors duration-200"
              >
                Cara Kerja
              </a>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Informasi Kontak */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
            Hubungi Kami
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <span>Email:</span>
              <a
                href="mailto:gardawirawiri@gmail.com"
                className="hover:text-white transition-colors"
              >
                gardawirawiri@gmail.com
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <span>WhatsApp:</span>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                -
              </a>
            </li>
            <li>Lokasi: Malang, Indonesia</li>
          </ul>
        </div>
      </div>

      {/* Garis Pembatas & Hak Cipta */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs space-y-4 sm:space-y-0">
        <p>&copy; {currentYear} Garda Wira-Wiri. All rights reserved.</p>
        <div className="flex space-x-6">
          <a
            href="/kebijakan-privasi"
            className="hover:text-white transition-colors duration-200"
          >
            Kebijakan Privasi
          </a>
          <a
            href="/terms-faq"
            className="hover:text-white transition-colors duration-200"
          >
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  );
}
