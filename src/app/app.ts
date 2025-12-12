import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationError, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { OfflineBannerComponent } from './offline-banner/offline-banner';
import { Subscription } from 'rxjs';
import { ConnectivityService } from './services/connectivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, OfflineBannerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSub?: Subscription;
  private onlineSub?: Subscription;

  constructor(private router: Router, private connectivity: ConnectivityService) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationError) {
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        const alreadyOfflinePage = event.url?.startsWith('/offline');

        if (isOffline && !alreadyOfflinePage) {
          // If navigation fails while offline (e.g., page not cached), route to offline fallback.
          this.router.navigateByUrl('/offline');
        }
      }
    });

    // When back online, if we're on the offline page, take user home.
    this.onlineSub = this.connectivity.online$.subscribe((isOnline) => {
      const isOfflinePage = this.router.url.startsWith('/offline');
      if (isOnline && isOfflinePage) {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.onlineSub?.unsubscribe();
  }
}
