import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Household, HouseholdMember, User } from '@/types';
import { generateInviteCode } from '@/utils/invite';
import { v4 as uuid } from 'uuid';

// ─── Household ───

export async function createHousehold(user: User, householdName: string): Promise<Household> {
  const id = uuid();
  const inviteCode = generateInviteCode();
  const member: HouseholdMember = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
  };

  const household: Household = {
    id,
    name: householdName,
    memberIds: [user.uid],
    members: { [user.uid]: member },
    inviteCode,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'households', id), household);
  await setDoc(doc(db, 'inviteCodes', inviteCode), {
    householdId: id,
    createdBy: user.uid,
    used: false,
  });
  await updateDoc(doc(db, 'users', user.uid), { householdId: id });

  return household;
}

export async function joinHouseholdByCode(user: User, code: string): Promise<Household> {
  const codeUpper = code.toUpperCase().trim();
  const codeSnap = await getDoc(doc(db, 'inviteCodes', codeUpper));
  if (!codeSnap.exists()) {
    throw new Error('Invalid invite code');
  }

  const { householdId } = codeSnap.data() as { householdId: string };
  const householdRef = doc(db, 'households', householdId);
  const householdSnap = await getDoc(householdRef);
  if (!householdSnap.exists()) {
    throw new Error('Household not found');
  }

  const household = householdSnap.data() as Household;
  const member: HouseholdMember = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
  };

  const updatedMembers = { ...household.members, [user.uid]: member };
  const updatedMemberIds = [...household.memberIds, user.uid];

  await updateDoc(householdRef, {
    members: updatedMembers,
    memberIds: updatedMemberIds,
  });
  await updateDoc(doc(db, 'users', user.uid), { householdId });

  return { ...household, members: updatedMembers, memberIds: updatedMemberIds };
}

export function subscribeToHousehold(
  householdId: string,
  callback: (household: Household) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'households', householdId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Household);
    }
  });
}

// ─── Generic collection helpers ───

export function subscribeToCollection<T extends { id: string }>(
  path: string,
  callback: (items: T[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, path), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(items);
  });
}

export async function addDocument<T extends DocumentData>(
  path: string,
  id: string,
  data: T
): Promise<void> {
  await setDoc(doc(db, path, id), data);
}

export async function updateDocument(
  path: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, path, id), data);
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  await deleteDoc(doc(db, path, id));
}
