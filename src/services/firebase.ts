import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import { Member, Transaction, PlotProject, ReminderLog } from '../types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS, INITIAL_PLOT_PROJECT } from '../data/initialData';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore targeting the project database
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by skill instructions
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_test_connection_', 'ping'));
    console.log('[Firestore] Connected successfully to live database:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline or establishing connection.');
      return false;
    }
    // Document might not exist, but network reachability is confirmed if no offline error
    return true;
  }
}

// Initial connection test invocation
testFirestoreConnection();

// Collection References
const MEMBERS_COL = 'members';
const TRANSACTIONS_COL = 'transactions';
const PROJECT_COL = 'project';
const PROJECT_DOC_ID = 'aristo_plot_main';
const REMINDERS_COL = 'reminders';

/**
 * Seeds initial data into Firestore if collections are empty on first boot.
 * Ensures the 11 syndicate members, March-October transaction records, and project settings exist in cloud.
 */
export async function initializeFirestoreDataIfEmpty(): Promise<void> {
  try {
    const membersSnap = await getDocs(collection(db, MEMBERS_COL));
    if (membersSnap.empty) {
      console.log('[Firestore] Empty database detected. Seeding initial syndicate records...');
      const batch = writeBatch(db);

      // Seed Project
      const projectRef = doc(db, PROJECT_COL, PROJECT_DOC_ID);
      batch.set(projectRef, INITIAL_PLOT_PROJECT);

      // Seed Members
      INITIAL_MEMBERS.forEach((member) => {
        const memRef = doc(db, MEMBERS_COL, member.id);
        batch.set(memRef, {
          ...member,
          approvalStatus: member.approvalStatus || 'approved'
        });
      });

      // Seed Initial Transactions
      INITIAL_TRANSACTIONS.forEach((tx) => {
        const txRef = doc(db, TRANSACTIONS_COL, tx.id);
        batch.set(txRef, tx);
      });

      await batch.commit();
      console.log('[Firestore] Initial syndicate data successfully seeded to cloud database.');
    } else {
      // Ensure project doc exists
      const projSnap = await getDoc(doc(db, PROJECT_COL, PROJECT_DOC_ID));
      if (!projSnap.exists()) {
        await setDoc(doc(db, PROJECT_COL, PROJECT_DOC_ID), INITIAL_PLOT_PROJECT);
      }
    }
  } catch (error) {
    console.error('[Firestore] Error initializing data:', error);
  }
}

/**
 * Real-time listener for Members collection.
 */
export function subscribeToMembers(onUpdate: (members: Member[]) => void): Unsubscribe {
  const membersRef = collection(db, MEMBERS_COL);
  return onSnapshot(membersRef, (snapshot) => {
    if (!snapshot.empty) {
      const items: Member[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Member);
      });
      // Sort members predictably by ID (m1, m2, ..., m11)
      items.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.id.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });
      onUpdate(items);
    }
  }, (err) => {
    console.error('[Firestore] Error listening to members:', err);
  });
}

/**
 * Real-time listener for Transactions collection.
 */
export function subscribeToTransactions(onUpdate: (txs: Transaction[]) => void): Unsubscribe {
  const txsRef = collection(db, TRANSACTIONS_COL);
  return onSnapshot(txsRef, (snapshot) => {
    const items: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as Transaction);
    });
    // Sort transactions by date descending
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(items);
  }, (err) => {
    console.error('[Firestore] Error listening to transactions:', err);
  });
}

/**
 * Real-time listener for Project configuration document.
 */
export function subscribeToProject(onUpdate: (proj: PlotProject) => void): Unsubscribe {
  const projRef = doc(db, PROJECT_COL, PROJECT_DOC_ID);
  return onSnapshot(projRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as PlotProject);
    }
  }, (err) => {
    console.error('[Firestore] Error listening to project:', err);
  });
}

/**
 * Real-time listener for Reminders collection.
 */
export function subscribeToReminders(onUpdate: (reminders: ReminderLog[]) => void): Unsubscribe {
  const remRef = collection(db, REMINDERS_COL);
  return onSnapshot(remRef, (snapshot) => {
    const items: ReminderLog[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as ReminderLog);
    });
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    onUpdate(items);
  }, (err) => {
    console.error('[Firestore] Error listening to reminders:', err);
  });
}

/**
 * Recursively removes all `undefined` properties so Firestore setDoc never throws.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return {};
  }
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    console.warn('[Firestore] Failed to sanitize object with JSON stringify, fallback object cleanup:', e);
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }
}

/**
 * Write / update a Member document in Firestore.
 */
export async function saveMemberToCloud(member: Member): Promise<void> {
  const ref = doc(db, MEMBERS_COL, member.id);
  await setDoc(ref, sanitizeForFirestore(member), { merge: true });
}

/**
 * Write / update a Transaction document in Firestore.
 */
export async function saveTransactionToCloud(tx: Transaction): Promise<void> {
  const ref = doc(db, TRANSACTIONS_COL, tx.id);
  await setDoc(ref, sanitizeForFirestore(tx), { merge: true });
}

/**
 * Delete a Transaction document from Firestore.
 */
export async function deleteTransactionFromCloud(txId: string): Promise<void> {
  const ref = doc(db, TRANSACTIONS_COL, txId);
  await deleteDoc(ref);
}

/**
 * Write / update the Project configuration document in Firestore.
 */
export async function saveProjectToCloud(project: PlotProject): Promise<void> {
  const ref = doc(db, PROJECT_COL, PROJECT_DOC_ID);
  await setDoc(ref, sanitizeForFirestore(project), { merge: true });
}

/**
 * Write a ReminderLog document to Firestore.
 */
export async function saveReminderToCloud(reminder: ReminderLog): Promise<void> {
  const ref = doc(db, REMINDERS_COL, reminder.id);
  await setDoc(ref, sanitizeForFirestore(reminder), { merge: true });
}
