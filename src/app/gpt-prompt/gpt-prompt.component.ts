import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
export class GptPromptComponent {
  prompt = '';
  response: string = '';
  loading = false;

  constructor(private http: HttpClient) {}

  sendPrompt() {
    const apiUrl = 'https://contractbot-api.azurewebsites.net/api/gpt';
    // const apiUrl = 'http://localhost:5000/api/gpt';
    this.loading = true;
    this.response = '';
    this.http.post<GPTResponse>(apiUrl, { prompt: this.prompt })
      .subscribe({
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

  formatResponse(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }
}