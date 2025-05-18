import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticatorService } from '../authenticator.service';
import { Router, RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm!: FormGroup;
  message: string = '';
  isLoading: boolean = false;
  private authSubscribe: Subscription | undefined;

  constructor(
    private authService: AuthenticatorService,
    private router: Router, 
    private googleAuthService: GoogleAuthService,
  ) {
    this.loginForm = new FormGroup({
      email_mobile: new FormControl('', [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.message = 'Please enter a valid email.';
      return;
    }
    
    this.isLoading = true;
    const email = this.loginForm.value.email_mobile;
    this.authSubscribe = this.authService.sendOtp(email).subscribe(
      (requestData) => {
        console.log(requestData);
        this.router.navigate(['/auth/otp']);
        this.authService.otpSent = true;
        this.authService.otpResponse = { 
          message: requestData.message, 
          request_id: requestData.request_id, 
          valid_for: requestData.valid_for, 
          resend_after: requestData.resend_after
        }
        this.message = '';

      },
      error => {
        console.log(error.error);
        this.isLoading = false;
        this.message = "Error Sending OTP";
      }
    );
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.googleAuthService.signInWithGoogle();
  }

  closeMessage(){
    this.message = ''
  }

  ngOnDestroy(){
    this.authSubscribe?.unsubscribe()
  }
}
