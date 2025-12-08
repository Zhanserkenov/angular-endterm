import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { Observable, Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ProfileService, UserProfile } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  profile: UserProfile = {};
  uploading = false;
  errorMsg = '';

  private destroy$ = new Subject<void>();
  private worker?: Worker;

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
            this.profile = profile || {};
          });
      } else {
        this.profile = {};
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.worker) {
      this.worker.terminate();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Please select an image file (.jpg or .png)';
      return;
    }

    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      this.errorMsg = 'Only .jpg and .png files are allowed';
      return;
    }

    this.uploading = true;
    this.errorMsg = '';

    try {
      const user = await firstValueFrom(this.currentUser$);
      if (!user?.uid) {
        this.errorMsg = 'You must be logged in to upload a photo';
        this.uploading = false;
        return;
      }

      const compressedDataUrl = await this.compressImage(file);
      await this.profileService.upsertProfile(user.uid, { photoData: compressedDataUrl });
      this.profile.photoData = compressedDataUrl;
      this.errorMsg = '';
    } catch (err: any) {
      this.errorMsg = err?.message || 'Failed to upload photo';
    } finally {
      this.uploading = false;
      input.value = '';
    }
  }

  private async compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof Worker !== 'undefined') {
        this.worker = new Worker(
          new URL('../workers/image-compress.worker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = ({ data }) => {
          if (data.success) {
            resolve(data.dataUrl);
          } else {
            reject(new Error(data.error || 'Compression failed'));
          }
          this.worker?.terminate();
          this.worker = undefined;
        };

        this.worker.onerror = (err) => {
          reject(new Error('Worker error: ' + err.message));
          this.worker?.terminate();
          this.worker = undefined;
        };

        this.worker.postMessage({ file, quality: 0.6, maxWidth: 512, maxHeight: 512 });
      } else {
        reject(new Error('Web Workers are not supported in this browser'));
      }
    });
  }
}
