'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Settings,
  Eye,
  RotateCcw,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { DEFAULT_EMAIL_HTML_TEMPLATE, DEFAULT_EMAIL_SUBJECT, renderEmailHtml } from '@/lib/emailTemplate';

interface SmtpForm {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
}

interface CampaignItem {
  id: number;
  title: string;
  subject: string;
  templateHtml: string;
  intervalMinutes: number;
  dailyLimit: number;
  activeHoursStart: number;
  activeHoursEnd: number;
  status: 'draft' | 'running' | 'paused' | 'completed';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  lastSentAt: string | null;
  createdAt: string;
}

interface QueueItem {
  id: number;
  campaignId: number;
  name: string;
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  scheduledAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

export default function EmailBlastTab() {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'new_campaign' | 'smtp'>('queue');

  // SMTP Settings State
  const [smtp, setSmtp] = useState<SmtpForm>({
    host: '',
    port: 465,
    secure: true,
    user: '',
    pass: '',
    fromEmail: '',
    fromName: 'Playlist Live Festival',
    replyTo: '',
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Campaigns & Queue State
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueTotal, setQueueTotal] = useState(0);
  const [queueSentToday, setQueueSentToday] = useState(0);
  const [queuePage, setQueuePage] = useState(1);
  const [queueLimit] = useState(30);
  const [queueStatusFilter, setQueueStatusFilter] = useState('all');
  const [queueSearch, setQueueSearch] = useState('');
  const [queueLoading, setQueueLoading] = useState(false);

  // Worker Action State
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerLog, setWorkerLog] = useState<string | null>(null);

  // New Campaign Form State
  const [campaignTitle, setCampaignTitle] = useState('Nostalgia Festival Blast 2026');
  const [campaignSubject, setCampaignSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [campaignTemplate, setCampaignTemplate] = useState(DEFAULT_EMAIL_HTML_TEMPLATE);
  const [campaignInterval, setCampaignInterval] = useState(8);
  const [campaignDailyLimit, setCampaignDailyLimit] = useState(80);
  const [campaignHoursStart, setCampaignHoursStart] = useState(8);
  const [campaignHoursEnd, setCampaignHoursEnd] = useState(21);
  const [rawRecipients, setRawRecipients] = useState('');
  const [parsedPreviewCount, setParsedPreviewCount] = useState(0);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Test Email State
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testMessage, setTestMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load SMTP on mount
  useEffect(() => {
    fetchSmtp();
    fetchCampaigns();
  }, []);

  // When campaign selected or filter changed, reload queue
  useEffect(() => {
    fetchQueue();
  }, [selectedCampaignId, queueStatusFilter, queuePage, queueSearch]);

  // Parse count of raw recipients dynamically
  useEffect(() => {
    if (!rawRecipients.trim()) {
      setParsedPreviewCount(0);
      return;
    }
    const lines = rawRecipients.split(/\r?\n/).filter((l) => l.includes('@'));
    setParsedPreviewCount(lines.length);
  }, [rawRecipients]);

  async function fetchSmtp() {
    try {
      setSmtpLoading(true);
      const res = await fetch('/api/email/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSmtp({
          host: data.settings.host || '',
          port: data.settings.port || 465,
          secure: data.settings.secure !== false,
          user: data.settings.user || '',
          pass: data.settings.pass || '',
          fromEmail: data.settings.fromEmail || '',
          fromName: data.settings.fromName || 'Playlist Live Festival',
          replyTo: data.settings.replyTo || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSmtpLoading(false);
    }
  }

  async function handleSaveSmtp(testConnection = false) {
    if (testConnection) setSmtpTesting(true);
    else setSmtpLoading(true);
    setSmtpMessage(null);

    try {
      const res = await fetch('/api/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...smtp, testConnection }),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpMessage({ text: data.message, type: 'success' });
      } else {
        setSmtpMessage({ text: data.error || 'Gagal menyimpan', type: 'error' });
      }
    } catch (err: any) {
      setSmtpMessage({ text: err.message, type: 'error' });
    } finally {
      setSmtpLoading(false);
      setSmtpTesting(false);
    }
  }

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/email/campaign');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        if (data.campaigns && data.campaigns.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(data.campaigns[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchQueue() {
    try {
      setQueueLoading(true);
      const params = new URLSearchParams();
      if (selectedCampaignId) params.set('campaignId', String(selectedCampaignId));
      if (queueStatusFilter !== 'all') params.set('status', queueStatusFilter);
      if (queueSearch.trim()) params.set('search', queueSearch.trim());
      params.set('page', String(queuePage));
      params.set('limit', String(queueLimit));

      const res = await fetch(`/api/email/queue?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQueueItems(data.items || []);
        setQueueTotal(data.total || 0);
        setQueueSentToday(data.sentToday || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQueueLoading(false);
    }
  }

  async function handleToggleCampaignStatus(newStatus: 'running' | 'paused') {
    if (!selectedCampaignId) return;
    try {
      const res = await fetch('/api/email/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', campaignId: selectedCampaignId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleResetFailed() {
    if (!selectedCampaignId) return;
    try {
      const res = await fetch('/api/email/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_failed', campaignId: selectedCampaignId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchCampaigns();
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTriggerWorkerNow() {
    setWorkerRunning(true);
    setWorkerLog('Mengeksekusi pengiriman 1 email dari antrean...');
    try {
      const res = await fetch('/api/email/worker?manual=true', { method: 'POST' });
      const data = await res.json();
      if (data.dispatched && data.success) {
        setWorkerLog(`✅ Berhasil terkirim ke: ${data.recipient.email} (${data.recipient.name || 'Penerima'})`);
        fetchCampaigns();
        fetchQueue();
      } else if (data.dispatched && !data.success) {
        setWorkerLog(`❌ Gagal mengirim ke ${data.recipient?.email}: ${data.error}`);
        fetchCampaigns();
        fetchQueue();
      } else {
        setWorkerLog(`ℹ️ ${data.message || 'Tidak ada email yang dikirim.'}`);
      }
    } catch (err: any) {
      setWorkerLog(`❌ Terjadi kesalahan: ${err.message}`);
    } finally {
      setWorkerRunning(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('Masukkan email penerima uji coba yang valid.');
      return;
    }
    setSendingTest(true);
    setTestMessage(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmailAddress,
          testName: 'Sahabat Playlist (Tester)',
          subject: campaignSubject,
          templateHtml: campaignTemplate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestMessage({ text: data.message, type: 'success' });
      } else {
        setTestMessage({ text: data.error, type: 'error' });
      }
    } catch (err: any) {
      setTestMessage({ text: err.message, type: 'error' });
    } finally {
      setSendingTest(false);
    }
  }

  async function handleCreateCampaign() {
    setCreatingCampaign(true);
    setCreateMessage(null);
    try {
      const res = await fetch('/api/email/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaignTitle,
          subject: campaignSubject,
          templateHtml: campaignTemplate,
          intervalMinutes: campaignInterval,
          dailyLimit: campaignDailyLimit,
          activeHoursStart: campaignHoursStart,
          activeHoursEnd: campaignHoursEnd,
          rawRecipientsText: rawRecipients,
          status: 'paused', // Start paused so user can review queue first
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateMessage({ text: data.message, type: 'success' });
        setRawRecipients('');
        fetchCampaigns();
        setSelectedCampaignId(data.campaignId);
        setActiveSubTab('queue');
      } else {
        setCreateMessage({ text: data.error, type: 'error' });
      }
    } catch (err: any) {
      setCreateMessage({ text: err.message, type: 'error' });
    } finally {
      setCreatingCampaign(false);
    }
  }

  // Handle CSV file upload
  function handleCsvFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setRawRecipients((prev) => (prev ? prev + '\n' + text : text));
      }
    };
    reader.readAsText(file);
  }

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Format date helper
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Email Blast Terjadwal &amp; Aman
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Nostalgia Mailer Queue</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Safe SMTP
              </span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Kirim email massal secara bertahap (1 email per 5–10 menit). Anti-spam, aman dari risiko suspend hosting,
              dan dilengkapi estimasi jam pengiriman realtime.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
              <div className="text-xs text-zinc-400 font-medium">Terkirim Hari Ini</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {queueSentToday} <span className="text-xs text-zinc-500 font-normal">/ {selectedCampaign?.dailyLimit || 80}</span>
              </div>
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
              <div className="text-xs text-zinc-400 font-medium">Total Antrean</div>
              <div className="text-xl font-bold text-white mt-0.5">{queueTotal}</div>
            </div>
          </div>
        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-zinc-800/80 flex-wrap">
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'queue'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Antrean &amp; Monitor Realtime</span>
            {queueTotal > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs">
                {queueTotal}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('new_campaign')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'new_campaign'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Sheet &amp; Buat Campaign</span>
          </button>

          <button
            onClick={() => setActiveSubTab('smtp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'smtp'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan SMTP Hosting</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANTREAN & MONITOR REALTIME */}
      {/* ========================================================================= */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          {/* CAMPAIGN SELECTOR & CONTROLS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Campaign Switcher */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
                  Pilih Campaign:
                </label>
                <select
                  value={selectedCampaignId || ''}
                  onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-pink-500"
                >
                  {campaigns.length === 0 && <option value="">(Belum ada campaign)</option>}
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.sentCount}/{c.totalRecipients} terkirim) - [{c.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCampaign && (
                  <>
                    {selectedCampaign.status === 'running' ? (
                      <button
                        onClick={() => handleToggleCampaignStatus('paused')}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Pause className="w-4 h-4" />
                        Jeda Pengiriman (Pause)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleCampaignStatus('running')}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        Jalankan Pengiriman (Start)
                      </button>
                    )}

                    <button
                      onClick={handleResetFailed}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all border border-zinc-700"
                      title="Kembalikan email gagal ke status antrean"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Gagal
                    </button>
                  </>
                )}

                <button
                  onClick={handleTriggerWorkerNow}
                  disabled={workerRunning}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                >
                  {workerRunning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Kirim 1 Sekarang (Manual)
                </button>

                <button
                  onClick={() => {
                    fetchCampaigns();
                    fetchQueue();
                  }}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700"
                  title="Refresh status antrean"
                >
                  <RefreshCw className={`w-4 h-4 ${queueLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Live Worker Diagnostic Message */}
            {workerLog && (
              <div className="px-4 py-2.5 rounded-xl bg-zinc-800/90 border border-zinc-700 text-xs text-zinc-200 flex items-center justify-between">
                <span className="font-mono">{workerLog}</span>
                <button
                  onClick={() => setWorkerLog(null)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Campaign Summary Strip */}
            {selectedCampaign && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500">Interval Throttle:</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">
                    1 email per {selectedCampaign.intervalMinutes} menit
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Limit Maks Harian:</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">
                    {selectedCampaign.dailyLimit} email / hari
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Jam Operasional:</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">
                    {selectedCampaign.activeHoursStart}:00 - {selectedCampaign.activeHoursEnd}:00 WIB
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Status Saat Ini:</span>
                  <p className="font-semibold mt-0.5">
                    {selectedCampaign.status === 'running' ? (
                      <span className="text-emerald-400">● Berjalan Otomatis</span>
                    ) : (
                      <span className="text-amber-400">❚❚ Dijeda (Paused)</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* QUEUE TABLE & FILTERS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Table Control Bar */}
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'pending', label: 'Antrean (Pending)' },
                  { id: 'sent', label: 'Terkirim (Sent)' },
                  { id: 'failed', label: 'Gagal (Failed)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setQueueStatusFilter(f.id);
                      setQueuePage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      queueStatusFilter === f.id
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={queueSearch}
                  onChange={(e) => {
                    setQueueSearch(e.target.value);
                    setQueuePage(1);
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Email Penerima</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Estimasi Waktu Kirim</th>
                    <th className="py-3 px-4">Waktu Terkirim</th>
                    <th className="py-3 px-4">Keterangan / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {queueItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        {queueLoading
                          ? 'Memuat data antrean...'
                          : 'Belum ada email dalam antrean ini. Silakan buat campaign dan import sheet.'}
                      </td>
                    </tr>
                  ) : (
                    queueItems.map((item, idx) => {
                      const rowNumber = (queuePage - 1) * queueLimit + idx + 1;
                      return (
                        <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 text-zinc-500 font-mono">{rowNumber}</td>
                          <td className="py-3 px-4 font-medium text-white">{item.name || '-'}</td>
                          <td className="py-3 px-4 font-mono text-zinc-300">{item.email}</td>
                          <td className="py-3 px-4 text-center">
                            {item.status === 'sent' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Terkirim
                              </span>
                            )}
                            {item.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/20">
                                <Clock className="w-3 h-3" /> Dalam Antrean
                              </span>
                            )}
                            {item.status === 'sending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/20">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Mengirim...
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/20">
                                <AlertCircle className="w-3 h-3" /> Gagal
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-400">
                            {item.status === 'sent' ? (
                              <span className="text-zinc-600 line-through">
                                {formatTime(item.scheduledAt)}
                              </span>
                            ) : (
                              <span className="text-pink-300 font-semibold">
                                {formatTime(item.scheduledAt)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400">
                            {item.sentAt ? formatTime(item.sentAt) : '-'}
                          </td>
                          <td className="py-3 px-4 text-zinc-500 max-w-xs truncate" title={item.errorMessage || ''}>
                            {item.errorMessage ? (
                              <span className="text-rose-400 font-mono text-[11px]">{item.errorMessage}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {queueTotal > queueLimit && (
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Menampilkan {(queuePage - 1) * queueLimit + 1} -{' '}
                  {Math.min(queuePage * queueLimit, queueTotal)} dari {queueTotal} email
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                    disabled={queuePage === 1}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-semibold text-white">
                    Hal {queuePage} / {Math.ceil(queueTotal / queueLimit)}
                  </span>
                  <button
                    onClick={() => setQueuePage((p) => Math.min(Math.ceil(queueTotal / queueLimit), p + 1))}
                    disabled={queuePage >= Math.ceil(queueTotal / queueLimit)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IMPORT SHEET & BUAT CAMPAIGN */}
      {/* ========================================================================= */}
      {activeSubTab === 'new_campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT FORM */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-pink-500" />
                <span>Import Daftar Email &amp; Konfigurasi Campaign</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Anda bisa memasukkan ribuan email sekaligus via upload file CSV atau langsung paste teks dari Excel/Sheet.
              </p>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Nama / Judul Campaign
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500"
                placeholder="Contoh: Blast Presale Tiket Phase 1"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Subjek Email
              </label>
              <input
                type="text"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500"
                placeholder="Subjek email..."
              />
            </div>

            {/* Recipients Import Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Daftar Penerima (Nama, Email)
                </label>
                <label className="text-xs text-pink-400 hover:text-pink-300 cursor-pointer font-medium flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File CSV / TXT</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={7}
                value={rawRecipients}
                onChange={(e) => setRawRecipients(e.target.value)}
                placeholder="Paste data dari Excel / Spreadsheet di sini...&#10;Contoh format per baris:&#10;Budi Santoso, budi@gmail.com&#10;Sarah Wijaya, sarah@yahoo.com&#10;dimas@gmail.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-pink-500"
              />
              <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                <span>
                  Status:{' '}
                  <strong className="text-emerald-400">{parsedPreviewCount} email valid terdeteksi</strong>
                </span>
                <span className="text-zinc-500">Mendukung ribuan baris data</span>
              </div>
            </div>

            {/* Safety Throttling Settings */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Pengaturan Keamanan Hosting (Safe Throttling)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Jeda Kirim (Interval per 1 Email):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={campaignInterval}
                      onChange={(e) => setCampaignInterval(Number(e.target.value))}
                      className="w-24 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 font-bold text-center focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-xs text-zinc-300 font-medium">Menit / email</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Rekomendasi: <strong>8 menit</strong> (~7 email/jam)
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Batas Maksimal Harian:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={campaignDailyLimit}
                      onChange={(e) => setCampaignDailyLimit(Number(e.target.value))}
                      className="w-24 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 font-bold text-center focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-xs text-zinc-300 font-medium">Email / hari</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Rekomendasi: <strong>60–80 email</strong> per hari
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
                <span>Jam Aktif Pengiriman:</span>
                <span className="font-semibold text-zinc-200">
                  {campaignHoursStart}:00 WIB – {campaignHoursEnd}:00 WIB
                </span>
              </div>
            </div>

            {/* Status Message */}
            {createMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  createMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {createMessage.text}
              </div>
            )}

            {/* Action Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCreateCampaign}
                disabled={creatingCampaign || parsedPreviewCount === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {creatingCampaign ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Simpan &amp; Masukkan ke Antrean ({parsedPreviewCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold flex items-center gap-1.5 transition-all border border-zinc-700"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Desain</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE EMAIL PREVIEW & TEST SEND */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Test Send Box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>Kirim Uji Coba (Test Send)</span>
              </div>
              <p className="text-xs text-zinc-400">
                Kirim 1 email percobaan langsung ke inbox pribadi Anda untuk melihat tampilan visual sebelum blast dijalankan.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Masukkan email tester Anda..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                >
                  {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim</span>
                </button>
              </div>

              {testMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs ${
                    testMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {testMessage.text}
                </div>
              )}
            </div>

            {/* Email Visual Preview Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Pratinjau Visual Template
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 font-mono">
                  Tag: {'{name}'}
                </span>
              </div>

              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#0f1117] h-[480px]">
                <iframe
                  title="Live Email Preview"
                  srcDoc={renderEmailHtml(campaignTemplate, 'Budi Santoso', '#')}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PENGATURAN SMTP HOSTING */}
      {/* ========================================================================= */}
      {activeSubTab === 'smtp' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-500" />
                <span>Konfigurasi SMTP Email Hosting</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Masukkan detail SMTP dari cPanel / Webmail / CloudPanel / Penyedia Hosting Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtp.host}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  placeholder="mail.playlistlivefestival.com atau smtp.hostinger.com"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                  placeholder="465"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Username / Email Login
                </label>
                <input
                  type="text"
                  value={smtp.user}
                  onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                  placeholder="info@playlistlivefestival.com"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Password Email
                </label>
                <input
                  type="password"
                  value={smtp.pass}
                  onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Sender Email (Dari)
                </label>
                <input
                  type="email"
                  value={smtp.fromEmail}
                  onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                  placeholder="info@playlistlivefestival.com"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nama Pengirim (Display Name)
                </label>
                <input
                  type="text"
                  value={smtp.fromName}
                  onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                  placeholder="Playlist Live Festival"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Status Message */}
            {smtpMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  smtpMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {smtpMessage.text}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => handleSaveSmtp(false)}
                disabled={smtpLoading}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50"
              >
                {smtpLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>

              <button
                onClick={() => handleSaveSmtp(true)}
                disabled={smtpTesting}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-all border border-zinc-700 disabled:opacity-50 flex items-center gap-2"
              >
                {smtpTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>Uji Koneksi SMTP</span>
              </button>
            </div>
          </div>

          {/* CRON JOB SETUP GUIDE CARD */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Jadwal Otomatis (Cron Job VPS / CloudPanel)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Agar pengiriman 1 email tiap 8 menit berjalan otomatis 24 jam tanpa perlu Anda membuka halaman web ini,
              buat 1 Cron Job di VPS / CloudPanel Anda dengan baris perintah berikut:
            </p>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-400 flex items-center justify-between overflow-x-auto">
              <code>*/8 * * * * curl -s &quot;https://playlistlivefestival.letsplaymaker.com/api/email/worker&quot; &gt;/dev/null 2&gt;&amp;1</code>
            </div>
            <p className="text-[11px] text-zinc-500">
              Perintah di atas akan memanggil worker setiap 8 menit. Worker secara cerdas hanya akan mengirim tepat 1
              email yang berstatus antrean jika kuota harian belum habis dan masih dalam jam kerja (08:00 - 21:00).
            </p>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-white text-sm">Pratinjau Email Playlist Live Festival</span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#0f1117]">
              <iframe
                title="Modal Email Preview"
                srcDoc={renderEmailHtml(campaignTemplate, 'Budi Santoso', '#')}
                className="w-full h-[600px] border-none rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
