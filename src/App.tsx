/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building,
  Users, 
  FilePlus, 
  History, 
  LayoutDashboard, 
  Plus, 
  Download, 
  Send, 
  Search,
  ChevronRight,
  FileText,
  Printer,
  X,
  CreditCard,
  CheckCircle2,
  Package,
  Truck,
  FileWarning,
  LogOut,
  ChevronDown,
  Mail,
  Phone,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from './lib/utils';
import { Client, BusinessDocument, DocumentType, DOCUMENT_LABELS } from './types';
import { DocumentPreview } from './components/DocumentPreview';
import { DocumentForm } from './components/DocumentForm';
import { ClientForm } from './components/ClientForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { firebaseService } from './services/firebaseService';
import { BusinessProfileForm } from './components/BusinessProfileForm';
import { BusinessProfile as BizProfileType } from './types';

// Views
type View = 'dashboard' | 'clients' | 'create-doc' | 'history' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<BusinessDocument | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BizProfileType | null>(() => {
    const cached = localStorage.getItem('kabuldoc_profile_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [showEmailDraft, setShowEmailDraft] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Subscriptions
  useEffect(() => {
    if (!user) {
      setClients([]);
      setDocuments([]);
      return;
    }

    const unsubClients = firebaseService.subscribeClients(user.uid, setClients);
    const unsubDocs = firebaseService.subscribeDocuments(user.uid, setDocuments);

    // Fetch Profile
    firebaseService.getBusinessProfile(user.uid).then(profile => {
      if (profile) {
        setBusinessProfile(profile);
        localStorage.setItem('kabuldoc_profile_cache', JSON.stringify(profile));
      } else {
        const defaultProfile = { name: '', address: '', phone: '', email: user.email || '' };
        setBusinessProfile(defaultProfile);
      }
    });

    return () => {
      unsubClients();
      unsubDocs();
    };
  }, [user]);

  const handleUpdateProfile = async (profile: BizProfileType) => {
    if (!user) return;
    try {
      await firebaseService.updateBusinessProfile(user.uid, profile);
      setBusinessProfile(profile);
      showToast('Profil bisnis berhasil diperbarui!');
    } catch (e) {
      showToast('Gagal memperbarui profil', 'error');
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showToast('Login berhasil!');
    } catch (error) {
      console.error('Login failed:', error);
      showToast('Gagal login', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Berhasil keluar');
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Gagal logout', 'error');
    }
  };

  const handleSaveClient = async (client: Client) => {
    try {
      await firebaseService.addClient(client);
      setShowClientModal(false);
      setEditingClient(null);
      showToast('Klien berhasil disimpan!');
    } catch (e) {
      showToast('Gagal menyimpan klien', 'error');
    }
  };

  const handleSaveDoc = async (doc: BusinessDocument) => {
    try {
      if (editingDocId) {
        // Find existing doc to get current revision
        const existingDoc = documents.find(d => d.id === editingDocId);
        const currentRevision = existingDoc?.revision || 0;
        
        await firebaseService.updateDocument(editingDocId, {
          ...doc,
          revision: currentRevision + 1
        });
        showToast('Dokumen berhasil diperbarui!');
      } else {
        await firebaseService.addDocument({
          ...doc,
          revision: 0
        });
        showToast('Dokumen berhasil dibuat!');
      }
      setEditingDocId(null);
      setActiveView('history');
    } catch (e) {
      showToast(editingDocId ? 'Gagal memperbarui dokumen' : 'Gagal membuat dokumen', 'error');
    }
  };

  const handleEditDoc = (doc: BusinessDocument) => {
    setEditingDocId(doc.id);
    setSelectedDoc(null); // Close preview if open
    setActiveView('create-doc');
  };

  const exportToPDF = async () => {
    if (!selectedDoc) return;
    setIsExporting(true);
    
    try {
      const element = document.getElementById('document-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200, 
        onclone: (clonedDoc) => {
          const preview = clonedDoc.getElementById('document-preview');
          if (preview) {
            // Restore proper padding and width for export
            preview.style.margin = '0';
            preview.style.boxShadow = 'none';
            preview.style.width = '210mm';
            preview.style.padding = '20mm'; 
            preview.style.borderTop = '12px solid #000000';
            
            const allElements = preview.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i] as HTMLElement;
              const style = window.getComputedStyle(el);
              
              const hasBlackBg = el.classList.contains('bg-black') || style.backgroundColor === 'rgb(0, 0, 0)';
              const hasWhiteText = el.classList.contains('text-white') || style.color === 'rgb(255, 255, 255)';

              if (hasBlackBg) {
                el.style.backgroundColor = '#000000';
                if (hasWhiteText) el.style.color = '#ffffff';
              } else {
                if (style.color && (style.color.includes('okl') || style.color.includes('var'))) {
                  el.style.color = '#000000';
                }
                if (style.backgroundColor && !style.backgroundColor.includes('rgba(0, 0, 0, 0)') && style.backgroundColor !== 'transparent') {
                  el.style.backgroundColor = '#ffffff';
                }
              }

              if (style.borderColor && (style.borderColor.includes('okl') || style.borderColor.includes('var'))) {
                el.style.borderColor = '#000000';
              }

              el.style.webkitPrintColorAdjust = 'exact';
              (el.style as any).printColorAdjust = 'exact';
            }
          }
        }
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Since padding is now in the canvas, we map full canvas to full PDF width
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = pdfWidth / canvasWidth;
      const imgHeightInPdf = canvasHeight * ratio;
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // We still want a protective margin for headers/footers in case of multi-page
      const MT = 10; // Extra buffer top
      const MB = 15; // Extra buffer bottom (room for page num)
      const printableHeight = pdfHeight - MB; 

      let heightLeft = imgHeightInPdf;
      let imgOffset = 0;
      let pageNumber = 1;

      while (heightLeft > 0) {
        if (pageNumber > 1) pdf.addPage();
        
        // Draw the image. On page 1, imgOffset is 0.
        pdf.addImage(imgData, 'JPEG', 0, -imgOffset, pdfWidth, imgHeightInPdf);
        
        // Protective bottom cover for footer area
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pdfHeight - MB, pdfWidth, MB, 'F');
        
        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`HALAMAN ${pageNumber} • ${selectedDoc.docNumber}`, pdfWidth / 2, pdfHeight - 8, { align: 'center' });
        
        if (selectedDoc.revision && selectedDoc.revision > 0) {
          pdf.text(`REV-${selectedDoc.revision}`, pdfWidth - 15, pdfHeight - 8, { align: 'right' });
        }
        
        heightLeft -= printableHeight;
        imgOffset += printableHeight;
        pageNumber++;
      }
      
      pdf.save(`${selectedDoc.docNumber}.pdf`);
      showToast('PDF berhasil diunduh');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Gagal mengekspor PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Beranda' },
    { id: 'clients', icon: Users, label: 'Daftar Klien' },
    { id: 'create-doc', icon: FilePlus, label: 'Buat Dokumen' },
    { id: 'history', icon: History, label: 'Riwayat Transaksi' },
    { id: 'settings', icon: Building, label: 'Profil Bisnis' },
  ];

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocs = documents.filter(d => 
    d.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.clientInfo?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="font-bold tracking-widest uppercase text-xs opacity-50">Menyiapkan Aplikasi...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 overflow-hidden font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center space-y-8 max-w-md px-6">
          <div className="inline-flex flex-col items-center gap-4 mb-4">
            <div className="w-32 h-24 bg-transparent flex items-center justify-center overflow-hidden">
              <img 
                src="https://kabulkonveksitas.co.id/wp-content/uploads/2022/01/LOGO-KABUL-KONVEKSI-TAS-full-putih-150x111.png" 
                alt="KabulDoc Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="font-black text-4xl tracking-tighter text-white">KabulDoc</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white leading-tight">Sistem Manajemen Dokumen Kabul Konveksi Tas</h1>
            <p className="text-slate-400 font-medium leading-relaxed">Sistem otomatis generate Penawaran, SPK, dan Invoice untuk Kabul Konveksi Tas.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Masuk dengan Google
          </button>
          
          <div className="pt-8 border-t border-slate-800/50">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Developed by <a href="https://www.sulissetyo.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sulis Setyo</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-visible font-sans print:bg-white print:block">
      {/* Sidebar - Hidden on print */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 print:hidden">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
              {businessProfile?.logo ? (
                <img src={businessProfile.logo} alt={businessProfile.name || 'Logo'} className="w-full h-full object-cover" />
              ) : (
                (businessProfile?.name || 'K').charAt(0).toUpperCase()
              )}
            </div>
            <span className="font-bold text-xl tracking-tight truncate">{businessProfile?.name || 'KonveksiDoc'}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setEditingDocId(null);
                setActiveView(item.id as View);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                activeView === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeView === item.id ? "text-white" : "group-hover:text-indigo-400"
              )} />
              <div className="flex-1">
                <p className="font-bold text-sm leading-none">{item.label}</p>
                {activeView === item.id && <p className="text-[10px] opacity-70 mt-1 font-medium">Sedang dibuka</p>}
              </div>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3 border border-slate-700/50 relative group">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl object-cover" />
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-sm truncate">{user.displayName}</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest truncate">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="absolute -top-12 left-0 w-full bg-red-500 text-white rounded-xl py-3 px-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Hidden on print if preview is open handled in modal */}
      <main className={cn("flex-1 flex flex-col relative overflow-hidden", selectedDoc && "print:hidden")}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight truncate">
              {navItems.find(n => n.id === activeView)?.label}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manajemen {businessProfile?.name || 'KonveksiDoc'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs w-48 lg:w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                if (activeView === 'clients') {
                  setShowClientModal(true);
                } else {
                  setEditingDocId(null);
                  setActiveView('create-doc');
                }
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Baru
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeView === 'dashboard' && <DashboardView documents={documents} clients={clients} setView={setActiveView} onEdit={handleEditDoc} />}
              {activeView === 'clients' && (
                <ClientsView 
                  clients={filteredClients} 
                  onAdd={() => {
                    setEditingClient(null);
                    setShowClientModal(true);
                  }} 
                  onEdit={(client) => {
                    setEditingClient(client);
                    setShowClientModal(true);
                  }}
                />
              )}
              {activeView === 'history' && <HistoryView documents={filteredDocs} setView={setActiveView} setSelectedDoc={setSelectedDoc} onEdit={handleEditDoc} />}
              {activeView === 'settings' && businessProfile && (
                <BusinessProfileForm 
                  initialProfile={businessProfile} 
                  onSave={handleUpdateProfile} 
                  onError={(msg) => showToast(msg, 'error')}
                />
              )}
              {activeView === 'create-doc' && (
                <DocumentForm 
                  clients={clients} 
                  onSave={handleSaveDoc} 
                  onPreview={setSelectedDoc} 
                  onAddClient={() => setShowClientModal(true)}
                  initialData={editingDocId ? documents.find(d => d.id === editingDocId) : null}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => {
                setShowClientModal(false);
                setEditingClient(null);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-xl"
            >
              <ClientForm 
                onSave={handleSaveClient} 
                onCancel={() => {
                  setShowClientModal(false);
                  setEditingClient(null);
                }} 
                initialData={editingClient}
              />
            </motion.div>
          </div>
        )}

        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:block">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md print:hidden"
              onClick={() => {
                setSelectedDoc(null);
                setShowEmailDraft(false);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              className="relative z-10 bg-slate-100 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[92vh] print:h-auto print:max-w-none print:rounded-none print:shadow-none print:bg-white print:m-0 print:overflow-visible print:static print:block"
            >
              <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 print:hidden">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block leading-none">{selectedDoc.docNumber}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{DOCUMENT_LABELS[selectedDoc.type]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowEmailDraft(!showEmailDraft)} className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                    showEmailDraft ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}>
                    <Send className="w-4 h-4" /> Surat Pengantar
                  </button>
                  <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all">
                    <Printer className="w-4 h-4" /> Cetak
                  </button>
                  <button 
                    onClick={() => handleEditDoc(selectedDoc)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    disabled={isExporting}
                    onClick={exportToPDF} 
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                  >
                    {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                    Simpan PDF
                  </button>
                  <button 
                    onClick={() => {
                      const subject = encodeURIComponent(`${DOCUMENT_LABELS[selectedDoc.type]} - ${selectedDoc.docNumber}`);
                      const body = encodeURIComponent(`Halo ${selectedDoc.clientInfo?.name},\n\nTerlampir ${DOCUMENT_LABELS[selectedDoc.type]} dengan nomor ${selectedDoc.docNumber} dari ${businessProfile?.name || 'kami'}.\n\nSilakan cek file PDF yang terlampir.\n\nTerima kasih,\n${businessProfile?.name || 'Manajemen'}`);
                      window.location.href = `mailto:${selectedDoc.clientInfo?.email}?subject=${subject}&body=${body}`;
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-lg shadow-slate-900/20"
                  >
                    <Send className="w-4 h-4" /> Kirim Email
                  </button>
                  <button onClick={() => {
                    setSelectedDoc(null);
                    setShowEmailDraft(false);
                  }} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-full ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden flex bg-slate-200/50 print:bg-white print:block print:overflow-visible">
                <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col items-center custom-scrollbar print:p-0 print:overflow-visible print:block bg-slate-300/30">
                  <div className="min-h-full py-12 print:py-0 print:m-0 print:block">
                    <DocumentPreview doc={selectedDoc} profile={businessProfile} />
                  </div>
                  <div className="h-12 print:hidden" /> {/* Spacer */}
                </div>
                
                {showEmailDraft && (
                  <motion.div 
                    initial={{ x: 400 }} animate={{ x: 0 }}
                    className="w-[400px] bg-white border-l border-slate-200 p-8 flex flex-col"
                  >
                    <h4 className="font-bold text-slate-800 mb-2">Draft Surat Pengantar</h4>
                    <p className="text-xs text-slate-500 mb-6">Salin teks ini untuk dikirimkan melalui Email atau WhatsApp.</p>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed overflow-y-auto whitespace-pre-line">
                      {`Subjek: ${DOCUMENT_LABELS[selectedDoc.type]} - ${selectedDoc.docNumber}\n\nYth. ${selectedDoc.clientInfo?.name},\n${selectedDoc.clientInfo?.company ? `(${selectedDoc.clientInfo.company})\n` : '\n'}
                      Semoga hari Anda menyenangkan.
                      
                      Kami dari ${businessProfile?.name || 'tim Konveksi'} ingin mengirimkan dokumen ${DOCUMENT_LABELS[selectedDoc.type].toLowerCase()} terkait rencana kerja sama kita.
                      
                      Detail Dokumen:
                      - No: ${selectedDoc.docNumber}
                      - Nama: ${DOCUMENT_LABELS[selectedDoc.type]}
                      - Total: ${formatCurrency(selectedDoc.total)}
                      
                      Silakan periksa detailnya pada lampiran file PDF. Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami melalui nomor ${businessProfile?.phone || 'yang tertera'}.
                      
                      Terima kasih atas kepercayaan Anda.
                      
                      Hormat kami,
                      ${businessProfile?.name || 'Tim Konveksi'}`}
                    </div>
                    <button 
                      onClick={() => {
                        const text = `Subjek: ${DOCUMENT_LABELS[selectedDoc.type]} - ${selectedDoc.docNumber}\n\nYth. ${selectedDoc.clientInfo?.name},\n${selectedDoc.clientInfo?.company ? `(${selectedDoc.clientInfo.company})\n` : '\n'}Semoga hari Anda menyenangkan.\n\nKami dari ${businessProfile?.name || 'tim Konveksi'} ingin mengirimkan dokumen ${DOCUMENT_LABELS[selectedDoc.type].toLowerCase()} terkait rencana kerja sama kita.\n\nDetail Dokumen:\n- No: ${selectedDoc.docNumber}\n- Nama: ${DOCUMENT_LABELS[selectedDoc.type]}\n- Total: ${formatCurrency(selectedDoc.total)}\n\nSilakan periksa detailnya pada lampiran file PDF. Jika ada pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami melalui nomor ${businessProfile?.phone || 'yang tertera'}.\n\nTerima kasih atas kepercayaan Anda.\n\nHormat kami,\n${businessProfile?.name || 'Tim Konveksi'}`;
                        navigator.clipboard.writeText(text);
                        showToast('Draft disalin ke clipboard');
                      }}
                      className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10"
                    >
                      Salin Teks
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest border",
              toast.type === 'success' ? "bg-white text-emerald-600 border-emerald-100" : 
              toast.type === 'error' ? "bg-white text-red-600 border-red-100" : "bg-white text-indigo-600 border-indigo-100"
            )}
          >
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              toast.type === 'success' ? "bg-emerald-500" : toast.type === 'error' ? "bg-red-500" : "bg-indigo-500"
            )} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents logic
function DashboardView({ documents, clients, setView, onEdit }: any) {
  const stats = [
    { label: 'Total Klien', value: clients.length, icon: Users, color: 'indigo' },
    { label: 'Dokumen Terbit', value: documents.length, icon: FileText, color: 'emerald' },
    { label: 'Estimasi Omzet', value: formatCurrency(documents.reduce((acc: number, d: any) => acc + d.total, 0)), icon: CreditCard, color: 'amber' },
    { label: 'Proyek Berjalan', value: documents.filter((d: any) => d.type === 'WORK_ORDER').length, icon: Package, color: 'blue' },
  ];

  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
               <stat.icon className="w-24 h-24" />
            </div>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-sm", colors[stat.color])}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight truncate relative z-10" title={stat.value.toString()}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg tracking-tight text-slate-800">Aktivitas Terakhir</h3>
            <button onClick={() => setView('history')} className="text-indigo-600 text-[10px] font-black hover:underline tracking-widest uppercase">Semua</button>
          </div>
          {documents.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
              <Plus className="w-6 h-6 mb-2 opacity-20" />
              <p className="font-bold text-xs">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="flex items-center p-3.5 bg-slate-50/50 rounded-2xl gap-4 border border-transparent hover:border-indigo-100 transition-all hover:bg-white group overflow-hidden">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-tight truncate">{DOCUMENT_LABELS[doc.type as DocumentType]}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">Untuk: {doc.clientInfo?.name}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(doc);
                      }}
                      className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <p className="font-black text-slate-900 text-xs">{formatCurrency(doc.total)}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{format(doc.date, 'dd MMM')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2 leading-tight">Mulai Produksi?</h3>
              <p className="text-indigo-100 text-xs mb-6 leading-relaxed font-medium">Buat Surat Perintah Kerja (SPK) untuk tim produksi Anda.</p>
              <button 
                onClick={() => setView('create-doc')}
                className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Buat SPK
              </button>
            </div>
            <FileText className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-base mb-4">Penyimpanan</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <span>Klien</span>
                  <span className="text-slate-800">{clients.length} / â</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[15%]" />
                </div>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100/50">
                <FileWarning className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-black text-amber-700 leading-normal uppercase tracking-tight">
                  Gunakan Cloud (Firebase) agar data tetap aman & sinkron.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientsView({ clients, onAdd, onEdit }: { clients: Client[], onAdd: () => void, onEdit: (client: Client) => void }) {
  const handleExportCSV = () => {
    const headers = ['Nama', 'Perusahaan', 'Alamat', 'Email', 'Telepon'];
    const rows = clients.map(client => [
      client.name,
      client.company || '',
      (client.address || '').replace(/\n/g, ' '),
      client.email,
      client.phone
    ]);
    
    // Add BOM for Excel compatibility with UTF-8
    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Daftar_Klien_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mb-8">
          <Users className="w-12 h-12 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Database Klien Kosong</h3>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">Simpan data klien Anda untuk mempercepat pembuatan Invoice atau Quotation di masa depan.</p>
        <button onClick={onAdd} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
          <Plus className="w-5 h-5" /> Tambah Klien Pertama
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Daftar Klien</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{clients.length} Klien Terdaftar</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" /> Tambah Klien
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-tighter text-[9px] font-black text-slate-400">
            <tr>
              <th className="px-6 py-4">Klien</th>
              <th className="px-6 py-4">Kontak</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{client.name}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase truncate tracking-widest">{client.company || 'Personal'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 mb-0.5 truncate max-w-[200px]">
                  <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                  <p className="text-xs font-medium text-slate-500 truncate">{client.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-slate-300 shrink-0" />
                  <p className="text-[10px] font-bold text-slate-400 font-mono">{client.phone}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                  Aktif
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEdit(client)}
                    className="p-2 text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
                    title="Edit Klien"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-200 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
}

function HistoryView({ documents, setView, setSelectedDoc, onEdit }: any) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mb-8">
          <History className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Belum ada Riwayat</h3>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">Semua dokumen yang Anda terbitkan akan tersimpan otomatis di sini untuk memudahkan pelacakan.</p>
        <button 
          onClick={() => setView('create-doc')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus className="w-5 h-5" /> Buat Dokumen Baru
        </button>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-tighter text-[9px] font-black text-slate-400">
          <tr>
            <th className="px-6 py-4">Dokumen</th>
            <th className="px-6 py-4">Klien</th>
            <th className="px-6 py-4">Tgl. Terbit</th>
            <th className="px-6 py-4">Jatuh Tempo</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {documents.map((doc: any) => (
            <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{doc.docNumber}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{DOCUMENT_LABELS[doc.type as DocumentType]}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{doc.clientInfo?.name}</p>
                <p className="text-[9px] font-black text-slate-300 uppercase truncate tracking-wider">{doc.clientInfo?.company || 'Personal'}</p>
              </td>
              <td className="px-6 py-5">
                <p className="text-[11px] font-medium text-slate-500">{format(doc.date, 'dd/MM/yyyy')}</p>
              </td>
              <td className="px-6 py-5">
                {doc.type === 'INVOICE' && doc.dueDate ? (
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      doc.dueDate < Date.now() ? "bg-red-500 animate-pulse" : "bg-amber-500"
                    )} />
                    <p className={cn(
                      "text-[11px] font-black",
                      doc.dueDate < Date.now() ? "text-red-500" : "text-amber-600"
                    )}>
                      {format(doc.dueDate, 'dd/MM/yyyy')}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-300 font-bold italic">-</p>
                )}
              </td>
              <td className="px-6 py-5">
                <p className="font-black text-indigo-600 text-sm whitespace-nowrap">{formatCurrency(doc.total)}</p>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEdit(doc)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                    title="Edit Dokumen"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setSelectedDoc(doc)}
                    className="px-3 py-1.5 bg-white border border-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm"
                  >
                    Preview
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


