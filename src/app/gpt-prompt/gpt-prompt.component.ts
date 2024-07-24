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
    this.loading = true;
    this.response = '';
    this.http.post<GPTResponse>('https://contractbot-api.azurewebsites.net/api/gpt', { prompt: this.prompt })
      .subscribe({
        next: (response) => {
          const content = response.choices[0]?.message?.content || '';
          this.response = content;
          this.loading = false;
        },
        error: (error) => {
          this.response = 'An error occurred: ' + error.message;
          this.loading = false;
        }
      });
  }
}