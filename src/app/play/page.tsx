'use client';

import React, { useState, useEffect } from 'react';
import { SiteConfig, Artist, LineupPhase } from '@/lib/config';
import {
  Lock,
  Save,
  CheckCircle2,
  RefreshCw,
  Layout,
  Tag,
  Globe,
  Music,
  MapPin,
  BarChart3,
  Trash2,
  Plus,
  ArrowLeft,
  Eye,
  Video,
  Upload,
  Image as ImageIcon,
  Users,
  Download,
  ExternalLink,
  Search,
  MessageSquare,
  Share2,
  FileText,
  Utensils,
  Clock,
  X
} from 'lucide-react';

import Link from 'next/link';


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'hero' | 'pixels' | 'seo' | 'lineup' | 'video' | 'features' | 'analytics' | 'affiliate' | 'compensation' | 'tenant'>('hero');
  const [config, setConfig] = useState<SiteConfig | null>(null);

  // Tenant F&B Submissions State
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [loadingTenant, setLoadingTenant] = useState<boolean>(false);
  const [tenantSearch, setTenantSearch] = useState<string>('');

  const fetchTenantData = async () => {
    setLoadingTenant(true);
    try {
      const res = await fetch('/api/tenant');
      const data = await res.json();
      if (data.success) {
        setTenantList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tenant data:', err);
    } finally {
      setLoadingTenant(false);
    }
  };

  const handleDeleteTenant = async (id: string | number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pendaftaran tenant ini?')) return;
    try {
      const res = await fetch(`/api/tenant?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTenantList((prev) => prev.filter((item) => String(item.id) !== String(id)));
      }
    } catch (err) {
      console.error('Failed to delete tenant record:', err);
    }
  };

  const exportTenantCsv = () => {
    if (!tenantList || tenantList.length === 0) {
      alert('Belum ada data pendaftar tenant F&B untuk diexport.');
      return;
    }
    const headers = [
      'ID',
      'Waktu Daftar',
      'Nama Brand / Usaha',
      'Kategori',
      'Deskripsi Menu',
      'Kisaran Harga',
      'Link Sosmed / Catalog',
      'Nama PIC',
      'WhatsApp',
      'Email',
      'Kota',
      'Kebutuhan Listrik',
      'Peralatan Listrik',
      'Pengalaman Event',
    ];
    const rows = tenantList.map((item) => [
      item.id,
      new Date(item.createdAt).toLocaleString('id-ID'),
      `"${(item.brandName || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.menuDescription || '').replace(/"/g, '""')}"`,
      `"${(item.priceRange || '').replace(/"/g, '""')}"`,
      `"${(item.instagramCatalog || '').replace(/"/g, '""')}"`,
      `"${(item.picName || '').replace(/"/g, '""')}"`,
      `"${(item.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.city || '').replace(/"/g, '""')}"`,
      `"${(item.powerRequirement || '').replace(/"/g, '""')}"`,
      `"${(item.equipmentList || '').replace(/"/g, '""')}"`,
      `"${(item.eventExperience || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tenant_fb_pendaftar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Compensation Submissions State
  const [compensationList, setCompensationList] = useState<any[]>([]);
  const [loadingCompensation, setLoadingCompensation] = useState<boolean>(false);
  const [compensationSearch, setCompensationSearch] = useState<string>('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [masterCount, setMasterCount] = useState<number>(0);
  const [uploadingMaster, setUploadingMaster] = useState<boolean>(false);
  const [curationFilter, setCurationFilter] = useState<'ALL' | 'VERIFIED_MATCH' | 'OVERCLAIM_WARNING' | 'UNMATCHED'>('ALL');

  // Visitor & Traffic Analytics State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Affiliate Registrations State
  const [affiliateList, setAffiliateList] = useState<any[]>([]);
  const [loadingAffiliate, setLoadingAffiliate] = useState<boolean>(false);
  const [affiliateSearch, setAffiliateSearch] = useState<string>('');

  const fetchAffiliateData = async () => {
    setLoadingAffiliate(true);
    try {
      const res = await fetch('/api/affiliate');
      const data = await res.json();
      if (data.success) {
        setAffiliateList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch affiliate data:', err);
    } finally {
      setLoadingAffiliate(false);
    }
  };

  const handleDeleteAffiliate = async (id: string | number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pendaftaran affiliate ini?')) return;
    try {
      const res = await fetch(`/api/affiliate?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAffiliateList((prev) => prev.filter((item) => String(item.id) !== String(id)));
      }
    } catch (err) {
      console.error('Failed to delete affiliate record:', err);
    }
  };

  const exportAffiliateCsv = () => {
    if (!affiliateList || affiliateList.length === 0) {
      alert('Belum ada data pendaftar affiliate untuk diexport.');
      return;
    }
    const headers = ['ID', 'Waktu Daftar', 'Nama Lengkap', 'WhatsApp', 'Email', 'Sosmed', 'Kota', 'Pengalaman'];
    const rows = affiliateList.map((item) => [
      item.id,
      new Date(item.createdAt).toLocaleString('id-ID'),
      `"${(item.fullName || '').replace(/"/g, '""')}"`,
      `"${(item.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.instagramTiktok || '').replace(/"/g, '""')}"`,
      `"${(item.city || '').replace(/"/g, '""')}"`,
      `"${(item.experience || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `affiliate_pendaftar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCompensationData = async () => {
    setLoadingCompensation(true);
    try {
      const res = await fetch('/api/compensation');
      const data = await res.json();
      if (data.success) {
        setCompensationList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch compensation data:', err);
    } finally {
      setLoadingCompensation(false);
    }
  };

  const fetchMasterCount = async () => {
    try {
      const res = await fetch('/api/compensation/master-buyers');
      const data = await res.json();
      if (data.success) {
        setMasterCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch master count:', err);
    }
  };

  const handleUploadMasterCsv = async (file: File) => {
    if (!file) return;
    setUploadingMaster(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/compensation/master-buyers', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Berhasil mengimpor ${data.imported} data pembeli 2024! Total data master saat ini: ${data.total}`);
        setMasterCount(data.total);
        fetchCompensationData();
      } else {
        alert(data.error || 'Gagal mengunggah file CSV Master');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah file CSV Master');
    } finally {
      setUploadingMaster(false);
    }
  };

  const handleClearMasterData = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus SELURUH data master pembeli 2024?')) return;
    try {
      const res = await fetch('/api/compensation/master-buyers', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMasterCount(0);
        alert('Data master pembeli 2024 berhasil dikosongkan.');
        fetchCompensationData();
      }
    } catch (err) {
      console.error('Failed to clear master data:', err);
    }
  };

  const handleDeleteCompensation = async (id: string | number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kompensasi ini?')) return;
    try {
      const res = await fetch(`/api/compensation?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCompensationList((prev) => prev.filter((item) => String(item.id) !== String(id)));
      }
    } catch (err) {
      console.error('Failed to delete compensation record:', err);
    }
  };

  const exportCompensationCsv = () => {
    if (!compensationList || compensationList.length === 0) {
      alert('Belum ada data pendaftar kompensasi untuk diexport.');
      return;
    }
    const headers = [
      'ID',
      'Waktu Pengajuan',
      'Status Kurasi 2024',
      'Pembelian Tiket 2024',
      'Nama Lengkap (KTP)',
      'No. KTP',
      'URL Foto KTP',
      'WhatsApp',
      'Email',
      'URL Bukti E-Tiket',
      'Jumlah Tiket Diklaim',
    ];
    const rows = compensationList.map((item) => [
      item.id,
      new Date(item.createdAt).toLocaleString('id-ID'),
      `"${item.curation?.status || 'UNMATCHED'}"`,
      `"${item.curation?.purchasedQty || 0} Tiket"`,
      `"${(item.fullName || '').replace(/"/g, '""')}"`,
      `"${(item.identityNumber || '').replace(/"/g, '""')}"`,
      `"${(item.ktpImageUrl || '').replace(/"/g, '""')}"`,
      `"${(item.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.ticketProofUrl || '').replace(/"/g, '""')}"`,
      `"${(item.ticketCount || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kompensasi_pendaftar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const fetchAnalytics = async (start?: string, end?: string) => {
    setLoadingAnalytics(true);
    try {
      let url = '/api/analytics';
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error('Failed to load config', err));
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics(startDate, endDate);
    } else if (activeTab === 'affiliate') {
      fetchAffiliateData();
    } else if (activeTab === 'compensation') {
      fetchCompensationData();
      fetchMasterCount();
    } else if (activeTab === 'tenant') {
      fetchTenantData();
    }
  }, [activeTab]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Password salah');
      }
    } catch (err) {
      setAuthError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setLoading(false);
    }
  };

  // Phase manager handlers
  const handleAddPhase = () => {
    if (!config) return;
    const currentPhases = config.lineupPhases || [
      { id: 'phase-1', name: 'Phase 1', title: 'Phase 1 Lineup', active: true }
    ];
    const nextNum = currentPhases.length + 1;
    const newPhase: LineupPhase = {
      id: `phase-${Date.now()}`,
      name: `Phase ${nextNum}`,
      title: `Phase ${nextNum} Lineup`,
      active: true,
    };
    setConfig({
      ...config,
      lineupPhases: [...currentPhases, newPhase],
    });
  };

  const handleRemovePhase = (id: string) => {
    if (!config || !config.lineupPhases) return;
    setConfig({
      ...config,
      lineupPhases: config.lineupPhases.filter((p) => p.id !== id),
    });
  };

  // Upload Logo File Handler
  const handleLogoUpload = async (artistId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 10 MB.');
      return;
    }
    setUploadingId(artistId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (config) {
          setConfig({
            ...config,
            lineup: config.lineup.map((a) => (a.id === artistId ? { ...a, logoUrl: data.url, image: '' } : a)),
          });
        }
      } else {
        alert(data.error || 'Gagal mengunggah logo');
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat mengunggah file logo.');
    } finally {
      setUploadingId(null);
    }
  };

  // Generic Upload File Handler for Site Config (ogImage, videoCoverImage, etc.)
  const handleGenericFileUpload = async (field: keyof SiteConfig, file: File) => {
    if (!config) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 10 MB.');
      return;
    }
    setUploadingId(field);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setConfig({ ...config, [field]: data.url });
      } else {
        alert(data.error || 'Gagal mengunggah file gambar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat mengunggah file gambar.');
    } finally {
      setUploadingId(null);
    }
  };

  // Artist lineup manager handlers
  const handleAddArtist = (defaultPhaseId?: string) => {
    if (!config) return;
    const firstPhaseId = defaultPhaseId || (config.lineupPhases && config.lineupPhases.length > 0 ? config.lineupPhases[0].id : 'phase-1');
    const newArtist: Artist = {
      id: Date.now().toString(),
      name: 'Nama Artis / Band Baru',
      genre: 'Pop',
      day: 'Day 1',
      time: '19:00 WIB',
      phaseId: firstPhaseId,
      featured: false,
    };
    setConfig({ ...config, lineup: [...config.lineup, newArtist] });
  };

  const handleRemoveArtist = (id: string) => {
    if (!config) return;
    setConfig({
      ...config,
      lineup: config.lineup.filter((a) => a.id !== id),
    });
  };

  const handleUpdateArtist = (id: string, field: keyof Artist, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      lineup: config.lineup.map((a) => {
        if (a.id === id) {
          const updated = { ...a, [field]: value };
          if (field === 'logoUrl' && value) {
            updated.image = '';
          }
          return updated;
        }
        return a;
      }),
    });
  };

  const handleRemoveLogo = (id: string) => {
    if (!config) return;
    setConfig({
      ...config,
      lineup: config.lineup.map((a) => (a.id === id ? { ...a, logoUrl: '', image: '' } : a)),
    });
  };


  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-zinc-900">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-zinc-200">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-center text-zinc-900">CMS Admin Panel</h1>
          <p className="text-zinc-500 text-center text-sm mt-1 mb-6">
            Playlist Rewind 2026 Management
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan passcode (default: admin123)"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
              />
            </div>

            {authError && (
              <p className="text-red-500 text-xs font-medium text-center">{authError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Verifikasi...' : 'Masuk CMS Admin'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600">
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 bg-white">
        Memuat data konfigurasi CMS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
              CMS
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-zinc-900">Playlist Rewind CMS</h1>
              <p className="text-xs text-zinc-500">Pengaturan Homepage & Pixel Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-colors border border-zinc-200"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </Link>

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Konfigurasi CMS berhasil disimpan & diperbarui!</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-1">
          {[
            { id: 'hero', label: 'Hero & Event Info', icon: Layout },
            { id: 'lineup', label: 'Guest Stars Lineup', icon: Music },
            { id: 'video', label: 'Video Preview Teaser', icon: Video },
            { id: 'pixels', label: 'Tracking & Pixels', icon: Tag },
            { id: 'seo', label: 'SEO & Meta Graph', icon: Globe },
            { id: 'features', label: 'Map & Features', icon: MapPin },
            { id: 'affiliate', label: 'Program Affiliate', icon: Users },
            { id: 'compensation', label: 'Form Kompensasi', icon: FileText },
            { id: 'tenant', label: 'Pendaftaran Tenant F&B', icon: Utensils },
            { id: 'analytics', label: 'Click Analytics', icon: BarChart3 },

          ].map((tab) => {

            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs">
          
          {/* TAB 1: HERO & EVENT INFO */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Hero & Info Event Utama</h2>
                <p className="text-xs text-zinc-500 mt-1">Ubah judul, tanggal, dan direct link tombol Buy Now</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Judul Pertama (Gradient Text)
                  </label>
                  <input
                    type="text"
                    value={config.eventTitleFirst}
                    onChange={(e) => setConfig({ ...config, eventTitleFirst: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Judul Kedua (Dark Text)
                  </label>
                  <input
                    type="text"
                    value={config.eventTitleSecond}
                    onChange={(e) => setConfig({ ...config, eventTitleSecond: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                  Subtitle Event (Lokasi & Tanggal)
                </label>
                <input
                  type="text"
                  value={config.eventSubtitle}
                  onChange={(e) => setConfig({ ...config, eventSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:ring-2 focus:ring-zinc-900 text-zinc-900 text-sm"
                />
              </div>

              <div className="p-5 bg-pink-50/60 rounded-2xl border border-pink-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-pink-900 uppercase mb-1">
                    Direct URL Pembelian Tiket (Target Link "Buy Now!")
                  </label>
                  <input
                    type="url"
                    value={config.ticketUrl}
                    onChange={(e) => setConfig({ ...config, ticketUrl: e.target.value })}
                    placeholder="https://loket.com/event/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-300 bg-white text-zinc-900 text-sm font-medium focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-[11px] text-pink-700 mt-1.5 font-medium">
                    *Saat pengunjung menekan tombol Buy Now, event pixel akan terkirim dan user langsung diarahkan ke URL ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                      Label Tombol
                    </label>
                    <input
                      type="text"
                      value={config.buyButtonText}
                      onChange={(e) => setConfig({ ...config, buyButtonText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                      Status Tiket Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.ticketStatusText}
                      onChange={(e) => setConfig({ ...config, ticketStatusText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="showTicketStatus"
                    checked={config.showTicketStatus}
                    onChange={(e) => setConfig({ ...config, showTicketStatus: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="showTicketStatus" className="text-xs font-semibold text-zinc-800">
                    Tampilkan Badge Status Tiket di Atas Hero
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                  Theme View Homepage
                </label>
                <select
                  value={config.theme}
                  onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white text-zinc-900 text-sm font-medium"
                >
                  <option value="light">Pure Minimalist White (Persis Gambar Referensi)</option>
                  <option value="dark">Sleek Dark Mode</option>
                  <option value="festival">Festival Vibrant Night</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: LINEUP MANAGER & GUEST STARS TOGGLE */}
          {activeTab === 'lineup' && (
            <div className="space-y-8">
              
              {/* MASTER TOGGLE ON/OFF FOR GUEST STARS */}
              <div className="p-5 rounded-2xl bg-zinc-900 text-white flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-base">Toggle Show/Hide Guest Stars Lineup</h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {config.showLineup
                      ? '🟢 Lineup SEDANG TAMPIL di homepage'
                      : '🔴 Lineup DISEMBUNYIKAN (Tutup dulu sebelum pengumuman resmi)'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showLineup}
                    onChange={(e) => setConfig({ ...config, showLineup: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              {/* PHASE MANAGEMENT SECTION */}
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900">Manajemen Phase Lineup</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Kelola daftar phase pengumuman (Phase 1 Lineup, Phase 2 Lineup, dst.)
                    </p>
                  </div>

                  <button
                    onClick={handleAddPhase}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Phase Lineup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(config.lineupPhases || []).map((phase, idx) => (
                    <div
                      key={phase.id}
                      className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) => {
                              const updated = (config.lineupPhases || []).map((p) =>
                                p.id === phase.id ? { ...p, name: e.target.value, title: `${e.target.value} Lineup` } : p
                              );
                              setConfig({ ...config, lineupPhases: updated });
                            }}
                            className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-900 w-28"
                          />
                        </div>
                      </div>

                      {config.lineupPhases && config.lineupPhases.length > 1 && (
                        <button
                          onClick={() => handleRemovePhase(phase.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus Phase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ARTISTS & LOGOS SECTION */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Daftar Logo Artis & Band</h2>
                  <p className="text-xs text-zinc-500 mt-1">Upload logo artis (PNG/JPG) atau ketik nama untuk tampilan minimalis</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveConfig}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" /> Simpan Lineup
                  </button>

                  <button
                    onClick={() => handleAddArtist()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-xs hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah Logo Artis
                  </button>
                </div>
              </div>


              <div className="space-y-4">
                {config.lineup.map((artist) => {
                  const logoSrc = artist.logoUrl || artist.image;
                  const isUploading = uploadingId === artist.id;
                  return (
                    <div
                      key={artist.id}
                      className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-4 shadow-2xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Nama Artis / Band</label>
                          <input
                            type="text"
                            value={artist.name}
                            onChange={(e) => handleUpdateArtist(artist.id, 'name', e.target.value)}
                            placeholder="Contoh: peterpan ft. ARMAND MAULANA"
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Phase Lineup</label>
                          <select
                            value={artist.phaseId || (config.lineupPhases?.[0]?.id || 'phase-1')}
                            onChange={(e) => handleUpdateArtist(artist.id, 'phaseId', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm font-medium"
                          >
                            {(config.lineupPhases || [{ id: 'phase-1', name: 'Phase 1' }]).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} Lineup
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 uppercase">Hari Performance (Opsional)</label>
                          <select
                            value={artist.day || 'Day 1'}
                            onChange={(e) => handleUpdateArtist(artist.id, 'day', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm"
                          >
                            <option value="Day 1">Day 1</option>
                            <option value="Day 2">Day 2</option>
                          </select>
                        </div>
                      </div>

                      {/* LOGO UPLOAD INPUT & PREVIEW */}
                      <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-3">
                        <label className="block text-[11px] font-bold text-zinc-700 uppercase">
                          Upload File Logo Artis (PNG / SVG Transparan disarankan)
                        </label>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploading ? 'Mengunggah...' : 'Pilih File Logo...'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleLogoUpload(artist.id, file);
                                }
                              }}
                            />
                          </label>

                          <span className="text-xs text-zinc-400 font-medium">atau ketik URL:</span>

                          <input
                            type="url"
                            value={artist.logoUrl || artist.image || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                handleRemoveLogo(artist.id);
                              } else {
                                handleUpdateArtist(artist.id, 'logoUrl', val);
                              }
                            }}
                            placeholder="/uploads/my_logo.png atau https://..."
                            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-mono"
                          />
                        </div>

                        {/* LIVE THUMBNAIL PREVIEW */}
                        {logoSrc && (
                          <div className="mt-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-12 rounded-lg bg-white p-1.5 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                  src={logoSrc}
                                  alt={artist.name || 'Preview Logo'}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.onerror = null;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3Cline x1='2' y1='2' x2='22' y2='22'/%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-zinc-800">Preview Logo Aktif</p>
                                <p className="text-[10px] text-zinc-400 truncate max-w-xs font-mono">{logoSrc}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLogo(artist.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Hapus Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-zinc-200">
                        <button
                          onClick={() => handleRemoveArtist(artist.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Artis
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM SAVE BUTTON FOR LINEUP */}
              <div className="flex justify-end pt-4 border-t border-zinc-200">
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Simpan Seluruh Perubahan Lineup
                </button>
              </div>
            </div>
          )}


          {/* TAB 3: VIDEO TEASER PREVIEW */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Video Teaser & Preview Trailer</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Tampilkan video teaser festival berdurasi singkat di homepage untuk menambah keseruan!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 text-white flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-base">Toggle Tampilkan Video Preview Section</h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {config.showVideoSection
                      ? '🟢 Video Preview SEDANG TAMPIL di homepage'
                      : '🔴 Video Preview DISEMBUNYIKAN'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showVideoSection}
                    onChange={(e) => setConfig({ ...config, showVideoSection: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Judul Video Teaser
                  </label>
                  <input
                    type="text"
                    value={config.videoTitle}
                    onChange={(e) => setConfig({ ...config, videoTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Subtitle Video
                  </label>
                  <input
                    type="text"
                    value={config.videoSubtitle}
                    onChange={(e) => setConfig({ ...config, videoSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                    URL Video Embed (YouTube / Direct Embed Link)
                  </label>
                  <input
                    type="url"
                    value={config.videoEmbedUrl}
                    onChange={(e) => setConfig({ ...config, videoEmbedUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    *Gunakan format YouTube Embed (contoh: https://www.youtube.com/embed/dQw4w9WgXcQ)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <label className="block text-xs font-bold text-zinc-700 uppercase">
                    Gambar Cover / Thumbnail Video (Upload File atau URL)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingId === 'videoCoverImage' ? 'Mengunggah...' : 'Upload Cover Video...'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingId === 'videoCoverImage'}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericFileUpload('videoCoverImage', file);
                          }
                        }}
                      />
                    </label>

                    <span className="text-xs text-zinc-400 font-medium">atau ketik URL:</span>

                    <input
                      type="url"
                      value={config.videoCoverImage}
                      onChange={(e) => setConfig({ ...config, videoCoverImage: e.target.value })}
                      placeholder="/uploads/my_cover.jpg atau https://..."
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-mono"
                    />
                  </div>

                  {config.videoCoverImage && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={config.videoCoverImage}
                          alt="Cover Video Preview"
                          className="w-16 h-12 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-zinc-800">Preview Cover Video</p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-xs font-mono">{config.videoCoverImage}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, videoCoverImage: '' })}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Hapus Cover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRACKING & PIXELS */}
          {activeTab === 'pixels' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Integrasi Tracking Pixel</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Masukkan ID pixel Meta, TikTok, & Google Tag. Event `InitiateCheckout` & `ClickBuyNow` akan ter-fire otomatis!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                    Meta Pixel ID (Facebook Pixel)
                  </label>
                  <input
                    type="text"
                    value={config.metaPixelId}
                    onChange={(e) => setConfig({ ...config, metaPixelId: e.target.value })}
                    placeholder="Contoh: 123456789012345"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    value={config.tikTokPixelId}
                    onChange={(e) => setConfig({ ...config, tikTokPixelId: e.target.value })}
                    placeholder="Contoh: C1234567890ABCDEF"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase mb-1">
                    Google Tag (GA4 ID / GTM ID)
                  </label>
                  <input
                    type="text"
                    value={config.googleTagId}
                    onChange={(e) => setConfig({ ...config, googleTagId: e.target.value })}
                    placeholder="Contoh: G-XXXXXXXXXX atau GTM-XXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Script Tambahan Head / Custom HTML Scripts
                  </label>
                  <textarea
                    rows={4}
                    value={config.customHeadScripts}
                    onChange={(e) => setConfig({ ...config, customHeadScripts: e.target.value })}
                    placeholder="<!-- Custom JS / Marketing tracking code -->"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & METAGRAPH */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">SEO & Open Graph Meta Tags</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Atur tampilan preview link saat di-share ke WhatsApp, Facebook, Twitter, dan Google SERP.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={config.metaTitle}
                    onChange={(e) => setConfig({ ...config, metaTitle: e.target.value, ogTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={config.metaDescription}
                    onChange={(e) => setConfig({ ...config, metaDescription: e.target.value, ogDescription: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={config.metaKeywords}
                    onChange={(e) => setConfig({ ...config, metaKeywords: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-900 text-sm"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <label className="block text-xs font-bold text-zinc-700 uppercase">
                    Open Graph (OG) Share Image (Upload File atau URL)
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Gambar ini akan tampil otomatis sebagai banner preview saat link website Anda di-share ke WhatsApp, Instagram, Facebook, & Twitter.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingId === 'ogImage' ? 'Mengunggah...' : 'Upload Gambar OG Share...'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingId === 'ogImage'}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericFileUpload('ogImage', file);
                          }
                        }}
                      />
                    </label>

                    <span className="text-xs text-zinc-400 font-medium">atau ketik URL:</span>

                    <input
                      type="url"
                      value={config.ogImage}
                      onChange={(e) => setConfig({ ...config, ogImage: e.target.value })}
                      placeholder="/uploads/og_banner.png atau https://..."
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-mono"
                    />
                  </div>

                  {config.ogImage && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={config.ogImage}
                          alt="Open Graph Preview"
                          className="w-20 h-12 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-zinc-800">Preview OG Share Banner</p>
                          <p className="text-[10px] text-zinc-400 truncate max-w-xs font-mono">{config.ogImage}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, ogImage: '' })}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Hapus Banner
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MAP & FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Venue & Toggle Fitur Interactive</h2>
                <p className="text-xs text-zinc-500 mt-1">Aktifkan atau nonaktifkan modul di landing page</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-800">Tampilkan Countdown Timer</span>
                    <input
                      type="checkbox"
                      checked={config.showCountdown}
                      onChange={(e) => setConfig({ ...config, showCountdown: e.target.checked })}
                      className="w-5 h-5 rounded text-pink-600"
                    />
                  </div>
                  {config.showCountdown && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Target Date & Time</label>
                      <input
                        type="datetime-local"
                        value={config.targetDate ? config.targetDate.slice(0, 16) : ''}
                        onChange={(e) => setConfig({ ...config, targetDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-800">Tampilkan Venue & Map Section</span>
                    <input
                      type="checkbox"
                      checked={config.showVenueMap}
                      onChange={(e) => setConfig({ ...config, showVenueMap: e.target.checked })}
                      className="w-5 h-5 rounded text-pink-600"
                    />
                  </div>
                  {config.showVenueMap && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Nama Venue</label>
                        <input
                          type="text"
                          value={config.venueName}
                          onChange={(e) => setConfig({ ...config, venueName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Alamat Lengkap</label>
                        <input
                          type="text"
                          value={config.venueAddress}
                          onChange={(e) => setConfig({ ...config, venueAddress: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-800">Tampilkan Spotify Playlist Embed</span>
                    <input
                      type="checkbox"
                      checked={config.showSpotify}
                      onChange={(e) => setConfig({ ...config, showSpotify: e.target.checked })}
                      className="w-5 h-5 rounded text-pink-600"
                    />
                  </div>
                  {config.showSpotify && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Spotify Embed URL</label>
                      <input
                        type="url"
                        value={config.spotifyEmbedUrl}
                        onChange={(e) => setConfig({ ...config, spotifyEmbedUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-800">Efek Suara Audio Feedback pada Tombol</span>
                  <input
                    type="checkbox"
                    checked={config.showSoundEffects}
                    onChange={(e) => setConfig({ ...config, showSoundEffects: e.target.checked })}
                    className="w-5 h-5 rounded text-pink-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VISITOR & TRAFFIC ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Traffic Visitor & Conversion Analytics</h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Laporan statistik pengunjung dari media sosial, kota asal, dan konversi tombol Buy Now.
                  </p>
                </div>

                <button
                  onClick={() => fetchAnalytics(startDate, endDate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* DATE RANGE FILTER CONTROLS */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                  Filter Berdasarkan Tanggal:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium">Dari:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium">Sampai:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-medium"
                    />
                  </div>

                  <button
                    onClick={() => fetchAnalytics(startDate, endDate)}
                    className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Terapkan Filter
                  </button>

                  <div className="h-4 w-[1px] bg-zinc-300 hidden sm:block mx-1" />

                  {/* QUICK DATE FILTER BUTTONS */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setStartDate(today);
                        setEndDate(today);
                        fetchAnalytics(today, today);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-xs hover:bg-zinc-100 font-medium"
                    >
                      Hari Ini
                    </button>

                    <button
                      onClick={() => {
                        const today = new Date();
                        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        const todayStr = today.toISOString().split('T')[0];
                        setStartDate(sevenDaysAgo);
                        setEndDate(todayStr);
                        fetchAnalytics(sevenDaysAgo, todayStr);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-xs hover:bg-zinc-100 font-medium"
                    >
                      7 Hari Terakhir
                    </button>

                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        fetchAnalytics('', '');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-xs hover:bg-zinc-100 font-medium"
                    >
                      Semua Waktu
                    </button>
                  </div>
                </div>
              </div>

              {/* METRIC SUMMARY CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Total Visitors
                  </span>
                  <div className="text-3xl font-black font-mono">
                    {analyticsData?.totalPageviews || 0}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Total Kunjungan Halaman</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Unique Visitors
                  </span>
                  <div className="text-3xl font-black font-mono text-purple-400">
                    {analyticsData?.uniqueVisitors || 0}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Perangkat IP Berbeda</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Klik Buy Now
                  </span>
                  <div className="text-3xl font-black font-mono text-pink-400">
                    {analyticsData?.totalBuyNowClicks || config?.buyNowClicksCount || 0}
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Konversi ke Loket.com</span>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Conversion Rate
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    {analyticsData?.conversionRate || '0.0'}%
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Persentase Klik / Visitor</span>
                </div>
              </div>

              {/* TRAFFIC SOURCE & CITY BREAKDOWN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center justify-between">
                    <span>Sumber Traffic Pengunjung</span>
                    <span className="text-xs text-zinc-400 font-normal">Sosmed & Search</span>
                  </h3>

                  <div className="space-y-3">
                    {analyticsData?.trafficSources && analyticsData.trafficSources.length > 0 ? (
                      analyticsData.trafficSources.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                            <span>{item.source}</span>
                            <span className="font-mono text-zinc-500">
                              {item.count} hits ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                              style={{ width: `${Math.max(item.percentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400 py-4 text-center">Belum ada data traffic pada rentang tanggal ini.</p>
                    )}
                  </div>
                </div>

                {/* Top Cities */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center justify-between">
                    <span>Kota Asal Pengunjung</span>
                    <span className="text-xs text-zinc-400 font-normal">Geolocation</span>
                  </h3>

                  <div className="space-y-3">
                    {analyticsData?.topCities && analyticsData.topCities.length > 0 ? (
                      analyticsData.topCities.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                            <span>📍 {item.city}</span>
                            <span className="font-mono text-zinc-500">
                              {item.count} pengunjung ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                              style={{ width: `${Math.max(item.percentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-400 py-4 text-center">Belum ada data kota pada rentang tanggal ini.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT VISITOR LOGS TABLE */}
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-zinc-900">Log Kunjungan Pengunjung Terkini</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-600">
                    <thead className="bg-zinc-50 text-zinc-800 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Sumber Traffic</th>
                        <th className="p-3">Kota / Wilayah</th>
                        <th className="p-3">Perangkat</th>
                        <th className="p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {analyticsData?.recentLogs && analyticsData.recentLogs.length > 0 ? (
                        analyticsData.recentLogs.map((log: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="p-3 font-mono text-[11px]">
                              {new Date(log.createdAt).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="p-3 font-semibold text-zinc-900">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                                {log.sourceCategory || 'Direct'}
                              </span>
                            </td>
                            <td className="p-3">📍 {log.city || 'Bandung'}</td>
                            <td className="p-3">{log.deviceType || 'Mobile'} ({log.browser || 'Browser'})</td>
                            <td className="p-3 font-mono text-zinc-400 text-[11px]">{log.ipAddress || '127.0.0.1'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-zinc-400 text-xs">
                            Belum ada log rincian kunjungan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: AFFILIATE MANAGEMENT */}
          {activeTab === 'affiliate' && config && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Manajemen Program Affiliate
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Atur saklar fitur, link WhatsApp Group, webhook Google Sheets, dan lihat daftar pendaftar affiliate.
                </p>
              </div>

              {/* Section 1: Settings Form */}
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-5">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center justify-between">
                  <span>1. Status & Pengaturan Formulir</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showAffiliateSection ?? true}
                      onChange={(e) => setConfig({ ...config, showAffiliateSection: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-3 text-xs font-semibold text-zinc-700">
                      {config.showAffiliateSection ? 'Fitur Tampil (ON)' : 'Fitur Sembunyi (OFF)'}
                    </span>
                  </label>
                </h3>

                {/* Countdown Control for Affiliate */}
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-700" />
                      <span className="text-xs font-bold text-purple-950">Countdown Timer & Auto-Close Deadline Affiliate</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showAffiliateCountdown ?? false}
                        onChange={(e) => setConfig({ ...config, showAffiliateCountdown: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  {config.showAffiliateCountdown && (
                    <div>
                      <label className="block text-xs font-semibold text-purple-900 mb-1">
                        Tanggal & Jam Batas Pendaftaran Affiliate (Form Auto-Off saat Waktu Habis)
                      </label>
                      <input
                        type="datetime-local"
                        value={config.affiliateTargetDate ? config.affiliateTargetDate.slice(0, 16) : ''}
                        onChange={(e) => setConfig({ ...config, affiliateTargetDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-purple-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Teks Tombol CTA Affiliate
                    </label>
                    <input
                      type="text"
                      value={config.affiliateButtonText || ''}
                      onChange={(e) => setConfig({ ...config, affiliateButtonText: e.target.value })}
                      placeholder="Daftar Affiliate Playlist"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Link WhatsApp Group Affiliate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.affiliateWaGroupUrl || ''}
                      onChange={(e) => setConfig({ ...config, affiliateWaGroupUrl: e.target.value })}
                      placeholder="https://chat.whatsapp.com/xxxxxx"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Judul Banner Affiliate
                    </label>
                    <input
                      type="text"
                      value={config.affiliateTitle || ''}
                      onChange={(e) => setConfig({ ...config, affiliateTitle: e.target.value })}
                      placeholder="Gabung Program Affiliate Playlist Rewind 2026"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Webhook Google Sheets (Opsional Auto-Sync)
                    </label>
                    <input
                      type="text"
                      value={config.affiliateGoogleSheetWebhook || ''}
                      onChange={(e) => setConfig({ ...config, affiliateGoogleSheetWebhook: e.target.value })}
                      placeholder="https://script.google.com/macros/s/xxxx/exec"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Deskripsi / Subtitle Banner
                  </label>
                  <textarea
                    rows={2}
                    value={config.affiliateSubtitle || ''}
                    onChange={(e) => setConfig({ ...config, affiliateSubtitle: e.target.value })}
                    placeholder="Dapatkan komisi menarik dan akses eksklusif dengan menjadi bagian dari tim promo Playlist!"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Pengaturan Affiliate
                  </button>
                </div>
              </div>

              {/* Section 2: Applications Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      2. Data Pendaftar Affiliate ({affiliateList.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Data pendaftaran real-time dari formulir homepage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cari nama / WA / kota..."
                        value={affiliateSearch}
                        onChange={(e) => setAffiliateSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                      />
                    </div>

                    <button
                      onClick={fetchAffiliateData}
                      disabled={loadingAffiliate}
                      className="p-2 border border-zinc-300 hover:bg-zinc-100 rounded-xl text-zinc-700 transition-colors"
                      title="Refresh Data"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingAffiliate ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={exportAffiliateCsv}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-zinc-200 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-100/80 text-zinc-600 border-b border-zinc-200 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Nama Lengkap</th>
                        <th className="p-3">WhatsApp</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Sosmed</th>
                        <th className="p-3">Kota</th>
                        <th className="p-3">Pengalaman</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {affiliateList.filter((item) => {
                        if (!affiliateSearch) return true;
                        const q = affiliateSearch.toLowerCase();
                        return (
                          (item.fullName || '').toLowerCase().includes(q) ||
                          (item.whatsapp || '').toLowerCase().includes(q) ||
                          (item.city || '').toLowerCase().includes(q) ||
                          (item.email || '').toLowerCase().includes(q)
                        );
                      }).length > 0 ? (
                        affiliateList
                          .filter((item) => {
                            if (!affiliateSearch) return true;
                            const q = affiliateSearch.toLowerCase();
                            return (
                              (item.fullName || '').toLowerCase().includes(q) ||
                              (item.whatsapp || '').toLowerCase().includes(q) ||
                              (item.city || '').toLowerCase().includes(q) ||
                              (item.email || '').toLowerCase().includes(q)
                            );
                          })
                          .map((item) => {
                            const waClean = (item.whatsapp || '').replace(/\D/g, '');
                            const waUrl = waClean.startsWith('0')
                              ? `https://wa.me/62${waClean.slice(1)}`
                              : `https://wa.me/${waClean}`;
                            return (
                              <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                                <td className="p-3 font-mono text-[11px] whitespace-nowrap text-zinc-500">
                                  {new Date(item.createdAt).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="p-3 font-bold text-zinc-900">{item.fullName}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium hover:bg-emerald-100 transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    {item.whatsapp}
                                  </a>
                                </td>
                                <td className="p-3 text-zinc-600 font-mono text-[11px]">{item.email || '-'}</td>
                                <td className="p-3 text-zinc-600 font-medium">{item.instagramTiktok || '-'}</td>
                                <td className="p-3 text-zinc-600">{item.city || '-'}</td>
                                <td className="p-3 text-zinc-500 max-w-xs truncate" title={item.experience}>
                                  {item.experience || '-'}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteAffiliate(item.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-zinc-400 text-xs">
                            {loadingAffiliate ? (
                              <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Memuat data pendaftar...
                              </div>
                            ) : (
                              'Belum ada pendaftaran affiliate.'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FORM KOMPENSASI */}
          {activeTab === 'compensation' && (
            <div className="space-y-8">
              {/* Section Header */}
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Pengaturan Form Kompensasi Tiket</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Kelola status aktif formulir klaim diskon kompensasi, kata-kata banner, link WA Group, serta sinkronisasi Webhook Google Sheets.
                </p>
              </div>

              {/* Section 1: Settings */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center justify-between">
                  <span>1. Status & Pengaturan Formulir</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showCompensationSection ?? true}
                      onChange={(e) => setConfig({ ...config, showCompensationSection: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-3 text-xs font-semibold text-zinc-700">
                      {config.showCompensationSection ? 'Fitur Tampil (ON)' : 'Fitur Sembunyi (OFF)'}
                    </span>
                  </label>
                </h3>

                {/* Countdown Timer Control */}
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-950">Countdown Timer & Auto-Close Deadline</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showCompensationCountdown ?? false}
                        onChange={(e) => setConfig({ ...config, showCompensationCountdown: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  {config.showCompensationCountdown && (
                    <div>
                      <label className="block text-xs font-semibold text-emerald-900 mb-1">
                        Tanggal & Jam Batas Pengajuan (Form Auto-Off saat Waktu Habis)
                      </label>
                      <input
                        type="datetime-local"
                        value={config.compensationTargetDate ? config.compensationTargetDate.slice(0, 16) : ''}
                        onChange={(e) => setConfig({ ...config, compensationTargetDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                      />
                    </div>
                  )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Teks Tombol CTA Kompensasi
                    </label>
                    <input
                      type="text"
                      value={config.compensationButtonText || ''}
                      onChange={(e) => setConfig({ ...config, compensationButtonText: e.target.value })}
                      placeholder="Klaim Kompensasi Tiket"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Webhook Google Sheets (Auto-Sync Data)
                    </label>
                    <input
                      type="text"
                      value={config.compensationGoogleSheetWebhook || ''}
                      onChange={(e) => setConfig({ ...config, compensationGoogleSheetWebhook: e.target.value })}
                      placeholder="https://script.google.com/macros/s/xxxx/exec"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Judul Form Kompensasi
                  </label>
                  <input
                    type="text"
                    value={config.compensationTitle || ''}
                    onChange={(e) => setConfig({ ...config, compensationTitle: e.target.value })}
                    placeholder="Kompensasi Tiket Playlist Live Super Festival 2024"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Deskripsi / Subtitle Banner Kompensasi
                  </label>
                  <textarea
                    rows={2}
                    value={config.compensationSubtitle || ''}
                    onChange={(e) => setConfig({ ...config, compensationSubtitle: e.target.value })}
                    placeholder="Kompensasi berupa Discount 50% dari harga PRESALE 1 - FESTIVAL 2 DAY PASS pada event Playlist Rewind Festival 2026"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                  <div>
                    <p className="text-xs font-bold text-zinc-800">Aktifkan Fitur Autokurasi Master Pembeli 2024</p>
                    <p className="text-[11px] text-zinc-500">Tampilkan modul upload CSV master & pencocokan otomatis di tabel</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showCompensationCuration ?? true}
                      onChange={(e) => setConfig({ ...config, showCompensationCuration: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-3 text-xs font-semibold text-zinc-700">
                      {config.showCompensationCuration ? 'Kurasi Active (ON)' : 'Kurasi Nonaktif (OFF)'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveConfig}
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Pengaturan Kompensasi
                  </button>
                </div>
              </div>

              {/* Section 2: Upload Master Buyers 2024 Dataset (Toggled ON/OFF) */}
              {(config.showCompensationCuration ?? true) && (
                <div className="bg-gradient-to-r from-zinc-900 to-emerald-950 text-white p-5 rounded-2xl border border-emerald-900/50 shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                        Data Master 2024 Engine
                      </div>
                      <h3 className="text-sm font-bold text-white">2. Upload Database Master Pembeli 2024 (.CSV)</h3>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        Unggah berkas CSV pembeli 2024 (Email, Phone, Name, Qty) untuk kurasi pencocokan otomatis instan.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-300">{masterCount.toLocaleString('id-ID')} Records</p>
                        <p className="text-[10px] text-zinc-400">Data Master Aktif</p>
                      </div>

                      <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-2 shrink-0">
                        {uploadingMaster ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload CSV Master</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadMasterCsv(file);
                          }}
                          disabled={uploadingMaster}
                        />
                      </label>

                      {masterCount > 0 && (
                        <button
                          onClick={handleClearMasterData}
                          className="px-3 py-2 bg-white/10 hover:bg-red-500/20 text-zinc-300 hover:text-red-300 text-xs font-bold rounded-xl transition-all border border-white/10"
                          title="Kosongkan Data Master"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Compensation Data Table */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      3. Data Pengajuan Kompensasi ({compensationList.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Data klaim kompensasi beserta status autokurasi matching histori 2024 & lampiran dokumen.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Curation Filter Dropdown (Only when Curation ON) */}
                    {(config.showCompensationCuration ?? true) && (
                      <select
                        value={curationFilter}
                        onChange={(e) => setCurationFilter(e.target.value as any)}
                        className="px-3 py-2 text-xs border border-zinc-300 rounded-xl bg-white text-zinc-700 font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-800"
                      >
                        <option value="ALL">Semua Kurasi ({compensationList.length})</option>
                        <option value="VERIFIED_MATCH">🟢 Verified Match</option>
                        <option value="OVERCLAIM_WARNING">⚠️ Overclaim Warning</option>
                        <option value="UNMATCHED">🔴 Unmatched (Foto E-Tiket)</option>
                      </select>
                    )}

                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={compensationSearch}
                        onChange={(e) => setCompensationSearch(e.target.value)}
                        placeholder="Cari nama, WA, email..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 bg-white"
                      />
                    </div>

                    <button
                      onClick={fetchCompensationData}
                      className="p-2 border border-zinc-300 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 transition-colors"
                      title="Refresh Data"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingCompensation ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={exportCompensationCsv}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-zinc-200 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-100/80 text-zinc-600 border-b border-zinc-200 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="p-3">Waktu</th>
                        {(config.showCompensationCuration ?? true) && <th className="p-3">Status Kurasi 2024</th>}
                        <th className="p-3">Nama (KTP)</th>
                        <th className="p-3">No. Identitas</th>
                        <th className="p-3">File KTP</th>
                        <th className="p-3">WhatsApp</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Bukti E-Tiket</th>
                        <th className="p-3">Jml Tiket</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {compensationList
                        .filter((item) => {
                          if (curationFilter !== 'ALL') {
                            const curStatus = item.curation?.status || 'UNMATCHED';
                            if (curStatus !== curationFilter) return false;
                          }
                          if (!compensationSearch) return true;
                          const q = compensationSearch.toLowerCase();
                          return (
                            (item.fullName || '').toLowerCase().includes(q) ||
                            (item.identityNumber || '').toLowerCase().includes(q) ||
                            (item.whatsapp || '').toLowerCase().includes(q) ||
                            (item.email || '').toLowerCase().includes(q)
                          );
                        }).length > 0 ? (
                        compensationList
                          .filter((item) => {
                            if (curationFilter !== 'ALL') {
                              const curStatus = item.curation?.status || 'UNMATCHED';
                              if (curStatus !== curationFilter) return false;
                            }
                            if (!compensationSearch) return true;
                            const q = compensationSearch.toLowerCase();
                            return (
                              (item.fullName || '').toLowerCase().includes(q) ||
                              (item.identityNumber || '').toLowerCase().includes(q) ||
                              (item.whatsapp || '').toLowerCase().includes(q) ||
                              (item.email || '').toLowerCase().includes(q)
                            );
                          })
                          .map((item) => {
                            const waClean = (item.whatsapp || '').replace(/\D/g, '');
                            const waUrl = waClean.startsWith('0')
                              ? `https://wa.me/62${waClean.slice(1)}`
                              : `https://wa.me/${waClean}`;

                            const cur = item.curation || { status: 'UNMATCHED', purchasedQty: 0, claimedQty: 1, matchedBy: 'none' };

                            return (
                              <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                                <td className="p-3 font-mono text-[11px] whitespace-nowrap text-zinc-500">
                                  {new Date(item.createdAt).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                {/* Curation Badge Column (Only when Curation ON) */}
                                {(config.showCompensationCuration ?? true) && (
                                  <td className="p-3">
                                    {cur.status === 'VERIFIED_MATCH' && (
                                      <div
                                        className="inline-flex flex-col gap-0.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-bold"
                                        title={`Cocok via ${cur.matchedBy}. Total beli 2024: ${cur.purchasedQty} tiket.`}
                                      >
                                        <span className="flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          VERIFIED MATCH
                                        </span>
                                        <span className="text-[9px] text-emerald-600 font-normal">
                                          Histori 2024: {cur.purchasedQty} Tiket (Via {cur.matchedBy})
                                        </span>
                                      </div>
                                    )}

                                    {cur.status === 'OVERCLAIM_WARNING' && (
                                      <div
                                        className="inline-flex flex-col gap-0.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-[10px] font-bold"
                                        title={`Histori 2024 hanya ${cur.purchasedQty} tiket, tapi klaim ${cur.claimedQty} tiket!`}
                                      >
                                        <span className="flex items-center gap-1 text-amber-700">
                                          ⚠️ OVERCLAIM
                                        </span>
                                        <span className="text-[9px] text-amber-800 font-medium">
                                          Beli 2024: {cur.purchasedQty} Tiket | Klaim: {cur.claimedQty} Tiket
                                        </span>
                                      </div>
                                    )}

                                    {cur.status === 'UNMATCHED' && (
                                      <div
                                        className="inline-flex flex-col gap-0.5 px-2.5 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-xl text-[10px] font-semibold"
                                        title="Email & HP tidak ada di database pembeli 2024. Cek foto bukti E-Tiket."
                                      >
                                        <span>🔴 UNMATCHED</span>
                                        <span className="text-[9px] text-zinc-400 font-normal">
                                          Cek Foto E-Tiket Manual
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                )}
                                <td className="p-3 font-bold text-zinc-900">{item.fullName}</td>
                                <td className="p-3 font-mono text-[11px] text-zinc-700">{item.identityNumber}</td>
                                <td className="p-3">
                                  {item.ktpImageUrl ? (
                                    <button
                                      onClick={() => setPreviewImageUrl(item.ktpImageUrl)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                    >
                                      <ImageIcon className="w-3 h-3 text-blue-600" />
                                      Lihat KTP
                                    </button>
                                  ) : (
                                    <span className="text-zinc-400">-</span>
                                  )}
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium hover:bg-emerald-100 transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    {item.whatsapp}
                                  </a>
                                </td>
                                <td className="p-3 text-zinc-600 font-mono text-[11px]">{item.email}</td>
                                <td className="p-3">
                                  {item.ticketProofUrl ? (
                                    <button
                                      onClick={() => setPreviewImageUrl(item.ticketProofUrl)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold hover:bg-purple-100 transition-colors"
                                    >
                                      <FileText className="w-3 h-3 text-purple-600" />
                                      Lihat Tiket
                                    </button>
                                  ) : (
                                    <span className="text-zinc-400">-</span>
                                  )}
                                </td>
                                <td className="p-3 font-semibold text-zinc-900">{item.ticketCount}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteCompensation(item.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-zinc-400 text-xs">
                            {loadingCompensation ? (
                              <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Memuat data kompensasi...
                              </div>
                            ) : (
                              'Belum ada pendaftaran kompensasi.'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: PENDAFTARAN TENANT F&B */}
          {activeTab === 'tenant' && (
            <div className="space-y-8">
              {/* Section Header */}
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Pengaturan Pendaftaran Tenant F&B</h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Kelola status aktif pendaftaran booth F&B, kata-kata banner, countdown timer deadline, link WA Group, serta sinkronisasi Webhook Google Sheets.
                </p>
              </div>

              {/* Section 1: Settings */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center justify-between">
                  <span>1. Status & Pengaturan Form Tenant F&B</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showTenantSection ?? true}
                      onChange={(e) => setConfig({ ...config, showTenantSection: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    <span className="ml-3 text-xs font-semibold text-zinc-700">
                      {config.showTenantSection ? 'Fitur Tampil (ON)' : 'Fitur Sembunyi (OFF)'}
                    </span>
                  </label>
                </h3>

                {/* Countdown Control for Tenant */}
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-950">Countdown Timer & Auto-Close Deadline Tenant</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showTenantCountdown ?? false}
                        onChange={(e) => setConfig({ ...config, showTenantCountdown: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  {config.showTenantCountdown && (
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">
                        Tanggal & Jam Batas Pendaftaran Tenant (Form Auto-Off saat Waktu Habis)
                      </label>
                      <input
                        type="datetime-local"
                        value={config.tenantTargetDate ? config.tenantTargetDate.slice(0, 16) : ''}
                        onChange={(e) => setConfig({ ...config, tenantTargetDate: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Judul Section Tenant F&B
                    </label>
                    <input
                      type="text"
                      value={config.tenantTitle || ''}
                      onChange={(e) => setConfig({ ...config, tenantTitle: e.target.value })}
                      placeholder="Open Recruitment Tenant F&B Playlist Rewind 2026"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Teks Tombol CTA Tenant
                    </label>
                    <input
                      type="text"
                      value={config.tenantButtonText || ''}
                      onChange={(e) => setConfig({ ...config, tenantButtonText: e.target.value })}
                      placeholder="Daftar Tenant F&B"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Subtitle / Deskripsi Singkat Tenant
                  </label>
                  <textarea
                    rows={2}
                    value={config.tenantSubtitle || ''}
                    onChange={(e) => setConfig({ ...config, tenantSubtitle: e.target.value })}
                    placeholder="Bergabunglah bersama puluhan ribu pengunjung..."
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Link WhatsApp Group khusus Tenant F&B
                    </label>
                    <input
                      type="text"
                      value={config.tenantWaGroupUrl || ''}
                      onChange={(e) => setConfig({ ...config, tenantWaGroupUrl: e.target.value })}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Webhook Google Sheets (Auto-Sync Data)
                    </label>
                    <input
                      type="text"
                      value={config.tenantGoogleSheetWebhook || ''}
                      onChange={(e) => setConfig({ ...config, tenantGoogleSheetWebhook: e.target.value })}
                      placeholder="https://script.google.com/macros/s/xxxx/exec"
                      className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Table Submissions */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      Daftar Pendaftar Tenant F&B ({tenantList.length})
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Pendaftar tenant yang mengisi form via website & modal
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchTenantData}
                      disabled={loadingTenant}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingTenant ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={exportTenantCsv}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV Data Tenant</span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama brand, PIC, WhatsApp, kategori, kota..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-800"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Nama Brand</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Nama PIC</th>
                        <th className="p-3">WhatsApp</th>
                        <th className="p-3">Daya Listrik</th>
                        <th className="p-3">Kota</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {tenantList && tenantList.length > 0 ? (
                        tenantList
                          .filter((item) => {
                            if (!tenantSearch) return true;
                            const q = tenantSearch.toLowerCase();
                            return (
                              (item.brandName || '').toLowerCase().includes(q) ||
                              (item.picName || '').toLowerCase().includes(q) ||
                              (item.whatsapp || '').toLowerCase().includes(q) ||
                              (item.category || '').toLowerCase().includes(q) ||
                              (item.city || '').toLowerCase().includes(q)
                            );
                          })
                          .map((item) => {
                            const cleanPhone = (item.whatsapp || '').replace(/\D/g, '');
                            const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`;

                            return (
                              <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                                <td className="p-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                                  {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="p-3 font-bold text-amber-950">{item.brandName}</td>
                                <td className="p-3 font-medium text-zinc-700">
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-zinc-900">{item.picName}</td>
                                <td className="p-3 whitespace-nowrap">
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium hover:bg-emerald-100 transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    {item.whatsapp}
                                  </a>
                                </td>
                                <td className="p-3 text-zinc-700 font-medium">{item.powerRequirement || '-'}</td>
                                <td className="p-3 text-zinc-600">{item.city || '-'}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteTenant(item.id)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Hapus Record Tenant"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-zinc-400 text-xs">
                            {loadingTenant ? (
                              <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Memuat data tenant...
                              </div>
                            ) : (
                              'Belum ada pendaftaran tenant F&B.'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        </main>
      </div>

      {/* Image / Document Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900">Preview Lampiran Dokumen</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Full Tab
                </a>
                <button
                  onClick={() => setPreviewImageUrl(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-zinc-100 rounded-xl p-2">
              {previewImageUrl.endsWith('.pdf') ? (
                <iframe src={previewImageUrl} className="w-full h-[60vh] rounded-lg" />
              ) : (
                <img
                  src={previewImageUrl}
                  alt="Lampiran Dokumen"
                  className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


