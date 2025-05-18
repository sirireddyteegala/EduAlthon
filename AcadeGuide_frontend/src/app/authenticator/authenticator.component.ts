import { Component, inject } from '@angular/core';
import { AuthenticatorService } from './authenticator.service';
import { NgFor, NgIf } from '@angular/common';
import { LoginComponent } from "./login/login.component";
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authenticator',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './authenticator.component.html',
  styleUrl: './authenticator.component.css'
})
export class AuthenticatorComponent {
  constructor(private authService: AuthenticatorService){}
}
