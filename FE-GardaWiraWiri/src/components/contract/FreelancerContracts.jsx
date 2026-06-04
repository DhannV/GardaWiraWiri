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
  PlayCircle,
  CheckCircle, // Tambahan icon untuk tombol mulai
} from "lucide-react";

export default function FreelancerContracts({ token }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedContractId, setSelectedContractId] = useState(null);
  const [contractDetail, setContractDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 🔥 State baru untuk memantau loading saat tombol ditekan
  const [actionLoading, setActionLoading] = useState(false);

  // State untuk menyimpan teks laporan hasil kerja
  const [finishNote, setFinishNote] = useState("");

  // 1. Fungsi Fetching Data Kontrak
  const fetchContracts = async () => {
    if (!token) {
      setError("Sesi Anda telah berakhir. Silakan masuk kembali.");
      setLoading(false);
      return;
    }

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
        throw new Error(json.message || "Gagal memuat daftar kontrak kerja.");
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Fetching Detail Kontrak
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
  // 🔥 FUNGSI BARU: Untuk submit hasil pekerjaan
  const handleFinishWork = async (id) => {
    if (!finishNote.trim()) {
      alert("Mohon isi laporan hasil pekerjaan Anda terlebih dahulu.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(
        `https://gardawirawiri.onrender.com/api/v1/contracts/${id}/finish`,
        {
          method: "PATCH", // Menggunakan PATCH sesuai endpoint Anda
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workNote: finishNote }), // Mengirim teks laporan ke backend
        },
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setContractDetail(json.data);
        setFinishNote(""); // Kosongkan form setelah sukses
        fetchContracts();
      } else {
        throw new Error(json.message || "Gagal mengirimkan hasil pekerjaan.");
      }
    } catch (err) {
      alert(err.message);
      console.error("Error finishing work:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 3. Fungsi Eksekusi API "Mulai Kerjakan"
  const handleStartWork = async (id) => {
    try {
      setActionLoading(true);
      const res = await fetch(
        `https://gardawirawiri.onrender.com/api/v1/contracts/${id}/start`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const json = await res.json();

      if (res.ok && json.success) {
        // Langsung update state detail dengan respons backend terbaru
        setContractDetail(json.data);
        // Refresh daftar list kontrak di belakang layar agar tersinkronisasi
        fetchContracts();
      } else {
        throw new Error(json.message || "Gagal memulai pekerjaan.");
      }
    } catch (err) {
      alert(err.message); // Notifikasi error jika terjadi masalah
      console.error("Error starting work:", err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [token]);

  useEffect(() => {
    if (selectedContractId) {
      fetchContractDetail(selectedContractId);
    }
  }, [selectedContractId]);

  const formatRupiah = (val) => `Rp ${Number(val).toLocaleString("id-ID")}`;
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

            {/* 🔥 6. Aksi Freelancer (Mulai, Form Laporan, Status Submit) */}
            <div className="border-t border-gray-100 pt-5 mt-4 space-y-4">
              {/* KONDISI 1: Belum Mulai (workNote null, submittedAt null) */}
              {contractDetail.status === "active" &&
                !contractDetail.workNote &&
                !contractDetail.submittedAt && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleStartWork(contractDetail.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 bg-[#1A67B2] hover:bg-sky-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                      {actionLoading ? "Memproses..." : "Mulai Kerjakan Tugas"}
                    </button>
                  </div>
                )}

              {/* KONDISI 2: Sedang Dikerjakan (workNote ada, submittedAt null) */}
              {contractDetail.status === "active" &&
                contractDetail.workNote &&
                !contractDetail.submittedAt && (
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 mt-0.5">🚀</span>
                      <div>
                        <p className="text-xs font-bold text-blue-800 mb-1">
                          Status Update: Pekerjaan Dimulai
                        </p>
                        <p className="text-[11px] text-blue-700">
                          {contractDetail.workNote}
                        </p>
                      </div>
                    </div>

                    {/* Form Laporan Penyelesaian Tugas */}
                    <div className="pt-3 border-t border-blue-100/50">
                      <label className="block text-[11px] font-bold text-blue-900 mb-2">
                        Laporan Penyelesaian Tugas:
                      </label>
                      <textarea
                        value={finishNote}
                        onChange={(e) => setFinishNote(e.target.value)}
                        placeholder="Tuliskan bukti/laporan (contoh: Semua paket telah berhasil diantarkan...)"
                        className="w-full text-xs p-3 rounded-xl border border-blue-200 focus:outline-none focus:border-[#1A67B2] focus:ring-1 focus:ring-[#1A67B2] min-h-[80px] bg-white text-gray-700"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleFinishWork(contractDetail.id)}
                          disabled={actionLoading || !finishNote.trim()}
                          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {actionLoading
                            ? "Mengirim..."
                            : "Kirim Hasil Pekerjaan"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* KONDISI 3: Sudah Disubmit (submittedAt tidak null) */}
              {contractDetail.submittedAt && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-green-600 mt-0.5"></span>
                  <div>
                    <p className="text-xs font-bold text-green-800 mb-1">
                      Berhasil Disubmit! Menunggu Konfirmasi Client.
                    </p>
                    <p className="text-[11px] text-green-700 leading-relaxed italic">
                      Laporan Anda: "{contractDetail.workNote}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Kondisi 1: Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 text-xs bg-white rounded-xl border border-gray-100 shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#1A67B2]" />
          Sinkronisasi kontrak kerja...
        </div>
      )}

      {/* Kondisi 2: Error State */}
      {error && !loading && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Kondisi 3: Data Kosong */}
      {!loading && !error && contracts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 bg-white rounded-2xl text-gray-400 text-xs">
          Belum ada kontrak kerja aktif yang tercatat saat ini.
        </div>
      )}

      {/* Kondisi 4: Render Data Kontrak Sukses */}
      {!loading && !error && contracts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              onClick={() => setSelectedContractId(contract.id)}
              className="border border-green-200 bg-white p-5 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              {/* Header Kartu Kontrak */}
              <div className="flex justify-between items-start gap-3 border-b border-gray-50 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Nama Proyek / Tugas
                  </span>
                  <h4 className="text-sm font-bold text-gray-800">
                    {contract.project?.title || "Tugas Tanpa Judul"}
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg uppercase">
                  <FileText className="w-3 h-3" />
                  {contract.status}
                </span>
              </div>

              {/* Detail Info Harga & Pihak Terlibat */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 text-[11px]">Nilai Kesepakatan</p>
                  <p className="font-bold text-gray-700">
                    {formatRupiah(contract.agreedPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px]">Freelancer</p>
                  <p className="font-bold text-gray-700">
                    {contract.freelancerProfile?.user?.name || "Anonim"}
                  </p>
                </div>
              </div>

              {/* Syarat / Ketentuan */}
              <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-[11px] text-gray-600 mb-4">
                <p className="font-semibold text-gray-500 mb-0.5">
                  Syarat Ketentuan:
                </p>
                <p className="italic">
                  "{contract.terms || "Tidak ada catatan khusus."}"
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#1A67B2] bg-blue-50 hover:bg-[#1A67B2] hover:text-white px-3 py-1.5 rounded-lg transition-all">
                Lihat Detail
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
