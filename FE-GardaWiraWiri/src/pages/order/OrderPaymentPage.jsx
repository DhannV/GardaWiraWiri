import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function OrderPaymentPage() {
  const navigate = useNavigate();

  // State manajemen formulir berdasarkan input baru Anda
  const [date, setDate] = useState("2026-06-01");
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("40");
  const [gender, setGender] = useState("Bebas"); // Bebas / Pria / Wanita
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState("fixed"); // fixed / custom
  const [customBudget, setCustomBudget] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bca");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Perhitungan nominal total bayar secara dinamis
  const basePrice = 100000;
  const totalDisplayPrice =
    budgetType === "fixed" ? basePrice : Number(customBudget) || 0;

  const handleOrderSubmit = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!isAgreed) {
      alert("Silakan setujui Syarat & Ketentuan terlebih dahulu.");
      return;
    }
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-sm text-center space-y-6 border border-gray-100">
          <div className="w-16 h-16 bg-[#7DCDB4]/20 text-[#00B5B7] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1C2939]">
              Pesanan Berhasil Dikirim!
            </h2>
            <p className="text-gray-500 text-sm">
              Sistem telah membuat invoice pembayaran. Rekan jasa kami akan
              segera meluncur sesuai jadwal yang Anda tentukan.
            </p>
          </div>
          <div className="bg-[#F8FAFC] p-4 rounded-xl text-left border border-gray-100 space-y-1.5 text-sm">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              Ringkasan Jadwal
            </p>
            <p className="font-semibold text-[#1C2939]">
              📅 {date} — ⏰ {hour}:{minute} WIB
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Metode:{" "}
              <span className="font-bold uppercase">{paymentMethod}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false);
              navigate("/services");
            }}
            className="w-full bg-[#1A67B2] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#00B5B7] transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2939] py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* FIX: Tombol Kembali Sekarang Sudah Berfungsi */}
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="flex items-center text-sm text-gray-500 hover:text-[#1A67B2] mb-8 transition-colors gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Beranda
        </button>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* KOLOM KIRI: INPUT FORMULIR ORDER (7 Kolom) */}
          <form
            onSubmit={handleOrderSubmit}
            className="lg:col-span-7 space-y-6"
          >
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <h3 className="text-lg font-bold text-[#1C2939]">
                  Detail Permintaan Jasa
                </h3>
                <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  Jam Operasional: 07:00 - 24:00
                </span>
              </div>

              {/* Baris 1: Pilih Tanggal & Waktu */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Pilih Tanggal
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-gray-100 focus:outline-none focus:border-[#1A67B2] text-sm font-medium text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Waktu Pengerjaan
                  </label>
                  <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-1.5 rounded-xl border border-gray-100">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      maxLength={2}
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      placeholder="Jam"
                      className="w-12 bg-transparent text-center font-bold text-lg p-1 focus:outline-none focus:text-[#1A67B2]"
                    />
                    <span className="text-gray-400 font-bold">:</span>
                    <input
                      type="number"
                      maxLength={2}
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      placeholder="Menit"
                      className="w-12 bg-transparent text-center font-bold text-lg p-1 focus:outline-none focus:text-[#1A67B2]"
                    />
                    <span className="text-xs text-gray-400 ml-auto font-medium">
                      WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Baris 2: Pilih Gender Rekan Jasa */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Pilih Gender Rekan Jasa
                </label>
                <div className="flex gap-2">
                  {["Bebas", "Pria", "Wanita"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all border ${
                        gender === g
                          ? "bg-[#1C2939] border-[#1C2939] text-white shadow-sm"
                          : "bg-[#F8FAFC] border-gray-100 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Baris 3: Deskripsi Layanan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Layanan Jasa yang Diperlukan
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Tolong bantu bersihkan pekarangan belakang atau bantu kubur bangkai kucing di dekat selokan depan rumah."
                    className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] rounded-xl border border-gray-100 focus:outline-none focus:border-[#1A67B2] text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Bagian Penawaran Harga & Metode Pembayaran */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-base font-bold border-b border-gray-50 pb-3">
                Harga & Pembayaran
              </h3>

              {/* Pilihan Budget */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="budget"
                    checked={budgetType === "fixed"}
                    onChange={() => setBudgetType("fixed")}
                    className="w-4 h-4 text-[#1A67B2] focus:ring-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Ikuti Harga Standar Mulai Dari:{" "}
                    <span className="font-bold text-[#1A67B2]">Rp 100.000</span>
                  </span>
                </label>

                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-50 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="budget"
                      checked={budgetType === "custom"}
                      onChange={() => setBudgetType("custom")}
                      className="w-4 h-4 text-[#1A67B2] focus:ring-0"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Input Budget/Penawaran Anda Sendiri
                    </span>
                  </label>

                  {budgetType === "custom" && (
                    <input
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="Masukkan nominal budget Anda. Contoh: 150000"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A67B2]"
                    />
                  )}
                </div>
              </div>

              {/* Pilihan Gerbang Pembayaran */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === "bca" ? "border-[#1A67B2] bg-[#1A67B2]/5" : "border-gray-100"}`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === "bca"}
                    onChange={() => setPaymentMethod("bca")}
                    className="sr-only"
                  />
                  <CreditCard className="w-5 h-5 text-[#1A67B2]" />
                  <span className="text-sm font-semibold">
                    Transfer Bank BCA
                  </span>
                </label>

                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === "qris" ? "border-[#1A67B2] bg-[#1A67B2]/5" : "border-gray-100"}`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === "qris"}
                    onChange={() => setPaymentMethod("qris")}
                    className="sr-only"
                  />
                  <Wallet className="w-5 h-5 text-[#1A67B2]" />
                  <span className="text-sm font-semibold">E-Wallet / QRIS</span>
                </label>
              </div>

              {/* Checkbox Persetujuan */}
              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-[#1A67B2] focus:ring-0"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Saya menyetujui{" "}
                  <span className="text-[#1A67B2] underline">
                    Syarat & Ketentuan
                  </span>{" "}
                  yang berlaku mengenai pendelegasian tugas kustom kepada tim
                  Garda Wira-Wiri.
                </span>
              </label>
            </div>
          </form>

          {/* KOLOM KANAN: RINGKASAN & PREVIEW CARD JASA (5 Kolom) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#1C2939] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00B5B7]/10 rounded-full blur-xl"></div>

              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Preview Layanan Jasa
              </h4>

              <div className="bg-[#1A67B2]/20 border border-gray-700/40 p-4 rounded-xl space-y-3">
                <div className="w-full h-36 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative text-xs text-gray-400 font-mono">
                  [ Ilustrasi Pengerjaan Tugas ]
                </div>
                <div>
                  <h5 className="font-bold text-sm text-[#00B5B7]">
                    Layanan Admin & Jasa Kustom
                  </h5>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                    {description ||
                      "Detail deskripsi tugas yang Anda masukkan di form sebelah kiri akan otomatis tampil di sini secara realtime..."}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700/50 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-400">
                  Total Penawaran:
                </span>
                <span className="text-2xl font-extrabold text-[#00B5B7]">
                  Rp {totalDisplayPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOrderSubmit}
                className="w-full bg-[#1A67B2] hover:bg-[#00B5B7] text-white py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-[#1A67B2]/10 text-center block"
              >
                Submit & Bayar
              </button>
            </div>

            {/* Banner Keamanan */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#7DCDB4]/10 rounded-full flex items-center justify-center text-[#00B5B7] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1C2939] uppercase tracking-wider">
                  Garansi Keamanan
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tugas dipantau penuh oleh manajemen pusat garda wira-wiri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
