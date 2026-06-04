import React, { useState, useEffect } from "react";
// Import sesuai struktur folder komponen Anda
import ClientBidsViewPage from "../../components/bids/ClientBidsViewPage";
import ClientContracts from "../../components/contract/ClientContracts";
import {
  FolderKanban,
  FileText,
  LogOut,
  Plus,
  Menu,
  X,
  Home,
} from "lucide-react";

const BASE_URL = "https://gardawirawiri.onrender.com/api/v1";

export default function DashboardClientPage() {
  // 1. STATE NAVIGASI UTAMA SIDEBAR
  const [currentMenu, setCurrentMenu] = useState("projects"); // "projects" atau "contracts"

  // 🔥 STATE BARU: Untuk kontrol buka/tutup sidebar di mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. STATE DATA MANAJEMEN PROYEK & BID
  const [hasFetched, setHasFetched] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 3. EFFECT FETCHING DAFTAR PROYEK UTK MENU MANAJEMEN PROYEK
  useEffect(() => {
    const fetchClientProjects = async () => {
      if (hasFetched) return;

      try {
        setLoadingProjects(true);
        setError(null);

        const response = await fetch(`${BASE_URL}/projects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setProjects(result.data || []);
          setHasFetched(true);

          if (result.data && result.data.length > 0) {
            setSelectedProjectId(result.data[0].id);
          }
        } else {
          throw new Error(
            result.message || "Gagal memuat daftar project Anda.",
          );
        }
      } catch (err) {
        console.error("Error fetching client projects:", err);
        setError(err.message);
      } finally {
        setLoadingProjects(false);
      }
    };

    if (token) {
      fetchClientProjects();
    } else {
      setError("Token tidak ditemukan. Silakan login kembali.");
      setLoadingProjects(false);
    }
  }, [token, hasFetched]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      {/* 🔥 ================= HEADER MOBILE (Hanya Muncul di Layar Kecil) ================= */}
      <header className="w-full bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 md:hidden">
        <div className="font-black text-sm text-[#1A67B2] tracking-wide">
          GARDA WIRA-WIRI <br />
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            Client Panel
          </span>
        </div>

        {/* Tombol Hamburger */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* 🔥 ================= OVERLAY BACKDROP (Menutup konten saat sidebar mobile aktif) ================= */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* ================= SIDEBAR KIRI PANEL (Responsive Slide-In) ================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white p-6 flex flex-col justify-between shrink-0 border-r border-gray-100
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:h-screen md:sticky md:top-0
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"}
        `}
      >
        <div className="space-y-6">
          {/* Header Internal Sidebar */}
          <div className="flex items-start justify-between">
            <div className="font-black text-base text-[#1A67B2] tracking-wide">
              GARDA WIRA-WIRI <br />
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                Client Panel
              </span>
            </div>

            {/* Tombol Close (Hanya muncul di Mobile Drawer) */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tombol Buat Tugas */}
          <a
            href="/create-project"
            className="inline-flex w-full items-center justify-center gap-1.5 bg-[#1A67B2] hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-center shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Buat Tugas Wira-Wiri
          </a>

          {/* Menu Navigasi */}
          <nav className="space-y-1">
            <a
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-gray-500 hover:bg-gray-50 hover:text-[#1A67B2]"
            >
              <Home className="w-4 h-4" />
              Home
            </a>
            {/* TAB MANAJEMEN TUGAS */}
            <button
              onClick={() => {
                setCurrentMenu("projects");
                setIsSidebarOpen(false); // Otomatis tutup sidebar setelah pilih menu di mobile
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                currentMenu === "projects"
                  ? "text-[#1A67B2] bg-sky-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Project & Bid
            </button>

            {/* BUTTON CONTRACT BARU */}
            <button
              onClick={() => {
                setCurrentMenu("contracts");
                setIsSidebarOpen(false); // Otomatis tutup sidebar setelah pilih menu di mobile
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                currentMenu === "contracts"
                  ? "text-[#1A67B2] bg-sky-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Kontrak
            </button>
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="mt-8 flex items-center gap-2 text-xs text-red-500 font-bold hover:text-red-700 px-4 py-2"
        >
          <LogOut className="w-4 h-4" /> Keluar Akun
        </button>
      </aside>

      {/* ================= AREA KONTEN UTAMA DENGAN KONDISIONAL MENU ================= */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 w-full overflow-y-auto">
        {currentMenu === "contracts" ? (
          /* A. KONDISI TAMPILAN JIKA MENU KONTRAK YANG AKTIF */
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#1C2939]">
                Daftar Kontrak Kerja Keluar
              </h2>
              <p className="text-xs text-gray-400">
                Pantau progres pengerjaan tugas dari freelancer yang Anda
                rekrut.
              </p>
            </div>

            <ClientContracts token={token} />
          </div>
        ) : (
          /* B. KONDISI TAMPILAN DEFAULT JIKA MANAJEMEN PROYEK (KOLOM KIRI & KANAN) YANG AKTIF */
          <div className="space-y-6">
            {/* STRUKTUR GRID WORKSPACE (KOLOM PROYEK KIRI & LIST BID KANAN) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* KOLOM KIRI (SKALA 4/12): LIST PROYEK MILIK CLIENT */}
              <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Project Saya
                </h3>

                {loadingProjects ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-14 bg-gray-50 rounded-xl" />
                    <div className="h-14 bg-gray-50 rounded-xl" />
                  </div>
                ) : error ? (
                  <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 space-y-1">
                    <p className="font-bold">Gagal memuat:</p>
                    <p className="leading-relaxed opacity-90">{error}</p>
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Kamu belum memiliki project yang aktif.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedProjectId === proj.id
                            ? "border-[#1A67B2] bg-blue-50/30 shadow-sm ring-1 ring-[#1A67B2]"
                            : "border-gray-100 hover:bg-gray-50 bg-white"
                        }`}
                      >
                        <h4 className="text-xs font-bold text-gray-800 truncate">
                          {proj.title}
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Max: Rp{" "}
                            {Number(proj.budgetMax).toLocaleString("id-ID")}
                          </span>

                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              proj.status === "open"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : proj.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : proj.status === "completed"
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {proj.status === "in_progress"
                              ? "In Progress"
                              : proj.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* KOLOM KANAN (SKALA 8/12): PANEL DETAIL/LIST BID DARI PROYEK YANG DIKLIK */}
              <div className="lg:col-span-8">
                {selectedProjectId ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                      <h3 className="text-base font-bold text-gray-800">
                        Daftar Penawaran Masuk
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Silakan tinjau tawaran harga dari kurir di bawah ini.
                      </p>
                    </div>

                    <ClientBidsViewPage
                      projectId={selectedProjectId}
                      token={token}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 bg-white">
                    <p className="text-xs font-medium">
                      Pilih salah satu project di panel kiri untuk melihat
                      tawaran masuk
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
