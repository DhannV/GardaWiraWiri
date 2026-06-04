import React, { useState } from "react";
import logo from "../../assets/images/logo/LogoGarda.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://gardawirawiri.onrender.com/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const result = await response.json();

      if (result.success && result.data) {
        const { accessToken, user } = result.data;

        // 💾 SIMPAN DATA PENTING KE LOCALSTORAGE UNTUK DASHBOARD KE DEPANNYA
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user_role", user.role); // 'client', 'freelancer', atau 'admin'
        localStorage.setItem("user_name", user.name);

        setMessage(` Login Berhasil! Selamat Datang ${user.name}.`);

        // 🧭 ARAHKAN DASHBOARD BERDASARKAN ROLE USER
        setTimeout(() => {
          if (user.role === "client") {
            window.location.href = "/";
          } else if (user.role === "freelancer") {
            window.location.href = "/";
          } else if (user.role === "admin") {
            window.location.href = "/";
          }
        }, 1500);
      } else {
        setMessage(`Gagal: ${result.message || "Email atau password salah"}`);
      }
    } catch (error) {
      setMessage("Terjadi kesalahan jaringan / server mati.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative">
      {/* 🧭 TOMBOL KEMBALI KE BERANDA (Atas Kiri Form) */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <a
          href="/"
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
          Kembali ke Beranda
        </a>
      </div>

      {/* CARD UTAMA */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 w-full max-w-md border border-slate-100">
        {/* LOGO AREA */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <span className="">
              <img
                src={logo}
                alt="Logo Garda Wira-Wiri"
                className="w-10 h-10"
              />
            </span>
            <span>
              Garda <span className="text-[#1A67B2]">Wira-Wiri</span>
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-[#00B5B7] tracking-tight">
          Selamat Datang Kembali
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 font-medium">
          Masuk untuk mengelola tugas wira-wiri Anda
        </p>

        {/* NOTIFIKASI RESPONS */}
        {message && (
          <div
            className={`p-3.5 rounded-xl mb-5 text-xs font-semibold border ${
              message.includes("")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* FORMULIR */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all placeholder:text-slate-300"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-bold text-[#1A67B2] hover:text-[#00B5B7] hover:underline"
              >
                Lupa Password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all placeholder:text-slate-300"
              placeholder="password"
            />
          </div>

          {/* BUTTON DENGAN WARNA BRANDING BARU */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-[#1A67B2] hover:bg-[#00B5B7] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Sedang Memproses..." : "Masuk ke Akun"}
          </button>
        </form>

        {/* FOOTER LINK */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Belum memiliki akun?{" "}
          <a
            href="/register"
            className="text-[#1A67B2] font-bold hover:underline hover:text-[#00B5B7]"
          >
            Daftar Sekarang
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
