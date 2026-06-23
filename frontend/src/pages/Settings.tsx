import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, API_BASE } from '../services/api';

interface ConnectionStatus {
  connected: boolean;
  connectedAt?: string;
}

const translations = {
  en: {
    settings: 'Settings',
    subtitle: 'Manage your app preferences and connections',
    deviceConnection: 'Device Connection',
    deviceDesc: 'Connect DailyVit with your smartwatch for automatic synchronization.',
    connected: 'Connected',
    connectedSince: 'Connected since',
    syncDesc: 'Sync steps, heart rate, and calories.',
    disconnect: 'Disconnect',
    connect: 'Connect',
    loading: 'Loading...',
    legalInfo: 'Legal Information',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    failedFetch: 'Failed to fetch Huawei connection status.',
    failedDisconnect: 'Failed to disconnect.',
    confirmDisconnect: 'Are you sure you want to disconnect from Huawei Health?'
  },
  id: {
    settings: 'Pengaturan',
    subtitle: 'Kelola preferensi dan koneksi aplikasi Anda',
    deviceConnection: 'Koneksi Perangkat',
    deviceDesc: 'Hubungkan DailyVit dengan smartwatch Anda untuk sinkronisasi otomatis.',
    connected: 'Terhubung',
    connectedSince: 'Terhubung sejak',
    syncDesc: 'Sinkronisasi langkah, detak jantung, dan kalori.',
    disconnect: 'Putuskan',
    connect: 'Hubungkan',
    loading: 'Memuat...',
    legalInfo: 'Informasi Hukum',
    privacyPolicy: 'Kebijakan Privasi',
    termsOfService: 'Syarat dan Ketentuan',
    failedFetch: 'Gagal mengambil status koneksi Huawei.',
    failedDisconnect: 'Gagal memutuskan koneksi.',
    confirmDisconnect: 'Apakah Anda yakin ingin memutuskan koneksi dari Huawei Health?'
  }
};

export const Settings: React.FC = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [huaweiStatus, setHuaweiStatus] = useState<ConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHuaweiStatus();
  }, [language]);

  const fetchHuaweiStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getHuaweiStatus();
      setHuaweiStatus(res.data);
      setError(null);
    } catch (err: unknown) {
      setError(t.failedFetch);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectHuawei = () => {
    window.location.href = `${API_BASE}/auth/huawei?token=${token}`;
  };

  const handleDisconnectHuawei = async () => {
    if (!window.confirm(t.confirmDisconnect)) return;
    
    try {
      setLoading(true);
      await api.disconnectHuawei();
      await fetchHuaweiStatus();
    } catch (err: unknown) {
      setError(t.failedDisconnect);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 w-full min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.settings}</h1>
          <p className="text-slate-500 mt-1">{t.subtitle}</p>
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
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center text-teal-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t.deviceConnection}</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6 ml-13">{t.deviceDesc}</p>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                Huawei Health
                {huaweiStatus.connected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                    <CheckCircle className="w-3 h-3" /> {t.connected}
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {huaweiStatus.connected 
                  ? `${t.connectedSince} ${new Date(huaweiStatus.connectedAt!).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}`
                  : t.syncDesc}
              </p>
            </div>
            
            <button
              onClick={huaweiStatus.connected ? handleDisconnectHuawei : handleConnectHuawei}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                huaweiStatus.connected 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' 
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-500/20'
              }`}
            >
              {loading ? t.loading : (huaweiStatus.connected ? t.disconnect : t.connect)}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center text-teal-600">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t.legalInfo}</h2>
          </div>
          
          <div className="space-y-3 ml-13">
            <Link to="/privacy-policy" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.privacyPolicy}</span>
              </div>
            </Link>
            
            <Link to="/terms-of-service" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.termsOfService}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
