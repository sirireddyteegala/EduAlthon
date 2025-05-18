import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OtpResponse } from '../authenticator.model';
import { AuthenticatorService } from '../authenticator.service';
import { NgFor } from '@angular/common';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  imports: [FormsModule, ReactiveFormsModule, NgFor, LoadingSpinnerComponent],
  standalone: true,
  styleUrl: './otp.component.css'
})
export class OtpComponent implements OnInit, OnDestroy {
  message: string = '';
  otpForm!: FormGroup;
  otpControls = ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6'];
  isLoading = false;
  private authSubscribe: Subscription | undefined;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthenticatorService) {}
  data: OtpResponse | null = null;

  ngOnInit(): void {
    this.data =  this.authService.otpResponse,
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]{1}')]],
    });
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value && index < this.otpControls.length - 1) {
      const nextInput = document.querySelectorAll('input')[index + 1] as HTMLInputElement;
      nextInput.focus();
    } else if (input.value && index === this.otpControls.length - 1) {
      (document.querySelector('button[type=submit]') as HTMLButtonElement).focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (
      !/^[0-9]{1}$/.test(event.key) &&
      event.key !== 'Backspace' &&
      event.key !== 'Delete' &&
      event.key !== 'Tab' &&
      !event.metaKey
    ) {
      event.preventDefault();
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (index > 0) {
        const prevInput = document.querySelectorAll('input')[index - 1] as HTMLInputElement;
        prevInput.value = '';
        prevInput.focus();
      }
    }
  }

  onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  
    const clipboardData = event.clipboardData;
    if (!clipboardData) {
      return;
    }
  
    const text = clipboardData.getData('text');
    if (!new RegExp(`^[0-9]{${this.otpControls.length}}$`).test(text)) {
      return;
    }
  
    const digits = text.split('');
    if (this.otpForm) {
      this.otpControls.forEach((control, index) => {
        const formControl = this.otpForm.get(control);
        if (formControl) {
          formControl.setValue(digits[index]);
        }
      });
    }
  
    const submitButton = document.querySelector('button[type=submit]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.focus();
    }
  }
  

  onSubmit(): void {
    if (this.otpForm.valid) {
      const otpDigits = this.otpForm.value;
      let otp = '';
      this.otpControls.forEach(element => {
        otp += otpDigits[element]
      });
      let request_id = this.authService.otpResponse.request_id;
      this.authSubscribe = this.authService.verifyOtp(request_id, otp).subscribe(
        (requestData) =>{
          console.log(requestData);
          this.isLoading = true;
          this.authService.loginUser(
            requestData.access,
            requestData.refresh
          )
          this.authService.otpSent = false;
          this.router.navigate(['student/']);
          this.isLoading = false;
        },
        error => {
          console.log(error.error);
          this.message = error.error;
        }
      )
    }
  }

  closeMessage(){
    this.message = ''
  }

  ngOnDestroy(){
    this.authSubscribe?.unsubscribe()
  }
}
