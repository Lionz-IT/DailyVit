import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Link to="/settings" className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Pengaturan</span>
      </Link>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:p-10 prose prose-slate dark:prose-invert max-w-none">
        <h1>Syarat dan Ketentuan</h1>
        <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
        
        <h2>1. Penerimaan Syarat</h2>
        <p>
          Dengan mengakses atau menggunakan aplikasi DailyVit, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.
        </p>

        <h2>2. Penggunaan Layanan</h2>
        <ul>
          <li>Layanan disediakan "sebagaimana adanya" dan hanya untuk tujuan pencatatan kesehatan pribadi, bukan sebagai pengganti saran medis profesional.</li>
          <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.</li>
          <li>Anda setuju untuk tidak menggunakan layanan untuk tujuan ilegal atau melanggar hukum.</li>
        </ul>

        <h2>3. Integrasi Pihak Ketiga</h2>
        <p>
          Layanan kami dapat terhubung dengan layanan pihak ketiga (contohnya: Huawei Health Kit). Penggunaan layanan pihak ketiga tersebut tunduk pada syarat dan ketentuan mereka masing-masing.
        </p>

        <h2>4. Penghentian Layanan</h2>
        <p>
          Kami berhak untuk menghentikan atau menangguhkan akses Anda ke layanan setiap saat, tanpa pemberitahuan sebelumnya, untuk alasan apa pun, termasuk pelanggaran terhadap Syarat dan Ketentuan ini.
        </p>

        <h2>5. Batasan Tanggung Jawab</h2>
        <p>
          DailyVit tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.
        </p>

        <h2>6. Perubahan Syarat</h2>
        <p>
          Kami dapat merevisi Syarat dan Ketentuan ini kapan saja. Dengan terus menggunakan layanan setelah revisi menjadi efektif, Anda setuju untuk terikat oleh ketentuan yang direvisi.
        </p>

        <h2>7. Kontak</h2>
        <p>Untuk pertanyaan mengenai syarat dan ketentuan ini, hubungi legal@dailyvit.com.</p>
      </div>
    </div>
  );
};
