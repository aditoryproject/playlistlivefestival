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
} from 'lucide-react';
import {
  triggerTenantSubmitPixels,
  triggerJoinTenantWaGroupPixels,
} from '@/lib/pixels';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export function TenantModal({ isOpen, onClose, title, subtitle }: TenantModalProps) {
  // Form Field States
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Makanan Berat');
  const [menuDescription, setMenuDescription] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [instagramCatalog, setInstagramCatalog] = useState('');
  const [picName, setPicName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [powerRequirement, setPowerRequirement] = useState('< 900 Watt');
  const [equipmentList, setEquipmentList] = useState('');
  const [eventExperience, setEventExperience] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [waGroupUrl, setWaGroupUrl] = useState('https://chat.whatsapp.com/');

  if (!isOpen) return null;

  const handleClearForm = () => {
    setBrandName('');
    setCategory('Makanan Berat');
    setMenuDescription('');
    setPriceRange('');
    setInstagramCatalog('');
    setPicName('');
    setWhatsapp('');
    setEmail('');
    setCity('');
    setPowerRequirement('< 900 Watt');
    setEquipmentList('');
    setEventExperience('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!brandName.trim()) {
      setErrorMsg('Nama Brand / Usaha F&B wajib diisi.');
      return;
    }
    if (!picName.trim()) {
      setErrorMsg('Nama Lengkap PIC / Owner wajib diisi.');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMsg('Nomor WhatsApp wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          category,
          menuDescription,
          priceRange,
          instagramCatalog,
          picName,
          whatsapp,
          email,
          city,
          powerRequirement,
          equipmentList,
          eventExperience,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengirim pendaftaran tenant.');
      }

      if (data.waGroupUrl) {
        setWaGroupUrl(data.waGroupUrl);
      }

      // Trigger Pixel Lead Event
      triggerTenantSubmitPixels(title || 'Tenant Registration Submission');

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-100 rounded-3xl shadow-2xl overflow-hidden my-8 border border-zinc-200 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-zinc-950 via-amber-950 to-orange-950 text-white px-6 py-5 flex items-start justify-between relative shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
              <Utensils className="w-3 h-3" />
              Open Registration Tenant F&B
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-white">
              {title || 'Open Recruitment Tenant F&B Playlist Rewind 2026'}
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
              {subtitle ||
                'Bergabunglah bersama puluhan ribu pengunjung di festival musik terbesar di Bandung!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 ml-2"
            aria-label="Tutup Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-zinc-800">
          {submitted ? (
            /* SUCCESS STATE */
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm border border-zinc-200 my-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Pendaftaran Tenant Berhasil!</h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
                Terima kasih <strong className="text-zinc-900">{picName}</strong>. Pendaftaran tenant F&B untuk <strong className="text-amber-700">{brandName}</strong> telah kami terima!
              </p>
              
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-xl text-left space-y-2">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Status Pendaftaran:
                </p>
                <p>
                  Tim panitia akan meninjau pendaftaran tenant Anda dan menghubungi nomor WhatsApp / Email penanggung jawab untuk koordinasi selanjutnya.
                </p>
              </div>


              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Tutup Halaman
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 border border-zinc-200 text-xs text-red-600 font-semibold">
                * Indicates required question
              </div>

              {/* 1. Nama Brand */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Nama Brand / Usaha F&B <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Contoh: Kopi Kenangan, Ayam Geprek Master"
                  className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* 2. Kategori Produk F&B */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Kategori Produk F&B <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-xl focus:border-zinc-900 focus:outline-none bg-white font-medium"
                >
                  <option value="Makanan Berat">Makanan Berat (Heavy Meals)</option>
                  <option value="Makanan Ringan">Makanan Ringan (Snacks & Finger Foods)</option>
                  <option value="Minuman">Minuman (Beverages / Coffee / Tea)</option>
                  <option value="Dessert & Pastry">Dessert & Pastry (Ice Cream, Bakery)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* 3. Deskripsi Menu & Bestseller */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Deskripsi Menu & Produk Unggulan (Bestseller)
                </label>
                <textarea
                  rows={3}
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  placeholder="Sebutkan menu favorit dan jenis makanan/minuman yang akan dijual..."
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-xl focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* 4. Kisaran Harga Menu & Link Catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Kisaran Harga Menu
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="Contoh: Rp 15.000 - Rp 45.000"
                    className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>

                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Link Social Media / Instagram / Catalog
                  </label>
                  <input
                    type="text"
                    value={instagramCatalog}
                    onChange={(e) => setInstagramCatalog(e.target.value)}
                    placeholder="https://instagram.com/nama_brand"
                    className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>
              </div>

              {/* 5. Nama PIC & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Nama Lengkap PIC / Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Nama Penanggung Jawab"
                    className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>

                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Nomor WhatsApp Active <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>
              </div>

              {/* 6. Email & Kota Asal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Email Active
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>

                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                  <label className="block text-sm font-bold text-zinc-900">
                    Kota Asal Brand
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bandung / Jakarta / dll"
                    className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>
              </div>

              {/* 7. Kebutuhan Listrik & Peralatan */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Estimasi Daya Listrik yang Dibutuhkan
                  </label>
                  <select
                    value={powerRequirement}
                    onChange={(e) => setPowerRequirement(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-sm border border-zinc-300 rounded-xl focus:border-zinc-900 focus:outline-none bg-white font-medium"
                  >
                    <option value="< 900 Watt">Standard (&lt; 900 Watt)</option>
                    <option value="1300 Watt">Sedang (1300 Watt)</option>
                    <option value="2200 Watt">Tinggi (2200 Watt)</option>
                    <option value="> 2200 Watt / Daya Besar">Daya Besar (&gt; 2200 Watt / Deep Fryer / Espresso)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900">
                    Peralatan Listrik Utama yang Dibawa
                  </label>
                  <input
                    type="text"
                    value={equipmentList}
                    onChange={(e) => setEquipmentList(e.target.value)}
                    placeholder="Contoh: 1 Deep Fryer 1500W, 1 Chiller 300W, 1 Blender"
                    className="w-full mt-1 px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                  />
                </div>
              </div>

              {/* 8. Pengalaman Event */}
              <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs space-y-2">
                <label className="block text-sm font-bold text-zinc-900">
                  Pengalaman Festival / Event Sebelumnya
                </label>
                <input
                  type="text"
                  value={eventExperience}
                  onChange={(e) => setEventExperience(e.target.value)}
                  placeholder="Pernah ikut event musik/bazaar apa saja..."
                  className="w-full px-3 py-2 text-sm border-b border-zinc-300 focus:border-zinc-900 focus:outline-none bg-transparent transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Daftar Tenant F&B
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:underline"
                >
                  Clear form
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
