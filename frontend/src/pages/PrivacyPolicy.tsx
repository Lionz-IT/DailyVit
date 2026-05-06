import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Link to="/settings" className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Pengaturan</span>
      </Link>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:p-10 prose prose-slate dark:prose-invert max-w-none">
        <h1>Kebijakan Privasi</h1>
        <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
        
        <h2>1. Pendahuluan</h2>
        <p>
          Selamat datang di DailyVit. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda bagikan kepada kami. 
          Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda ketika menggunakan aplikasi kami.
        </p>

        <h2>2. Informasi yang Kami Kumpulkan</h2>
        <p>Kami dapat mengumpulkan informasi berikut:</p>
        <ul>
          <li><strong>Informasi Akun:</strong> Alamat email dan kata sandi saat Anda mendaftar.</li>
          <li><strong>Data Kesehatan:</strong> Data langkah, detak jantung, dan pembakaran kalori yang disinkronkan melalui integrasi smartwatch (misal: Huawei Health Kit).</li>
          <li><strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda menggunakan layanan kami untuk perbaikan kualitas.</li>
        </ul>

        <h2>3. Penggunaan Informasi</h2>
        <p>Informasi yang kami kumpulkan digunakan untuk:</p>
        <ul>
          <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
          <li>Memproses sinkronisasi data dari perangkat terhubung.</li>
          <li>Menganalisis tren untuk memberikan wawasan kesehatan (Smart Insight).</li>
          <li>Merespons permintaan layanan pelanggan.</li>
        </ul>

        <h2>4. Berbagi Informasi</h2>
        <p>
          Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi Anda dalam kondisi:
        </p>
        <ul>
          <li>Dengan persetujuan Anda.</li>
          <li>Diwajibkan oleh hukum yang berlaku.</li>
        </ul>

        <h2>5. Keamanan Data</h2>
        <p>
          Kami menerapkan langkah-langkah keamanan teknis untuk melindungi data Anda dari akses yang tidak sah. Namun, tidak ada metode transmisi di internet yang 100% aman.
        </p>

        <h2>6. Hubungi Kami</h2>
        <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di support@dailyvit.com.</p>
      </div>
    </div>
  );
};
