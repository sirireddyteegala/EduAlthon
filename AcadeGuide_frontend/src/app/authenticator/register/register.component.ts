import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticatorService } from '../authenticator.service';
import { last, Subscription } from 'rxjs';
import { GoogleAuthService } from '../google-auth.service';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  message: string = '';
  isLoading: boolean = false;
  private authSubscribe: Subscription | undefined;

  constructor(private authService: AuthenticatorService, private router: Router, private googleAuthService: GoogleAuthService) {
    this.registerForm = new FormGroup({
      enrollmentNumber: new FormControl('',[
        Validators.required,
      ]),
      first_name: new FormControl('',[Validators.required]),
      last_name: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      cgpa: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(10),
        Validators.pattern('^[0-9]*\.?[0-9]+$')
      ]),
    });
  }

  // Utility to parse enrollment number
  static parseEnrollmentNumber(enrollment: string) {
  console.log('Parsing enrollment number:', enrollment);

  // Extract just the enrollment part before '@' if it's an email
  const username = enrollment.split('@')[0];
  const upperEnrollment = username.toUpperCase();

  console.log('Converted to uppercase:', upperEnrollment);

  const regex = /^(\d{2})EG(\d{3})([A-Z])(\d{2})$/;
  const match = regex.exec(upperEnrollment);

  console.log('Regex match result:', match);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const fullYear = 2000 + year;
  const duration = `${fullYear}-${fullYear + 4}`;
  const branchCode = match[2];
  const section = match[3];
  const rollNo = match[4];

  const branchMap: { [key: string]: string } = {
    '112': 'Information Technology',
    '104': 'Electronics & Communication',
    '107': 'Artificial Intelligence',
  };
  const branch = branchMap[branchCode] || branchCode;

  console.log({ year, duration, branchCode, branch, section, rollNo });

  return {
    year: fullYear,
    duration,
    branchCode,
    branch,
    section,
    rollNo: parseInt(rollNo, 10)
  };
}
  onSubmit() {
    if (this.registerForm.invalid) {
      this.message = 'Please enter a valid details.';
      return;
    }
    this.isLoading = true;
    const email = this.registerForm.value.email;
    const user_name = this.registerForm.value.enrollmentNumber;
    const first_name = this.registerForm.value.first_name;
    const last_name = this.registerForm.value.last_name;
    const cgpa = this.registerForm.value.cgpa;
    this.authSubscribe = this.authService.registerUser(user_name, first_name, last_name, email, cgpa).subscribe(
      (requestData) => {
        console.log(requestData);
        this.isLoading = false;
        this.message = 'User registered successfully. Redirecting to login page...';

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error => {
        console.log(error.error);
        this.isLoading = false;
        this.message = error.error;
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
