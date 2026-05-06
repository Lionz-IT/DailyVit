import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface ConnectionStatus {
  connected: boolean;
  connectedAt?: string;
}

export const Settings: React.FC = () => {
  const { token } = useAuth();
  const [huaweiStatus, setHuaweiStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHuaweiStatus();
  }, []);

  const fetchHuaweiStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/auth/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHuaweiStatus(res.data);
      setError(null);
    } catch (err: any) {
      setError('Gagal mengambil status koneksi Huawei.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectHuawei = () => {
    window.location.href = `http://localhost:3001/auth/huawei?token=${token}`;
  };

  const handleDisconnectHuawei = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan tautan dengan Huawei Health?')) return;
    
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/auth/disconnect', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchHuaweiStatus();
    } catch (err: any) {
      setError('Gagal memutuskan tautan.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan</h1>
          <p className="text-slate-500 mt-1">Kelola preferensi dan koneksi aplikasi Anda</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center text-green-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Koneksi Perangkat</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6 ml-13">Hubungkan DailyVit dengan smartwatch Anda untuk sinkronisasi otomatis.</p>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                Huawei Health
                {huaweiStatus.connected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" /> Terhubung
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {huaweiStatus.connected 
                  ? `Terhubung sejak ${new Date(huaweiStatus.connectedAt!).toLocaleDateString('id-ID')}`
                  : 'Sinkronisasi langkah, detak jantung, dan kalori.'}
              </p>
            </div>
            
            <button
              onClick={huaweiStatus.connected ? handleDisconnectHuawei : handleConnectHuawei}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                huaweiStatus.connected 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' 
                  : 'bg-primary text-white hover:bg-green-600 shadow-sm shadow-green-500/20'
              }`}
            >
              {loading ? 'Memuat...' : (huaweiStatus.connected ? 'Putuskan' : 'Hubungkan')}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Informasi Hukum</h2>
          </div>
          
          <div className="space-y-3 ml-13">
            <Link to="/privacy-policy" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-medium text-slate-700 dark:text-slate-200">Kebijakan Privasi</span>
              </div>
            </Link>
            
            <Link to="/terms-of-service" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-medium text-slate-700 dark:text-slate-200">Syarat dan Ketentuan</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
