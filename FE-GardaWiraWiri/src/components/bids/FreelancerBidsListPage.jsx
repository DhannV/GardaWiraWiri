import React, { useState } from "react";
import { Clock, CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
// 🌟 Import SweetAlert2
import Swal from "sweetalert2";

const BASE_URL = "https://gardawirawiri.onrender.com/api/v1";

export default function FreelancerBidsListPage({
  myBids = [],
  fetchFreelancerBids,
  token,
}) {
  const [withdrawLoadingId, setWithdrawLoadingId] = useState(null);

  // =========================================================================
  // 🌟 HANDLER TARIK PENAWARAN (SweetAlert2 Integration)
  // =========================================================================
  const handleWithdrawBid = async (bidId, currentStatus) => {
    if (currentStatus === "accepted") {
      Swal.fire({
        title: "Aksi Ditolak",
        text: "Maaf, penawaran ini sudah disetujui oleh client dan tidak dapat ditarik kembali.",
        icon: "error",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[2rem]" },
      });
      return;
    }

    // Mengganti window.confirm di image_2324df.png dengan SweetAlert2 Peringatan Destruktif
    const resultConfirm = await Swal.fire({
      title: "Tarik Penawaran?",
      text: "Apakah Anda yakin ingin menarik penawaran harga ini? Tindakan ini akan menghapus data lamaran Anda pada proyek tersebut.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626", // Merah tegas penanda hapus/tarik data
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, Tarik",
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
      setWithdrawLoadingId(bidId);

      const response = await fetch(`${BASE_URL}/bids/${bidId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let result = {};
      const responseText = await response.text();
      if (responseText) {
        result = JSON.parse(responseText);
      }

      if (!response.ok || (result && result.success === false)) {
        throw new Error(result.message || "Gagal menarik penawaran.");
      }

      // Mengganti alert() bawaan sukses dengan SweetAlert2 Premium
      Swal.fire({
        title: "Berhasil!",
        text: "Penawaran Anda berhasil ditarik dan dihapus dari sistem.",
        icon: "success",
        confirmButtonColor: "#1A67B2",
        customClass: { popup: "rounded-[2rem]" },
      });

      if (fetchFreelancerBids) {
        await fetchFreelancerBids();
      }
    } catch (err) {
      console.error("Error withdrawing bid:", err);
      Swal.fire({
        title: "Gagal Menarik Bid",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#EF4444",
        customClass: { popup: "rounded-[2rem]" },
      });
    } finally {
      setWithdrawLoadingId(null);
    }
  };

  const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-4">
      {myBids.map((bid) => {
        const currentStatus = (bid.status || "pending").toLowerCase();

        const isPending = currentStatus === "pending";
        const isAccepted = currentStatus === "accepted";
        const isRejected = currentStatus === "rejected";
        const projectTitle = bid.project?.title || "Proyek Tanpa Nama";

        return (
          <div
            key={bid.id}
            className={`border rounded-xl p-5 bg-white transition-all shadow-sm ${
              isAccepted
                ? "border-green-200 bg-green-50/5 ring-1 ring-green-400"
                : isRejected
                  ? "border-gray-200 bg-gray-50/40 opacity-80"
                  : "border-gray-100"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Nama Tugas / Proyek
                </span>
                <h3
                  className={`text-sm font-bold ${isRejected ? "text-gray-400 line-through" : "text-gray-800"}`}
                >
                  {projectTitle}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Harga Ditawarkan:{" "}
                  <span className="font-bold text-gray-700">
                    {formatRupiah(bid.proposedPrice)}
                  </span>{" "}
                  • Estimasi: {bid.estimatedDays} Hari
                </p>
              </div>

              {/* BADGE STATUS */}
              <div className="shrink-0">
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5" />
                    Menunggu Respons
                  </span>
                )}
                {isAccepted && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tawaran Diterima
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-xl">
                    <XCircle className="w-3.5 h-3.5" />
                    Tawaran Ditolak
                  </span>
                )}
              </div>
            </div>

            {/* KONTRAK AKTIF */}
            {isAccepted && bid.contract && (
              <div className="mt-4 bg-green-50/50 border border-green-200/60 p-3 rounded-lg text-xs text-green-800">
                <p className="font-bold">
                  🎉 Selamat! Kontrak Kerja Anda Telah Aktif
                </p>
                <p className="opacity-90 mt-0.5">
                  ID Kontrak: {bid.contract.id}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Silakan buka tab 'Kontrak Saya' untuk mulai mengirim
                  paket/tugas.
                </p>
              </div>
            )}

            {/* ALASAN PENOLAKAN */}
            {isRejected && bid.rejectionNote && (
              <div className="mt-4 bg-red-50/40 border border-red-100 p-3 rounded-lg text-xs text-red-700">
                <p className="font-bold">Catatan dari Client:</p>
                <p className="italic opacity-90 mt-0.5">
                  "{bid.rejectionNote}"
                </p>
              </div>
            )}

            {/* TOMBOL TARIK PENAWARAN */}
            <div className="flex justify-end pt-4 mt-4 border-t border-gray-50">
              {isPending ? (
                <button
                  onClick={() => handleWithdrawBid(bid.id, currentStatus)}
                  disabled={withdrawLoadingId !== null}
                  type="button"
                  className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 font-bold text-xs px-3.5 py-2 rounded-xl border border-red-200 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {withdrawLoadingId === bid.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menarik...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Tarik Penawaran
                    </>
                  )}
                </button>
              ) : isAccepted ? (
                <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  🔒 Terkunci (Kontrak Berjalan)
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 italic py-1">
                  Arsip Penolakan
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
