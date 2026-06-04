import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  User,
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
  CheckCircle,
  PlayCircle,
} from "lucide-react";

export default function ClientContracts({ token }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedContractId, setSelectedContractId] = useState(null);
  const [contractDetail, setContractDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Fetch Semua Kontrak Kerja Keluar milik Client
  const fetchContracts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        "https://gardawirawiri.onrender.com/api/v1/contracts",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setContracts(json.data || []);
      } else {
        throw new Error(json.message || "Gagal mengambil daftar kontrak.");
      }
    } catch (err) {
      setError(err.message || "Gagal memuat daftar kontrak.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Detail Kontrak Spesifik berdasarkan ID Kontrak yang diklik
  const fetchContractDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(
        `https://gardawirawiri.onrender.com/api/v1/contracts/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setContractDetail(json.data);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Ambil list kontrak saat pertama kali render halaman
  useEffect(() => {
    fetchContracts();
  }, [token]);

  // 🔥 PERBAIKAN DI SINI: Memantau selectedContractId (Bukan selectedProjectId)
  useEffect(() => {
    if (selectedContractId) {
      fetchContractDetail(selectedContractId);
    }
  }, [selectedContractId]);

  const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;

  // ================= TAMPILAN JIKA SEDANG MELIHAT DETAIL KONTRAK =================
  if (selectedContractId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 max-w-3xl mx-auto">
        {/* Tombol Kembali ke List */}
        <button
          onClick={() => {
            setSelectedContractId(null);
            setContractDetail(null);
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kontrak
        </button>

        {loadingDetail || !contractDetail ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-[#1A67B2]" /> Membuka
            lembar kontrak kerja...
          </div>
        ) : (
          <>
            {/* 1. Header Detail & Status Kontrak */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  ID KONTRAK: {contractDetail.id}
                </span>
                <h3 className="text-lg font-black text-gray-800 mt-1">
                  {contractDetail.project?.title}
                </h3>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border uppercase self-start sm:self-center ${
                  contractDetail.status === "active"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : contractDetail.status === "completed"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${contractDetail.status === "active" ? "bg-blue-500" : "bg-green-500"}`}
                />
                {contractDetail.status}
              </span>
            </div>

            {/* 2. Informasi Utama Kartu Kontrak */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-[#1A67B2] rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Kurir Partner
                  </p>
                  <p className="text-xs font-bold text-gray-700">
                    {contractDetail.freelancerProfile?.user?.name}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Nilai Kesepakatan
                  </p>
                  <p className="text-xs font-bold text-green-700">
                    {formatRupiah(contractDetail.agreedPrice)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Target Waktu
                  </p>
                  <p className="text-xs font-bold text-gray-700">
                    {contractDetail.bid?.estimatedDays} Hari
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Detail Deskripsi Tugas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Detail Rute &
                Deskripsi Pengiriman
              </h4>
              <div className="bg-white border border-gray-100 p-4 rounded-xl text-xs text-gray-600 leading-relaxed shadow-sm">
                {contractDetail.project?.description}
              </div>
            </div>

            {/* 4. Cover Letter Kurir */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Catatan
                Komitmen Kurir (Cover Letter)
              </h4>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-gray-600 italic">
                "
                {contractDetail.bid?.coverLetter ||
                  "Tidak menyertakan lampiran catatan."}
                "
              </div>
            </div>

            {/* 5. Aturan Kerja Resmi */}
            <div className="bg-blue-50/30 border border-blue-100/50 p-4 rounded-xl text-xs">
              <p className="font-bold text-blue-900 mb-0.5">
                Syarat & Ketentuan Perjanjian:
              </p>
              <p className="text-gray-600 leading-relaxed">
                {contractDetail.terms}
              </p>
            </div>

            {/* 🔥 6. Status Pekerjaan & Aksi Client */}
            <div className="border-t border-gray-100 pt-5 mt-4 space-y-4">
              {/* KONDISI 1: Sudah Disubmit oleh Freelancer (Menunggu Review Client) */}
              {contractDetail.submittedAt ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="text-amber-600 mt-0.5">📦</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-800 mb-1">
                      Pekerjaan Selesai! Silakan Tinjau Hasilnya.
                    </p>
                    {/* Laporan dari Kurir */}
                    <div className="text-[11px] text-amber-900 leading-relaxed mb-2 bg-white/60 p-3 rounded-lg border border-amber-100 italic">
                      "{contractDetail.workNote}"
                    </div>
                    <p className="text-[10px] text-amber-600/80 font-semibold mb-4">
                      Dikirim pada:{" "}
                      {new Date(contractDetail.submittedAt).toLocaleString(
                        "id-ID",
                      )}
                    </p>

                    {/* Tombol Konfirmasi Selesai (Hanya muncul jika status belum di-complete) */}
                    {contractDetail.status === "active" && (
                      <div className="flex justify-end pt-3 border-t border-amber-200/50">
                        <button className="inline-flex items-center gap-2 bg-[#1A67B2] hover:bg-sky-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95">
                          <CheckCircle className="w-4 h-4" /> Setujui &
                          Konfirmasi Selesai
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : contractDetail.workNote ? (
                /* KONDISI 2: Sedang Dikerjakan (Belum disubmit) */
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-blue-600 mt-0.5">🚀</span>
                  <div>
                    <p className="text-xs font-bold text-blue-800 mb-1">
                      Status Update: Kurir Telah Memulai Perjalanan
                    </p>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      {contractDetail.workNote}
                    </p>
                  </div>
                </div>
              ) : (
                /* KONDISI 3: Belum diapa-apakan oleh kurir */
                <div className="text-center p-5 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-xs font-medium text-gray-400">
                    Menunggu kurir memulai tugas pengiriman...
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ================= TAMPILAN DEFAULT: LIST KONTRAK SEPERTI BIASA =================
  return (
    <div className="space-y-4 w-full">
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 text-xs bg-white rounded-xl border border-gray-100 shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#1A67B2]" />{" "}
          Menyinkronkan daftar kontrak aktif...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && contracts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 bg-white rounded-2xl text-gray-400 text-xs">
          Belum ada ikatan kontrak kerja yang sedang berjalan saat ini.
        </div>
      )}

      {!loading && !error && contracts.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              onClick={() => setSelectedContractId(contract.id)} // Masuk ke mode detail
              className="border border-gray-100 hover:border-blue-200 bg-white p-4 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer flex justify-between items-center group"
            >
              <div className="space-y-1">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md capitalize inline-block mb-1 ${
                    contract.status === "active"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {contract.status}
                </span>
                <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#1A67B2] transition-colors truncate max-w-md">
                  {contract.project?.title || "Tugas Tanpa Judul"}
                </h4>
                <p className="text-[11px] text-gray-500">
                  Nilai Sepakat:{" "}
                  <span className="font-bold text-gray-700">
                    {formatRupiah(contract.agreedPrice)}
                  </span>
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#1A67B2] bg-blue-50 group-hover:bg-[#1A67B2] group-hover:text-white px-3 py-1.5 rounded-lg transition-all">
                Lihat Detail
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
