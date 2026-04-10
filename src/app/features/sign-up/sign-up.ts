import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ClickableLink } from '../../shared/components/clickable-link/clickable-link';
import { HybridField } from '../../shared/components/hybrid-field/hybrid-field';
import { EncomPanel } from '../../shared/components/ui/encom-panel/encom-panel';
import { TronButton } from '../../shared/components/ui/tron-button/tron-button';
import { AuthValidators } from '../../shared/validators/auth.validators';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { InputTypeEnum } from '../../shared/utils/enums';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, ClickableLink, HybridField, EncomPanel, TronButton],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  readonly InputTypeEnum = InputTypeEnum;

  readonly form = new FormGroup(
    {
      username:        new FormControl('', AuthValidators.username),
      email:           new FormControl('', AuthValidators.email),
      password:        new FormControl('', AuthValidators.password),
      confirmPassword: new FormControl(''),
      agreeToTerms:    new FormControl(false),
    },
    { validators: AuthValidators.passwordMatch }
  );

  readonly submitted  = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly isLoading  = signal(false);

  // ── Atalhos de erro por campo ────────────────────────────────────────────

  readonly usernameError = computed(() => {
    const ctrl = this.form.get('username');
    if (!this.submitted() || !ctrl?.errors) return null;
    const e = ctrl.errors;
    return (e['required'] || e['minlength'] || e['maxlength'] || e['invalidUsername']?.['message'] || null) as string | null;
  });

  readonly emailError = computed(() => {
    const ctrl = this.form.get('email');
    if (!this.submitted() || !ctrl?.errors) return null;
    const e = ctrl.errors;
    return (e['required'] || e['invalidEmail']?.['message'] || null) as string | null;
  });

  readonly passwordError = computed(() => {
    const ctrl = this.form.get('password');
    if (!this.submitted() || !ctrl?.errors) return null;
    const e = ctrl.errors;
    return (e['required'] || e['minlength'] || e['weakPassword']?.['message'] || null) as string | null;
  });

  readonly confirmPasswordError = computed(() => {
    const ctrl = this.form.get('confirmPassword');
    if (!this.submitted() || !ctrl?.errors) return null;
    return (ctrl.errors?.['passwordMismatch'] as string | null) ?? null;
  });

  readonly termsError = computed(() =>
    this.submitted() && !this.form.get('agreeToTerms')?.value
      ? 'Você deve aceitar os termos para continuar.'
      : null
  );

  constructor(
    private readonly router: Router,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  // ── Getters para o template (bind com HybridField) ───────────────────────

  get usernameValue(): string        { return this.form.get('username')?.value ?? ''; }
  get emailValue(): string           { return this.form.get('email')?.value ?? ''; }
  get passwordValue(): string        { return this.form.get('password')?.value ?? ''; }
  get confirmPasswordValue(): string { return this.form.get('confirmPassword')?.value ?? ''; }
  get agreeToTermsValue(): boolean   { return !!this.form.get('agreeToTerms')?.value; }

  onUsernameChange(value: string): void        { this.form.get('username')?.setValue(value); }
  onEmailChange(value: string): void           { this.form.get('email')?.setValue(value); }
  onPasswordChange(value: string): void        { this.form.get('password')?.setValue(value); }
  onConfirmPasswordChange(value: string): void { this.form.get('confirmPassword')?.setValue(value); }

  onTermsChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.get('agreeToTerms')?.setValue(checked);
  }

  // ── Ações ────────────────────────────────────────────────────────────────

  onSignUp(): void {
    this.submitted.set(true);
    this.serverError.set(null);

    if (this.form.invalid || !this.agreeToTermsValue) return;

    this.isLoading.set(true);

    // TODO: substituir por chamada real à AuthService quando o back-end estiver disponível
    try {
      this.router.navigate(['/login']);
    } catch (err) {
      const appError = this.errorHandler.handle(err, '[SignUp]');
      this.serverError.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  onLogin(): void { this.router.navigate(['/login']); }

  onBackToWebsite(): void {
    window.open('https://www.matheussiqueira.dev/', '_blank', 'noopener,noreferrer');
  }
}
