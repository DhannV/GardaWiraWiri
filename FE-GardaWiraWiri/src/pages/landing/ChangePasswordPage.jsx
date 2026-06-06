import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "../../assets/images/logo/LogoGarda.png";

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State untuk visibilitas masing-masing input password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatErrorMessage = (result) => {
    if (Array.isArray(result.errors) && result.errors.length > 0) {
      return result.errors[0].message;
    }
    if (result.errors && typeof result.errors === "object") {
      const firstKey = Object.keys(result.errors)[0];
      if (firstKey) return result.errors[firstKey];
    }
    return (
      result.message ||
      "Gagal mengubah password. Silakan periksa kembali data Anda."
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validasi Sederhana di Sisi Frontend sebelum kirim ke API
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Gagal: Konfirmasi password baru tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://gardawirawiri.onrender.com/api/v1/auth/change-password",
        {
          method: "PATCH", // 🌟 Sesuai dengan metode API Anda
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (response.ok || result.success) {
        setMessage(
          `Sukses: ${result.message || "Password berhasil diubah. Silakan login ulang."}`,
        );
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Alihkan kembali ke halaman login setelah 2 detik
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        const cleanMessage = formatErrorMessage(result);
        setMessage(`Gagal: ${cleanMessage}`);
      }
    } catch (error) {
      setMessage("Terjadi kesalahan jaringan / server mati.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative">
      {/* TOMBOL KEMBALI KE LOGIN */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <a
          href="/login"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-900 transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Login
        </a>
      </div>

      {/* CARD UTAMA */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 w-full max-w-md border border-slate-100">
        {/* LOGO AREA */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <img src={logo} alt="Logo Garda Wira-Wiri" className="w-10 h-10" />
            <span>
              Garda <span className="text-[#1A67B2]">Wira-Wiri</span>
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-[#00B5B7] tracking-tight">
          Perbarui Password
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 font-medium">
          Amankan akun Garda Wira-Wiri Anda dengan kata sandi baru
        </p>

        {/* FORMULIR */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PASSWORD SEKARANG */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                required
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#00B5B7] outline-none text-sm transition-all"
                placeholder="Masukkan password lama"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* PASSWORD BARU */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#00B5B7] outline-none text-sm transition-all"
                placeholder="Masukkan password baru"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* KONFIRMASI PASSWORD BARU */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="showConfirm" // Menggunakan state lokal, atau samakan dengan nama properti payload
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#00B5B7] outline-none text-sm transition-all"
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* NOTIFIKASI RESPONS */}
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold border transition-all ${
                message.toLowerCase().includes("gagal") ||
                message.toLowerCase().includes("terjadi")
                  ? "bg-red-50 border-red-200 text-red-600 shadow-sm"
                  : "bg-green-50 border-green-200 text-green-700 shadow-sm"
              }`}
            >
              {message}
            </div>
          )}

          {/* BUTTON SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1A67B2] hover:bg-[#00B5B7] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Perubahan...</span>
              </>
            ) : (
              "Simpan Password Baru"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
