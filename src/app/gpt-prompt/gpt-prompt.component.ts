import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface GPTResponse {
  choices: Array<{ message: { content: string } }>;
}

@Component({
  selector: 'app-gpt-prompt',
  templateUrl: './gpt-prompt.component.html',
  styleUrls: ['./gpt-prompt.component.css'],
  standalone: true,
  imports: [JsonPipe, FormsModule, CommonModule]
})
export class GptPromptComponent implements OnInit, OnDestroy {
  prompt = '';
  response: string = '';
  loading = false;
  private subscription: Subscription = new Subscription();

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    // const socketUrl = 'ws://localhost:5000/ws';
    const socketUrl = 'wss://contractbot-api.azurewebsites.net/ws'
    this.webSocketService.connect(socketUrl);
    this.subscription = this.webSocketService.getMessages().subscribe({
      next: (response) => {
        const content = response.choices[0]?.message?.content || '';
        this.response = this.formatResponse(content);
        this.loading = false;
      },
      error: (error) => {
        this.response = 'An error occurred: ' + error.message;
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  sendPrompt() {
    this.loading = true;
    this.response = '';
    const message = {
      role: 'user',
      content: this.prompt
    };
    this.webSocketService.sendMessage(message);
  }

  formatResponse(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }
}