import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { loadGapiInsideDOM, loadAuth2, gapi } from 'gapi-script';
import { environment } from '../../environments/environment.development';
import { AuthenticatorService } from './authenticator.service';
import { Router } from '@angular/router';

interface AuthResponse {
    access: string;
    refresh: string;
  }
@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private auth2: any;
  private backendUrl = environment.apiUrl + 'auth/google/';
  private authState = new BehaviorSubject<boolean>(false); // Set a default
  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService, private authService: AuthenticatorService) {
    this.loadGoogleAuth();
    this.authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  }


  /** Load Google Authentication */
  async loadGoogleAuth() {
    await loadGapiInsideDOM();
    this.auth2 = await loadAuth2(gapi, '649819644034-nbnviseoqlrhh48nbujiaicavf8npmej.apps.googleusercontent.com', 'profile email');
  }
/** Trigger Google Sign-in */
async signInWithGoogle(): Promise<void> {
    try {
      const googleUser = await this.auth2.signIn();
      const authResponse = googleUser.getAuthResponse(); // Contains both tokens
  
      const idToken = authResponse.id_token;
      const accessToken = authResponse.access_token; // Fetching access token
  
      console.log("Google ID Token:", idToken);
      console.log("Google Access Token:", accessToken);
  
      this.authenticateWithBackend(idToken, accessToken).subscribe(response => {
        console.log("User authenticated:", response);
        this.authState.next(true);
      });
  
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  }
  /** Send Google token to backend for authentication */
  authenticateWithBackend(token: string, accessToken: string): Observable<AuthResponse> {
    console.log('Backend token:', token);
    return this.http.post<AuthResponse>(this.backendUrl, {access_token: accessToken
    }).pipe(
      tap((response: AuthResponse) => {
        if (response.access && response.refresh) {
            this.authService.setSession(response.access, response.refresh);
            this.router.navigate(['']);
        } else {
          console.error('Invalid response from backend:', response);
        }
      })
    );
  }

  /** Logout User */
  signOut(): void {
    this.auth2.signOut().then(() => {
      this.cookieService.delete('access_token', '/');
      this.cookieService.delete('refresh_token', '/');
      this.authState.next(false);
      console.log('User signed out.');
    });
  }

  /** Check if the user is logged in */
  isLoggedIn(): boolean {
    return this.cookieService.check('access_token');
  }

  /** Get authentication state */
  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }
}