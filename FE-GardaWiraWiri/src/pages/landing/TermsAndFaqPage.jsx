import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  CreditCard,
  UserX,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Footer from "../../components/layout/Footer";

export default function TermsAndFaqPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const faqData = [
    {
      q: "Apakah saya bisa membuat pesanan di luar kategori layanan?",
      a: "Garda Wira-Wiri siap mengerjakan layanan apapun selama halal dan tidak merugikan orang lain. Kamu bisa memilih kategori 'Tugas Kustom / Jasa Lainnya' dan isi detail permintaan layanan apa yang kamu butuhkan, beserta jadwal dan penawaran budget kamu sendiri.",
    },
    {
      q: "Apakah saya bisa meminta lebih dari 1 layanan?",
      a: "Tentu saja kamu bisa meminta layanan jasa lebih dari 1. Silakan tulis di kolom catatan deskripsi untuk tambahan permintaan detail layanan yang diperlukan agar tim kami bisa memahaminya secara menyeluruh.",
    },
    {
      q: "Bagaimana langkah selanjutnya setelah selesai order dan pembayaran sudah berhasil?",
      a: "Setelah pembayaran berhasil, pesanan kamu akan langsung diproses ke sistem. Admin pusat Garda Wira-Wiri akan melakukan konfirmasi kepada kamu via WhatsApp mengenai identitas Rekan Jasa (Mitra) yang akan meluncur melakukan layanan sesuai jadwal. Mohon ditunggu ya!",
    },
    {
      q: "Bagaimana cara memberikan rating dan review?",
      a: "Klik tombol 'Selesaikan' pada bagian detail riwayat pesanan Anda setelah tugas selesai dikerjakan, lalu kamu dapat mengisi rating bintang dan review ulasan atas kinerja layanan yang telah diselesaikan oleh mitra kami.",
    },
    {
      q: "Bagaimana cara mendaftar sebagai rekan jasa (mitra)?",
      a: "Saat ini pendaftaran untuk mitra baru sedang ditutup sementara. Jangan lupa pantau terus akun sosial media resmi Garda Wira-Wiri untuk informasi pembukaan gelombang pendaftaran berikutnya.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1C2939] font-sans antialiased selection:bg-[#7DCDB4]/30 flex flex-col justify-between">
      {/* AREA KONTEN UTAMA (Kena batasan max-width agar rapi di tengah) */}
      <div className="max-w-4xl w-full mx-auto space-y-12 py-12 px-6 md:px-12 pb-10 flex-grow">
        {/* Tombol Kembali yang Estetik */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-500 hover:text-[#1A67B2] transition-colors gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Halaman Sebelumnya
          </button>
        </div>

        {/* HEADER UTAMA */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Syarat, Ketentuan & <span className="text-[#00B5B7]">FAQ</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Dokumen legalitas aturan penggunaan platform serta rangkuman jawaban
            seputar layanan operasional Garda Wira-Wiri.
          </p>
        </div>

        {/* KONTEN UTAMA SYARAT & KETENTUAN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10 space-y-8">
          {/* Pengantar / Kebijakan Umum */}
          <div className="border-b border-gray-50 pb-6 space-y-3">
            <div className="flex items-center gap-2.5 text-[#00B5B7]">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-lg font-bold">
                Syarat & Ketentuan Umum Garda Wira-Wiri
              </h2>
            </div>
            <div className="text-sm text-gray-500 leading-relaxed space-y-3">
              <p>
                Pengguna disarankan untuk membaca Syarat dan Ketentuan dengan
                teliti karena terdapat hak dan kewajiban hukum yang wajib
                dipatuhi oleh pengguna. Syarat dan Ketentuan Umum merupakan
                suatu bentuk kesepakatan dan perjanjian yang dituangkan dalam
                suatu kontrak yang absolut dan sah antara Pengguna dan{" "}
                <strong>Garda Wira-Wiri</strong>. Jika Anda tidak menyetujui
                syarat dan ketentuan penggunaan yang ditetapkan di bawah ini,
                harap hentikan semua penggunaan dan juga pemesanan.
              </p>
              <p>
                Setelah Anda menyelesaikan/mengambil prosedur pemesanan, Anda
                akan dianggap telah menyetujui Perjanjian ini, dan dengan
                mengakses serta menggunakan Website/WhatsApp kami, Anda mengakui
                dan menyetujui bahwa Anda telah membaca, memahami dan menyetujui
                Syarat & Ketentuan sebagai pengguna.
              </p>
            </div>
          </div>

          {/* Bagian 1: Kebijakan Layanan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#1C2939] font-bold text-base">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="text-[#00B5B7]">1. Kebijakan Layanan</h3>
            </div>
            <ol className="list-[lower-alpha] pl-5 text-sm text-gray-500 space-y-2.5 leading-relaxed">
              <li>
                <strong>Garda Wira-Wiri</strong> akan menyediakan layanan mulai
                Pk 06.00 – Pk 22.00 WIB, melayani setiap hari termasuk hari
                nasional, kecuali jika timbul masalah bisnis atau teknis,
                dan/atau jika tidak terdapat Rekan Jasa yang memenuhi dan
                menyanggupi untuk mengerjakan layanan.
              </li>
              <li>
                Perusahaan dapat membatasi layanan atau pengguna tertentu. Jika
                terjadi pembatasan tersebut, pengumuman akan dilakukan terlebih
                dahulu.
              </li>
              <li>
                Pesanan yang dibuat setelah pukul 22.00 WIB akan diproses pada
                hari berikutnya.
              </li>
              <li>
                Garda Wira-Wiri tidak bertanggung jawab atas transaksi langsung
                yang dilakukan oleh Pelanggan dan Mitra, yang tidak melalui
                konfirmasi admin pusat.
              </li>
              <li>
                Garda Wira-Wiri tidak bertanggung jawab atas kerusakan setelah
                pengiriman, terutama barang yang tidak dapat dilihat bentuk
                fisiknya pada saat sebelum pengiriman.
              </li>
              <li>
                Garda Wira-Wiri hanya akan mengerjakan layanan sesuai video atau
                instruksi detail yang dikirimkan oleh Pelanggan. Jika lingkup
                kerja di lapangan tidak ada pada video/catatan awal, akan
                dikenakan penambahan biaya proporsional.
              </li>
              <li>
                Pelanggan wajib konfirmasi kepada admin jika layanan sudah
                selesai. Garda Wira-Wiri tidak bertanggung jawab atas kondisi
                atau permintaan perbaikan yang diminta setelah pelanggan
                melakukan konfirmasi bahwa layanan telah selesai.
              </li>
              <li>
                Jika pelanggan tidak melakukan konfirmasi dalam waktu maksimal
                1x24 jam setelah tugas dilaporkan selesai, maka layanan otomatis
                dianggap telah selesai secara sah.
              </li>
              <li>
                Biaya akan dikenakan berbeda berdasarkan jenis layanan, tingkat
                kerumitan lingkup kerja dan juga jangkauan lokasi penugasan.
              </li>
              <li>
                Terdapat beberapa istilah yang digunakan, antara lain:{" "}
                <strong>“Freelancer”</strong> yang mengacu bagi Pelaksana Jasa
                lapangan; <strong>Client</strong> yang mengacu kepada Pengguna
                yang memesan layanan, dan <strong>Client</strong> adalah istilah
                umum bagi kedua pihak baik pelanggan maupun mitra.
              </li>
              <li>
                Perusahaan dapat mengubah perjanjian ini sewaktu-waktu dengan
                ketentuan bahwa perubahan tersebut tidak melanggar hukum serta
                regulasi Undang-Undang yang relevan.
              </li>
            </ol>
          </div>

          {/* Bagian 2: Pembayaran / Penarikan Dana */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-[#1C2939] font-bold text-base">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h3 className="text-[#00B5B7]">2. Pembayaran / Penarikan Dana</h3>
            </div>
            <ol className="list-[lower-alpha] pl-5 text-sm text-gray-500 space-y-2.5 leading-relaxed">
              <li>
                Garda Wira-Wiri menerima pembayaran melalui e-wallet dan
                transfer bank resmi. Transaksi ini akan muncul di laporan
                rekening bank Anda sebagai pembayaran sah kepada rekening
                perusahaan.
              </li>
              <li>
                Semua nominal harga transaksi di dalam situs ini diproses
                menggunakan mata uang Rupiah (IDR).
              </li>
              <li>
                Garda Wira-Wiri dapat menangguhkan layanan dan/atau pencairan
                dana untuk sementara waktu jika terjadi perbaikan sistem,
                gangguan komunikasi massal, atau kondisi <i>force majeure</i>{" "}
                seperti bencana alam. Informasi resmi akan diumumkan melalui
                kanal media sosial terverifikasi kami.
              </li>
              <li>
                Garda Wira-Wiri berhak menangguhkan akun Mitra dan pencairan
                saldo jika terjadi pelanggaran kode etik serius yang dilakukan
                oleh Mitra lapangan. Jika pelanggaran terjadi berulang kali atau
                tidak terselesaikan dalam 30 hari, perusahaan berhak menutup
                akun secara permanen.
              </li>
              <li>
                Garda Wira-Wiri tidak melakukan proses pengembalian dana
                (refund) ketika terjadi pembatalan sepihak dari pihak pelanggan
                di saat posisi penugasan layanan sudah dalam proses pengerjaan
                di lapangan.
              </li>
            </ol>
          </div>

          {/* Bagian 3: Kewajiban Pelanggan */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-[#1C2939] font-bold text-base">
              <UserX className="w-4 h-4 text-gray-400" />
              <h3 className="text-[#00B5B7]">
                3. Kewajiban Pelanggan & Pengguna
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Pelanggan atau pengguna dilarang keras melakukan kegiatan-kegiatan
              merugikan berikut:
            </p>
            <ol className="list-[lower-alpha] pl-5 text-sm text-gray-500 space-y-2.5 leading-relaxed">
              <li>
                Menggunakan data diri, identitas, atau akun pembayaran milik
                orang lain secara ilegal (curian).
              </li>
              <li>
                Melakukan pelanggaran Hak Kekayaan Intelektual (HAKI) dan/atau
                hak-hak komersial lain milik pihak ketiga.
              </li>
              <li>
                Tindakan pencemaran nama baik, pelecehan verbal/fisik kepada
                mitra, atau kegiatan disengaja yang merugikan nama baik Garda
                Wira-Wiri.
              </li>
              <li>
                Penyebaran materi/konten penugasan yang dianggap kriminal,
                ilegal, melanggar norma kesusilaan hukum, maupun ketertiban
                sosial.
              </li>
              <li>
                Menyebarkan virus, malware, melakukan upaya peretasan (hacking),
                atau tindakan siber berbahaya lainnya yang mengganggu sistem web
                Garda Wira-Wiri.
              </li>
            </ol>
          </div>

          {/* Bagian 4: Kebijakan Privasi */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-[#1C2939] font-bold text-base">
              <Lock className="w-4 h-4 text-gray-400" />
              <h3 className="text-[#00B5B7]">4. Kebijakan Privasi</h3>
            </div>
            <div className="text-sm text-gray-500 leading-relaxed space-y-3">
              <p>
                Garda Wira-Wiri berkomitmen penuh melindungi privasi data Anda.
                Kami memperoleh informasi teknis tertentu secara otomatis saat
                Anda berkunjung seperti cookies untuk kebutuhan optimalisasi
                browser, membaca alamat IP, dan melacak aktivitas performa
                halaman web demi meningkatkan pengalaman kenyamanan pengguna.
              </p>
              <p>
                Tidak ada data pribadi Anda yang akan dijual atau diungkapkan
                kepada pihak ketiga mana pun di luar tujuan kepentingan validasi
                pemenuhan pesanan operasional, verifikasi identitas keamanan,
                dan program promosi internal perusahaan. Kami menerapkan standar
                sistem enkripsi tinggi demi menjaga keamanan ketat database
                Anda.
              </p>
            </div>
          </div>
        </div>

        {/* AREA BAGIAN FAQ (FREQUENTLY ASKED QUESTIONS) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#1C2939]">
            <HelpCircle className="w-5 h-5 text-[#00B5B7]" />
            <h2 className="text-xl font-bold">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-[#1C2939] hover:bg-gray-50/50 transition-colors"
                >
                  <span>
                    {index + 1}. {faq.q}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-50/50 bg-[#FBFDFF]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER SEKARANG BERDIRI SENDIRI scr FULL WIDTH & SEJAJAR */}
      <Footer />
    </div>
  );
}
