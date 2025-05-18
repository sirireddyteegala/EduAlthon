import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Observable } from "rxjs";
import { AuthenticatorService } from "./authenticator.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private cookieService: CookieService, private authService: AuthenticatorService) { }
    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {

        if (req.url.includes('auth/api/token/refresh/')) {
            return next.handle(req);
        }
        
        this.authService.checkTokenExpiry();
        const access_token = this.cookieService.get("access_token");

        if (access_token) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization",
                    "Bearer " + access_token)
            });

            return next.handle(cloned);
        }
        else {
            return next.handle(req);
        }
    }
}