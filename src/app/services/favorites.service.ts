import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';
import { Firestore, doc, docData, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';

const LOCAL_FAVORITES_KEY = 'favorites_guest_ids';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<number[]>(this.loadLocalFavorites());
  favorites$ = this.favoritesSubject.asObservable();

  private currentUser: User | null = null;
  private hasMergedLocalToRemote = false;

  private mergeInfoSubject = new BehaviorSubject<boolean>(false);
  mergeInfo$ = this.mergeInfoSubject.asObservable();

  private authService = inject(AuthService);
  private firestore = inject(Firestore);

  constructor() {
    this.authService.currentUser$.subscribe(async (user) => {
      const previousUser = this.currentUser;
      this.currentUser = user;

      if (user) {
        if (!this.hasMergedLocalToRemote || !previousUser) {
          await this.mergeLocalWithRemote(user.uid);
        }
        this.loadRemoteFavorites(user.uid);
      } else {
        this.favoritesSubject.next(this.loadLocalFavorites());
        this.hasMergedLocalToRemote = false;
      }
    });
  }

  isFavorite(itemId: number): Observable<boolean> {
    return this.favorites$.pipe(map((ids) => ids.includes(itemId)));
  }

  async toggleFavorite(itemId: number): Promise<void> {
    const current = this.favoritesSubject.getValue();
    const exists = current.includes(itemId);
    const updated = exists ? current.filter((id) => id !== itemId) : [...current, itemId];

    if (this.currentUser?.uid) {
      await this.saveRemoteFavorites(this.currentUser.uid, updated);
      this.favoritesSubject.next(updated);
    } else {
      this.saveLocalFavorites(updated);
      this.favoritesSubject.next(updated);
    }
  }

  private loadLocalFavorites(): number[] {
    try {
      const raw = localStorage.getItem(LOCAL_FAVORITES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((v) => Number(v)).filter((v) => !isNaN(v))
        : [];
    } catch {
      return [];
    }
  }

  private saveLocalFavorites(ids: number[]): void {
    try {
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(ids));
    } catch {}
  }

  private loadRemoteFavorites(uid: string): void {
    const ref = doc(this.firestore, 'users', uid);

    docData(ref)
      .pipe(
        map((data: any) => {
          const ids = (data?.favorites as number[]) ?? [];
          return Array.isArray(ids)
            ? ids.map((v) => Number(v)).filter((v) => !isNaN(v))
            : [];
        })
      )
      .subscribe({
        next: (ids) => this.favoritesSubject.next(ids),
        error: () => {
        }
      });
  }

  private async saveRemoteFavorites(uid: string, ids: number[]): Promise<void> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { favorites: ids });
      } else {
        await setDoc(ref, { favorites: ids }, { merge: true });
      }
    } catch (err) {
      console.warn('Failed to save favorites to Firestore', err);
      this.saveLocalFavorites(ids);
    }
  }

  private async mergeLocalWithRemote(uid: string): Promise<void> {
    const localIds = this.loadLocalFavorites();
    if (!localIds.length) return;

    try {
      const ref = doc(this.firestore, 'users', uid);
      const remoteSnap = await getDoc(ref);
      let remoteIds: number[] = [];
      if (remoteSnap.exists()) {
        const data: any = remoteSnap.data();
        remoteIds = Array.isArray(data?.favorites)
          ? (data.favorites as number[]).map((v) => Number(v)).filter((v) => !isNaN(v))
          : [];
      }

      const merged = Array.from(new Set([...remoteIds, ...localIds]));
      await this.saveRemoteFavorites(uid, merged);
      this.hasMergedLocalToRemote = true;
      this.mergeInfoSubject.next(true);

      this.saveLocalFavorites([]);
    } catch (err) {
      console.warn('Failed to merge favorites, keeping local list', err);
      this.favoritesSubject.next(localIds);
    }
  }
}
