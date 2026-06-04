import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo/LogoGarda.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State untuk menu mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 🔥 State baru untuk Dropdown Profil
  const dropdownRef = useRef(null);

  // Ambil token dan role dari localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const rawRole =
    typeof window !== "undefined" ? localStorage.getItem("user_role") : ""; // 🔥 GANTI JADI user_role

  // Normalisasi: paksa huruf kecil & hapus spasi gaib
  const role = rawRole ? rawRole.trim().toLowerCase() : "";
  // 🔥 Fungsi untuk menutup dropdown saat klik di luar area tombol
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi proteksi menu Project
  const handleProjectClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (!token) {
      navigate("/login");
    } else {
      navigate("/services");
    }
  };

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.clear();
    setIsDropdownOpen(false);
    setIsOpen(false);
    navigate("/login");
  };

  // 🔥 RENDER TOMBOL AKSI / DROPDOWN (DESKTOP & MOBILE)
  const renderActionButton = (isMobileView = false) => {
    // 1. KONDISI BELUM LOGIN (TETAP TOMBOL BERGABUNG)
    if (!token) {
      return (
        <button
          onClick={() => {
            navigate("/login");
            setIsOpen(false);
          }}
          className={
            isMobileView
              ? "w-full bg-[#1A67B2] hover:bg-[#00B5B7] text-white px-5 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
              : "bg-[#1A67B2] hover:bg-[#00B5B7] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 group"
          }
        >
          Bergabung
          <ArrowRight
            className={`w-4 h-4 ${!isMobileView && "transition-transform group-hover:translate-x-1"}`}
          />
        </button>
      );
    }

    // Format nama role agar huruf pertamanya kapital (client -> Client)
    const displayRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : "Akun Saya";
    // Jalur dashboard tujuan berdasarkan role
    const dashboardRoute =
      role === "client" ? "/dashboard-client" : "/dashboard-freelancer/bid/all";

    // 2. KONDISI SUDAH LOGIN (TAMPILAN DESKTOP DROPDOWN)
    if (!isMobileView) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white border border-gray-200 hover:border-gray-300 text-[#1C2939] hover:bg-gray-50 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {displayRole}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* ISI DROPDOWN DESKTOP */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  navigate(dashboardRoute);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#1A67B2] text-left transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                Panel Dashboard
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 text-left transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar Akun
              </button>
            </div>
          )}
        </div>
      );
    }

    // 3. KONDISI SUDAH LOGIN (TAMPILAN ACCORDION MENU DI HP)
    return (
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          Masuk Sebagai: <span className="text-[#1A67B2]">{displayRole}</span>
        </div>
        <button
          onClick={() => {
            navigate(dashboardRoute);
            setIsOpen(false);
          }}
          className="w-full bg-sky-50 text-[#1A67B2] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Buka Dashboard Panel
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar Akun
        </button>
      </div>
    );
  };

  return (
    <nav className="w-full py-5 px-6 md:px-12 bg-white/95 backdrop-blur-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Area Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
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
          <a
            href="/services"
            onClick={handleProjectClick}
            className="hover:text-[#1A67B2] transition-colors font-bold text-[#1A67B2]"
          >
            Project
          </a>
        </div>

        {/* Tombol Aksi / Dropdown (Desktop) */}
        <div className="hidden md:block">{renderActionButton(false)}</div>

        {/* Tombol Hamburger (Mobile) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex flex-col justify-center items-center relative focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            <span
              className={`block absolute h-0.5 w-6 bg-[#1C2939] transform transition-all duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-0" : "-translate-y-2"}`}
            ></span>
            <span
              className={`block absolute h-0.5 w-6 bg-[#1C2939] transform transition-all duration-200 ease-in-out ${isOpen ? "opacity-0" : "opacity-100"}`}
            ></span>
            <span
              className={`block absolute h-0.5 w-6 bg-[#1C2939] transform transition-all duration-300 ease-in-out ${isOpen ? "-rotate-45 translate-y-0" : "translate-y-2"}`}
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
            className="hover:text-[#1A67B2] transition-colors py-2.5 text-base border-b border-gray-50"
          >
            Cara Kerja
          </a>
          <a
            href="/services"
            onClick={handleProjectClick}
            className="hover:text-[#1A67B2] transition-colors py-2.5 text-base font-bold text-[#1A67B2]"
          >
            Project
          </a>

          {/* Dropdown / Tombol Aksi Khusus Tampilan HP */}
          {renderActionButton(true)}
        </div>
      </div>
    </nav>
  );
}
