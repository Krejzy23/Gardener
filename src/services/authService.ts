import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function sendResetPasswordEmail(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function signOutCurrentUser() {
  return signOut(auth);
}
