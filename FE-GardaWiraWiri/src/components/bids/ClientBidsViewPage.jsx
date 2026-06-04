import React, { useState, useEffect } from "react";
import { AlertCircle, Star, Clock, Check, X, Loader2 } from "lucide-react";
// 🌟 Import SweetAlert2
import Swal from "sweetalert2";

const BASE_URL = "https://gardawirawiri.onrender.com/api/v1";

export default function ClientBidsViewPage({ projectId, token: propToken }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk melacak item mana yang sedang diproses di background
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const token =
    propToken ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const fetchBids = async () => {
    if (!projectId) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bids/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat data penawaran.");
      }

      setBids(result.data || []);
    } catch (err) {
      console.error("Gagal memuat list bid:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && token) fetchBids();
  }, [projectId, token]);

  // =========================================================================
  // 🌟 1. HANDLER TERIMA BID (Menggantikan window.confirm & alert sukses)
  // =========================================================================
  const handleAcceptBid = async (bidId, freelancerName, price) => {
    // Tampilkan SweetAlert2 Konfirmasi
    const resultConfirm = await Swal.fire({
      title: "Terima Penawaran?",
      text: `Apakah Anda yakin ingin menerima penawaran dari ${freelancerName} sebesar Rp ${Number(price).toLocaleString("id-ID")}? Kontrak kerja akan otomatis dibuat.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00B5B7", // Warna khas Garda Wira-Wiri
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Terima",
      cancelButtonText: "Batal",
      background: "#ffffff",
      customClass: {
        popup: "rounded-[2rem]",
        confirmButton: "px-5 py-2.5 rounded-xl text-sm font-bold",
        cancelButton: "px-5 py-2.5 rounded-xl text-sm font-bold",
      },
    });

    if (!resultConfirm.isConfirmed) return;

    try {
      setActionLoadingId(bidId);

      const response = await fetch(`${BASE_URL}/bids/${bidId}/accept`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Notifikasi Sukses Premium
        Swal.fire({
          title: "Berhasil!",
          text: result.message || "Kontrak kerja telah sukses diterbitkan.",
          icon: "success",
          confirmButtonColor: "#1A67B2",
          customClass: { popup: "rounded-[2rem]" },
        });
        await fetchBids(); // Refresh data
      } else {
        throw new Error(result.message || "Gagal menyetujui penawaran ini.");
      }
    } catch (err) {
      Swal.fire({
        title: "Pemberitahuan",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[2rem]" },
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================================
  // 🌟 2. HANDLER TOLAK BID (Menggantikan window.prompt & alert penolakan)
  // =========================================================================
  const handleRejectBid = async (bidId, freelancerName) => {
    // Tampilkan SweetAlert2 Input Textarea Prompt
    const { value: rejectionNote, isDismissed } = await Swal.fire({
      title: "Tolak Penawaran",
      text: `Berikan alasan menolak penawaran dari ${freelancerName}:`,
      input: "textarea",
      inputValue: "Maaf, budget belum sesuai / kriteria kurang cocok.",
      inputPlaceholder: "Tulis alasan modifikasi di sini jika ada...",
      inputAttributes: {
        "aria-label": "Tulis alasan penolakan Anda",
      },
      showCancelButton: true,
      confirmButtonColor: "#DC2626", // Merah tegas untuk hapus/tolak
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Kembali",
      customClass: {
        popup: "rounded-[2rem]",
        input:
          "rounded-2xl text-sm border-gray-200 focus:ring-blue-50 focus:border-[#1A67B2]",
      },
    });

    // Jika user menutup modal atau menekan cancel
    if (isDismissed) return;

    try {
      setActionLoadingId(bidId);

      const response = await fetch(`${BASE_URL}/bids/${bidId}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejectionNote: rejectionNote ? rejectionNote.trim() : "",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Notifikasi Sukses Penolakan
        Swal.fire({
          title: "Diarsipkan",
          text: result.message || "Penawaran berhasil ditolak.",
          icon: "success",
          confirmButtonColor: "#1A67B2",
          customClass: { popup: "rounded-[2rem]" },
        });
        await fetchBids(); // Refresh list data
      } else {
        throw new Error(result.message || "Gagal menolak penawaran ini.");
      }
    } catch (err) {
      Swal.fire({
        title: "Gagal Proses",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[2rem]" },
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;

  if (loading)
    return (
      <div className="text-center py-6 text-xs text-gray-400">
        Menyelaraskan data penawaran...
      </div>
    );

  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-4">
        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
        <div className="space-y-2">
          <p className="font-bold">Akses Penawaran Terbatasi (Error 403/422)</p>
          <p className="leading-relaxed opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => {
        const isPending = bid.status === "pending" || !bid.status;
        const isAccepted = bid.status === "accepted";
        const isRejected = bid.status === "rejected";
        const freelancerName =
          bid.freelancerProfile?.user?.name || "Freelancer Garda";

        return (
          <div
            key={bid.id}
            className={`border rounded-xl p-4 bg-white transition-all ${
              isAccepted
                ? "border-green-200 bg-green-50/10 shadow-sm ring-1 ring-green-400"
                : isRejected
                  ? "border-gray-200 bg-gray-50/50 opacity-75"
                  : "border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${isRejected ? "text-gray-400 line-through" : "text-gray-800"}`}
                  >
                    {freelancerName}
                  </span>
                  {isAccepted && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Terpilih
                    </span>
                  )}
                  {isRejected && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                      Ditolak
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{" "}
                    {bid.freelancerProfile?.avgRating || 0}/5
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {bid.estimatedDays} Hari Kerja
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-black ${isRejected ? "text-gray-400 line-through" : "text-[#00B5B7]"}`}
                >
                  {formatRupiah(bid.proposedPrice)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 italic bg-gray-50/70 p-2.5 rounded-lg border-l-2 border-gray-300 mt-2">
              "{bid.coverLetter}"
            </p>

            {bid.rejectionNote && (
              <p className="text-[11px] text-red-600 mt-2 bg-red-50/50 p-2 rounded-lg border border-red-100">
                <b>Alasan Penolakan:</b> {bid.rejectionNote}
              </p>
            )}

            {/* AREA AKSI TOMBOL */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-50 mt-3">
              {isPending ? (
                <>
                  <button
                    onClick={() => handleRejectBid(bid.id, freelancerName)}
                    disabled={actionLoadingId !== null}
                    className="flex items-center gap-1.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-red-600 border border-red-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 disabled:text-gray-400 disabled:border-gray-100"
                  >
                    {actionLoadingId === bid.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" /> Tolak
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleAcceptBid(bid.id, freelancerName, bid.proposedPrice)
                    }
                    disabled={actionLoadingId !== null}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {actionLoadingId === bid.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" /> Terima Penawaran
                      </>
                    )}
                  </button>
                </>
              ) : isAccepted ? (
                <div className="text-[11px] text-green-600 font-medium flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Kontrak Kerja
                  Aktif
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 capitalize font-medium py-1">
                  Selesai Diarsip ({bid.status})
                </span>
              )}
            </div>
          </div>
        );
      })}

      {bids.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-6">
          Belum ada freelancer yang melakukan bid pada tugas ini.
        </p>
      )}
    </div>
  );
}
