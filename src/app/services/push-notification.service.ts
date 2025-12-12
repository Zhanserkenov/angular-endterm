import { Injectable, inject } from '@angular/core';
import { Messaging, getToken } from '@angular/fire/messaging';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private messaging = inject(Messaging);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private subscriptionStatus$ = new BehaviorSubject<boolean | null>(null);

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }


  async subscribeToPush(): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user?.uid) {
      throw new Error('You must be authorized to subscribe to notifications');
    }

    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }


      const token = await getToken(this.messaging, {
        vapidKey: 'BAkF2XnpvfvBl5w6-JZNto1P4z5LP9B7q_YviG8qP0eq7H1GD2zUTix3FFTzmxnUJqeSXGsVP9k0FNfjFdeNBeA'
      });

      if (!token) {
        throw new Error('Failed to get token');
      }


      await setDoc(doc(this.firestore, 'users', user.uid), {
        fcmToken: token
      }, { merge: true });

      this.subscriptionStatus$.next(true);

      console.log('FCM Token:', token);
      console.log('Token saved to Firestore for user:', user.uid);
    } catch (error: any) {
      console.error('Subscription error:', error);
      throw error;
    }
  }


  isSubscribed(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return new BehaviorSubject(false).asObservable();
        }

        if (this.subscriptionStatus$.value === null) {
          getDoc(doc(this.firestore, 'users', user.uid)).then((userDoc) => {
            const isSubscribed = userDoc.exists() && !!userDoc.data()?.['fcmToken'];
            this.subscriptionStatus$.next(isSubscribed);
          }).catch(() => {
            this.subscriptionStatus$.next(false);
          });
        }

        return this.subscriptionStatus$.pipe(
          map(status => status ?? false)
        );
      })
    );
  }
}
