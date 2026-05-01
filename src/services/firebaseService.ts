import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Client, BusinessDocument } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Clients
  subscribeClients: (callback: (clients: Client[]) => void) => {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const clients = snapshot.docs.map(doc => ({ ...doc.data() as Client, id: doc.id }));
        callback(clients);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'clients')
    );
  },

  addClient: async (client: Client) => {
    try {
      await setDoc(doc(db, 'clients', client.id), client);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `clients/${client.id}`);
    }
  },

  // Documents
  subscribeDocuments: (callback: (docs: BusinessDocument[]) => void) => {
    const q = query(collection(db, 'documents'), orderBy('date', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ ...doc.data() as BusinessDocument, id: doc.id }));
        callback(docs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'documents')
    );
  },

  addDocument: async (document: BusinessDocument) => {
    try {
      await setDoc(doc(db, 'documents', document.id), document);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `documents/${document.id}`);
    }
  },

  // Business Profile
  getBusinessProfile: async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as any : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `profiles/${userId}`);
    }
  },

  updateBusinessProfile: async (userId: string, profile: any) => {
    try {
      await setDoc(doc(db, 'profiles', userId), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `profiles/${userId}`);
    }
  }
};
