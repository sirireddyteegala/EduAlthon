import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatMessage, ChatSession } from './chat.interface';
import { UserAPIService } from '../user.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  chatSessions: ChatSession[] = [];
  currentSessionId: string | null = null;
  currentSessionDetailId: number | null = null;
  currentSession: ChatSession | null = null;
  isLoading: boolean = false;
  editingTitle: boolean = false;
  editedTitle: string = '';
  private shouldScrollToBottom: boolean = false;

  constructor(private userService: UserAPIService) {}

  ngOnInit() {
    this.loadChatSessions();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private loadChatSessions() {
    this.userService.getSessionsList().subscribe({
      next: (sessions) => {
        this.chatSessions = sessions.map((session: any) => ({
          detail_id: session.id,
          id: session.session_id,
          title: session.name,
          messages: [],
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at)
        }));
        
        if (this.chatSessions.length > 0) {
          this.loadChatSession(this.chatSessions[0]?.detail_id);
        } else {
          this.createNewSession();
        }
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
      }
    });
  }

  createNewSession() {
    this.currentSessionId = null;
    this.currentSessionDetailId = null;
    this.currentSession = null;
    this.messages = [];
    
    this.messages.push({
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    });
  }

  loadChatSession(sessionId: number) {
    this.currentSessionDetailId = sessionId;
    this.userService.getSessionDetail(sessionId).subscribe({
      next: (session) => {
        this.currentSessionId = session.session_id;
        this.currentSession = {
          detail_id: session.id,
          id: session.session_id,
          title: session.name,
          messages: [],
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at)
        };
        this.messages = session.messages.map((msg: any) => ({
          content: msg.content,
          sender: msg.role,
          timestamp: new Date(msg.created_at)
        }));
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error loading session:', error);
      }
    });
  }

  startEditingTitle() {
    if (this.currentSession) {
      this.editedTitle = this.currentSession.title;
      this.editingTitle = true;
    }
  }

  saveTitle() {
    if (this.currentSessionDetailId && this.editedTitle.trim()) {
      this.userService.updateSessionTitle(this.currentSessionDetailId, this.editedTitle.trim()).subscribe({
        next: () => {
          if (this.currentSession) {
            this.currentSession.title = this.editedTitle.trim();
          }
          const sessionIndex = this.chatSessions.findIndex(s => s.detail_id === this.currentSessionDetailId);
          if (sessionIndex !== -1) {
            this.chatSessions[sessionIndex].title = this.editedTitle.trim();
          }
          this.editingTitle = false;
        },
        error: (error) => {
          console.error('Error updating title:', error);
        }
      });
    }
  }

  cancelEditingTitle() {
    this.editingTitle = false;
    this.editedTitle = '';
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage: ChatMessage = {
      content: this.newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;
    this.isLoading = true;

    try {
      const response = await this.userService.sendMessage(this.newMessage, this.currentSessionId || undefined).toPromise();
      
      // Update current session ID if it's a new session
      if (!this.currentSessionId) {
        this.currentSessionId = response.session_id;
        this.currentSessionDetailId = response.id;
        this.currentSession = {
          detail_id: response.id,
          id: response.session_id,
          title: response.name,
          messages: [],
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at)
        };
      }

      // Add assistant's response
      const lastMessage = response.messages[response.messages.length - 1];
      const assistantMessage: ChatMessage = {
        content: lastMessage.content,
        sender: lastMessage.role,
        timestamp: new Date(lastMessage.created_at)
      };

      this.messages.push(assistantMessage);
      this.shouldScrollToBottom = true;

      // Refresh sessions list
      this.loadChatSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      });
      this.shouldScrollToBottom = true;
    } finally {
      this.isLoading = false;
      this.newMessage = '';
    }
  }
} 