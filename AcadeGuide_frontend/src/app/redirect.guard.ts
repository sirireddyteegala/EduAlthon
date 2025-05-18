import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService
  ) {}

  canActivate(): boolean {
    const isLoggedIn = this.cookieService.check('access_token');
    
    if (isLoggedIn) {
      this.router.navigate(['/student']);
    } else {
      this.router.navigate(['/rag']);
    }

    return false;
  }
}