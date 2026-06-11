import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
    console.error('Erro ao salvar ocorrência:', error);
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

    return snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    throw error;
  }
}

export async function getOccurrenceById(id) {
  try {
    if (!id) {
      throw new Error('ID da ocorrência não informado.');
    }

    const ref = doc(db, 'occurrences', id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error('Ocorrência não encontrada.');
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error('Erro ao buscar ocorrência por ID:', error);
    throw error;
  }
}

export async function updateOccurrenceStatus(id, currentStatus, newStatus) {
  try {
    if (!id) {
      throw new Error('ID da ocorrência não informado.');
    }

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

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

export async function deleteOccurrence(id) {
  try {
    if (!id) {
      throw new Error('ID da ocorrência não informado.');
    }

    const ref = doc(db, 'occurrences', id);
    await deleteDoc(ref);

    return true;
  } catch (error) {
    console.error('Erro ao excluir ocorrência:', error);
    throw error;
  }
}