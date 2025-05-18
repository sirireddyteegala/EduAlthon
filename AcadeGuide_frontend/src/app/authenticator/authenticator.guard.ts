import { Injectable } from '@angular/core';

import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { AuthenticatorService } from './authenticator.service';


@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthenticatorService, private router: Router) { }

    canActivate(

        next: ActivatedRouteSnapshot,

        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (this.authService.isLoggedIn()){
            this.router.navigate(['/']);
            return false;
        }

        return true;

    }

}

@Injectable({
    providedIn: 'root'
})
export class OtpGuard implements CanActivate {

    constructor(private authService: AuthenticatorService, private router: Router) { }

    canActivate(

        next: ActivatedRouteSnapshot,

        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (!this.authService.otpSent) {
            this.router.navigate(['/auth']);
            return false;
        }

        return true;

    }

}