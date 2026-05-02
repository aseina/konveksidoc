import React, { useState, useRef } from 'react';
import { Building, MapPin, Phone, Mail, Globe, Save, Upload, Image as ImageIcon, X, UserPlus, CreditCard } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessProfileFormProps {
  initialProfile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
  onError: (message: string) => void;
}

export const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({ initialProfile, onSave, onError }) => {
  const [profile, setProfile] = useState<BusinessProfile>({
    ...initialProfile,
    bankAccounts: initialProfile.bankAccounts?.length 
      ? initialProfile.bankAccounts 
      : [{ bankName: '', accountNumber: '', accountHolder: '' }]
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty bank accounts
    const cleanedBankAccounts = profile.bankAccounts?.filter(acc => acc.bankName || acc.accountNumber) || [];
    onSave({ ...profile, bankAccounts: cleanedBankAccounts });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onError('File terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBankAccountChange = (index: number, field: string, value: string) => {
    const newAccounts = [...(profile.bankAccounts || [])];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setProfile({ ...profile, bankAccounts: newAccounts });
  };

  const addBankAccount = () => {
    if ((profile.bankAccounts?.length || 0) < 3) {
      setProfile({
        ...profile,
        bankAccounts: [...(profile.bankAccounts || []), { bankName: '', accountNumber: '', accountHolder: '' }]
      });
    }
  };

  const removeBankAccount = (index: number) => {
    const newAccounts = profile.bankAccounts?.filter((_, i) => i !== index);
    setProfile({ ...profile, bankAccounts: newAccounts });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 max-w-xl mx-auto overflow-hidden custom-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <Building className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight truncate">Profil Bisnis</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identitas Dokumen</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Logo Bisnis</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden group relative shrink-0">
              {profile.logo ? (
                <>
                  <img src={profile.logo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                  <button 
                    type="button"
                    onClick={() => setProfile({ ...profile, logo: '' })}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm"
              >
                {profile.logo ? 'Ganti Logo' : 'Pilih Logo'}
              </button>
              <p className="text-[9px] text-slate-400 font-medium leading-normal">
                Maks. 2MB (JPG/PNG/SVG).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Pemilik Bisnis</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={profile.ownerName || ''}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Bisnis</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Kantor</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
            <textarea 
              required
              rows={2}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                type="email"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bank Accounts Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-3 h-3 text-indigo-600" />
              Rekening Bank (Maks. 3)
            </label>
            {(profile.bankAccounts?.length || 0) < 3 && (
              <button 
                type="button"
                onClick={addBankAccount}
                className="text-indigo-600 text-[10px] font-bold hover:underline"
              >
                + Tambah Rekening
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {profile.bankAccounts?.map((account, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group/bank">
                {profile.bankAccounts!.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeBankAccount(index)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/bank:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nama Bank</label>
                    <input 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                      placeholder="BCA, Mandiri, dll"
                      value={account.bankName}
                      onChange={(e) => handleBankAccountChange(index, 'bankName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">No. Rekening</label>
                    <input 
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                      placeholder="8830..."
                      value={account.accountNumber}
                      onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Atas Nama</label>
                  <input 
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                    placeholder="Nama Pemilik Rekening"
                    value={account.accountHolder}
                    onChange={(e) => handleBankAccountChange(index, 'accountHolder', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Simpan Selengkapnya
        </button>
      </form>
    </div>
  );
};
