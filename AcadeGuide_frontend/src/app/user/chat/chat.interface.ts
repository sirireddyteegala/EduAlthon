export interface ChatMessage {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  detail_id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
} 