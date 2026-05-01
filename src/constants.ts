import { DocumentType } from "./types";

export const DOCUMENT_TEMPLATES: Record<DocumentType, { title: string; prefix: string; opening?: string; closing?: string }> = {
  QUOTATION: { 
    title: "PENAWARAN HARGA", 
    prefix: "QTN",
    opening: "Bersama ini kami sampaikan penawaran harga untuk kebutuhan konveksi Anda sesuai dengan rincian berikut. Kami berkomitmen memberikan kualitas terbaik dengan harga yang kompetitif.",
    closing: "Besar harapan kami penawaran ini dapat memenuhi ekspektasi Anda. Jika ada hal yang ingin didiskusikan lebih lanjut, jangan ragu untuk menghubungi kami."
  },
  INVOICE: { 
    title: "TAGIHAN", 
    prefix: "INV",
    opening: "Berikut adalah tagihan atas pesanan konveksi yang telah kami proses/selesaikan. Mohon dilakukan pembayaran sesuai dengan detail di bawah ini.",
    closing: "Terima kasih atas kepercayaan Anda menggunakan jasa konveksi kami. Kami nantikan kerja sama berikutnya."
  },
  WORK_ORDER: { 
    title: "SURAT PERINTAH KERJA", 
    prefix: "SPK",
    opening: "Surat ini berfungsi sebagai instruksi resmi untuk memulai proses produksi sesuai dengan spesifikasi teknis dan timeline yang telah disepakati.",
    closing: "Mohon tim produksi menjalankan instruksi sesuai spesifikasi di atas guna menjaga standar kualitas yang telah ditentukan."
  },
  DELIVERY_ORDER: { 
    title: "SURAT JALAN", 
    prefix: "SJ",
    opening: "Dokumen ini menyertai pengiriman barang pesanan Anda dengan rincian sebagai berikut. Mohon dilakukan pemeriksaan saat barang diterima.",
    closing: "Harap ttd/stempel dokumen ini sebagai bukti serah terima barang yang sah."
  },
  PACKING_LIST: { 
    title: "PACKING LIST", 
    prefix: "PL",
    opening: "Daftar rincian pengemasan barang untuk memastikan kesesuaian antara isi paket dengan pesanan Anda.",
    closing: "Semua barang telah melalui pengecekan akhir sebelum pengemasan."
  },
  PURCHASE_ORDER: { 
    title: "PURCHASE ORDER", 
    prefix: "PO",
    opening: "Kami bermaksud memesan barang/bahan dengan rincian di bawah ini untuk mendukung operasional produksi kami.",
    closing: "Mohon konfirmasi kesediaan barang dan estimasi waktu pengiriman sesegera mungkin."
  },
  SALES_ORDER: { 
    title: "SALES ORDER", 
    prefix: "SO",
    opening: "Konfirmasi pesanan penjualan yang telah kami terima dan akan segera masuk ke dalam antrean jadwal produksi kami.",
    closing: "Proses produksi akan segera dimulai setelah seluruh persyaratan administrasi terpenuhi."
  },
  CONTRACT: { 
    title: "KONTRAK KERJASAMA", 
    prefix: "KTR",
    opening: "Perjanjian ini dibuat untuk mengikat kerja sama antara kedua belah pihak dalam bidang jasa konveksi dan manufaktur pakaian.",
    closing: "Demikian perjanjian ini dibuat dengan kesadaran penuh demi kelancaran kerja sama jangka panjang."
  },
  MEMO: { 
    title: "MEMO INTERNAL", 
    prefix: "MEMO",
    opening: "Pemberitahuan resmi internal ini disampaikan kepada pihak terkait untuk ditindaklanjuti sebagaimana mestinya.",
    closing: "Harap informasi ini diperhatikan dan dijalankan dengan penuh tanggung jawab."
  },
  RECEIPT: { 
    title: "KWITANSI", 
    prefix: "KWS",
    opening: "Tanda bukti penerimaan sejumlah dana sebagai pembayaran atas layanan konveksi kami.",
    closing: "Pembayaran telah kami terima secara sah. Terima kasih."
  },
  MOU: { 
    title: "MEMORANDUM OF UNDERSTANDING", 
    prefix: "MOU",
    opening: "Nota kesepahaman ini merupakan dasar awal untuk menjajaki sinergi bisnis konveksi antara kedua belah pihak.",
    closing: "Kesepakatan ini akan ditindaklanjuti dengan kontrak kerja sama yang lebih rinci di masa mendatang."
  },
  NDA: { 
    title: "NON-DISCLOSURE AGREEMENT", 
    prefix: "NDA",
    opening: "Pernyataan kerahasiaan untuk melindungi aset desain, pola, dan informasi bisnis lainnya selama proses kerja sama berlangsung.",
    closing: "Pelanggaran terhadap kerahasiaan ini akan diproses sesuai dengan hukum yang berlaku."
  },
  PROPOSAL: { 
    title: "PROPOSAL PROJECT", 
    prefix: "PROP",
    opening: "Pengajuan rencana kerja dan konsep produksi yang kami susun khusus untuk memenuhi visi dan kebutuhan brand/instansi Anda.",
    closing: "Kami sangat antusias untuk mewujudkan project ini bersama Anda."
  },
  SOW: { 
    title: "SCOPE OF WORK", 
    prefix: "SOW",
    opening: "Batasan pekerjaan dan tanggung jawab yang akan dijalankan selama proses produksi konveksi berlangsung.",
    closing: "Penambahan pekerjaan di luar dokumen ini akan didiskusikan kembali sebagai addendum."
  },
};

export const CONVECTION_SERVICES = [
  "Aksesoris Event",
  "Baju Safety",
  "Celana Training",
  "Dasi SD",
  "Dasi SMA",
  "Dasi SMP",
  "Jaket",
  "Jaket Custom",
  "Jaket Komunitas",
  "Jaket Sekolah",
  "Jas",
  "Jas Almamater",
  "Kaos Berkerah",
  "Kaos Training",
  "Polo Shirt",
  "Rompi",
  "Rompi Lapangan",
  "Rompi Safety",
  "Rompi Vest",
  "Seragam Kerja PDH",
  "Seragam Kerja PDL",
  "Seragam Komunitas",
  "Seragam MI",
  "Seragam MTs",
  "Seragam Olahraga",
  "Seragam Olahraga Sekolah",
  "Seragam PAUD",
  "Seragam RA",
  "Seragam SD",
  "Seragam Sekolah (Umum)",
  "Seragam SMA",
  "Seragam SMP",
  "Seragam TK",
  "Setelan Training (Celana + Kaos)",
  "Sweater",
  "Sweatshirt",
  "Tas Blacu",
  "Tas Custom",
  "Tas Diklat",
  "Tas Duffel Bag",
  "Tas Goodie Bag",
  "Tas Goodie Bag Event",
  "Tas Goodie Bag Seminar",
  "Tas Gym",
  "Tas Kanvas",
  "Tas Kerja",
  "Tas Kosmetik",
  "Tas Laptop",
  "Tas Makeup",
  "Tas Merchandise",
  "Tas Pelatihan",
  "Tas Pendingin (Cooler Bag)",
  "Tas Pouch",
  "Tas Promosi",
  "Tas Ransel",
  "Tas Ransel Laptop",
  "Tas Ransel Sekolah",
  "Tas Ransel Travel",
  "Tas Selempang",
  "Tas Selempang Pria",
  "Tas Selempang Wanita",
  "Tas Seminar Kit",
  "Tas Sepatu",
  "Tas Serut (Drawstring Bag)",
  "Tas Spunbond",
  "Tas Totebag",
  "Tas Totebag Custom",
  "Tas Totebag Promosi",
  "Tas Travel",
  "Topi Custom",
  "Topi Kantor Custom",
  "Topi SD",
  "Topi SMA",
  "Topi SMP",
  "Wearpack",
  "Wearpack Safety",
  "Jahit Kaos",
  "Jahit Kemeja",
  "Sablon Plastisol",
  "Sablon DTF",
  "Bordir Komputer",
  "Pembuatan Pola",
  "Potong Bahan",
  "Finishing & Packing",
];

export const UNITS = ["pcs", "meter", "roll", "kg", "set"];
