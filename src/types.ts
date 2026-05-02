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
  userId?: string; // Added for multi-user support
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

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  ownerName?: string;
  bankAccounts?: BankAccount[];
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

export interface BusinessDocument {
  id: string;
  userId?: string; // Added for multi-user support
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
  revision?: number;
  paymentType?: 'FULL' | 'DP';
  dpAmount?: number;
  dpPercentage?: number;
  amountPaid?: number;
  outstandingBalance?: number;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  QUOTATION: 'Penawaran Harga (Quotation)',
  INVOICE: 'Tagihan / Faktur (Invoice)',
  WORK_ORDER: 'Surat Perintah Kerja (SPK)',
  DELIVERY_ORDER: 'Surat Jalan (DO)',
  PACKING_LIST: 'Daftar Barang (Packing List)',
  PURCHASE_ORDER: 'Pesanan Pembelian (PO)',
  SALES_ORDER: 'Pesanan Penjualan (SO)',
  CONTRACT: 'Kontrak Kerjasama',
  MEMO: 'Memo Internal',
  RECEIPT: 'Kwitansi Pembayaran (Receipt)',
  MOU: 'Nota Kesepahaman (MoU)',
  NDA: 'Perjanjian Non-Disclosure (NDA)',
  PROPOSAL: 'Proposal Proyek',
  SOW: 'Lingkup Kerja (SOW)',
};
