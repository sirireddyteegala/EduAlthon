import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class JwtService {
  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }

  getTokenExpirationDate(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      console.warn('Invalid token or token does not have an expiration date.');
      return null;
    }
    return new Date(decoded.exp * 1000);
  }

  isTokenExpired(token: string): boolean {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      console.warn('Cannot determine if token is expired. Treating it as expired.');
      return true; // Treat as expired if we can't determine the expiration date
    }
    return expirationDate < new Date();
  }
}
