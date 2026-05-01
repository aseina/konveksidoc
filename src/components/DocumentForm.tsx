import React, { useState } from 'react';
import { Plus, Trash2, Save, Eye, UserPlus, Copy } from 'lucide-react';
import { Client, DocumentType, DocumentItem, BusinessDocument, DOCUMENT_LABELS, DocumentSection } from '../types';
import { DOCUMENT_TEMPLATES, UNITS, CONVECTION_SERVICES } from '../constants';
import { cn, formatCurrency } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface DocumentFormProps {
  clients: Client[];
  onSave: (doc: BusinessDocument) => void;
  onPreview: (doc: BusinessDocument) => void;
  onAddClient: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({ clients, onSave, onPreview, onAddClient }) => {
  const [docType, setDocType] = useState<DocumentType>('QUOTATION');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [items, setItems] = useState<DocumentItem[]>([
    { id: uuidv4(), description: '', quantity: 1, unit: 'pcs', price: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0); // in percent
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Pembayaran dilakukan 50% di awal dan 50% setelah barang selesai.');
  const [opening, setOpening] = useState(DOCUMENT_TEMPLATES.QUOTATION.opening || '');
  const [closing, setClosing] = useState(DOCUMENT_TEMPLATES.QUOTATION.closing || '');
  const [sections, setSections] = useState<DocumentSection[]>([]);

  const isNarrative = ['CONTRACT', 'MOU', 'NDA', 'PROPOSAL', 'MEMO', 'SOW'].includes(docType);

  // Update paragraphs when doc type changes
  const handleDocTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    setOpening(DOCUMENT_TEMPLATES[newType].opening || '');
    setClosing(DOCUMENT_TEMPLATES[newType].closing || '');
    
    // Add default sections for narrative types if transitioning to one
    if (['CONTRACT', 'MOU', 'NDA', 'PROPOSAL', 'MEMO', 'SOW'].includes(newType)) {
      setSections([
        { id: uuidv4(), title: 'Pasal 1: Ruang Lingkup', content: 'Deskripsikan secara detail cakupan kerjasama ini...' },
        { id: uuidv4(), title: 'Pasal 2: Kewajiban Pihak Pertama', content: 'Sebutkan apa saja tanggung jawab pemberi kerja...' },
        { id: uuidv4(), title: 'Pasal 3: Kewajiban Pihak Kedua', content: 'Sebutkan apa saja tanggung jawab pelaksana...' }
      ]);
    } else {
      setSections([]);
    }
  };

  const addSection = () => {
    setSections([...sections, { id: uuidv4(), title: `Pasal ${sections.length + 1}: `, content: '' }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: keyof DocumentSection, value: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: '', quantity: 1, unit: 'pcs', price: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const duplicateItem = (item: DocumentItem) => {
    const newItem: DocumentItem = {
      ...item,
      id: uuidv4(),
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, field: keyof DocumentItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const handleSubmit = (action: 'save' | 'preview') => {
    const selectedClient = clients.find(c => c.id === selectedClientId);
    
    const doc: BusinessDocument = {
      id: uuidv4(),
      type: docType,
      docNumber: `${DOCUMENT_TEMPLATES[docType].prefix}-${Date.now().toString().slice(-6)}`,
      date: Date.now(),
      clientId: selectedClientId,
      clientInfo: selectedClient,
      items,
      sections: isNarrative ? sections : [],
      subtotal,
      tax: taxAmount,
      discount,
      total,
      notes,
      terms,
      opening,
      closing,
      status: 'DRAFT',
      createdBy: 'admin'
    };

    if (action === 'save') onSave(doc);
    else onPreview(doc);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Left Column: Config */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">1</span>
            Informasi Dasar
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Dokumen</label>
              <select 
                value={docType}
                onChange={(e) => handleDocTypeChange(e.target.value as DocumentType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Klien</label>
                <button onClick={onAddClient} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Tambah Klien
                </button>
              </div>
              <select 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Pilih Klien --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">2</span>
              Detail Item & Layanan
            </h3>
            <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
              <Plus className="w-4 h-4" /> Tambah Baris
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50 rounded-xl group relative items-start border border-transparent hover:border-slate-200 transition-all">
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Pekerjaan / Produk</label>
                  <input 
                    list="services"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Deskripsi..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                  />
                  <datalist id="services">
                    {CONVECTION_SERVICES.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Spek Detail</label>
                  <input 
                    value={item.specifications || ''}
                    onChange={(e) => updateItem(item.id, 'specifications', e.target.value)}
                    placeholder="Bahan, warna..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="md:col-span-1 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center block">Qty</label>
                  <input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-center font-mono"
                  />
                </div>
                <div className="md:col-span-1.5 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center block">Unit</label>
                  <select 
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-1 py-1.5 text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold uppercase"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 text-right block">Harga Satuan</label>
                  <input 
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-right font-mono"
                  />
                </div>
                <div className="md:col-span-0.5 pt-6 flex items-center justify-end">
                  <div className="flex bg-white border border-slate-100 rounded-lg shadow-sm">
                    <button 
                      onClick={() => duplicateItem(item)}
                      title="Duplicate"
                      className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => removeItem(item.id)}
                      title="Hapus"
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors border-l border-slate-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">3</span>
            Paragraf Pembuka & Penutup
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paragraf Pembuka</label>
              <textarea 
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
                rows={isNarrative ? 6 : 3}
                placeholder="Kalimat pembuka dokumen..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm leading-relaxed"
              />
            </div>

            {/* Narrative Sections (Pasal-Pasal) */}
            {isNarrative && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pasal-Pasal / Ketentuan (Narasi)</label>
                  <button 
                    onClick={addSection}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-all"
                  >
                    + Tambah Pasal
                  </button>
                </div>
                <div className="space-y-4">
                  {sections.map((section, idx) => (
                    <div key={section.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group">
                      <button 
                        onClick={() => removeSection(section.id)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        placeholder="Judul Pasal (Contoh: Pasal 1: ...)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold font-serif outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <textarea 
                        value={section.content}
                        onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                        rows={4}
                        placeholder="Isi uraian pasal..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paragraf Penutup</label>
              <textarea 
                value={closing}
                onChange={(e) => setClosing(e.target.value)}
                rows={isNarrative ? 6 : 3}
                placeholder="Kalimat penutup dokumen..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">4</span>
            Catatan & Ketentuan
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Tambahan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Syarat & Ketentuan</label>
              <textarea 
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Calculations */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 sticky top-8">
          <h3 className="text-lg font-bold mb-6">Ringkasan Biaya</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-sm">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-sm">Pajak (PPN %)</span>
                <input 
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-xs"
                />
              </div>
              <p className="text-right text-[10px] text-slate-400 font-mono">+{formatCurrency(taxAmount)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-sm">Diskon (IDR)</span>
                <input 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Akhir</span>
              <span className="text-xl font-black text-indigo-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button 
              disabled={!selectedClientId}
              onClick={() => handleSubmit('preview')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" /> Preview Dokumen
            </button>
            <button 
              disabled={!selectedClientId}
              onClick={() => handleSubmit('save')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> Simpan Dokumen
            </button>
          </div>
          
          {!selectedClientId && (
            <p className="mt-4 text-[10px] text-amber-600 font-bold uppercase tracking-widest text-center">
              * Pilih klien terlebih dahulu
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
