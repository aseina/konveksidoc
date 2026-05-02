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
  
  const bizName = profile?.name || "KABUL KONVEKSI TAS";
  const bizAddress = profile?.address || "Jl. Industri Kreatif No. 123\nBandung, Jawa Barat";
  const bizPhone = profile?.phone || "0812-3456-7890";

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[210mm] mx-auto print:m-0">
      <div 
        id="document-preview" 
        className="bg-white p-12 md:p-[20mm] shadow-2xl w-full min-h-[297mm] h-auto font-sans text-sm print:shadow-none print:m-0 block relative overflow-visible border-t-[12px] border-black transition-all"
      >
        {/* Letter Header (for Narrative) or Standard Header */}
      {isNarrative ? (
        <div className="text-center border-b-2 border-black pb-8 mb-10">
          {profile?.logo && (
            <img src={profile.logo} alt={bizName} className="w-24 h-24 mx-auto mb-4 object-contain grayscale" />
          )}
          <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-1">{bizName}</h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">{bizAddress.replace(/\n/g, ' • ')}</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-500 font-bold uppercase">
            <span>Telp: {bizPhone}</span>
            <span className="text-gray-300">|</span>
            <span>Email: {profile?.email}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-black pb-8 mb-8 gap-6 overflow-visible">
          <div className="flex items-start gap-4 max-w-full sm:max-w-[65%] overflow-visible">
            {profile?.logo && (
              <div className="w-20 h-20 bg-white overflow-visible border-2 border-black flex items-center justify-center p-1 shrink-0">
                <img src={profile.logo} alt={bizName} className="w-full h-full object-contain grayscale" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-black text-black leading-none tracking-tighter uppercase">
                {template?.title || DOCUMENT_LABELS[doc.type]}
              </h1>
              <div className="mt-3 inline-block px-3 py-1 border-2 border-black font-black text-xs tracking-widest uppercase">
                #{doc.docNumber}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto min-w-0 flex-1">
            <h2 className="text-sm font-black tracking-tight uppercase break-words text-black">{bizName}</h2>
            <p className="text-[10px] text-gray-600 mt-1 max-w-[240px] sm:ml-auto leading-relaxed break-words font-bold">
              {bizAddress.replace(/\n/g, ', ')}
            </p>
            <p className="mt-2 text-[10px] font-black text-black uppercase tracking-wider">
              WHATSAPP: {bizPhone}
            </p>
          </div>
        </div>
      )}

      {/* Narrative Specific Meta (Date & Subj) */}
      {isNarrative && (
        <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-black uppercase tracking-tight">{template?.title}</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">NO: {doc.docNumber}</p>
          </div>
          <p className="text-xs font-black text-black uppercase">Tanggal: {format(doc.date, 'dd MMMM yyyy')}</p>
        </div>
      )}

      {/* Info Sections */}
      <div className={cn("print:break-inside-avoid", isNarrative ? "mb-10" : "grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8")}>
        <div className="min-w-0">
          <h3 className="text-black uppercase text-[10px] font-black tracking-widest mb-3 border-b-2 border-black w-fit pb-1.5">
            {isNarrative ? "KEPADA YTH:" : 
             doc.type === 'INVOICE' ? "TUJUAN PENAGIHAN:" : 
             "DITUJUKAN KEPADA:"}
          </h3>
          <div className="text-black break-words border-l-4 border-black pl-4 py-2">
            <p className="text-sm font-black break-words uppercase">{doc.clientInfo?.name}</p>
            {doc.clientInfo?.company && <p className="text-gray-600 font-bold text-[9px] uppercase mt-1 tracking-widest break-words">{doc.clientInfo?.company}</p>}
            <p className="text-black mt-2 text-[10px] font-medium leading-relaxed max-w-[280px] break-words uppercase">{doc.clientInfo?.address}</p>
            {isNarrative && (
              <p className="mt-4 text-black font-black text-xs italic">Di Tempat.</p>
            )}
          </div>
        </div>
        {!isNarrative && (
          <div className="flex flex-col justify-start sm:items-end min-w-0">
            <h3 className="text-black uppercase text-[10px] font-black tracking-widest mb-3 sm:text-right border-b-2 border-black w-fit sm:ml-auto pb-1.5">RINCIAN DOKUMEN:</h3>
            <div className="space-y-1.5 w-full sm:w-52 border-2 border-black p-4 font-bold">
              <div className="flex justify-between gap-4 text-[10px] border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 uppercase text-[8px] tracking-widest">TERBIT</span>
                <span className="text-black tracking-tight">{format(doc.date, 'dd/MM/yyyy')}</span>
              </div>
              {doc.type === 'INVOICE' && doc.paymentType && (
                <div className="flex justify-between gap-4 text-[10px] border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase text-[8px] tracking-widest">STATUS</span>
                  <span className="text-black">
                    {doc.paymentType === 'FULL' ? 'PELUNASAN' : 'DP %'}
                  </span>
                </div>
              )}
              {doc.type === 'INVOICE' && doc.dueDate && (
                <div className="flex justify-between gap-4 text-[10px]">
                  <span className="text-gray-500 uppercase text-[8px] tracking-widest">TEMPO</span>
                  <span className="text-black tracking-tight">
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
            isNarrative ? "text-black leading-loose text-xs" : "text-black leading-relaxed text-[11px]"
          )}>
            {doc.opening || template?.opening}
          </p>
        </div>
      )}

      {/* Narrative Sections (Pasal-Pasal) */}
      {isNarrative && doc.sections && doc.sections.length > 0 && (
        <div className="mb-10 space-y-8">
          {doc.sections.map((section) => (
            <div key={section.id} className="space-y-3 print:break-inside-avoid">
              <h4 className="text-xs font-black text-black border-b-2 border-black pb-1 uppercase tracking-widest">{section.title}</h4>
              <p className="text-black leading-loose text-xs text-justify whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table Section */}
      {doc.items.length > 0 && (
        <div className={cn("mb-10 overflow-hidden border-2 border-black print:overflow-visible")}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-left text-[10px] uppercase tracking-[0.2em] font-black text-white">
                <th className="py-4 px-4 border-r border-gray-700">DESKRIPSI PESANAN</th>
                <th className="py-4 px-2 text-center border-r border-gray-700">QTY</th>
                {!isNarrative && <th className="py-4 px-2 text-right border-r border-gray-700">HARGA</th>}
                {!isNarrative && <th className="py-4 px-4 text-right">TOTAL</th>}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black bg-white">
              {doc.items.map((item) => (
                <tr key={item.id} className="text-black break-inside-avoid-page page-break-inside-avoid print:break-inside-avoid">
                  <td className="py-4 px-4 align-top max-w-[240px] border-r border-black">
                    <p className="font-black text-xs uppercase leading-snug break-words">{item.description}</p>
                    {item.specifications && (
                      <p className="text-[10px] text-gray-700 mt-2 leading-relaxed border-t border-gray-200 pt-2 whitespace-pre-line break-words font-medium">
                        {item.specifications}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center align-top border-r border-black font-mono text-[11px] font-black">
                    {item.quantity} <span className="text-[9px] uppercase font-sans">{item.unit}</span>
                  </td>
                  {!isNarrative && (
                    <td className="py-4 px-2 text-right align-top border-r border-black font-mono text-black text-[11px] font-bold">
                      {formatCurrency(item.price)}
                    </td>
                  )}
                  {!isNarrative && (
                    <td className="py-4 px-4 text-right align-top font-black text-black text-[11px] tracking-tight">
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
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-black items-start mb-4 print-break-inside-avoid">
          <div className="space-y-6">
            {doc.notes && (
              <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-black mb-2 border-b-2 border-black w-fit pb-1.5">CATATAN:</h4>
                <p className="text-black font-medium text-[10px] leading-relaxed break-words">{doc.notes}</p>
              </div>
            )}
            {doc.terms && (
              <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-black mb-2 border-b-2 border-black w-fit pb-1.5">SYARAT & KETENTUAN:</h4>
                <p className="text-gray-700 text-[9px] leading-relaxed break-words">{doc.terms}</p>
              </div>
            )}
          </div>
          <div className="bg-white border-4 border-black p-6 space-y-3">
            <div className="flex justify-between text-black items-center text-[10px] font-black uppercase tracking-widest">
              <span>SUBTOTAL</span>
              <span className="font-mono tabular-nums text-xs">{formatCurrency(doc.subtotal)}</span>
            </div>
            {doc.tax > 0 && (
              <div className="flex justify-between text-black items-center text-[10px] font-black uppercase tracking-widest">
                <span>PAJAK (PPN)</span>
                <span className="font-mono tabular-nums text-xs">{formatCurrency(doc.tax)}</span>
              </div>
            )}
            {doc.discount > 0 && (
              <div className="flex justify-between text-black items-center text-[10px] font-black uppercase tracking-widest">
                <span>DISKON</span>
                <span className="font-mono tabular-nums text-xs">-{formatCurrency(doc.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t-4 border-black mt-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-black">TOTAL PROJECT</span>
              <span className="text-2xl font-black text-black tabular-nums tracking-tighter">{formatCurrency(doc.total)}</span>
            </div>
            {doc.type === 'INVOICE' && doc.paymentType === 'DP' && doc.dpAmount !== undefined && (
              <div className="mt-4 p-4 border-2 border-black flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-black font-black uppercase tracking-widest text-[10px]">UANG MUKA (DP {doc.dpPercentage}%)</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter italic">Tagihan saat ini</span>
                </div>
                <span className="text-xl font-black text-black tabular-nums">{formatCurrency(doc.dpAmount)}</span>
              </div>
            )}
            {doc.type === 'INVOICE' && (doc.amountPaid !== undefined || doc.outstandingBalance !== undefined) && (
              <div className="mt-4 space-y-2 p-3 border border-gray-200">
                {doc.amountPaid !== undefined && doc.amountPaid > 0 && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 font-black uppercase tracking-widest">TELAH DIBAYAR</span>
                    <span className="text-black font-black tabular-nums">{formatCurrency(doc.amountPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[11px] pt-2 border-t border-black">
                  <span className="text-black font-black uppercase tracking-widest">SISA TAGIHAN</span>
                  <span className="text-black font-black tabular-nums text-sm">{formatCurrency(doc.outstandingBalance || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bank Account Info */}
      {profile?.bankAccounts && profile.bankAccounts.length > 0 && (
        <div className="mb-10 p-6 border-2 border-black print-break-inside-avoid bg-white">
          <h4 className="text-[9px] uppercase font-black tracking-[0.2em] text-black mb-6 flex items-center gap-2">
            INFORMASI PEMBAYARAN:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {profile.bankAccounts.map((bank, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] font-black text-black uppercase tracking-widest">{bank.bankName}</p>
                <p className="text-lg font-black text-black font-mono tracking-tighter whitespace-nowrap">{bank.accountNumber}</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase italic leading-none">a.n {bank.accountHolder}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing Statement & Signatures */}
      <div className="mt-12 print:break-inside-avoid break-inside-avoid page-break-inside-avoid">
        {(doc.closing || template?.closing) && (
          <div className={cn("mb-12", isNarrative ? "text-justify" : "")}>
            <p className={cn(
              "text-black font-medium leading-loose break-words",
              isNarrative ? "text-xs" : "text-[11px]"
            )}>
              {doc.closing || template?.closing}
            </p>
          </div>
        )}

        <div className="flex justify-between pt-10">
          <div className="space-y-12 shrink-0">
            <div className="text-left space-y-20">
              <div className="min-w-[220px]">
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{isNarrative ? "PIHAK PERTAMA (KESATU)" : "PENERIMA / KLIEN"}</span>
                <div className="mt-20 border-t-2 border-black w-full" />
                <p className="mt-3 text-sm font-black text-black uppercase tracking-tight">{doc.clientInfo?.name}</p>
                {isNarrative && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{doc.clientInfo?.company}</p>}
              </div>
            </div>
          </div>
          <div className="space-y-12 shrink-0">
            <div className="text-right space-y-20">
              <div className="min-w-[220px]">
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{isNarrative ? "PIHAK KEDUA" : "HORMAT KAMI,"}</span>
                <div className="mt-20 border-t-2 border-black w-full" />
                <p className="mt-3 text-sm font-black text-black uppercase tracking-tight">
                  {profile?.ownerName || bizName}
                </p>
                {isNarrative && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{bizName}</p>}
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
      </div>
    );
  };
