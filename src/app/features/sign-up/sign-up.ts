import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClickableLink } from "../../shared/components/clickable-link/clickable-link";
import { HybridField } from "../../shared/components/hybrid-field/hybrid-field";
import { EncomPanel } from "../../shared/components/ui/encom-panel/encom-panel";
import { TronButton } from "../../shared/components/ui/tron-button/tron-button";
import { InputTypeEnum } from "../../shared/utils/enums";

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, ClickableLink, HybridField, EncomPanel, TronButton],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  InputTypeEnum = InputTypeEnum;
  username = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  agreeToTerms = signal(false);

  constructor(private router: Router) { }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onSignUp(): void {
    console.log('Sign Up:', {
      username: this.username(),
      email: this.email(),
      password: this.password(),
      confirmPassword: this.confirmPassword(),
      agreeToTerms: this.agreeToTerms()
    });
    // Implementation for sign up
    this.router.navigate(['/login']);
  }

  onUsernameChange(value: string): void {
    this.username.set(value);
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onConfirmPasswordChange(value: string): void {
    this.confirmPassword.set(value);
  }

  onTermsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.agreeToTerms.set(target.checked);
  }

  onBackToWebsite(): void {
    // Navigate to home or main page
    this.router.navigate(['/']);
  }
}
