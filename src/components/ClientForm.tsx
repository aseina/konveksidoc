import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, X, Save } from 'lucide-react';
import { Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ClientFormProps {
  onSave: (client: Client) => void;
  onCancel: () => void;
  initialData?: Client | null;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    company: initialData?.company || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedClient: Client = {
      ...formData,
      id: initialData?.id || uuidv4(),
      createdAt: initialData?.createdAt || Date.now(),
    };
    onSave(updatedClient);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 truncate">
              {initialData ? 'Edit Klien' : 'Tambah Klien'}
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {initialData ? 'Perbarui Data' : 'Database Baru'}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-full transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="text" 
                placeholder="Masukkan nama lengkap klien..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="email" 
                placeholder="Email..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Telepon / WA *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required
                type="tel" 
                placeholder="HP..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono font-bold"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Instansi (Opsional)</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Contoh: PT Konveksi Sejahtera..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Lengkap *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <textarea 
              required
              rows={2}
              placeholder="Alamat klien..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold resize-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-slate-200 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button 
            type="submit"
            className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Simpan Data Klien
          </button>
        </div>
      </form>
    </div>
  );
};
