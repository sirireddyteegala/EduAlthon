import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAPIService } from './user.service';
import { AuthenticatorService } from '../authenticator/authenticator.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  showProfileModal = false;
  
  constructor(
    public userAPIService: UserAPIService,
    private authService: AuthenticatorService
  ){}

  ngOnInit(): void {
    this.getCurrentUserData();
  }

  getCurrentUserData(){
    this.userAPIService.getCurrentUser().subscribe(
      (apiData) =>{
        this.userAPIService.setCurrentUserData(apiData);
      }
    )
  }

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }

  logout() {
    this.authService.logout();
  }
}
