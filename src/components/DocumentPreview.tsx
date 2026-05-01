import React from 'react';
import { BusinessDocument, DOCUMENT_LABELS, BusinessProfile } from '../types';
import { DOCUMENT_TEMPLATES } from '../constants';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

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
    <div id="document-preview" className="bg-white p-10 md:p-14 shadow-xl mx-auto w-full max-w-[210mm] min-h-[297mm] h-auto font-sans text-sm print:shadow-none print:p-0 print:m-0 block relative overflow-visible">
      {/* Letter Header (for Narrative) or Standard Header */}
      {isNarrative ? (
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 print:border-b-4">
          {profile?.logo && (
            <img src={profile.logo} alt={bizName} className="w-16 h-16 mx-auto mb-4 object-contain" />
          )}
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{bizName}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{bizAddress.replace(/\n/g, ' • ')}</p>
          <p className="text-[10px] text-slate-500 font-bold">Telp: {bizPhone} • Email: {profile?.email}</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3 max-w-full sm:max-w-[65%]">
            {profile?.logo && (
              <div className="w-14 h-14 bg-white rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center p-1 shrink-0">
                <img src={profile.logo} alt={bizName} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 leading-tight truncate">
                {template?.title || DOCUMENT_LABELS[doc.type]}
              </h1>
              <p className="text-slate-400 mt-0.5 uppercase tracking-wider font-bold text-[9px]">DOC NO. #{doc.docNumber}</p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto min-w-0 flex-1">
            <h2 className="text-sm font-black tracking-tight uppercase truncate text-slate-800">{bizName}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-[220px] sm:ml-auto leading-relaxed break-words line-clamp-2">
              {bizAddress.replace(/\n/g, ', ')}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Telp: {bizPhone}</p>
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
      <div className={isNarrative ? "mb-10" : "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 border-b border-slate-50 pb-6"}>
        <div className="min-w-0">
          <h3 className="text-slate-300 uppercase text-[9px] font-black tracking-widest mb-1.5">{isNarrative ? "Kepada Yth:" : "Ditujukan Kepada:"}</h3>
          <div className="text-slate-900 break-words">
            <p className="text-sm font-bold truncate text-indigo-600 underline decoration-indigo-200 underline-offset-4">{doc.clientInfo?.name}</p>
            {doc.clientInfo?.company && <p className="text-slate-700 font-bold text-[10px] uppercase mt-1">{doc.clientInfo?.company}</p>}
            <p className="text-slate-500 mt-1 text-[10px] leading-relaxed max-w-[280px]">{doc.clientInfo?.address}</p>
            {isNarrative && (
              <p className="mt-4 text-slate-800 font-bold text-xs italic">Di Tempat.</p>
            )}
          </div>
        </div>
        {!isNarrative && (
          <div className="flex flex-col justify-start sm:items-end min-w-0 mt-4 sm:mt-0">
            <h3 className="text-slate-300 uppercase text-[9px] font-black tracking-widest mb-1.5 sm:text-right">Rincian Dokumen:</h3>
            <div className="space-y-1 w-full sm:w-44">
              <div className="flex justify-between gap-4 text-[10px] border-b border-slate-50 pb-1">
                <span className="text-slate-400 font-bold uppercase text-[8px]">Tgl. Terbit:</span>
                <span className="text-slate-800 font-bold">{format(doc.date, 'dd/MM/yyyy')}</span>
              </div>
              {doc.dueDate && (
                <div className="flex justify-between gap-4 text-[10px] border-b border-slate-50 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[8px]">Jatuh Tempo:</span>
                  <span className="text-red-500 font-bold">{format(doc.dueDate, 'dd/MM/yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Opening Paragraph */}
      {(doc.opening || template?.opening) && (
        <div className={isNarrative ? "mb-8 text-justify" : "mb-6"}>
          <p className={isNarrative ? "text-slate-700 leading-loose text-xs" : "text-slate-600 leading-relaxed text-[11px] break-words line-clamp-3"}>
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
          "mb-10 print:break-inside-avoid",
          !isNarrative && "border border-slate-100 rounded-2xl p-4 mb-8 bg-slate-50/20"
        )}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[9px] uppercase tracking-widest font-black text-slate-400">
                <th className="py-2 px-1">Deskripsi Layanan / Produk</th>
                <th className="py-2 text-center">Jumlah</th>
                {!isNarrative && <th className="py-2 text-right">Harga</th>}
                {!isNarrative && <th className="py-2 text-right">Total</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {doc.items.map((item) => (
                <tr key={item.id} className="text-slate-700">
                  <td className="py-3 px-1 align-top max-w-[240px]">
                    <p className="font-bold text-xs text-slate-900 leading-snug break-words">{item.description}</p>
                    {item.specifications && (
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed bg-white/80 p-1.5 rounded border border-slate-100/50 whitespace-pre-line break-words">
                        <span className="font-black text-[8px] uppercase tracking-tighter block mb-0.5">Spec:</span>
                        {item.specifications}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-center align-top text-slate-500 font-mono text-[11px]">
                    {item.quantity} <span className="text-[9px] uppercase font-sans font-black">{item.unit}</span>
                  </td>
                  {!isNarrative && (
                    <td className="py-3 text-right align-top font-mono text-slate-500 text-[11px]">
                      {formatCurrency(item.price)}
                    </td>
                  )}
                  {!isNarrative && (
                    <td className="py-3 text-right align-top font-black text-slate-900 text-[11px]">
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
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 items-start mb-8">
          <div className="space-y-4">
            {doc.notes && (
              <div>
                <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-300 mb-1">Catatan:</h4>
                <p className="text-slate-600 italic text-[10px] leading-relaxed line-clamp-3">{doc.notes}</p>
              </div>
            )}
            {doc.terms && (
              <div>
                <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-300 mb-1">T&C:</h4>
                <p className="text-slate-500 text-[9px] leading-relaxed line-clamp-3">{doc.terms}</p>
              </div>
            )}
          </div>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-400 items-center text-[10px] font-bold">
              <span className="uppercase tracking-tighter">Subtotal</span>
              <span className="font-mono">{formatCurrency(doc.subtotal)}</span>
            </div>
            {doc.tax > 0 && (
              <div className="flex justify-between text-slate-400 items-center text-[10px] font-bold">
                <span className="uppercase tracking-tighter">Pajak (PPN)</span>
                <span className="font-mono">{formatCurrency(doc.tax)}</span>
              </div>
            )}
            {doc.discount > 0 && (
              <div className="flex justify-between text-red-400 items-center text-[10px] font-bold">
                <span className="uppercase tracking-tighter">Diskon</span>
                <span className="font-mono">-{formatCurrency(doc.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Total Akhir</span>
              <span className="text-lg font-black text-slate-900">{formatCurrency(doc.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Closing Statement & Signatures */}
      <div className="mt-4 space-y-12 print:break-inside-avoid">
        {(doc.closing || template?.closing) && (
          <div className={isNarrative ? "mb-12 text-justify" : "mb-0"}>
            <p className={isNarrative ? "text-slate-700 leading-loose text-xs" : "text-slate-600 leading-relaxed text-[11px] break-words"}>
              {doc.closing || template?.closing}
            </p>
          </div>
        )}

        <div className="flex justify-between pt-8">
          <div className="space-y-12 shrink-0">
            <div className="text-left space-y-16">
              <div className="border-t border-slate-200 pt-2 min-w-[180px]">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-300">{isNarrative ? "PIHAK PERTAMA" : "Penerima"}</span>
                <p className="mt-2 text-xs font-bold text-slate-800 underline underline-offset-4 decoration-slate-200">{doc.clientInfo?.name}</p>
                {isNarrative && <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.clientInfo?.company}</p>}
              </div>
            </div>
          </div>
          <div className="space-y-12 shrink-0">
            <div className="text-right space-y-16">
              <div className="border-t border-slate-200 pt-2 min-w-[180px]">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-300">{isNarrative ? "PIHAK KEDUA" : "Hormat Kami"}</span>
                <p className="mt-2 text-xs font-black text-indigo-600 uppercase tracking-tight">
                  {profile?.ownerName || bizName}
                </p>
                {isNarrative && <p className="text-[10px] text-slate-400 font-bold uppercase">{bizName}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
