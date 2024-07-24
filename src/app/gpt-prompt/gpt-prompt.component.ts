import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gpt-prompt',
  templateUrl: './gpt-prompt.component.html',
  styleUrls: ['./gpt-prompt.component.css'],
  standalone: true,
  imports: [JsonPipe, FormsModule, CommonModule]
})
export class GptPromptComponent {
  prompt = '';
  response: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  sendPrompt() {
    this.loading = true;
    this.response = null;
    this.http.post('https://contractbot-api.azurewebsites.net/api/gpt', { prompt: this.prompt })
      .subscribe({
        next: (response) => {
          this.response = response;
          this.loading = false;
        },
        error: (error) => {
          this.response = { error: 'An error occurred: ' + error.message };
          this.loading = false;
        }
      });
  }
}