'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Utensils,
  MessageSquare,
  Sparkles,
  Zap,
  Mail,
  Phone,
  HelpCircle,
  Send,
  RotateCcw,
} from 'lucide-react';
import {
  triggerTenantSubmitPixels,
  triggerJoinTenantWaGroupPixels,
} from '@/lib/pixels';
import { SiteConfig, TenantFormField, getDefaultTenantFormFields } from '@/lib/config';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  config?: SiteConfig;
}

export function TenantModal({ isOpen, onClose, title, subtitle, config }: TenantModalProps) {
  const fields: TenantFormField[] =
    config?.tenantFormFields && config.tenantFormFields.length > 0
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

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [waGroupUrl, setWaGroupUrl] = useState(
    config?.tenantWaGroupUrl || 'https://chat.whatsapp.com/'
  );

  if (!isOpen) return null;

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
          const el = document.getElementById(`modal-field-${field.id}`);
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

      triggerTenantSubmitPixels(title || 'Tenant Submission');
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-50 border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-zinc-900">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-950 via-amber-950 to-orange-950 text-white flex items-start justify-between relative shrink-0">
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3 h-3" />
              Open Recruitment Tenant F&B 2026
            </div>
            <h3 className="text-xl font-black text-white leading-tight">
              {title || 'Open Recruitment Tenant F&B Playlist Rewind 2026'}
            </h3>
            <p className="text-xs text-zinc-300">
              {subtitle || 'Isi formulir pendaftaran tenant untuk bergabung di festival kami.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-zinc-50/70">
          {submitted ? (
            /* SUCCESS STATE */
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center space-y-5 border border-zinc-200 shadow-sm">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-zinc-900">Pendaftaran Tenant Terkirim!</h4>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih <strong className="text-zinc-900">{submittedData?.picName}</strong>. Formulir pendaftaran tenant untuk <strong className="text-amber-700">{submittedData?.brandName}</strong> telah berhasil kami terima.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl text-left space-y-2">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Gabung Grup WhatsApp Tenant:
                </p>
                <p className="text-[11px] text-zinc-700 leading-relaxed">
                  Dapatkan update informasi denah booth, jadwal kurasi, dan koordinasi teknis langsung via grup WhatsApp panitia.
                </p>

                {waGroupUrl && (
                  <div className="pt-2">
                    <a
                      href={waGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerJoinTenantWaGroupPixels()}
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm text-xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Gabung WhatsApp Group Tenant F&B</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    handleClearForm();
                  }}
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline"
                >
                  Kirim pendaftaran lagi
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 sticky top-0 z-10 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <div className="bg-white rounded-xl p-3.5 border border-zinc-200 text-[11px] text-zinc-600 flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-1 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  Lengkapi pertanyaan di bawah ini:
                </span>
                <span className="text-red-500 font-bold">* Wajib diisi</span>
              </div>

              {/* DYNAMIC QUESTIONS (GOOGLE FORM STYLE) */}
              {fields.map((field, index) => {
                const val = formData[field.id];

                return (
                  <div
                    key={field.id}
                    id={`modal-field-${field.id}`}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/90 shadow-xs hover:border-amber-400/80 transition-all space-y-2.5 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-100"
                  >
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                        {index + 1}. {field.label}
                        {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                      </label>
                      {field.helperText && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{field.helperText}</p>
                      )}
                    </div>

                    <div className="pt-0.5">
                      {/* TYPE: SHORT TEXT */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={val || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Jawaban Anda'}
                          className="w-full px-3 py-2 text-xs border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 placeholder-zinc-400"
                        />
                      )}

                      {/* TYPE: PARAGRAPH / TEXTAREA */}
                      {field.type === 'textarea' && (
                        <textarea
                          rows={2}
                          value={val || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Jawaban Anda'}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-zinc-50/50 hover:bg-white transition-all text-zinc-900 placeholder-zinc-400"
                        />
                      )}

                      {/* TYPE: NUMBER */}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          value={val || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.placeholder || 'Masukkan angka'}
                          className="w-full sm:w-1/2 px-3 py-2 text-xs border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 font-mono placeholder-zinc-400"
                        />
                      )}

                      {/* TYPE: EMAIL */}
                      {field.type === 'email' && (
                        <div className="relative w-full">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            value={val || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || 'nama@email.com'}
                            className="w-full pl-9 pr-3 py-2 text-xs border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 placeholder-zinc-400"
                          />
                        </div>
                      )}

                      {/* TYPE: PHONE */}
                      {field.type === 'phone' && (
                        <div className="relative w-full">
                          <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            value={val || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || '081234567890'}
                            className="w-full pl-9 pr-3 py-2 text-xs border-b-2 border-zinc-200 focus:border-amber-600 outline-none bg-zinc-50/50 hover:bg-white rounded-t-lg transition-all text-zinc-900 font-mono placeholder-zinc-400"
                          />
                        </div>
                      )}

                      {/* TYPE: DROPDOWN */}
                      {field.type === 'dropdown' && (
                        <select
                          value={val || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-zinc-50/50 hover:bg-white transition-all text-zinc-900 cursor-pointer font-medium"
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
                      )}

                      {/* TYPE: RADIO */}
                      {field.type === 'radio' && (
                        <div className="space-y-1.5 pt-0.5">
                          {(field.options || []).map((opt, i) => {
                            const isSelected = val === opt;
                            return (
                              <label
                                key={i}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                                  isSelected
                                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-semibold shadow-xs'
                                    : 'bg-zinc-50/40 border-zinc-200 text-zinc-800 hover:bg-zinc-100/60'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`modal_radio_${field.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleInputChange(field.id, opt)}
                                  className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 border-zinc-300"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* TYPE: CHECKBOX */}
                      {field.type === 'checkbox' && (
                        <div className="space-y-1.5 pt-0.5">
                          {(field.options || []).map((opt, i) => {
                            const isChecked = Array.isArray(val) && val.includes(opt);
                            return (
                              <label
                                key={i}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                                  isChecked
                                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-semibold shadow-xs'
                                    : 'bg-zinc-50/40 border-zinc-200 text-zinc-800 hover:bg-zinc-100/60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxToggle(field.id, opt)}
                                  className="w-3.5 h-3.5 text-amber-600 rounded-sm focus:ring-amber-500 border-zinc-300"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pendaftaran</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
