import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserAPIService } from '../user.service';
import { Subscription } from 'rxjs';
import { RegisterComponent } from '../../authenticator/register/register.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  userDetails: any | null = null;
  greeting: string = '';
  userName: string = '';
  firstName: string = '';
  lastName: string = '';
  userEnrollmentInfo: any = null;
  userLevel: string = 'Medium';
  private subscription: Subscription = new Subscription();

  private morningGreetings = [
    'Rise and shine',
    'Good morning',
    'Morning has broken',
    'Top of the morning to you',
    'Hello, early bird'
  ];

  private afternoonGreetings = [
    'Good afternoon',
    'Hope your day is going well',
    'Afternoon delight',
    'Hello there',
    'Hope you\'re having a productive day'
  ];

  private eveningGreetings = [
    'Good evening',
    'Evening has arrived',
    'Hope you had a great day',
    'Welcome to the evening',
    'Hello, night owl'
  ];

  constructor(public userAPIService: UserAPIService) {}

  ngOnInit() {
    this.updateGreeting();
    this.subscription = this.userAPIService.currentUserData$.subscribe(data => {
      if (data) {
        this.fetchUserDetails(data);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  private calculateUserLevel(cgpa: number): string {
    console.log('Calculating user level for CGPA:', cgpa);
    if (cgpa >= 8.5) return 'Advanced';
    if (cgpa >= 7.0) return 'Medium';
    return 'Beginner';
  }

  private fetchUserDetails(userData: any) {
    console.log('User data received:', userData);
    this.userDetails = {
      name: userData.username,
      first_name: userData.first_name || 'Not specified',
      last_name: userData.last_name || '',
      email: userData.email,
      role: userData.role || 'Student',
      enrollmentNumber: userData.username || 'Not specified',
      cgpa: userData.experience || 'Not specified',
    };
    this.userName = userData.username;
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
        if (userData.experience) {
        this.userLevel = this.calculateUserLevel(userData.experience);
    }
    console.log('Attempting to parse username:', userData.username);
    this.userEnrollmentInfo = RegisterComponent.parseEnrollmentNumber(userData.username);
    console.log('Parsed enrollment info:', this.userEnrollmentInfo);
  }

  private updateGreeting() {
    const hour = new Date().getHours();
    let greetings: string[];
    
    if (hour < 12) {
      greetings = this.morningGreetings;
    } else if (hour < 18) {
      greetings = this.afternoonGreetings;
    } else {
      greetings = this.eveningGreetings;
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    this.greeting = greetings[randomIndex];
  }
} 