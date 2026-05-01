export type DocumentType = 
  | 'QUOTATION' 
  | 'INVOICE' 
  | 'WORK_ORDER' 
  | 'DELIVERY_ORDER' 
  | 'PACKING_LIST' 
  | 'PURCHASE_ORDER' 
  | 'SALES_ORDER'
  | 'CONTRACT'
  | 'MEMO'
  | 'RECEIPT'
  | 'MOU'
  | 'NDA'
  | 'PROPOSAL'
  | 'SOW';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  createdAt: number;
}

export interface DocumentItem {
  id: string;
  description: string;
  specifications?: string;
  quantity: number;
  unit: string; // pcs, meter, roll, etc
  price: number;
  total: number;
}

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  ownerName?: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  docNumber: string;
  date: number;
  dueDate?: number;
  clientId: string;
  clientInfo?: Client; // Populated for preview
  items: DocumentItem[];
  sections?: DocumentSection[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  opening?: string;
  closing?: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  createdBy: string;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  QUOTATION: 'Penawaran Harga (Quotation)',
  INVOICE: 'Tagihan (Invoice)',
  WORK_ORDER: 'Surat Perintah Kerja (SPK)',
  DELIVERY_ORDER: 'Surat Jalan (DO)',
  PACKING_LIST: 'Packing List',
  PURCHASE_ORDER: 'Purchase Order (PO)',
  SALES_ORDER: 'Sales Order (SO)',
  CONTRACT: 'Kontrak Kerjasama',
  MEMO: 'Memo Internal',
  RECEIPT: 'Kwitansi (Receipt)',
  MOU: 'Memorandum of Understanding (MoU)',
  NDA: 'Non-Disclosure Agreement (NDA)',
  PROPOSAL: 'Proposal Project',
  SOW: 'Scope of Work (SOW)',
};
