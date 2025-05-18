import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RouterLink } from '@angular/router';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: number;
  messages: Message[];
  user_id: number | null;
  session_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

@Component({
  selector: 'app-rag',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rag.component.html',
  styleUrl: './rag.component.css'
})
export class RagComponent implements OnInit {
  userQuery: string = '';
  isLoading: boolean = false;
  messages: Message[] = [];
  tempSessionId: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const storedSessionId = localStorage.getItem('temp_session_id');
    console.log(storedSessionId)
    if (storedSessionId) {
      this.tempSessionId = storedSessionId;
      this.fetchTempSession();
    }
  }

  fetchTempSession(): void {
    this.isLoading = true;
    this.http.get<ChatSession>(`${environment.apiUrl}/university/chat/temp-session/current/?temp_session_id=${this.tempSessionId}`)
      .subscribe({
        next: (response) => {
          if (response && response.messages && response.messages.length > 0) {
            this.messages = response.messages;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching temp session:', error);
          this.isLoading = false;
          localStorage.removeItem('temp_session_id');
          this.tempSessionId = '';
        }
      });
  }

  sendMessage(): void {
    if (!this.userQuery.trim()) return;
    
    this.isLoading = true;
    
    const userMessage: Message = {
      id: this.messages.length > 0 ? Math.max(...this.messages.map(m => m.id)) + 1 : 1,
      role: 'user',
      content: this.userQuery,
      created_at: new Date().toISOString()
    };
    
    this.messages.push(userMessage);
    
    const payload = {
      user_query: this.userQuery,
      session_id: this.tempSessionId || ''
    };
    
    this.userQuery = '';
    
    this.http.post<ChatSession>(`${environment.apiUrl}/university/chat/temp-session/send-message/`, payload)
      .subscribe({
        next: (response) => {
          if (!this.tempSessionId && response.session_id) {
            this.tempSessionId = response.session_id;
            localStorage.setItem('temp_session_id', response.session_id);
          }
          this.messages = response.messages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isLoading = false;
                    this.messages.push({
            id: this.messages.length > 0 ? Math.max(...this.messages.map(m => m.id)) + 1 : 1,
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
            created_at: new Date().toISOString()
          });
        }
      });
  }

  setQuery(question: string): void {
    this.userQuery = question;
    this.sendMessage();
  }

  clearChat(): void {
    this.messages = [];
    this.tempSessionId = '';
    localStorage.removeItem('temp_session_id');
  }
}
