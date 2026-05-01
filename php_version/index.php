<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Dokumen Konveksi - PHP Version</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- PDF Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <!-- Date Formatting -->
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        [x-cloak] { display: none !important; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

        @media print {
            .no-print { display: none !important; }
            body { background: white; padding: 0; margin: 0; }
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen" x-data="app()" x-init="initData()" x-cloak>

    <!-- Desktop Sidebar -->
    <div class="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-40 no-print">
        <div class="p-6 border-b border-slate-100 flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i data-lucide="layers" class="w-6 h-6"></i>
            </div>
            <div>
                <h1 class="font-black text-sm tracking-tighter text-slate-800 leading-none">DOKUMEN</h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Konveksi Pro</p>
            </div>
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <button @click="view = 'dashboard'" :class="view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">
                <i data-lucide="layout-grid" class="w-4 h-4"></i>
                Dashboard
            </button>
            <button @click="startNewDoc()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-wider">
                <i data-lucide="plus-circle" class="w-4 h-4 text-indigo-500"></i>
                Buat Dokumen
            </button>
            <div class="h-px bg-slate-100 my-4"></div>
            <button @click="view = 'clients'" :class="view === 'clients' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">
                <i data-lucide="users" class="w-4 h-4"></i>
                Klien
            </button>
            <button @click="view = 'settings'" :class="view === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">
                <i data-lucide="settings" class="w-4 h-4"></i>
                Profil Bisnis
            </button>
        </nav>
    </div>

    <!-- Main Content -->
    <main class="lg:ml-64 min-h-screen">
        
        <!-- DASHBOARD VIEW -->
        <template x-if="view === 'dashboard'">
            <div class="p-8 max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h2>
                        <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Kelola Riwayat Dokumen</p>
                    </div>
                    <button @click="startNewDoc()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> Buat Dokumen Baru
                    </button>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <div class="bg-white p-6 rounded-2xl border border-slate-200">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dokumen</p>
                        <h3 class="text-2xl font-black text-slate-800" x-text="documents.length">0</h3>
                   </div>
                   <div class="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
                        <p class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Nilai Invoice</p>
                        <h3 class="text-2xl font-black" x-text="formatCurrency(calculateTotalValue())">Rp 0</h3>
                   </div>
                </div>

                <!-- History Table -->
                <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-slate-50/50 border-b border-slate-100">
                                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe & Nomor</th>
                                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Klien</th>
                                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                <th class="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th class="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <template x-for="doc in documents" :key="doc.id">
                                <tr class="hover:bg-slate-50/50 transition-colors group cursor-pointer" @click="editDoc(doc)">
                                    <td class="px-6 py-4">
                                        <span class="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter" x-text="doc.type"></span>
                                        <p class="text-xs font-black text-slate-800 mt-1" x-text="'#' + doc.doc_number"></p>
                                    </td>
                                    <td class="px-6 py-4">
                                        <p class="text-xs font-bold text-slate-700" x-text="doc.client_name"></p>
                                        <p class="text-[10px] text-slate-400 uppercase font-bold" x-text="doc.client_company"></p>
                                    </td>
                                    <td class="px-6 py-4">
                                        <p class="text-xs font-bold text-slate-500" x-text="doc.date"></p>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <p class="text-xs font-black text-slate-900" x-text="formatCurrency(doc.total)"></p>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button @click.stop="deleteDoc(doc.id)" class="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>

        <!-- DOC FORM VIEW (Editor) -->
        <template x-if="view === 'form'">
            <div class="flex flex-col h-screen overflow-hidden">
                <!-- Toolbar -->
                <div class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10 no-print">
                    <div class="flex items-center gap-4">
                        <button @click="view = 'dashboard'" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                            <i data-lucide="arrow-left" class="w-5 h-5"></i>
                        </button>
                        <div>
                            <h2 class="text-lg font-black text-slate-800 tracking-tight">Editor Dokumen</h2>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Draft #{form.docNumber}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="saveDocument()" class="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all">
                            <i data-lucide="save" class="w-4 h-4"></i> Simpan
                        </button>
                        <button @click="exportToPDF()" class="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                            <i data-lucide="download" class="w-4 h-4"></i> PDF
                        </button>
                    </div>
                </div>

                <!-- Editor Body -->
                <div class="flex-1 flex overflow-hidden bg-slate-200/30">
                    <!-- Form Section -->
                    <div class="w-2/5 h-full overflow-y-auto p-10 bg-white border-r border-slate-200 custom-scrollbar shadow-inner shadow-slate-100">
                        <div class="max-w-xl mx-auto space-y-12">
                            
                            <!-- Basic Header Info -->
                            <div class="grid grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Dokumen</label>
                                    <select x-model="form.type" @change="updateTemplates()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                                        <template x-for="(label, type) in DOCUMENT_LABELS" :key="type">
                                            <option :value="type" x-text="label"></option>
                                        </template>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Dokumen</label>
                                    <input type="text" x-model="form.docNumber" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-indigo-500/20 outline-none">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</label>
                                    <input type="date" x-model="form.date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none">
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jatuh Tempo (Opsional)</label>
                                    <input type="date" x-model="form.dueDate" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none">
                                </div>
                            </div>

                            <!-- Client Selector -->
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Pilih Klien</label>
                                    <button @click="showAddClient = true" class="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">+ Tambah Baru</button>
                                </div>
                                <select x-model="form.clientId" @change="updateClientInfo()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none">
                                    <option value="">- Pilih Klien -</option>
                                    <template x-for="client in clients" :key="client.id">
                                        <option :value="client.id" x-text="client.name + (client.company ? ' (' + client.company + ')' : '')"></option>
                                    </template>
                                </select>
                            </div>

                            <!-- Line Items -->
                            <div class="space-y-6 pt-6 border-t border-slate-100">
                                <div class="flex justify-between items-center">
                                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Rincian Pekerjaan / Produksi</h3>
                                    <button @click="addItem()" class="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                        <i data-lucide="plus" class="w-3 h-3"></i> Tambah Item
                                    </button>
                                </div>
                                <div class="space-y-5">
                                    <template x-for="(item, index) in form.items" :key="item.id">
                                        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group space-y-4">
                                            <button @click="removeItem(index)" class="absolute -top-2 -right-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                                                <i data-lucide="x" class="w-3 h-3"></i>
                                            </button>
                                            <div class="space-y-4">
                                                <textarea x-model="item.description" rows="2" placeholder="Nama Layanan / Produk (Contoh: Produksi Kaos Polo Sablon)" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"></textarea>
                                                <div class="grid grid-cols-3 gap-3">
                                                    <div class="space-y-1">
                                                        <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jumlah</label>
                                                        <div class="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
                                                            <input type="number" x-model.number="item.quantity" @input="calculateTotals()" class="w-full text-xs font-black bg-transparent outline-none">
                                                            <select x-model="item.unit" class="bg-transparent text-[8px] font-black uppercase tracking-widest text-slate-400 outline-none">
                                                                <option value="pcs">pcs</option>
                                                                <option value="lusin">lusin</option>
                                                                <option value="kg">kg</option>
                                                                <option value="meter">m</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="space-y-1 col-span-2">
                                                        <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Harga Satuan</label>
                                                        <div class="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
                                                            <span class="text-[10px] font-bold text-slate-400 mr-1">Rp</span>
                                                            <input type="number" x-model.number="item.price" @input="calculateTotals()" class="w-full text-xs font-mono font-bold bg-transparent outline-none">
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea x-model="item.specifications" rows="2" placeholder="Spesifikasi Tambahan (Opsional)..." class="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- Narrative Sections (If Contract/NDA) -->
                            <div x-show="isNarrativeType()" class="space-y-6 pt-6 border-t border-slate-100">
                                <div class="flex justify-between items-center">
                                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest">Pasal-Pasal / Narasi</h3>
                                    <button @click="addSection()" class="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100">
                                        <i data-lucide="plus" class="w-3 h-3"></i> Tambah Pasal
                                    </button>
                                </div>
                                <div class="space-y-4">
                                    <template x-for="(section, index) in form.sections" :key="section.id">
                                        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative group space-y-3">
                                            <button @click="removeSection(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                            <input type="text" x-model="section.title" placeholder="Judul Pasal (Contoh: Pasal 1: ...)" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black font-serif italic outline-none">
                                            <textarea x-model="section.content" rows="4" placeholder="Uraian isi pasal..." class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs leading-loose outline-none"></textarea>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- Totals -->
                            <div class="bg-indigo-600/5 p-8 rounded-3xl border-2 border-indigo-600/10 space-y-6">
                                <div class="flex justify-between items-center text-xs font-bold text-slate-500">
                                    <span class="uppercase tracking-widest">Subtotal</span>
                                    <span class="font-mono text-slate-700" x-text="formatCurrency(form.subtotal)"></span>
                                </div>
                                <div class="grid grid-cols-2 gap-6">
                                    <div class="space-y-1">
                                        <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">PPN (%)</label>
                                        <input type="number" x-model.number="form.taxPercent" @input="calculateTotals()" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black outline-none">
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Diskon (Nominal)</label>
                                        <input type="number" x-model.number="form.discount" @input="calculateTotals()" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black outline-none">
                                    </div>
                                </div>
                                <div class="pt-4 border-t border-indigo-100 flex justify-between items-center">
                                    <span class="text-xs font-black text-slate-900 uppercase tracking-widest">Total Akhir</span>
                                    <span class="text-xl font-black text-indigo-600" x-text="formatCurrency(form.total)"></span>
                                </div>
                            </div>

                            <div class="space-y-8 pt-6">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kalimat Pembuka</label>
                                    <textarea x-model="form.opening" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm leading-relaxed outline-none"></textarea>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ketentuan & Syarat</label>
                                    <textarea x-model="form.terms" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[11px] leading-relaxed outline-none"></textarea>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Preview Section -->
                    <div class="flex-1 h-full overflow-y-auto bg-slate-200/50 flex flex-col items-center custom-scrollbar py-12 px-8">
                        
                        <!-- The Document Paper -->
                        <div id="document-preview" class="bg-white p-14 shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] h-auto text-sm print:shadow-none print:p-0 print:m-0 block relative overflow-visible">
                            
                            <!-- Header -->
                            <template x-if="isNarrativeType()">
                                <div class="text-center border-b-2 border-slate-900 pb-6 mb-8 print:border-b-4">
                                    <template x-if="profile.logo">
                                        <img :src="profile.logo" class="w-16 h-16 mx-auto mb-4 object-contain">
                                    </template>
                                    <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1" x-text="profile.name"></h1>
                                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]" x-text="profile.address.replace(/\n/g, ' • ')"></p>
                                    <p class="text-[10px] text-slate-500 font-bold" x-text="'Telp: ' + profile.phone + ' • Email: ' + profile.email"></p>
                                </div>
                            </template>
                            <template x-if="!isNarrativeType()">
                                <div class="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                                    <div class="flex items-center gap-4">
                                        <template x-if="profile.logo">
                                            <div class="w-16 h-16 bg-white rounded-xl border border-slate-100 p-1 flex items-center justify-center">
                                                <img :src="profile.logo" class="w-full h-full object-contain">
                                            </div>
                                        </template>
                                        <div>
                                            <h1 class="text-2xl font-black text-slate-900 leading-none mb-1" x-text="DOCUMENT_LABELS[form.type]"></h1>
                                            <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest" x-text="'DOC NO: #' + form.docNumber"></p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <h2 class="text-sm font-black uppercase text-slate-800" x-text="profile.name"></h2>
                                        <p class="text-[10px] text-slate-400 mt-1 max-w-[200px] ml-auto leading-relaxed" x-text="profile.address"></p>
                                        <p class="text-[10px] font-bold text-slate-500 mt-1" x-text="'P: ' + profile.phone"></p>
                                    </div>
                                </div>
                            </template>

                            <!-- Document Meta Header (For Contracts) -->
                            <template x-if="isNarrativeType()">
                                <div class="mb-10 flex justify-between items-end">
                                    <div class="space-y-1">
                                        <h2 class="text-lg font-black text-indigo-600 uppercase tracking-tight" x-text="DOCUMENT_LABELS[form.type]"></h2>
                                        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest" x-text="'NO: ' + form.docNumber"></p>
                                    </div>
                                    <p class="text-xs font-bold text-slate-800" x-text="'Tanggal: ' + form.date"></p>
                                </div>
                            </template>

                            <!-- Addresses -->
                            <div :class="isNarrativeType() ? 'mb-10' : 'grid grid-cols-2 gap-8 mb-8 border-b border-slate-50 pb-8'">
                                <div class="space-y-3">
                                    <h3 class="text-[10px] font-black text-slate-300 uppercase tracking-widest" x-text="isNarrativeType() ? 'Kepada Yth:' : 'Ditujukan Kepada:'"></h3>
                                    <div class="space-y-1">
                                        <p class="text-sm font-black text-indigo-600 underline underline-offset-4 decoration-indigo-100" x-text="selectedClient.name"></p>
                                        <p class="text-[11px] font-black text-slate-700 uppercase" x-text="selectedClient.company"></p>
                                        <p class="text-[11px] text-slate-500 leading-relaxed max-w-[280px]" x-text="selectedClient.address"></p>
                                        <template x-if="isNarrativeType()">
                                            <p class="mt-4 text-slate-800 font-bold text-xs italic">Di Tempat.</p>
                                        </template>
                                    </div>
                                </div>
                                <template x-if="!isNarrativeType()">
                                    <div class="text-right flex flex-col items-end">
                                        <h3 class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Rincian Dokumen:</h3>
                                        <div class="space-y-2 w-48">
                                            <div class="flex justify-between text-[11px] border-b border-slate-50 pb-1">
                                                <span class="text-slate-400 font-bold uppercase">Terbit:</span>
                                                <span class="text-slate-800 font-black" x-text="form.date"></span>
                                            </div>
                                            <template x-if="form.dueDate">
                                                <div class="flex justify-between text-[11px] border-b border-slate-50 pb-1">
                                                    <span class="text-slate-400 font-bold uppercase">Tempo:</span>
                                                    <span class="text-red-500 font-black" x-text="form.dueDate"></span>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </template>
                            </div>

                            <!-- Opening -->
                            <div :class="isNarrativeType() ? 'mb-10 text-justify' : 'mb-8'">
                                <p :class="isNarrativeType() ? 'text-slate-700 leading-loose text-xs' : 'text-slate-600 leading-relaxed text-[11px]'" x-text="form.opening"></p>
                            </div>

                            <!-- Sections (Articles) -->
                            <template x-if="isNarrativeType()">
                                <div class="mb-10 space-y-8">
                                    <template x-for="sec in form.sections" :key="sec.id">
                                        <div class="space-y-3 print:break-inside-avoid">
                                            <h4 class="text-xs font-black text-slate-900 border-b border-slate-100 pb-1 font-serif italic" x-text="sec.title"></h4>
                                            <p class="text-slate-700 leading-loose text-xs text-justify whitespace-pre-line" x-text="sec.content"></p>
                                        </div>
                                    </template>
                                </div>
                            </template>

                            <!-- Items Table -->
                            <template x-if="form.items.length > 0">
                                <div :class="isNarrativeType() ? 'mb-12' : 'flex-grow border border-slate-100 rounded-3xl p-6 mb-10 bg-slate-50/20'">
                                    <table class="w-full border-collapse">
                                        <thead>
                                            <tr class="border-b border-slate-200 text-left text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                <th class="pb-3 text-slate-400">Diskripsi Layanan / Produk</th>
                                                <th class="pb-3 text-center text-slate-400">Jml</th>
                                                <template x-if="!isNarrativeType()">
                                                    <th class="pb-3 text-right text-slate-400">Harga</th>
                                                </template>
                                                <template x-if="!isNarrativeType()">
                                                    <th class="pb-3 text-right text-slate-400">Total</th>
                                                </template>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100">
                                            <template x-for="item in form.items" :key="item.id">
                                                <tr class="text-slate-700">
                                                    <td class="py-4 align-top max-w-[280px]">
                                                        <p class="font-black text-xs text-slate-900 leading-snug" x-text="item.description"></p>
                                                        <template x-if="item.specifications">
                                                            <div class="mt-2 bg-white/80 p-2.5 rounded-xl border border-slate-100">
                                                                <span class="text-[8px] font-black text-indigo-400 uppercase block mb-1">Spec:</span>
                                                                <p class="text-[10px] text-slate-500 leading-relaxed whitespace-pre-line" x-text="item.specifications"></p>
                                                            </div>
                                                        </template>
                                                    </td>
                                                    <td class="py-4 text-center align-top font-mono text-[11px] text-slate-500">
                                                        <span x-text="item.quantity"></span> <span class="text-[8px] font-bold font-sans uppercase" x-text="item.unit"></span>
                                                    </td>
                                                    <template x-if="!isNarrativeType()">
                                                        <td class="py-4 text-right align-top font-mono text-[11px] text-slate-500" x-text="formatCurrency(item.price)"></td>
                                                    </template>
                                                    <template x-if="!isNarrativeType()">
                                                        <td class="py-4 text-right align-top font-black text-[11px] text-slate-900" x-text="formatCurrency(item.price * item.quantity)"></td>
                                                    </template>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                            </template>

                            <!-- Summary & Notes -->
                            <template x-if="!isNarrativeType()">
                                <div class="grid grid-cols-2 gap-10 pt-8 border-t border-slate-100 mb-12">
                                    <div class="space-y-6">
                                        <template x-if="form.notes">
                                            <div>
                                                <h4 class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Catatan:</h4>
                                                <p class="text-slate-500 italic text-[10px] leading-relaxed" x-text="form.notes"></p>
                                            </div>
                                        </template>
                                        <template x-if="form.terms">
                                            <div>
                                                <h4 class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">S&K:</h4>
                                                <p class="text-slate-400 text-[9px] leading-relaxed" x-text="form.terms"></p>
                                            </div>
                                        </template>
                                    </div>
                                    <div class="bg-slate-50/50 p-6 rounded-3xl space-y-3">
                                        <div class="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                            <span class="uppercase tracking-tighter">Subtotal</span>
                                            <span class="font-mono text-slate-600" x-text="formatCurrency(form.subtotal)"></span>
                                        </div>
                                        <template x-if="form.taxAmount > 0">
                                            <div class="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                <span class="uppercase tracking-tighter" x-text="'Pajak (' + form.taxPercent + '%)'"></span>
                                                <span class="font-mono text-slate-600" x-text="formatCurrency(form.taxAmount)"></span>
                                            </div>
                                        </template>
                                        <template x-if="form.discount > 0">
                                            <div class="flex justify-between items-center text-[10px] font-bold text-red-300">
                                                <span class="uppercase tracking-tighter">Diskon</span>
                                                <span class="font-mono" x-text="'-' + formatCurrency(form.discount)"></span>
                                            </div>
                                        </template>
                                        <div class="pt-4 border-t border-slate-200 mt-2 flex justify-between items-center">
                                            <span class="text-xs font-black uppercase text-slate-900 tracking-widest">Total Akhir</span>
                                            <span class="text-xl font-black text-indigo-600 tracking-tighter" x-text="formatCurrency(form.total)"></span>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <!-- Signatures -->
                            <div class="mt-12 space-y-16 print:break-inside-avoid">
                                <div class="flex justify-between items-start">
                                    <div class="w-56 text-left">
                                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest" x-text="isNarrativeType() ? 'PIHAK PERTAMA' : 'Penerima'"></span>
                                        <div class="h-24"></div>
                                        <div class="border-t border-slate-200 pt-2">
                                            <p class="text-xs font-black text-slate-800 underline underline-offset-8 decoration-slate-200" x-text="selectedClient.name"></p>
                                            <p class="text-[10px] font-bold text-slate-400 uppercase mt-1" x-text="selectedClient.company"></p>
                                        </div>
                                    </div>
                                    <div class="w-56 text-right">
                                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest" x-text="isNarrativeType() ? 'PIHAK KEDUA' : 'Hormat Kami'"></span>
                                        <div class="h-24"></div>
                                        <div class="border-t border-slate-200 pt-2">
                                            <p class="text-xs font-black text-indigo-600 uppercase tracking-tighter" x-text="profile.owner_name"></p>
                                            <p class="text-[10px] font-bold text-slate-400 uppercase mt-1" x-text="profile.name"></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- SETTINGS VIEW (Business Profile) -->
        <template x-if="view === 'settings'">
            <div class="p-10 max-w-2xl mx-auto">
                <div class="mb-10">
                    <h2 class="text-3xl font-black text-slate-800 tracking-tight">Profil Bisnis</h2>
                    <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Sesuaikan Identitas Perusahaan Anda</p>
                </div>

                <div class="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
                    <div class="flex flex-col items-center pb-8 border-b border-slate-50">
                        <div class="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative group cursor-pointer" @click="$refs.logoInput.click()">
                            <template x-if="profile.logo">
                                <img :src="profile.logo" class="w-full h-full object-contain">
                            </template>
                            <template x-if="!profile.logo">
                                <i data-lucide="image" class="w-8 h-8 mb-1"></i>
                                <span class="text-[8px] font-black uppercase tracking-widest">Logo</span>
                            </template>
                            <input type="file" x-ref="logoInput" class="hidden" @change="handleLogoUpload($event)">
                        </div>
                        <p class="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Klik untuk unggah logo baru</p>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Bisnis</label>
                            <input type="text" x-model="profile.name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Pemilik</label>
                            <input type="text" x-model="profile.owner_name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Lengkap</label>
                        <textarea x-model="profile.address" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Telepon</label>
                            <input type="text" x-model="profile.phone" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Bisnis</label>
                            <input type="email" x-model="profile.email" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                        </div>
                    </div>

                    <button @click="saveProfile()" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-[0.98]">
                        Simpan Perubahan Profil
                    </button>
                </div>
            </div>
        </template>

        <!-- CLIENTS VIEW -->
        <template x-if="view === 'clients'">
            <div class="p-10 max-w-5xl mx-auto">
                 <div class="flex justify-between items-end mb-10">
                    <div>
                        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Manajemen Klien</h2>
                        <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Hubungi & Kelola Pelanggan Anda</p>
                    </div>
                    <button @click="showAddClient = true" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
                        <i data-lucide="user-plus" class="w-4 h-4"></i> Tambah Klien
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <template x-for="client in clients" :key="client.id">
                        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 font-black text-lg" x-text="client.name[0]"></div>
                                <div>
                                    <h4 class="text-sm font-black text-slate-800 tracking-tight" x-text="client.name"></h4>
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3" x-text="client.company || 'Pribadi'"></p>
                                    <div class="space-y-1.5">
                                        <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <i data-lucide="phone" class="w-3 h-3"></i> <span x-text="client.phone"></span>
                                        </div>
                                        <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <i data-lucide="mail" class="w-3 h-3"></i> <span x-text="client.email"></span>
                                        </div>
                                        <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 line-clamp-1 mt-1 italic">
                                            <i data-lucide="map-pin" class="w-3 h-3"></i> <span x-text="client.address"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>

    </main>

    <!-- ADD CLIENT MODAL -->
    <div x-show="showAddClient" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" x-transition>
        <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8" @click.away="showAddClient = false">
            <h3 class="text-xl font-black text-slate-800 mb-6 tracking-tight uppercase">Tambah Klien Baru</h3>
            <div class="space-y-5">
                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                    <input type="text" x-model="newClient.name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perusahaan / Brand</label>
                    <input type="text" x-model="newClient.company" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat</label>
                    <textarea x-model="newClient.address" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Telp</label>
                        <input type="text" x-model="newClient.phone" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                        <input type="email" x-model="newClient.email" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none">
                    </div>
                </div>
                <div class="flex gap-4 pt-4">
                    <button @click="showAddClient = false" class="flex-1 bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl hover:bg-slate-100 transition-all">Batal</button>
                    <button @click="saveClient()" class="flex-1 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Simpan Klien</button>
                </div>
            </div>
        </div>
    </div>

    <!-- APP LOGIC -->
    <script>
        const DOCUMENT_LABELS = {
            QUOTATION: 'Penawaran Harga',
            INVOICE: 'Faktur (Invoice)',
            RECEIPT: 'Kwitansi',
            PURCHASE_ORDER: 'Purchase Order',
            SURAT_JALAN: 'Surat Jalan',
            CONTRACT: 'Kontrak Kerjasama',
            MOU: 'Memorandum of Understanding',
            NDA: 'Non-Disclosure Agreement',
            PROPOSAL: 'Proposal Project',
            MEMO: 'Memo Bisnis',
            SOW: 'Statement of Work'
        };

        const DOCUMENT_TEMPLATES = {
            QUOTATION: {
                opening: 'Berdasarkan hasil diskusi sebelumnya mengenai kebutuhan produksi Anda, berikut kami lampirkan penawaran harga untuk layanan konveksi kami. Kami berkomitmen memberikan kualitas terbaik dengan ketepatan waktu yang terjamin.',
                closing: 'Penawaran ini berlaku selama 14 hari kalender sejak tanggal diterbitkan. Kami sangat menantikan konfirmasi Anda untuk melanjutkan ke tahap produksi.',
            },
            CONTRACT: {
                opening: 'Perjanjian Kerjasama Produksi ini dibuat dan ditandatangani pada hari ini oleh dan antara Pihak Pertama dan Pihak Kedua, yang selanjutnya setuju untuk mengikatkan diri dalam kerjasama dengan ketentuan sebagai berikut:',
                closing: 'Demikian perjanjian ini dibuat dalam rangkap dua, bermaterai cukup dan memiliki kekuatan hukum yang sama untuk masing-masing pihak.',
            }
        };

        function app() {
            return {
                view: 'dashboard',
                documents: [],
                clients: [],
                profile: {},
                showAddClient: false,
                selectedClient: {},
                DOCUMENT_LABELS: DOCUMENT_LABELS,
                newClient: { name: '', company: '', address: '', phone: '', email: '' },
                form: {
                    id: '',
                    type: 'QUOTATION',
                    docNumber: '',
                    date: new Date().toISOString().split('T')[0],
                    dueDate: '',
                    clientId: '',
                    opening: '',
                    closing: '',
                    notes: '',
                    terms: 'Pembayaran dilakukan 50% di awal dan 50% setelah barang selesai.',
                    items: [],
                    sections: [],
                    subtotal: 0,
                    taxPercent: 0,
                    taxAmount: 0,
                    discount: 0,
                    total: 0
                },

                async initData() {
                    const profileRes = await fetch('api.php?action=get_profile');
                    this.profile = await profileRes.json();
                    
                    const clientsRes = await fetch('api.php?action=get_clients');
                    this.clients = await clientsRes.json();

                    this.loadDocuments();
                    
                    setTimeout(() => lucide.createIcons(), 100);
                },

                async loadDocuments() {
                    const res = await fetch('api.php?action=get_documents');
                    this.documents = await res.json();
                    setTimeout(() => lucide.createIcons(), 100);
                },

                isNarrativeType() {
                    return ['CONTRACT', 'MOU', 'NDA', 'PROPOSAL', 'MEMO', 'SOW'].includes(this.form.type);
                },

                startNewDoc() {
                    const today = new Date();
                    const num = today.getFullYear().toString().slice(-2) + (today.getMonth()+1).toString().padStart(2, '0') + Math.floor(Math.random()*1000).toString().padStart(3, '0');
                    
                    this.form = {
                        id: 'doc_' + Date.now(),
                        type: 'QUOTATION',
                        docNumber: num,
                        date: today.toISOString().split('T')[0],
                        dueDate: '',
                        clientId: '',
                        opening: DOCUMENT_TEMPLATES.QUOTATION.opening,
                        closing: DOCUMENT_TEMPLATES.QUOTATION.closing,
                        notes: '',
                        terms: 'Pembayaran dilakukan 50% di awal dan 50% setelah barang selesai.',
                        items: [],
                        sections: [],
                        subtotal: 0,
                        taxPercent: 0,
                        taxAmount: 0,
                        discount: 0,
                        total: 0
                    };
                    this.view = 'form';
                    setTimeout(() => lucide.createIcons(), 100);
                },

                async editDoc(doc) {
                    const res = await fetch('api.php?action=get_document&id=' + doc.id);
                    const fullDoc = await res.json();
                    
                    this.form = {
                        id: fullDoc.id,
                        type: fullDoc.type,
                        docNumber: fullDoc.doc_number,
                        date: fullDoc.date,
                        dueDate: fullDoc.due_date,
                        clientId: fullDoc.client_id,
                        opening: fullDoc.opening,
                        closing: fullDoc.closing,
                        notes: fullDoc.notes,
                        terms: fullDoc.terms,
                        items: fullDoc.items,
                        sections: fullDoc.sections || [],
                        subtotal: parseFloat(fullDoc.subtotal),
                        taxPercent: 0, // Simplified for this version
                        taxAmount: parseFloat(fullDoc.tax),
                        discount: parseFloat(fullDoc.discount),
                        total: parseFloat(fullDoc.total)
                    };
                    
                    this.updateClientInfo();
                    this.view = 'form';
                    setTimeout(() => lucide.createIcons(), 100);
                },

                updateTemplates() {
                    const template = DOCUMENT_TEMPLATES[this.form.type] || { opening: '', closing: '' };
                    this.form.opening = template.opening;
                    this.form.closing = template.closing;
                    
                    if (this.isNarrativeType() && this.form.sections.length === 0) {
                        this.addSection();
                    }
                },

                updateClientInfo() {
                    this.selectedClient = this.clients.find(c => c.id == this.form.clientId) || {};
                },

                addItem() {
                    this.form.items.push({
                        id: 'item_' + Date.now(),
                        description: '',
                        specifications: '',
                        quantity: 1,
                        unit: 'pcs',
                        price: 0,
                        total: 0
                    });
                    setTimeout(() => lucide.createIcons(), 100);
                },

                removeItem(index) {
                    this.form.items.splice(index, 1);
                    this.calculateTotals();
                },

                addSection() {
                    this.form.sections.push({
                        id: 'sec_' + Date.now(),
                        title: 'Pasal ' + (this.form.sections.length + 1) + ': ',
                        content: ''
                    });
                },

                removeSection(index) {
                    this.form.sections.splice(index, 1);
                },

                calculateTotals() {
                    this.form.subtotal = this.form.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                    this.form.taxAmount = (this.form.subtotal * (this.form.taxPercent / 100));
                    this.form.total = this.form.subtotal + this.form.taxAmount - (this.form.discount || 0);
                },

                async saveDocument() {
                    this.calculateTotals();
                    const res = await fetch('api.php?action=save_document', {
                        method: 'POST',
                        body: JSON.stringify(this.form)
                    });
                    const result = await res.json();
                    if (result.success) {
                        alert('Dokumen berhasil disimpan!');
                        this.loadDocuments();
                        this.view = 'dashboard';
                    }
                },

                async deleteDoc(id) {
                    if (!confirm('Hapus dokumen ini?')) return;
                    await fetch('api.php?action=delete_document&id=' + id);
                    this.loadDocuments();
                },

                async saveClient() {
                    const res = await fetch('api.php?action=add_client', {
                        method: 'POST',
                        body: JSON.stringify(this.newClient)
                    });
                    const result = await res.json();
                    if (result.success) {
                        this.newClient = { name: '', company: '', address: '', phone: '', email: '' };
                        this.showAddClient = false;
                        await this.initData();
                    }
                },

                async saveProfile() {
                    const res = await fetch('api.php?action=update_profile', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: this.profile.name,
                            ownerName: this.profile.owner_name,
                            address: this.profile.address,
                            phone: this.profile.phone,
                            email: this.profile.email,
                            logo: this.profile.logo
                        })
                    });
                    alert('Profil berhasil diperbarui!');
                },

                handleLogoUpload(e) {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.profile.logo = e.target.result;
                    };
                    reader.readAsDataURL(file);
                },

                formatCurrency(val) {
                    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
                },

                calculateTotalValue() {
                    return this.documents.reduce((sum, d) => sum + parseFloat(d.total), 0);
                },

                async exportToPDF() {
                    const element = document.getElementById('document-preview');
                    const { jsPDF } = window.jspdf;
                    
                    try {
                        const canvas = await html2canvas(element, {
                            scale: 2,
                            useCORS: true,
                            windowWidth: 794
                        });
                        
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = pdf.internal.pageSize.getHeight();
                        const imgWidth = canvas.width;
                        const imgHeight = canvas.height;
                        const ratio = pdfWidth / imgWidth;
                        const canvasPageHeight = pdfHeight / ratio;
                        
                        let heightLeft = imgHeight;
                        let position = 0;

                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight * ratio);
                        heightLeft -= canvasPageHeight;

                        while (heightLeft > 0) {
                            position = heightLeft - imgHeight;
                            pdf.addPage();
                            pdf.addImage(imgData, 'PNG', 0, position * ratio, pdfWidth, imgHeight * ratio);
                            heightLeft -= canvasPageHeight;
                        }
                        
                        pdf.save(`${this.form.docNumber}_${this.selectedClient.name}.pdf`);
                    } catch (error) {
                        console.error('PDF Export Error:', error);
                        alert('Gagal mengekspor PDF');
                    }
                }
            }
        }
    </script>
</body>
</html>
