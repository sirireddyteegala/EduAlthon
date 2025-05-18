import { Routes } from '@angular/router';
import { routes as authRoutes } from './authenticator/authenticator.routes';
import {routes as userRoutes} from './user/user.routes'
import { AuthenticatorComponent } from './authenticator/authenticator.component';
import { AuthGuard } from './authenticator/authenticator.guard';
import { AppGuard } from './app.guard';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { RagComponent } from './rag/rag.component';
import { UserComponent } from './user/user.component';
import { RedirectGuard } from './redirect.guard';


export const routes: Routes = [
    {
        path: '',
        canActivate: [RedirectGuard],
        component: PageNotFoundComponent,
    },
    {
        path: 'auth',
        component: AuthenticatorComponent,
        children: authRoutes,
    },
    {
        path: 'rag',
        component: RagComponent,
        
    },
    {
        path: 'student',
        component: UserComponent,
        children: userRoutes,
        canActivate: [AppGuard]
    },
    { 
        path: '**', 
        component: PageNotFoundComponent
    }
];
