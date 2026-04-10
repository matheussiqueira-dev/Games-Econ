import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores reutilizáveis para formulários de autenticação.
 *
 * Uso com `FormControl` / `FormGroup` do Angular Reactive Forms:
 * ```ts
 * email    = new FormControl('', AuthValidators.email);
 * password = new FormControl('', AuthValidators.password);
 * form     = new FormGroup({ ... }, { validators: AuthValidators.passwordMatch });
 * ```
 */
export const AuthValidators = {
  /** Obrigatório + formato de e-mail RFC 5322 básico. */
  email: [
    requiredValidator('E-mail obrigatório.'),
    patternValidator(
      /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
      { invalidEmail: true },
      'E-mail inválido.'
    ),
  ],

  /** Obrigatório + mínimo 8 caracteres + letras e números. */
  password: [
    requiredValidator('Senha obrigatória.'),
    minLengthValidator(8, 'A senha deve ter pelo menos 8 caracteres.'),
    patternValidator(
      /(?=.*[a-zA-Z])(?=.*[0-9])/,
      { weakPassword: true },
      'A senha deve conter letras e números.'
    ),
  ],

  /** Obrigatório + 3–30 caracteres alfanuméricos ou hífen/underline. */
  username: [
    requiredValidator('Nome de operador obrigatório.'),
    minLengthValidator(3, 'O nome deve ter pelo menos 3 caracteres.'),
    maxLengthValidator(30, 'O nome deve ter no máximo 30 caracteres.'),
    patternValidator(
      /^[a-zA-Z0-9_\-]+$/,
      { invalidUsername: true },
      'Apenas letras, números, _ e - são permitidos.'
    ),
  ],

  /**
   * Validador de grupo: verifica se `password` e `confirmPassword` são iguais.
   * Aplica o erro em `confirmPassword` para facilitar a exibição no template.
   */
  passwordMatch: passwordMatchValidator(),
} as const;

// ── Fábrica de validadores ─────────────────────────────────────────────────

function requiredValidator(message: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as unknown;
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim().length === 0);
    return isEmpty ? { required: message } : null;
  };
}

function minLengthValidator(min: number, message: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value : '';
    return value.length > 0 && value.length < min ? { minlength: message } : null;
  };
}

function maxLengthValidator(max: number, message: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value : '';
    return value.length > max ? { maxlength: message } : null;
  };
}

function patternValidator(
  regex: RegExp,
  errorKey: ValidationErrors,
  message: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value : '';
    if (value.length === 0) return null; // deixa `required` tratar
    return regex.test(value) ? null : { ...errorKey, message };
  };
}

function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value as string | null;
    const confirm  = group.get('confirmPassword')?.value as string | null;

    if (!confirm) return null; // campo vazio — `required` trata
    if (password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: 'As senhas não conferem.' });
      return { passwordMismatch: true };
    }

    // Limpa o erro de mismatch se as senhas baterem
    const existing = group.get('confirmPassword')?.errors;
    if (existing) {
      const { passwordMismatch: _removed, ...rest } = existing;
      group.get('confirmPassword')?.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}
