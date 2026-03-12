# AG-Games - Documentação da Arquitetura

## 📋 Visão Geral

**AG-Games** é uma aplicação web Angular de hub de jogos, desenvolvida com **Angular v21.2.0** utilizando as mais recentes práticas e padrões recomendados pelo framework. A aplicação utiliza **standalone components**, **signals** para gerenciamento de estado, e uma arquitetura modular organizada por funcionalidades.

### Stack Tecnológico

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Angular | ^21.2.0 | Framework principal |
| TypeScript | ~5.9.2 | Linguagem de programação |
| RxJS | ~7.8.0 | Programação reativa |
| Vitest | ^4.0.8 | Framework de testes unitários |
| Prettier | ^3.8.1 | Formatação de código |

---

## 🏗️ Estrutura de Diretórios

A arquitetura segue o padrão **Feature-Based Architecture** recomendado pelo Angular Style Guide, organizando o código por áreas funcionais ao invés de tipos de arquivos.

```
src/
├── main.ts                    # Bootstrap da aplicação
├── index.html                 # HTML raiz
├── styles.css                 # Estilos globais
├── app/
│   ├── app.ts                 # Componente raiz
│   ├── app.config.ts          # Configuração da aplicação
│   ├── app.routes.ts          # Definição de rotas
│   ├── app.html               # Template do componente raiz
│   ├── app.css                # Estilos do componente raiz
│   │
│   ├── core/                  # Módulo Core - Serviços singleton e funcionalidades essenciais
│   │   ├── auth/              # Autenticação e guards
│   │   │   └── is-authenticated.guard.ts
│   │   ├── interfaces/        # Interfaces de domínio
│   │   │   └── user/
│   │   │       ├── user.interface.ts
│   │   │       └── user-credentials.interface.ts
│   │   ├── components/            # Componentes de layout core
│   │   │   └── main-card/
│   │   │       ├── main-card.ts
│   │   │       ├── main-card.html
│   │   │       ├── main-card.css
│   │   │       └── main-card.spec.ts
│   │   └── storage/           # Stores de estado
│   │       └── current-logged-in-user.store.ts
│   │
│   ├── features/              # Módulos de funcionalidades
│   │   ├── home/              # Página inicial
│   │   ├── login/             # Página de login
│   │   ├── sign-up/           # Página de cadastro
│   │   ├── splash/            # Tela de splash com animação 3D
│   │   └── play-game-page/    # Página de jogo
│   │
│   └── shared/                # Componentes e utilitários compartilhados
│       ├── components/        # Componentes reutilizáveis
│       │   ├── clickable-link/
│       │   └── hybrid-field/
│       ├── interfaces/        # Interfaces compartilhadas
│       ├── services/          # Serviços compartilhados
│       └── utils/             # Utilitários e constantes
│           ├── app-constants.ts
│           └── enums.ts
│
├── assets/                    # Assets estáticos
├── styles/                    # Estilos globais e temas
│   └── theme.css              # Variáveis CSS de tema
└── public/                    # Arquivos públicos
```

---

## 🤖 Instruções para Agentes de IA - Boas Práticas

> **IMPORTANTE**: Estas instruções devem ser seguidas por qualquer agente de IA ao trabalhar neste projeto para manter a consistência, qualidade e escalabilidade do código.

### 📦 Criação de Componentes - Evitar Duplicação

**REGRA PRINCIPAL**: Antes de criar qualquer código novo, SEMPRE verifique se já existe um componente similar em:
1. `src/app/shared/components/` - Componentes reutilizáveis globais
2. `src/app/core/components/` - Componentes de layout e estruturais

**Checklist antes de criar um novo componente:**
```
□ Pesquisar componentes existentes com funcionalidade similar
□ Verificar se pode estender ou compor um componente existente
□ Se criar novo, avaliar se deve ir em shared/ (reutilizável) ou na feature específica
□ Documentar o propósito do componente no arquivo .ts
```

**Exemplo de componente reutilizável bem estruturado:**
```typescript
// ✅ CORRETO: Componente genérico e configurável
@Component({
  selector: 'app-action-button',
  template: `
    <button 
      [class]="variant" 
      [disabled]="disabled()"
      (click)="onClick.emit()">
      <ng-content />
    </button>
  `
})
export class ActionButton {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly disabled = input<boolean>(false);
  readonly onClick = output<void>();
}
```

```typescript
// ❌ ERRADO: Código duplicado em múltiplas features
// login.html: <button class="primary-btn">Login</button>
// sign-up.html: <button class="primary-btn">Cadastrar</button>
// home.html: <button class="primary-btn">Jogar</button>
```

### 🔄 Reutilização de Funções - DRY (Don't Repeat Yourself)

**Onde colocar funções reutilizáveis:**

| Tipo de Função | Localização | Exemplo |
|----------------|-------------|---------|
| Validações | `shared/utils/validators.ts` | `isEmailValid()`, `isPasswordStrong()` |
| Formatadores | `shared/utils/formatters.ts` | `formatDate()`, `formatCurrency()` |
| Transformações de dados | `shared/utils/transformers.ts` | `mapUserResponse()` |
| Constantes | `shared/utils/app-constants.ts` | `API_URL`, `TIMEOUT` |
| Enums | `shared/utils/enums.ts` | `InputTypeEnum`, `UserRoleEnum` |

**Exemplo de estrutura de utils:**
```typescript
// shared/utils/validators.ts
export const Validators = {
  isEmailValid: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  isPasswordStrong: (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  },
  
  isNotEmpty: (value: string): boolean => value.trim().length > 0
};
```

### 🛠️ Services - Responsabilidade Única

**REGRA**: Cada service deve ter UMA responsabilidade clara. Não misture lógicas diferentes no mesmo service.

**Estrutura de Services:**

```
shared/services/
├── auth.service.ts           # Autenticação (login, logout, token)
├── user.service.ts           # Operações CRUD de usuário
├── game.service.ts           # Operações de jogos
├── notification.service.ts   # Notificações/toasts
└── http-error.service.ts     # Tratamento de erros HTTP
```

**Exemplo de service bem estruturado:**
```typescript
// shared/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userStore = inject(CurrentLoggedInUserStore);
  private readonly router = inject(Router);

  login(credentials: iUserCredentials): Observable<iUser> {
    return this.http.post<iUser>(`${BASE_URL}/auth/login`, credentials).pipe(
      tap(user => this.userStore.setUser(user)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Tratamento centralizado de erros
    return throwError(() => error);
  }
}
```

**❌ EVITAR - Service com múltiplas responsabilidades:**
```typescript
// ❌ ERRADO: Mistura autenticação, usuários e jogos
@Injectable()
export class AppService {
  login() { }
  getUsers() { }
  getGames() { }
  sendNotification() { }
}
```

### 📁 Onde Criar Novos Arquivos

| Tipo | Localização | Nomenclatura |
|------|-------------|--------------|
| Componente de feature | `features/{feature-name}/` | `{component-name}.ts` |
| Componente reutilizável | `shared/components/{component-name}/` | `{component-name}.ts` |
| Componente de layout | `core/components/{component-name}/` | `{component-name}.ts` |
| Service global | `shared/services/` | `{name}.service.ts` |
| Service de feature | `features/{feature-name}/services/` | `{name}.service.ts` |
| Guard | `core/auth/` | `{name}.guard.ts` |
| Interface global | `core/interfaces/{domain}/` | `{name}.interface.ts` |
| Interface de feature | `features/{feature-name}/interfaces/` | `{name}.interface.ts` |
| Store de estado | `core/storage/` | `{name}.store.ts` |
| Utilitário | `shared/utils/` | `{name}.ts` |

### ✅ Checklist para Novos Componentes

Antes de criar qualquer componente, o agente DEVE verificar:

```markdown
1. [ ] O componente já existe em `shared/components/`?
2. [ ] Existe um componente similar que pode ser estendido?
3. [ ] O componente será usado em mais de uma feature?
   - SIM → Criar em `shared/components/`
   - NÃO → Criar na pasta da feature específica
4. [ ] O componente usa `ChangeDetectionStrategy.OnPush`?
5. [ ] Os inputs usam `input()` function (não @Input decorator)?
6. [ ] Os outputs usam `output()` function (não @Output decorator)?
7. [ ] Propriedades do template estão marcadas como `protected`?
8. [ ] Arquivo de teste `.spec.ts` foi criado?
```

### ✅ Checklist para Novos Services

```markdown
1. [ ] O service tem responsabilidade única?
2. [ ] Usa `inject()` ao invés de constructor injection?
3. [ ] Está com `providedIn: 'root'` se for singleton?
4. [ ] Métodos HTTP retornam `Observable`?
5. [ ] Tratamento de erros está implementado?
6. [ ] Interface de retorno está definida?
```

### 🔍 Comandos para Agentes

**Ao receber uma tarefa, o agente deve:**

1. **Analisar primeiro**: Buscar código existente antes de criar novo
2. **Perguntar se necessário**: Em caso de dúvida sobre onde colocar o código
3. **Seguir padrões**: Usar os mesmos padrões de código já existentes no projeto


**Padrão de código Angular v21+ a ser seguido:**

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Example {
  // 1. Injeções de dependência
  private readonly router = inject(Router);
  private readonly userStore = inject(CurrentLoggedInUserStore);
  
  // 2. Inputs
  readonly title = input.required<string>();
  readonly disabled = input<boolean>(false);
  
  // 3. Outputs
  readonly submitted = output<void>();
  
  // 4. Estado interno (signals)
  private readonly loading = signal<boolean>(false);
  
  // 5. Computed (derivados)
  protected readonly isValid = computed(() => !this.disabled() && !this.loading());
  
  // 6. Métodos públicos/protected
  protected onSubmit(): void {
    this.submitted.emit();
  }
}
```

---

## 🧱 Padrões Arquiteturais

### 1. Core Module Pattern

O diretório `core/` contém funcionalidades essenciais que são instanciadas uma única vez na aplicação:

```typescript
// core/storage/current-logged-in-user.store.ts
@Injectable({
  providedIn: 'root',  // Singleton em toda a aplicação
})
export class CurrentLoggedInUserStore {
  private readonly state = signal<iUser | null>(null);
  
  currentUser = computed(() => this.state());
  isLoggedIn = computed(() => this.currentUser() !== null);
}
```

**Conteúdo do Core:**
- **Auth**: Guards de rota e lógica de autenticação
- **Storage**: Stores de estado global usando Signals
- **Interfaces**: Tipos de domínio da aplicação
- **Layout**: Componentes de layout estruturais

### 2. Feature Module Pattern

Cada feature é autocontida com seus próprios componentes, templates e estilos:

```
features/
└── login/
    ├── login.ts           # Componente (lógica)
    ├── login.html         # Template
    ├── login.css          # Estilos específicos
    └── login.spec.ts      # Testes unitários
```

### 3. Shared Module Pattern

Componentes, serviços e utilitários reutilizáveis são organizados no diretório `shared/`:

```typescript
// shared/components/hybrid-field/hybrid-field.ts
@Component({
  selector: 'app-hybrid-field',
  imports: [],
  templateUrl: './hybrid-field.html',
  styleUrl: './hybrid-field.css',
})
export class HybridField {
  @Input() type: InputTypeEnum = InputTypeEnum.Text;
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
}
```

---

## 🚀 Configuração da Aplicação

### Bootstrap

A aplicação é inicializada usando a função `bootstrapApplication`:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

### Configuração do App

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
```

### Componente Raiz

```typescript
// app.ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Games-ECON');
}
```

---

## 🛣️ Roteamento

A aplicação utiliza roteamento simples com componentes standalone:

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: Splash },
  { path: 'login', component: Login },
  { path: 'sign-up', component: SignUp },
  { path: 'home', component: Home },
  { path: 'play', component: PlayGamePage }
];
```

### Guard de Autenticação

```typescript
// core/auth/is-authenticated.guard.ts
export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authStoreService = inject(CurrentLoggedInUserStore);
  const router = inject(Router);

  if (!authStoreService.isLoggedIn()) {
    const loginPath = router.parseUrl('/auth/login');
    return new RedirectCommand(loginPath);
  }

  return true;
};
```

---

## 🎨 Sistema de Temas

O sistema de design utiliza CSS Custom Properties para temas:

```css
/* styles/theme.css */
:root {
  --color-primary: #00E5FF;
  --color-primary-light: #33EDFF;
  --color-primary-dark: #009EB3;

  --color-secondary: #C084FC;
  --color-secondary-light: #D1A6FD;
  --color-secondary-dark: #8B5CF6;
}
```

---

## 📐 Boas Práticas Angular Implementadas

### ✅ Standalone Components (Angular v21+)

Todos os componentes utilizam a arquitetura standalone, sem necessidade de NgModules:

```typescript
@Component({
  selector: 'app-home',
  imports: [],  // Importações diretas no componente
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
```

### ✅ Signals para Gerenciamento de Estado

```typescript
// Uso de signals para estado reativo
private readonly state = signal<iUser | null>(null);
currentUser = computed(() => this.state());
isLoggedIn = computed(() => this.currentUser() !== null);
```

### ✅ Função inject() ao invés de Constructor Injection

```typescript
// Preferido (functional guards)
const authStoreService = inject(CurrentLoggedInUserStore);
const router = inject(Router);
```

### ✅ Convenções de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `Home`, `MainCard` |
| Arquivos | kebab-case | `main-card.ts`, `user.interface.ts` |
| Interfaces | iCamelCase | `iUser`, `iUserCredentials` |
| Enums | PascalCase | `InputTypeEnum` |
| Guards | camelCase + Guard | `isAuthenticatedGuard` |
| Stores | PascalCase + Store | `CurrentLoggedInUserStore` |

### ✅ Organização de Arquivos

Cada componente mantém seus arquivos relacionados agrupados:

```
component-name/
├── component-name.ts          # Lógica do componente
├── component-name.html        # Template
├── component-name.css         # Estilos
└── component-name.spec.ts     # Testes
```

---

## 📦 Componentes Principais

### MainCard (Layout Core)

Componente de card reutilizável com propriedades configuráveis via inputs:

```typescript
@Component({
  selector: 'app-main-card',
  standalone: true,
})
export class MainCard {
  @Input() width: string = '350px';
  @Input() height: string = '400px';
  @Input() justifyContent: string = 'center';
  @Input() alignItems: string = 'center';
  @Input() flexDirection: string = 'column';
  @Input() opacity: string = '1';
  @Input() gap: string = '10px';
  @Input() background: string = 'rgba(40, 30, 60, 0.55)';
}
```

### HybridField (Shared Component)

Campo de input reutilizável com suporte a múltiplos tipos:

```typescript
@Component({
  selector: 'app-hybrid-field',
})
export class HybridField {
  @Input() type: InputTypeEnum = InputTypeEnum.Text;
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
}
```

### ClickableLink (Shared Component)

Link clicável com estilização customizável:

```typescript
@Component({
  selector: 'app-clickable-link',
})
export class ClickableLink {
  @Input() text: string = '';
  @Input() color: string = '#007bff';
  @Output() clicked = new EventEmitter<void>();
}
```

---

## 🔧 Utilitários

### Enums

```typescript
// shared/utils/enums.ts
export enum InputTypeEnum {
  Email = 'email',
  Password = 'password',
  Text = 'text',
}
```

### Constantes

```typescript
// shared/utils/app-constants.ts
export const BASE_URL = 'https://api.seuprojeto.com';
export const TIMEOUT = 5000;
export const DEFAULT_LANGUAGE = 'pt-BR';
```

---

## 🧪 Testes

O projeto utiliza **Vitest** como framework de testes:

```json
{
  "devDependencies": {
    "vitest": "^4.0.8",
    "jsdom": "^28.0.0"
  }
}
```

Estrutura de testes seguindo o padrão Angular:
- Arquivos de teste com sufixo `.spec.ts`
- Localizados no mesmo diretório do código testado

---

## 📝 Melhorias Recomendadas

Baseado nas boas práticas do Angular Style Guide, considere:

1. **Lazy Loading para Rotas**
   ```typescript
   {
     path: 'home',
     loadComponent: () => import('./features/home/home').then(m => m.Home)
   }
   ```

2. **ChangeDetection OnPush**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   ```

3. **Uso de input() e output() functions** (Angular v17+)
   ```typescript
   readonly type = input<InputTypeEnum>(InputTypeEnum.Text);
   readonly valueChange = output<string>();
   ```


5. **Implementar serviços HTTP** na pasta `shared/services/`

6. **Adicionar interceptors** para tratamento global de erros e autenticação

---

## 📚 Referências

- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components)
- [Angular Router](https://angular.dev/guide/routing)

---

*Documentação gerada em: Março 2026*  
*Versão Angular: 21.2.0*
