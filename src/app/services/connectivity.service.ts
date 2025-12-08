import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private onlineSubject = new BehaviorSubject<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  online$: Observable<boolean> = this.onlineSubject.asObservable();

  constructor() {
    const online$ = fromEvent(window, 'online').pipe(startWith(null));
    const offline$ = fromEvent(window, 'offline').pipe(startWith(null));

    merge(online$, offline$).subscribe(() => {
      this.onlineSubject.next(navigator.onLine);
    });
  }
}




