import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '@angular/fire/auth';
import { ProfileService, UserProfile } from '../services/profile.service';
import {AppComponent} from '../app';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  avatarUrl: string | null | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user?.uid) {
        this.profileService
          .getProfile(user.uid)
          .pipe(takeUntil(this.destroy$))
          .subscribe((profile) => {
            this.avatarUrl = profile?.photoData || null;
          });
      } else {
        this.avatarUrl = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}
