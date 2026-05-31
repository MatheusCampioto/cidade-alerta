import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { canTransition, STATES } from '../models/occurrenceStateMachine';
import { db } from './firebase';

export async function saveOccurrence(data) {
  try {
    const docRef = await addDoc(collection(db, 'occurrences'), {
      ...data,
      status: STATES.NOVO,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      statusHistory: [
        {
          status: STATES.NOVO,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar:', error);
    throw error;
  }
}

export async function getOccurrences() {
  try {
    const q = query(
      collection(db, 'occurrences'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar:', error);
    throw error;
  }
}

export async function updateOccurrenceStatus(id, currentStatus, newStatus) {
  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(`Transição inválida: ${currentStatus} → ${newStatus}`);
  }
  const ref = doc(db, 'occurrences', id);
  await updateDoc(ref, {
    status: newStatus,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({
      status: newStatus,
      timestamp: new Date().toISOString(),
    }),
  });
}