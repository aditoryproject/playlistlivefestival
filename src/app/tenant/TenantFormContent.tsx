'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Lock,
  Utensils,
  MessageSquare,
  Sparkles,
  Zap,
  RotateCcw,
  Send,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';
import {
  triggerTenantSubmitPixels,
  triggerJoinTenantWaGroupPixels,
} from '@/lib/pixels';
import { SiteConfig, TenantFormField, getDefaultTenantFormFields } from '@/lib/types';
import TenantLayoutViewer from '@/components/TenantLayoutViewer';

interface TenantFormContentProps {
  config: SiteConfig;
  showCountdown?: boolean;
  targetDate?: string;
}

export default function TenantFormContent({
  config,
  showCountdown,
  targetDate,
}: TenantFormContentProps) {
  const fields: TenantFormField[] =
    config.tenantFormFields && config.tenantFormFields.length > 0
      ? config.tenantFormFields
      : getDefaultTenantFormFields();

  // Dynamic Form Values State
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === 'checkbox') {
        initial[f.id] = [];
      } else {
        initial[f.id] = '';
      }
    });
    return initial;
  });

  // Submission states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [waGroupUrl, setWaGroupUrl] = useState(
    config.tenantWaGroupUrl || 'https://chat.whatsapp.com/'
  );

  // Countdown timer state
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!showCountdown || !targetDate) return;

    const calculateTime = () => {
      const diff = +new Date(targetDate) - +new Date();
      if (diff <= 0) {
        setIsExpired(true);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [showCountdown, targetDate]);

  if (isExpired) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-zinc-200 shadow-md">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
          Waktu Pendaftaran Tenant F&B Telah Berakhir
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Mohon maaf, batas waktu pendaftaran tenant telah melewati tenggat waktu yang ditentukan.
        </p>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleCheckboxToggle = (fieldId: string, optionValue: string) => {
    setFormData((prev) => {
      const currentList: string[] = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      let nextList: string[];
      if (currentList.includes(optionValue)) {
        nextList = currentList.filter((item) => item !== optionValue);
      } else {
        nextList = [...currentList, optionValue];
      }
      return {
        ...prev,
        [fieldId]: nextList,
      };
    });
    if (errorMsg) setErrorMsg('');
  };

  const handleClearForm = () => {
    const resetValues: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === 'checkbox') {
        resetValues[f.id] = [];
      } else {
        resetValues[f.id] = '';
      }
    });
    setFormData(resetValues);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Dynamic Validation based on required fields
    for (const field of fields) {
      if (field.required) {
        const val = formData[field.id];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === 'string' && !val.trim()) ||
          (Array.isArray(val) && val.length === 0);

        if (isEmpty) {
          setErrorMsg(`Pertanyaan "${field.label}" wajib diisi.`);
          // Scroll to the field if possible
          const el = document.getElementById(`field-container-${field.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
    }

    setLoading(true);

    try {
      const responses = fields.map((f) => ({
        id: f.id,
        label: f.label,
        value: Array.isArray(formData[f.id]) ? formData[f.id].join(', ') : formData[f.id] ?? '',
        type: f.type,
      }));

      const payload: Record<string, any> = {
        ...formData,
        responses,
      };

      const res = await fetch('/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengirim pendaftaran tenant.');
      }

      if (data.waGroupUrl) {
        setWaGroupUrl(data.waGroupUrl);
      }

      setSubmittedData({
        brandName: formData.brandName || formData[fields[0]?.id] || 'Brand Tenant',
        picName: formData.picName || formData.pic_name || 'Penanggung Jawab',
        whatsapp: formData.whatsapp || formData.phone || '',
      });

      triggerTenantSubmitPixels(config.tenantTitle || 'Tenant Submission');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Optional Countdown Bar */}
      {showCountdown && targetDate && !isExpired && (
        <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Batas Waktu Pendaftaran Tenant F&B
                </p>
                <p className="text-[11px] text-zinc-300">Form akan otomatis ditutup saat timer berakhir</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Hari', val: timeLeft.days },
                { label: 'Jam', val: timeLeft.hours },
                { label: 'Menit', val: timeLeft.minutes },
                { label: 'Detik', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-xl">
                  <span className="text-lg font-black font-mono text-amber-400">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-zinc-400 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {submitted ? (
        /* SUCCESS STATE */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-lg border border-zinc-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-zinc-900">Pendaftaran Tenant Berhasil!</h2>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
              Terima kasih <strong className="text-zinc-900">{submittedData?.picName}</strong>. Formulir pendaftaran untuk <strong className="text-amber-700">{submittedData?.brandName}</strong> telah kami terima.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-5 rounded-2xl text-left space-y-3">
            <p className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Langkah Selanjutnya:
            </p>
            <p className="leading-relaxed">
              Silakan bergabung ke <strong>Grup WhatsApp Resmi Tenant F&B</strong> untuk mendapatkan informasi mengenai jadwal kurasi, technical meeting, dan denah layout booth.
            </p>

            {waGroupUrl && (
              <div className="pt-2">
                <a
                  href={waGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerJoinTenantWaGroupPixels()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Gabung WhatsApp Group Tenant F&B</span>
                </a>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                handleClearForm();
              }}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-4"
            >
              Kirim respon pendaftaran tenant lainnya &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* FORM STATE */
        <div>
          {/* DENAH LAYOUT BOOTH TENANT */}
          <TenantLayoutViewer
            imageSrc="/layout-tenant.png"
            versionTitle="LAYOUT TENANT"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2.5 shadow-xs sticky top-20 z-20">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form Top Header Info */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 text-xs text-zinc-600 shadow-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Isi data formulir pendaftaran di bawah ini dengan lengkap dan benar.
            </span>
            <span className="text-red-500 font-bold shrink-0">* Wajib diisi</span>
          </div>

          {/* DYNAMIC QUESTIONS (GOOGLE FORM STYLE) */}
          {fields.map((field, index) => {
            const val = formData[field.id];

            return (
              <div
                key={field.id}
                id={`field-container-${field.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200/90 shadow-xs hover:border-amber-400/80 transition-all space-y-3 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-100"
              >
                {/* Question Label & Required Star */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                    {index + 1}. {field.label}
                    {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                  </label>
                  {field.helperText && (
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{field.helperText}</p>
                  )}
                </div>

                {/* Question Inputs by Type */}
                <div className="pt-1">
                  {/* TYPE: SHORT TEXT */}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Jawaban Anda'}
                      className="w-full px-3.5 py-2.5 text-sm border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 placeholder-zinc-400"
                    />
                  )}

                  {/* TYPE: PARAGRAPH / TEXTAREA */}
                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Jawaban Anda'}
                      className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-zinc-50/50 hover:bg-white transition-all text-zinc-900 placeholder-zinc-400"
                    />
                  )}

                  {/* TYPE: NUMBER */}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || 'Masukkan angka'}
                      className="w-full sm:w-1/2 px-3.5 py-2.5 text-sm border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 font-mono placeholder-zinc-400"
                    />
                  )}

                  {/* TYPE: EMAIL */}
                  {field.type === 'email' && (
                    <div className="relative w-full sm:w-3/4">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'nama@email.com'}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 placeholder-zinc-400"
                      />
                    </div>
                  )}

                  {/* TYPE: PHONE / WHATSAPP */}
                  {field.type === 'phone' && (
                    <div className="relative w-full sm:w-3/4">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '081234567890'}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 font-mono placeholder-zinc-400"
                      />
                    </div>
                  )}

                  {/* TYPE: DROPDOWN */}
                  {field.type === 'dropdown' && (
                    <div className="w-full sm:w-3/4">
                      <select
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-zinc-50/50 hover:bg-white transition-all text-zinc-900 cursor-pointer font-medium"
                      >
                        <option value="" disabled>
                          {field.placeholder || '-- Pilih salah satu opsi --'}
                        </option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* TYPE: RADIO / PILIHAN GANDA */}
                  {field.type === 'radio' && (
                    <div className="space-y-2 pt-1">
                      {(field.options || []).map((opt, i) => {
                        const isSelected = val === opt;
                        return (
                          <label
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-semibold shadow-xs'
                                : 'bg-zinc-50/40 border-zinc-200 text-zinc-800 hover:bg-zinc-100/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`radio_${field.id}`}
                              value={opt}
                              checked={isSelected}
                              onChange={() => handleInputChange(field.id, opt)}
                              className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-zinc-300"
                            />
                            <span className="text-xs sm:text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* TYPE: CHECKBOX / KOTAK CENTANG (MULTI-SELECT) */}
                  {field.type === 'checkbox' && (
                    <div className="space-y-2 pt-1">
                      {(field.options || []).map((opt, i) => {
                        const isChecked = Array.isArray(val) && val.includes(opt);
                        return (
                          <label
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                              isChecked
                                ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-semibold shadow-xs'
                                : 'bg-zinc-50/40 border-zinc-200 text-zinc-800 hover:bg-zinc-100/60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxToggle(field.id, opt)}
                              className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500 border-zinc-300"
                            />
                            <span className="text-xs sm:text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ACTION BUTTONS & FOOTER */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Formulir...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Formulir Pendaftaran</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kosongkan Formulir</span>
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
