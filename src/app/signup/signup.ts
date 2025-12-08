import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  private readonly passwordMinLength = 8;
  private readonly passwordDigitRegex = /\d/;
  private readonly passwordSpecialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-]/;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < this.passwordMinLength) {
      this.errorMessage = `Password must be at least ${this.passwordMinLength} characters long.`;
      return;
    }

    if (!this.passwordDigitRegex.test(this.password)) {
      this.errorMessage = 'Password must contain at least one digit.';
      return;
    }

    if (!this.passwordSpecialCharRegex.test(this.password)) {
      this.errorMessage = 'Password must contain at least one special character (e.g. ! @ # $ %).';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.signup(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error;
      }
    });
  }
}



