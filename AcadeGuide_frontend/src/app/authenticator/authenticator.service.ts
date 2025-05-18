import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { OtpResponse } from "./authenticator.model";
import { CookieService } from "ngx-cookie-service";
import { JwtService } from "./jwt.service";


@Injectable({providedIn: 'root'})
export class AuthenticatorService {

  apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);
  private cookieService = inject(CookieService);
  private jwtService = inject(JwtService)
  private cookiePath = '/';

  otpResponse!: OtpResponse;
  otpSent: boolean = false;

  isLoggedIn(): boolean {
    return this.cookieService.get('is_authenticated') === 'true';
  }


  registerUser(user_name: string, first_name: string, last_name: string, email: string, cgpa: string): Observable<any> {
      return this.httpClient.post(this.apiUrl + 'auth/user/register/', {
          username: user_name,
          first_name: first_name,
          last_name: last_name,
          email: email,
          experience: cgpa
      });
  }

  sendOtp(email_mobile: string) : Observable<any> {
    return this.httpClient.post(this.apiUrl + 'auth/login-otp/request-new/', {
      'email_mobile': email_mobile,
    })
  }

  verifyOtp(request_id: string, otp: string) : Observable<any> {
    return this.httpClient.post(this.apiUrl + 'auth/login-otp/verify/', {
      'request_id': request_id,
      'otp': otp
    })
  }

  setSession(access_token: string, refresh_token: string = "") {
    const expirationDate = this.jwtService.getTokenExpirationDate(access_token);
    const cookieOptions = { path: this.cookiePath };

    this.cookieService.set('expires_at', expirationDate!.toISOString(), cookieOptions);
    this.cookieService.set('access_token', access_token, cookieOptions);
    this.cookieService.set('refresh_token', refresh_token, cookieOptions);
    this.cookieService.set('is_authenticated', 'true', cookieOptions);
  }

  refreshToken(refresh_token: string): Observable<any> {

    console.log("started refreshing the token")

    const cookieOptions = { path: this.cookiePath };

    return this.httpClient.post(this.apiUrl + 'auth/api/token/refresh/', {
      refresh: refresh_token,
    }).pipe(
      tap((response: any) => {
        this.cookieService.set('access_token', response.access, cookieOptions);
      })
    );
  }

  checkTokenExpiry() {

    const token = this.cookieService.get('access_token');
    const refreshToken = this.cookieService.get('refresh_token');

    if(token === ""){
      return
    }
  
    if (this.jwtService.isTokenExpired(token)) {
      if (this.jwtService.isTokenExpired(refreshToken)) {
        this.logout(); 
      } else {
        this.refreshToken(refreshToken).subscribe(
          (apiData) => {
            window.location.reload()
          },
          (error) => {
            this.logout()
        });
      }
    }
  }
  

  getExpiration(): string | null {
    return localStorage.getItem('expires_at');
}

  loginUser(access_token: string, refresh_token: string) {
    this.setSession(access_token, refresh_token);
  }

  logout(){      
      this.cookieService.deleteAll(this.cookiePath);
      location.reload()
      console.log('After logout:', this.cookieService.getAll());
      console.log('User has been logged out.');
  }
  }
  