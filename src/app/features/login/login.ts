import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClickableLink } from '../../shared/components/clickable-link/clickable-link';
import { HybridField } from '../../shared/components/hybrid-field/hybrid-field';
import { InputTypeEnum } from '../../shared/utils/enums';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ClickableLink, HybridField],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  InputTypeEnum = InputTypeEnum;
  email = signal('');
  password = signal('');

  constructor(private router: Router) {}

  onLogin(): void {
    console.log('Login:', this.email(), 'Senha:', this.password());
    this.router.navigate(['/play-dashboard']);
  }

  onSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onBackToWebsite(): void {
    // Navigate to home or main page
    this.router.navigate(['/']);
  }
}
