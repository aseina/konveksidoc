import React from 'react';
import { BusinessDocument, DOCUMENT_LABELS, BusinessProfile } from '../types';
import { DOCUMENT_TEMPLATES } from '../constants';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';

interface DocumentPreviewProps {
  doc: BusinessDocument;
  profile?: BusinessProfile | null;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc, profile }) => {
  const template = DOCUMENT_TEMPLATES[doc.type];
  const isNarrative = ['CONTRACT', 'MOU', 'NDA', 'PROPOSAL', 'MEMO', 'SOW'].includes(doc.type);
  
  const bizName = profile?.name || "BISNIS KONVEKSI SAYA";
  const bizAddress = profile?.address || "Jl. Industri Kreatif No. 123\nBandung, Jawa Barat";
  const bizPhone = profile?.phone || "0812-3456-7890";

  return (
    <div id="document-preview" className="bg-white p-10 md:p-14 shadow-xl mx-auto w-full max-w-[210mm] min-h-fit md:min-h-[297mm] h-auto font-sans text-sm print:shadow-none print:p-[20mm] print:m-0 block relative overflow-visible border-t-[6px] border-indigo-600">
      {/* Letter Header (for Narrative) or Standard Header */}
      {isNarrative ? (
        <div className="text-center border-b border-slate-200 pb-8 mb-10">
          {profile?.logo && (
            <img src={profile.logo} alt={bizName} className="w-20 h-20 mx-auto mb-6 object-contain" />
          )}
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{bizName}</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">{bizAddress.replace(/\n/g, ' • ')}</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-500 font-medium">
            <span>Telp: {bizPhone}</span>
            <span className="text-slate-200">|</span>
            <span>Email: {profile?.email}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-8 mb-8 gap-6 overflow-visible">
          <div className="flex items-center gap-4 max-w-full sm:max-w-[65%] overflow-visible">
            {profile?.logo && (
              <div className="w-16 h-16 bg-white rounded-xl overflow-visible border border-slate-100 shadow-sm flex items-center justify-center p-2 shrink-0">
                <img src={profile.logo} alt={bizName} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black text-indigo-950 leading-none tracking-tight">
                {template?.title || DOCUMENT_LABELS[doc.type]}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-black tracking-widest uppercase">#{doc.docNumber}</span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto min-w-0 flex-1">
            <h2 className="text-sm font-black tracking-tight uppercase break-words text-slate-900">{bizName}</h2>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] sm:ml-auto leading-relaxed break-words font-medium">
              {bizAddress.replace(/\n/g, ', ')}
            </p>
            <div className="flex items-center sm:justify-end gap-2 mt-2 text-[10px] font-bold text-indigo-600">
              <div className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center">
                <CreditCard className="w-2.5 h-2.5" />
              </div>
              <span>WA: {bizPhone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Narrative Specific Meta (Date & Subj) */}
      {isNarrative && (
        <div className="mb-8 flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-indigo-600 uppercase tracking-tight">{template?.title}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">NO: {doc.docNumber}</p>
          </div>
          <p className="text-xs font-bold text-slate-800">Tanggal: {format(doc.date, 'dd MMMM yyyy')}</p>
        </div>
      )}

      {/* Info Sections */}
      <div className={isNarrative ? "mb-10" : "grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8"}>
        <div className="min-w-0">
          <h3 className="text-indigo-900/30 uppercase text-[9px] font-black tracking-[0.2em] mb-3">
            {isNarrative ? "Kepada Yth:" : 
             doc.type === 'INVOICE' ? "Tujuan Penagihan:" : 
             "Ditujukan Kepada:"}
          </h3>
          <div className="text-slate-900 break-words bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm font-black break-words text-indigo-900">{doc.clientInfo?.name}</p>
            {doc.clientInfo?.company && <p className="text-indigo-600 font-bold text-[9px] uppercase mt-1 tracking-wider break-words">{doc.clientInfo?.company}</p>}
            <p className="text-slate-500 mt-2 text-[10px] font-medium leading-relaxed max-w-[280px] break-words">{doc.clientInfo?.address}</p>
            {isNarrative && (
              <p className="mt-4 text-slate-800 font-bold text-xs italic">Di Tempat.</p>
            )}
          </div>
        </div>
        {!isNarrative && (
          <div className="flex flex-col justify-start sm:items-end min-w-0">
            <h3 className="text-indigo-900/30 uppercase text-[9px] font-black tracking-[0.2em] mb-3 sm:text-right">Rincian Dokumen:</h3>
            <div className="space-y-1.5 w-full sm:w-52 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between gap-4 text-[10px] border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">Terbit</span>
                <span className="text-slate-900 font-black tracking-tight">{format(doc.date, 'dd/MM/yyyy')}</span>
              </div>
              {doc.type === 'INVOICE' && doc.paymentType && (
                <div className="flex justify-between gap-4 text-[10px] border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">Status</span>
                  <span className="font-black text-indigo-600">
                    {doc.paymentType === 'FULL' ? 'PELUNASAN' : 'DP %'}
                  </span>
                </div>
              )}
              {doc.type === 'INVOICE' && doc.dueDate && (
                <div className="flex justify-between gap-4 text-[10px]">
                  <span className="text-slate-400 font-bold uppercase text-[8px] tracking-widest">Tempo</span>
                  <span className={cn(
                    "font-black tracking-tight",
                    doc.dueDate < Date.now() ? "text-red-600" : "text-indigo-900"
                  )}>
                    {format(doc.dueDate, 'dd MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Opening Paragraph */}
      {(doc.opening || template?.opening) && (
        <div className={cn("mb-8 overflow-visible", isNarrative ? "text-justify" : "mb-6")}>
          <p className={cn(
            "break-words py-0.5", 
            isNarrative ? "text-slate-700 leading-loose text-xs" : "text-slate-600 leading-relaxed text-[11px]"
          )}>
            {doc.opening || template?.opening}
          </p>
        </div>
      )}

      {/* Narrative Sections (Pasal-Pasal) */}
      {isNarrative && doc.sections && doc.sections.length > 0 && (
        <div className="mb-10 space-y-6">
          {doc.sections.map((section) => (
            <div key={section.id} className="space-y-2 print:break-inside-avoid">
              <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-1 font-serif italic">{section.title}</h4>
              <p className="text-slate-700 leading-loose text-xs text-justify whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table Section Wrapped in Box */}
      {doc.items.length > 0 && (
        <div className={cn(
          "mb-10 overflow-hidden",
          !isNarrative && "border border-slate-100 rounded-2xl mb-8 bg-slate-50/20 shadow-sm"
        )}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-950 text-left text-[9px] uppercase tracking-[0.2em] font-black text-indigo-200">
                <th className="py-3 px-4">Deskripsi Pesanan</th>
                <th className="py-3 px-2 text-center">Jumlah</th>
                {!isNarrative && <th className="py-3 px-2 text-right">Harga Unit</th>}
                {!isNarrative && <th className="py-3 px-4 text-right">Total</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {doc.items.map((item) => (
                <tr key={item.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 align-top max-w-[240px]">
                    <p className="font-black text-xs text-slate-900 leading-snug break-words">{item.description}</p>
                    {item.specifications && (
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed bg-slate-50/80 p-2 rounded-lg border border-slate-100/50 whitespace-pre-line break-words font-medium">
                        {item.specifications}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center align-top text-slate-600 font-mono text-[11px] font-bold">
                    {item.quantity} <span className="text-[9px] uppercase font-sans font-black text-slate-400">{item.unit}</span>
                  </td>
                  {!isNarrative && (
                    <td className="py-4 px-2 text-right align-top font-mono text-slate-500 text-[11px]">
                      {formatCurrency(item.price)}
                    </td>
                  )}
                  {!isNarrative && (
                    <td className="py-4 px-4 text-right align-top font-black text-slate-900 text-[11px] tracking-tight">
                      {formatCurrency(item.total)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Narrative Spacer */}
      {isNarrative && <div className="h-10" />}

      {/* Totals and Notes */}
      {!isNarrative && (
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 items-start mb-4 print-break-inside-avoid">
          <div className="space-y-4">
            {doc.notes && (
              <div>
                <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-300 mb-1">Catatan:</h4>
                <p className="text-slate-600 italic text-[10px] leading-relaxed break-words">{doc.notes}</p>
              </div>
            )}
            {doc.terms && (
              <div>
                <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-300 mb-1">T&C:</h4>
                <p className="text-slate-500 text-[9px] leading-relaxed break-words">{doc.terms}</p>
              </div>
            )}
          </div>
          <div className="bg-indigo-950 p-6 rounded-2xl space-y-3 shadow-inner">
            <div className="flex justify-between text-indigo-300 items-center text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums text-xs">{formatCurrency(doc.subtotal)}</span>
            </div>
            {doc.tax > 0 && (
              <div className="flex justify-between text-indigo-300 items-center text-[10px] font-black uppercase tracking-widest">
                <span>Pajak (PPN)</span>
                <span className="font-mono tabular-nums text-xs">{formatCurrency(doc.tax)}</span>
              </div>
            )}
            {doc.discount > 0 && (
              <div className="flex justify-between text-red-400 items-center text-[10px] font-black uppercase tracking-widest">
                <span>Diskon</span>
                <span className="font-mono tabular-nums text-xs">-{formatCurrency(doc.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-indigo-900/50 mt-1">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Total Project</span>
              <span className="text-xl font-black text-white tabular-nums tracking-tighter">{formatCurrency(doc.total)}</span>
            </div>
            {doc.type === 'INVOICE' && doc.paymentType === 'DP' && doc.dpAmount !== undefined && (
              <div className="mt-4 space-y-1 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-indigo-400 font-black uppercase tracking-widest text-[9px]">Uang Muka (DP {doc.dpPercentage}%)</span>
                  <span className="text-[7px] text-indigo-300/50 font-bold uppercase tracking-tighter italic">Tagihan saat ini</span>
                </div>
                <span className="text-lg font-black text-white tabular-nums">{formatCurrency(doc.dpAmount)}</span>
              </div>
            )}
            {doc.type === 'INVOICE' && (doc.amountPaid !== undefined || doc.outstandingBalance !== undefined) && (
              <div className="mt-4 space-y-2 p-3 bg-white/5 rounded-xl border border-white/10">
                {doc.amountPaid !== undefined && doc.amountPaid > 0 && (
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-indigo-300/60 font-black uppercase tracking-widest">Telah Dibayar</span>
                    <span className="text-white font-black tabular-nums">{formatCurrency(doc.amountPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[10px] pt-2 border-t border-white/5">
                  <span className="text-indigo-400 font-black uppercase tracking-widest">Sisa Tagihan</span>
                  <span className="text-white font-black tabular-nums text-xs">{formatCurrency(doc.outstandingBalance || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bank Account Info */}
      {profile?.bankAccounts && profile.bankAccounts.length > 0 && (
        <div className="mb-8 p-6 rounded-2xl border border-indigo-50 bg-indigo-50/30 print-break-inside-avoid">
          <h4 className="text-[8px] uppercase font-black tracking-[0.2em] text-indigo-900/40 mb-4 flex items-center gap-2">
            Metode Pembayaran Transfer:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {profile.bankAccounts.map((bank, i) => (
              <div key={i} className="space-y-1 py-1">
                <p className="text-[9px] font-black text-indigo-950 uppercase tracking-wider">{bank.bankName}</p>
                <p className="text-sm font-black text-slate-900 font-mono tracking-tight">{bank.accountNumber}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase italic leading-none">a.n {bank.accountHolder}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing Statement & Signatures */}
      <div className="mt-8 print-break-inside-avoid">
        {(doc.closing || template?.closing) && (
          <div className={cn("mb-8", isNarrative ? "text-justify" : "")}>
            <p className={isNarrative ? "text-slate-700 leading-loose text-xs" : "text-slate-600 leading-relaxed text-[11px] break-words"}>
              {doc.closing || template?.closing}
            </p>
          </div>
        )}

        <div className="flex justify-between pt-8 border-t border-slate-100">
          <div className="space-y-12 shrink-0">
            <div className="text-left space-y-16">
              <div className="min-w-[200px]">
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">{isNarrative ? "PIHAK PERTAMA (KESATU)" : "Penerima / Klien"}</span>
                <div className="mt-14 h-px bg-slate-200 w-full" />
                <p className="mt-2 text-xs font-black text-slate-900">{doc.clientInfo?.name}</p>
                {isNarrative && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{doc.clientInfo?.company}</p>}
              </div>
            </div>
          </div>
          <div className="space-y-12 shrink-0">
            <div className="text-right space-y-16">
              <div className="min-w-[200px]">
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">{isNarrative ? "PIHAK KEDUA" : "Hormat Kami,"}</span>
                <div className="mt-14 h-px bg-indigo-200 w-full" />
                <p className="mt-2 text-xs font-black text-indigo-600 uppercase tracking-tight">
                  {profile?.ownerName || bizName}
                </p>
                {isNarrative && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{bizName}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Revision Marker (Multi-page support via fixed position) */}
      {(doc.revision !== undefined && doc.revision > 0) && (
        <div className="print-revision-footer" data-html2canvas-ignore="true">
          Rev-{doc.revision}
        </div>
      )}
    </div>
  );
};
