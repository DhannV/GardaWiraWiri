import React, { useState } from "react";
import logo from "../../assets/images/logo/LogoGarda.png";

const Register = () => {
  const [role, setRole] = useState("client"); // default role 'client' atau 'freelancer'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: role,
    };

    console.log("Data yang dikirim ke backend:", payload);

    try {
      const response = await fetch(
        "https://gardawirawiri.onrender.com/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.ok || result.success) {
        setMessage(
          ` Registrasi Sukses sebagai ${role.toUpperCase()}! Silakan Login.`,
        );
        setFormData({ name: "", email: "", password: "", phone: "" });
      } else {
        const errorMessage = result.errors
          ? JSON.stringify(result.errors)
          : result.message || "Validasi gagal. Periksa kembali data Anda.";

        setMessage(`Gagal (Status ${response.status}): ${errorMessage}`);
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
            {/* Representasi Icon Globe Map Pin Garda Wira-Wiri */}
            <span className="">
              <img
                src={logo}
                alt="Logo Garda Wira-Wiri"
                className="w-10 h-10"
              />
            </span>
            f
            <span>
              Garda <span className="text-[#1A67B2]">Wira-Wiri</span>
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center text-[#00B5B7] tracking-tight">
          Daftar Akun Baru
        </h2>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 font-medium">
          Sederhanakan hidup Anda bersama Garda Wira-Wiri
        </p>

        {/* 🛠️ TAB TOGGLE ROLE DENGAN STYLE TERBARU */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/50">
          <button
            type="button"
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              role === "client"
                ? "bg-[#00B5B7] text-white shadow-lg shadow-blue-900/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setRole("client")}
          >
            Sebagai Client
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              role === "freelancer"
                ? "bg-[#00B5B7] text-white shadow-lg shadow-blue-900/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setRole("freelancer")}
          >
            Sebagai Freelancer
          </button>
        </div>

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

        {/* FORMULIR DENGAN SIZING & RING WARNA BARU */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all placeholder:text-slate-300"
              placeholder="ex: Alrizky Putra Dhandi"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all placeholder:text-slate-300"
              placeholder="alrizky2906@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor Telepon / WA
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all placeholder:text-slate-300"
              placeholder="ex: 082352769327"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900/20 focus:border-[#00B5B7] outline-none text-sm transition-all placeholder:text-slate-300"
              placeholder="••••••••"
            />
          </div>

          {/* BUTTON DENGAN WARNA BRANDING BARU */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#1A67B2]  hover:bg-[#00B5B7] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading
              ? "Sedang Memproses..."
              : `Mulai Sebagai ${role === "client" ? "Client" : "Freelancer"}`}
          </button>
        </form>

        {/* FOOTER LINK */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="text-[#1A67B2] font-bold hover:underline hover:text-[#00B5B7]"
          >
            Masuk Di Sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
