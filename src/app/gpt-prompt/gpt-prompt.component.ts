import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface GPTResponse {
  choices: Array<{ message: { content: string } }>;
}

interface UploadResponse {
  isContract: boolean;
  fileId: number;
  originalFileName: string;
  blobStorageLocation: string;
  contractText: string;
  contractType: string;
  product: string;
  price: string;
  volume: string;
  deliveryTerms: string;
  appendix: string;
  message?: string;
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
  originalFileName: string | null = null;
  blobStorageLocation: string | null = null;
  isEditing = false;
  originalUploadResponse = '';
  errorMessage: string = '';
  contractType: string = '';
  product: string = '';
  price: string = '';
  volume: string = '';
  deliveryTerms: string = '';
  appendix: string = '';

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
          if (response.isContract === false) {
            this.errorMessage = response.message || 'The uploaded document is not a contract.';
            this.uploadResponse = '';
            this.originalFileName = null;
            this.blobStorageLocation = null;
            this.contractType = '';
            this.product = '';
            this.price = '';
            this.volume = '';
            this.deliveryTerms = '';
            this.appendix = '';
          } else {
            this.errorMessage = '';
            this.uploadResponse = response.contractText; // Changed from response.text
            this.originalFileName = response.originalFileName;
            this.blobStorageLocation = response.blobStorageLocation;
            this.contractType = response.contractType;
            this.product = response.product;
            this.price = response.price;
            this.volume = response.volume;
            this.deliveryTerms = response.deliveryTerms;
            this.appendix = response.appendix;
          }
        },
        error: (error) => {
          this.errorMessage = 'An error occurred during file upload: ' + error.message;
          this.uploadResponse = '';
          this.originalFileName = null;
          this.blobStorageLocation = null;
          this.contractType = '';
          this.product = '';
          this.price = '';
          this.volume = '';
          this.deliveryTerms = '';
          this.appendix = '';
        }
      });
  }

  startEditing() {
    this.isEditing = true;
    this.originalUploadResponse = this.uploadResponse;
  }

  cancelEditing() {
    this.isEditing = false;
    this.uploadResponse = this.originalUploadResponse;
  }

  saveEdits() {
    const apiUrl = `${serverUrl}/api/gpt/generate-pdf`;
    const requestBody = {
      fileName: this.originalFileName,
      textContent: this.uploadResponse
    };

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>(apiUrl, requestBody).subscribe({
      next: (response) => {
        console.log('PDF generated successfully', response);
        this.isEditing = false;
        this.loading = false;
        if (response.blobStorageLocation) {
          this.blobStorageLocation = response.blobStorageLocation;
        }
      },
      error: (error) => {
        console.error('Error generating PDF', error);
        this.loading = false;
        this.errorMessage = 'An error occurred while updating the PDF. Please try again.';
      }
    });
  }

  clearErrorMessage() {
    this.errorMessage = '';
  }
}