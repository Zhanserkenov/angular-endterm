import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private onlineSubject = new BehaviorSubject<boolean>(true);
  online$: Observable<boolean> = this.onlineSubject.asObservable();

  constructor() {
    const onlineEvent$ = fromEvent(window, 'online').pipe(map(() => true));
    const offlineEvent$ = fromEvent(window, 'offline').pipe(map(() => false));

    const checkOnline = (): Observable<boolean> => {
      if (!navigator.onLine) return of(false);

      const timestamp = Date.now();
      return from(
        fetch(`https://httpbin.org/status/200?t=${timestamp}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
          .then(res => res.ok)
          .catch(() => false)
      ).pipe(catchError(() => of(false)));
    };

    merge(
      of(navigator.onLine),
      onlineEvent$,
      offlineEvent$
    ).pipe(
      switchMap(() => checkOnline())
    ).subscribe(isOnline => this.onlineSubject.next(isOnline));
  }
}
