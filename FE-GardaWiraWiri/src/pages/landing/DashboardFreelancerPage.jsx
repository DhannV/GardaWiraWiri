import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FreelancerBidPage from "../../components/bids/FreelancerBidPage";
import FreelancerBidsList from "../../components/bids/FreelancerBidsListPage";
// IMPORT KOMPONEN KONTRAK FREELANCER KAMU
import FreelancerContract from "../../components/contract/FreelancerContracts";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  Loader2,
  AlertCircle,
  Menu,
  X,
  Home,
} from "lucide-react";

const BASE_URL = "https://gardawirawiri.onrender.com/api/v1";

export default function DashboardFreelancerPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 1. STATE NAVIGASI TAB UTAMA ("bids" atau "contracts")
  const [activeTab, setActiveTab] = useState("bids");

  // 🔥 STATE BARU: Untuk kontrol buka/tutup sidebar di mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const fetchFreelancerBids = async () => {
    if (projectId && projectId !== "all") return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASE_URL}/bids/my-bids`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMyBids(result.data || []);
      } else {
        throw new Error(result.message || "Gagal mengambil data penawaran.");
      }
    } catch (err) {
      console.error("Error fetching freelancer bids:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFreelancerBids();
    } else {
      setError("Sesi Anda habis. Silakan login kembali.");
      setLoading(false);
    }
  }, [token, projectId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2939] flex flex-col md:flex-row relative">
      {/* 🔥 ================= HEADER MOBILE FREELANCER (Hanya Muncul di Layar Kecil) ================= */}
      <header className="w-full bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 md:hidden">
        <div className="font-black text-sm text-[#1A67B2] tracking-wide">
          GARDA WIRA-WIRI <br />
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            Freelancer Panel
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

      {/* 🔥 ================= OVERLAY BACKDROP MOBILE ================= */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* ================= SIDEBAR FREELANCER (Responsive Slide-In) ================= */}
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
                Freelancer Panel
              </span>
            </div>

            {/* Tombol Close X (Hanya muncul saat drawer mobile terbuka) */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Navigasi */}
          <nav className="space-y-1">
            <a
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all text-gray-500 hover:bg-gray-50 hover:text-[#1A67B2]"
            >
              <Home className="w-4 h-4" />
              Home
            </a>
            {/* BUTTON 1: PANELS / BIDS */}
            <button
              onClick={() => {
                setActiveTab("bids");
                setIsSidebarOpen(false); // 🔥 Otomatis tutup sidebar di mobile
                navigate("/dashboard-freelancer/bid/all");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === "bids" && (!projectId || projectId === "all")
                  ? "text-[#1A67B2] bg-sky-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Project & Bid
            </button>

            {/* BUTTON 2: CONTRACT LINE */}
            <button
              onClick={() => {
                setActiveTab("contracts");
                setIsSidebarOpen(false); // 🔥 Otomatis tutup sidebar di mobile
                navigate("/dashboard-freelancer/bid/all");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                activeTab === "contracts"
                  ? "text-[#1A67B2] bg-sky-50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Kontrak
            </button>
          </nav>
        </div>

        {/* BUTTON KELUAR */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="mt-8 flex items-center gap-2 text-xs text-red-500 font-bold hover:text-red-700 px-4 py-2"
        >
          <LogOut className="w-4 h-4" /> Keluar Akun
        </button>
      </aside>

      {/* ================= AREA KONTEN UTAMA DENGAN RESPONSIVE PADDING ================= */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        {projectId && projectId !== "all" ? (
          <div>
            <FreelancerBidPage />
          </div>
        ) : activeTab === "contracts" ? (
          /* RENDERING KOMPONEN KONTRAK KAMU JIKA TAB CONTRACTS AKTIF */
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#1C2939]">
                Kontrak Kerja Saya
              </h2>
              <p className="text-xs text-gray-400">
                Daftar kesepakatan tugas resmi yang sedang Anda jalankan.
              </p>
            </div>
            <FreelancerContract token={token} baseUrl={BASE_URL} />
          </div>
        ) : (
          /* DEFAULT: RENDER LIST BID */
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#1C2939]">
                Selamat Datang di Workspace Anda
              </h2>
              <p className="text-xs text-gray-400">
                Berikut adalah daftar penawaran harga (bid) yang sedang Anda
                ajukan.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 text-xs bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-[#1A67B2]" />
                Menyelaraskan data...
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            ) : myBids.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs bg-white">
                Anda belum pernah mengajukan penawaran harga.
              </div>
            ) : (
              <FreelancerBidsList
                myBids={myBids}
                fetchFreelancerBids={fetchFreelancerBids}
                token={token}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
