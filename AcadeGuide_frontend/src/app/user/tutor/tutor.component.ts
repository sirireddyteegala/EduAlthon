import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { UserAPIService } from '../user.service';
import { RegisterComponent } from '../../authenticator/register/register.component';

interface TutorResponse {
  description: string;
  steps: {
    step_name: string;
    step_descripion: string;
  }[];
  link: string;
}

@Component({
  selector: 'app-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor.component.html',
  styleUrl: './tutor.component.css'
})
export class TutorComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  isLoading: boolean = false;
  searchResults: TutorResponse | null = null;
  error: string | null = null;
  userDetails: any | null = null;
  private subscription: Subscription = new Subscription();
  userLevel: string = 'medium';
  userEnrollmentInfo: any = null;

  constructor(private http: HttpClient, private userAPIService: UserAPIService) {}

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
    this.userEnrollmentInfo = RegisterComponent.parseEnrollmentNumber(userData.username);
    
    if (userData.experience) {
      this.userLevel = this.calculateUserLevel(userData.experience);
    }
  }

  private calculateUserLevel(cgpa: number): string {
    if (cgpa >= 8.5) return 'advanced';
    if (cgpa >= 7.0) return 'medium';
    return 'beginner';
  }

  ngOnInit() {
    this.subscription = this.userAPIService.currentUserData$.subscribe(data => {
      if (data) {
        this.fetchUserDetails(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.error = 'Please enter a search query';
      return;
    }

    if (!this.userDetails) {
      this.error = 'User details not available. Please try again.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    const params = new URLSearchParams({
      user_query: this.searchQuery,
      user_level: this.userLevel,
      user_details: JSON.stringify(this.userDetails)
    });

    this.http.get<TutorResponse>(`${environment.apiUrl}/university/tutor/?${params.toString()}`)
      .subscribe({
        next: (response) => {
          this.searchResults = response;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to fetch results. Please try again.';
          this.isLoading = false;
          console.error('Error fetching tutor data:', err);
        }
      });
  }
}
