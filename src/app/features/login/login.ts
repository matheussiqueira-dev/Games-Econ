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
  selector: 'app-login',
  imports: [ReactiveFormsModule, ClickableLink, HybridField, EncomPanel, TronButton],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  readonly InputTypeEnum = InputTypeEnum;

  readonly form = new FormGroup({
    email:    new FormControl('', AuthValidators.email),
    password: new FormControl('', AuthValidators.password),
  });

  /** Sinaliza que o submit foi tentado — ativa mensagens de erro no template. */
  readonly submitted = signal(false);

  /** Mensagem de erro global (ex.: credenciais inválidas devolvidas pela API). */
  readonly serverError = signal<string | null>(null);

  /** Bloqueia o botão enquanto aguarda resposta da API. */
  readonly isLoading = signal(false);

  // Atalhos para erros por campo
  readonly emailError = computed(() => {
    const ctrl = this.form.get('email');
    if (!this.submitted() || !ctrl?.errors) return null;
    const errs = ctrl.errors;
    return (errs['required'] || errs['invalidEmail']?.['message'] || null) as string | null;
  });

  readonly passwordError = computed(() => {
    const ctrl = this.form.get('password');
    if (!this.submitted() || !ctrl?.errors) return null;
    const errs = ctrl.errors;
    return (errs['required'] || errs['minlength'] || errs['weakPassword']?.['message'] || null) as string | null;
  });

  constructor(
    private readonly router: Router,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  get emailValue(): string { return this.form.get('email')?.value ?? ''; }
  get passwordValue(): string { return this.form.get('password')?.value ?? ''; }

  onEmailChange(value: string): void { this.form.get('email')?.setValue(value); }
  onPasswordChange(value: string): void { this.form.get('password')?.setValue(value); }

  onLogin(): void {
    this.submitted.set(true);
    this.serverError.set(null);

    if (this.form.invalid) return;

    this.isLoading.set(true);

    // TODO: substituir por chamada real à AuthService quando o back-end estiver disponível
    try {
      this.router.navigate(['/play-dashboard']);
    } catch (err) {
      const appError = this.errorHandler.handle(err, '[Login]');
      this.serverError.set(appError.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSignUp(): void { this.router.navigate(['/sign-up']); }

  onBackToWebsite(): void {
    window.open('https://www.matheussiqueira.dev/', '_blank', 'noopener,noreferrer');
  }
}
