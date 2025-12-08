import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

export interface UserProfile {
  photoData?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private firestore = inject(Firestore);

  getProfile(uid: string): Observable<UserProfile> {
    const ref = doc(this.firestore, 'users', uid);
    return docData(ref).pipe(
      map((data: any) => (data as UserProfile) ?? {})
    );
  }

  async upsertProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, data);
      } else {
        await setDoc(ref, data, { merge: true });
      }
    } catch (err) {
      console.warn('Failed to save profile to Firestore', err);
      throw err;
    }
  }
}


