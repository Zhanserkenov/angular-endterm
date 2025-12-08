import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectivityService } from '../services/connectivity.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-banner.html',
  styleUrls: ['./offline-banner.css']
})
export class OfflineBannerComponent {
  online$: Observable<boolean>;

  constructor(connectivityService: ConnectivityService) {
    this.online$ = connectivityService.online$;
  }
}




