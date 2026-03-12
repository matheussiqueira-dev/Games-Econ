import { Routes } from '@angular/router';
import { Splash } from './features/splash/splash';
import { Login } from './features/login/login';
import { SignUp } from './features/sign-up/sign-up';
import { PlayGameDashboard } from './features/play-game-dashboard/play-game-dashboard';
import { PlayGamePage } from './features/play-game-page/play-game-page';


export const routes: Routes = [
    {
        path: '',
        component: Splash
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'sign-up',
        component: SignUp
    },
    {
        path: 'play-dashboard',
        component: PlayGameDashboard
    },
    {
        path: 'play-game',
        component: PlayGamePage
    }
];
