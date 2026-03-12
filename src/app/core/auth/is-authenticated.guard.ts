import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';
import { CurrentLoggedInUserStore } from '../storage/current-logged-in-user.store';


export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authStoreService = inject(CurrentLoggedInUserStore);
  const router = inject(Router);

  if (!authStoreService.isLoggedIn()) {
    const loginPath = router.parseUrl('/auth/login');
    return new RedirectCommand(loginPath);
  }

  return true;
};
