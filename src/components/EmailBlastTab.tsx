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
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Copy,
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
  const [copiedCron, setCopiedCron] = useState(false);

  // Load SMTP on mount & auto-sync latest festival template
  useEffect(() => {
    fetchSmtp();
    fetchCampaigns();
    if (
      !campaignTemplate ||
      !campaignTemplate.includes('Perunggu') ||
      campaignTemplate.includes('https://playlistlivefestival.letsplaymaker.com/" target="_blank"')
    ) {
      setCampaignTemplate(DEFAULT_EMAIL_HTML_TEMPLATE);
    }
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

  async function handleSendTestEmail(
    type: 'campaign' | 'system' | 'official_festival' = 'campaign',
    customTarget?: string
  ) {
    const target = (customTarget || testEmailAddress || '').trim();
    if (!target || !target.includes('@')) {
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
          testEmail: target,
          testName: 'Sahabat Playlist (Tester)',
          subject: campaignSubject,
          templateHtml: type === 'official_festival' ? undefined : campaignTemplate,
          type,
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
          status: 'paused',
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

  const cronCommand = '*/8 * * * * curl -s "https://playlistlivefestival.letsplaymaker.com/api/email/worker" >/dev/null 2>&1';

  return (
    <div className="space-y-6">
      {/* HEADER HERO BANNER - Clean White Style */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold tracking-wide mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Sistem Email Blast Terjadwal &amp; Aman
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight flex items-center gap-2.5">
              <span>Email Blast &amp; Queue</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium">
                Safe SMTP Throttle
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
              Kirim email massal secara otomatis dan berkala (1 email per 5–10 menit). Anti-spam, aman dari risiko suspend hosting, dan dilengkapi estimasi jam pengiriman realtime.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-center min-w-[120px]">
              <div className="text-xs text-zinc-500 font-medium">Terkirim Hari Ini</div>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                {queueSentToday} <span className="text-xs text-zinc-400 font-normal">/ {selectedCampaign?.dailyLimit || 80}</span>
              </div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-center min-w-[110px]">
              <div className="text-xs text-zinc-500 font-medium">Total Antrean</div>
              <div className="text-2xl font-bold text-zinc-900 mt-0.5">{queueTotal}</div>
            </div>
          </div>
        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-zinc-200 flex-wrap">
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'queue'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Antrean &amp; Monitor Realtime</span>
            {queueTotal > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeSubTab === 'queue' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-800'
              }`}>
                {queueTotal}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('new_campaign')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'new_campaign'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Sheet &amp; Buat Campaign</span>
          </button>

          <button
            onClick={() => setActiveSubTab('smtp')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'smtp'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
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
          {/* CAMPAIGN CONTROLLER CARD */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Campaign Switcher */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider shrink-0">
                  Pilih Campaign:
                </label>
                <select
                  value={selectedCampaignId || ''}
                  onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
                  className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-none focus:border-zinc-900"
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
                        className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Pause className="w-4 h-4" />
                        Jeda (Pause)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleCampaignStatus('running')}
                        className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Play className="w-4 h-4" />
                        Mulai (Start)
                      </button>
                    )}

                    <button
                      onClick={handleResetFailed}
                      className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all border border-zinc-200"
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
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {workerRunning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-400" />
                  )}
                  Kirim 1 Sekarang (Manual)
                </button>

                <button
                  onClick={() => {
                    fetchCampaigns();
                    fetchQueue();
                  }}
                  className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-all border border-zinc-200"
                  title="Refresh antrean"
                >
                  <RefreshCw className={`w-4 h-4 ${queueLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Live Worker Diagnostic Message */}
            {workerLog && (
              <div className="px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 flex items-center justify-between">
                <span className="font-mono">{workerLog}</span>
                <button
                  onClick={() => setWorkerLog(null)}
                  className="text-zinc-400 hover:text-zinc-600 text-xs ml-2 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Campaign Summary Strip */}
            {selectedCampaign && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-500">Interval Throttle:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">
                    1 email per {selectedCampaign.intervalMinutes} menit
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Limit Maks Harian:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">
                    {selectedCampaign.dailyLimit} email / hari
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Jam Operasional:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">
                    {selectedCampaign.activeHoursStart}:00 - {selectedCampaign.activeHoursEnd}:00 WIB
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Status Saat Ini:</span>
                  <p className="font-semibold mt-0.5">
                    {selectedCampaign.status === 'running' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Berjalan Otomatis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Dijeda (Paused)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* QUEUE TABLE & FILTERS */}
          <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
            {/* Table Control Bar */}
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/50">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      queueStatusFilter === f.id
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={queueSearch}
                  onChange={(e) => {
                    setQueueSearch(e.target.value);
                    setQueuePage(1);
                  }}
                  className="w-full bg-white border border-zinc-300 text-zinc-900 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-zinc-400">No</th>
                    <th className="py-3.5 px-4">Nama</th>
                    <th className="py-3.5 px-4">Email Penerima</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Estimasi Waktu Kirim</th>
                    <th className="py-3.5 px-4">Waktu Terkirim</th>
                    <th className="py-3.5 px-4">Keterangan / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  {queueItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        {queueLoading
                          ? 'Memuat data antrean...'
                          : 'Belum ada email dalam antrean ini. Silakan buat campaign dan import sheet.'}
                      </td>
                    </tr>
                  ) : (
                    queueItems.map((item, idx) => {
                      const rowNumber = (queuePage - 1) * queueLimit + idx + 1;
                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-zinc-400 font-mono">{rowNumber}</td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-900">{item.name || '-'}</td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600">{item.email}</td>
                          <td className="py-3.5 px-4 text-center">
                            {item.status === 'sent' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Terkirim
                              </span>
                            )}
                            {item.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                <Clock className="w-3 h-3" /> Dalam Antrean
                              </span>
                            )}
                            {item.status === 'sending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Mengirim...
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                                <AlertCircle className="w-3 h-3" /> Gagal
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-600">
                            {item.status === 'sent' ? (
                              <span className="text-zinc-400 line-through">
                                {formatTime(item.scheduledAt)}
                              </span>
                            ) : (
                              <span className="text-pink-600 font-semibold">
                                {formatTime(item.scheduledAt)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-emerald-600 font-medium">
                            {item.sentAt ? formatTime(item.sentAt) : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 max-w-xs truncate" title={item.errorMessage || ''}>
                            {item.errorMessage ? (
                              <span className="text-rose-600 font-mono text-[11px]">{item.errorMessage}</span>
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
              <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/50">
                <span>
                  Menampilkan {(queuePage - 1) * queueLimit + 1} -{' '}
                  {Math.min(queuePage * queueLimit, queueTotal)} dari {queueTotal} email
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                    disabled={queuePage === 1}
                    className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-semibold text-zinc-800">
                    Hal {queuePage} / {Math.ceil(queueTotal / queueLimit)}
                  </span>
                  <button
                    onClick={() => setQueuePage((p) => Math.min(Math.ceil(queueTotal / queueLimit), p + 1))}
                    disabled={queuePage >= Math.ceil(queueTotal / queueLimit)}
                    className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-40"
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
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-pink-600" />
                <span>Import Daftar Email &amp; Konfigurasi Campaign</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Anda bisa memasukkan ribuan email sekaligus via upload file CSV atau langsung paste teks dari Excel/Sheet.
              </p>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Nama / Judul Campaign
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                placeholder="Contoh: Blast Presale Tiket Phase 1"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Subjek Email
              </label>
              <input
                type="text"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                placeholder="Subjek email..."
              />
            </div>

            {/* Recipients Import Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Daftar Penerima (Nama, Email)
                </label>
                <label className="text-xs text-pink-600 hover:text-pink-700 cursor-pointer font-semibold flex items-center gap-1">
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
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 font-mono text-xs rounded-xl p-3 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
              <div className="flex items-center justify-between text-xs text-zinc-500 mt-1.5">
                <span>
                  Status:{' '}
                  <strong className="text-emerald-600">{parsedPreviewCount} email valid terdeteksi</strong>
                </span>
                <span className="text-zinc-400">Mendukung ribuan baris data</span>
              </div>
            </div>

            {/* Safety Throttling Settings */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
                <ShieldCheck className="w-4 h-4 text-pink-600" />
                <span>Pengaturan Keamanan Hosting (Safe Throttling)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Jeda Kirim (Interval per 1 Email):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={campaignInterval}
                      onChange={(e) => setCampaignInterval(Number(e.target.value))}
                      className="w-24 bg-white border border-zinc-300 text-zinc-900 text-sm rounded-xl px-3 py-2 font-bold text-center focus:outline-none focus:border-zinc-900"
                    />
                    <span className="text-xs text-zinc-600 font-medium">Menit / email</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Rekomendasi: <strong>8 menit</strong> (~7 email/jam)
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-600 mb-1">
                    Batas Maksimal Harian:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={campaignDailyLimit}
                      onChange={(e) => setCampaignDailyLimit(Number(e.target.value))}
                      className="w-24 bg-white border border-zinc-300 text-zinc-900 text-sm rounded-xl px-3 py-2 font-bold text-center focus:outline-none focus:border-zinc-900"
                    />
                    <span className="text-xs text-zinc-600 font-medium">Email / hari</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Rekomendasi: <strong>60–80 email</strong> per hari
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                <span>Jam Aktif Pengiriman:</span>
                <span className="font-semibold text-zinc-900">
                  {campaignHoursStart}:00 WIB – {campaignHoursEnd}:00 WIB
                </span>
              </div>
            </div>

            {/* Status Message */}
            {createMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  createMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
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
                className="flex-1 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {creatingCampaign ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-pink-400" />
                )}
                <span>Simpan &amp; Masukkan ke Antrean ({parsedPreviewCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-semibold flex items-center gap-1.5 transition-all border border-zinc-200"
              >
                <Eye className="w-4 h-4 text-zinc-600" />
                <span>Preview Desain</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE EMAIL PREVIEW & TEST SEND */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Test Send Box */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                <Mail className="w-4 h-4 text-pink-600" />
                <span>Kirim Uji Coba (Test Send)</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Kirim 1 email percobaan langsung ke inbox pribadi Anda untuk melihat tampilan visual sebelum blast dijalankan.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Masukkan email tester Anda..."
                  className="flex-1 bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900 font-mono"
                />
                <button
                  onClick={() => handleSendTestEmail('campaign')}
                  disabled={sendingTest}
                  className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                >
                  {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Kirim</span>
                </button>
              </div>

              {testMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs ${
                    testMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testMessage.text}
                </div>
              )}
            </div>

            {/* Email Visual Preview Card */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Pratinjau Visual Template
                </span>
                <button
                  type="button"
                  onClick={() => setCampaignTemplate(DEFAULT_EMAIL_HTML_TEMPLATE)}
                  className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold underline cursor-pointer"
                  title="Kembalikan ke template putih standar terbaru"
                >
                  Reset Template Putih
                </button>
              </div>

              <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-[#f4f4f5] h-[480px] shadow-xs">
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-7 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-600" />
                <span>Konfigurasi SMTP Email Hosting</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Masukkan detail SMTP dari cPanel / Webmail / CloudPanel / Penyedia Hosting Anda.
              </p>
            </div>

            {/* Host & Port */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtp.host}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  placeholder="mail.letsplaymaker.com"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                  placeholder="465"
                  className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Username / Email Login - Full Width & Spacious */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Username / Email Login (Akun Email cPanel Lengkap)
              </label>
              <input
                type="text"
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                placeholder="playlistlivefestival@letsplaymaker.com"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:border-zinc-900 font-sans"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Gunakan alamat email lengkap sesuai di cPanel (contoh: <code>playlistlivefestival@letsplaymaker.com</code>).
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Password Email
              </label>
              <input
                type="password"
                value={smtp.pass}
                onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
            </div>

            {/* Sender Email (Dari) - Full Width & Spacious */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Sender Email (Alamat Pengirim / FROM)
                </label>
                <button
                  type="button"
                  onClick={() => setSmtp({ ...smtp, fromEmail: smtp.user })}
                  className="text-xs text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Sama dengan Username ↵
                </button>
              </div>
              <input
                type="email"
                value={smtp.fromEmail}
                onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                placeholder="playlistlivefestival@letsplaymaker.com"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:border-zinc-900 font-sans"
              />
            </div>

            {/* Display Name & Reply To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Nama Pengirim (Display Name)
                </label>
                <input
                  type="text"
                  value={smtp.fromName}
                  onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                  placeholder="Playlist Live Festival"
                  className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Reply-To (Opsional)
                </label>
                <input
                  type="email"
                  value={smtp.replyTo}
                  onChange={(e) => setSmtp({ ...smtp, replyTo: e.target.value })}
                  placeholder="support@letsplaymaker.com"
                  className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Status Message */}
            {smtpMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  smtpMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {smtpMessage.text}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-200">
              <button
                onClick={() => handleSaveSmtp(false)}
                disabled={smtpLoading}
                className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-50"
              >
                {smtpLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>

              <button
                onClick={() => handleSaveSmtp(true)}
                disabled={smtpTesting}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-sm transition-all border border-zinc-200 disabled:opacity-50 flex items-center gap-2"
              >
                {smtpTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
                <span>Uji Koneksi Port &amp; Login</span>
              </button>
            </div>
          </div>

          {/* DEDICATED DIRECT TEST SEND PANEL */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Mail className="w-4 h-4 text-pink-600" />
              <span>Tes Pengiriman Langsung ke Inbox (Test Delivery)</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Uji pengiriman email langsung ke Gmail Anda untuk memverifikasi apakah email benar-benar mendarat di inbox.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email Penerima Uji Coba:
                </label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Masukkan email tujuan uji coba (contoh: emailanda@gmail.com)"
                  className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => handleSendTestEmail('system', testEmailAddress)}
                  disabled={sendingTest}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Kirim Tes Cepat (Format Transaksional seperti TaskManager)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendTestEmail('official_festival', testEmailAddress)}
                  disabled={sendingTest}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-pink-400" />}
                  <span>Kirim Tes Template Festival</span>
                </button>
              </div>

              {testMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    testMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {testMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* CRON JOB SETUP GUIDE CARD */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-7 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Clock className="w-4 h-4 text-pink-600" />
              <span>Jadwal Otomatis (Cron Job VPS / CloudPanel)</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Agar pengiriman 1 email tiap 8 menit berjalan otomatis 24 jam tanpa perlu Anda membuka halaman web ini,
              buat 1 Cron Job di VPS / CloudPanel Anda dengan baris perintah berikut:
            </p>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-900 flex items-center justify-between overflow-x-auto gap-3">
              <code className="text-zinc-800">{cronCommand}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cronCommand);
                  setCopiedCron(true);
                  setTimeout(() => setCopiedCron(false), 2000);
                }}
                className="px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100 font-medium shrink-0 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCron ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              Perintah di atas akan memanggil worker setiap 8 menit. Worker secara cerdas hanya akan mengirim tepat 1
              email yang berstatus antrean jika kuota harian belum habis dan masih dalam jam kerja (08:00 - 21:00 WIB).
            </p>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <span className="font-bold text-zinc-900 text-sm">Pratinjau Email Playlist Live Festival</span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#f4f4f5]">
              <iframe
                title="Modal Email Preview"
                srcDoc={renderEmailHtml(campaignTemplate, 'Budi Santoso', '#')}
                className="w-full h-[600px] border-none rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
