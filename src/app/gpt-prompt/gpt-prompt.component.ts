import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface GPTResponse {
  choices: Array<{ message: { content: string } }>;
}

interface UploadResponse {
  text: string;
}

// const serverUrl = 'https://contractbot-api.azurewebsites.net';
const serverUrl = 'http://localhost:5198';

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
  uploadResponse: string = '';
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  sendPrompt() {
    const apiUrl = `${serverUrl}/api/gpt`;
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<UploadResponse>(`${serverUrl}/api/gpt/upload-pdf`, formData)
      .subscribe({
        next: (response) => {
          this.uploadResponse = response.text;
        },
        error: (error) => {
          this.uploadResponse = 'An error occurred during file upload: ' + error.message;
        }
      });
  }
}