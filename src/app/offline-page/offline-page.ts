import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConnectivityService } from '../services/connectivity.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-offline-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offline-page.html',
  styleUrls: ['./offline-page.css']
})
export class OfflinePageComponent {
  online$: Observable<boolean>;

  constructor(connectivityService: ConnectivityService) {
    this.online$ = connectivityService.online$;
  }

  retry(): void {
    location.reload();
  }
}


