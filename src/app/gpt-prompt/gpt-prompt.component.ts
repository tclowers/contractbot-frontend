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
  id: number;
  originalFileName: string;
  blobStorageLocation: string;
  contractText: string;
  contractType: string;
  product: string;
  price: string;
  volume: string;
  deliveryTerms: string;
  appendix: string;
  futureDeliveryDate?: string;
  settlementTerms?: string;
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
  id: number = 0;
  futureDeliveryDate: string = '';
  settlementTerms: string = '';
  contracts: { id: number; originalFileName: string }[] = [];
  selectedContractId: number | null = null;
  isLoadingContracts = false;

  constructor(private http: HttpClient) {
    this.fetchContracts();
  }

  fetchContracts() {
    this.isLoadingContracts = true;
    this.http.get<{ id: number; originalFileName: string }[]>(`${serverUrl}/api/gpt/contracts`)
      .subscribe({
        next: (contracts) => {
          this.contracts = contracts;
          this.isLoadingContracts = false;
        },
        error: (error) => {
          console.error('Error fetching contracts:', error);
          this.isLoadingContracts = false;
        }
      });
  }

  fetchContractById(id: number) {
    this.http.get<UploadResponse>(`${serverUrl}/api/gpt/contract/${id}`)
      .subscribe({
        next: (response) => {
          this.handleContractResponse(response);
        },
        error: (error) => {
          console.error('Error fetching contract:', error);
          this.errorMessage = 'An error occurred while fetching the contract.';
        }
      });
  }

  sendPrompt() {
    const apiUrl = `${serverUrl}/api/gpt/contract/${this.id}/prompt`;
    this.loading = true;
    this.response = '';

    const requestBody = {
      prompt: this.prompt
    };

    this.http.post<any>(apiUrl, requestBody)
      .subscribe({
        next: (response) => {
          console.log('Response from server:', response);
          if (response.response.prompt_type === 'contract_edit') {
            this.response = response.response.prompt_response;
            this.uploadResponse = response.response.updated_text;
            this.updateContractDetails(response.updatedContract);
          } else if (response.response.prompt_type === 'query') {
            this.response = response.response.prompt_response;
          } else {
            this.response = 'Unexpected response type';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error from server:', error);
          this.response = 'An error occurred: ' + error.message;
          this.loading = false;
        }
      });
  }

  parseJsonSafely(str: string): any {
    // First, try to parse it as-is
    try {
      return JSON.parse(str);
    } catch (e) {
      // If that fails, try to clean up the string
      console.warn('Initial JSON parse failed, attempting to clean string');
      
      // Replace any unescaped newlines, carriage returns, or tabs
      str = str.replace(/[\n\r\t]/g, '\\$&');
      
      // Replace any unescaped quotes
      str = str.replace(/(?<!\\)"/g, '\\"');
      
      // Try parsing again
      try {
        return JSON.parse(str);
      } catch (e2) {
        console.error('Failed to parse JSON even after cleaning', e2);
        throw e2;
      }
    }
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
          this.handleContractResponse(response);
        },
        error: (error) => {
          this.errorMessage = 'An error occurred during file upload: ' + error.message;
          this.resetContractData();
        }
      });
  }

  handleContractResponse(response: UploadResponse) {
    if (response.isContract === false) {
      this.errorMessage = response.message || 'The uploaded document is not a contract.';
      this.resetContractData();
    } else {
      this.errorMessage = '';
      this.uploadResponse = response.contractText;
      this.originalFileName = response.originalFileName;
      this.blobStorageLocation = response.blobStorageLocation;
      this.contractType = response.contractType;
      this.product = response.product;
      this.price = response.price;
      this.volume = response.volume;
      this.deliveryTerms = response.deliveryTerms;
      this.appendix = response.appendix;
      this.id = response.id;
      this.futureDeliveryDate = response.futureDeliveryDate || '';
      this.settlementTerms = response.settlementTerms || '';
      this.selectedContractId = response.id;
      
      // Refresh the contracts list after uploading a new contract
      this.fetchContracts();
    }
  }

  resetContractData() {
    this.uploadResponse = '';
    this.originalFileName = null;
    this.blobStorageLocation = null;
    this.contractType = '';
    this.product = '';
    this.price = '';
    this.volume = '';
    this.deliveryTerms = '';
    this.appendix = '';
    this.selectedContractId = null;
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
    const apiUrl = `${serverUrl}/api/gpt/edit-contract/${this.id}`;
    const requestBody = {
      textContent: this.uploadResponse
    };

    this.loading = true;
    this.errorMessage = '';

    this.http.patch<any>(apiUrl, requestBody).subscribe({
      next: (response) => {
        console.log('PDF generated successfully', response);
        this.isEditing = false;
        this.loading = false;
        if (response.blobUrl) {
          this.blobStorageLocation = response.blobUrl;
        }
        if (response.updatedContract) {
          this.updateContractDetails(response.updatedContract);
        }
      },
      error: (error) => {
        console.error('Error generating PDF', error);
        this.loading = false;
        this.errorMessage = 'An error occurred while updating the PDF. Please try again.';
      }
    });
  }

  updateContractDetails(updatedContract: any) {
    this.contractType = updatedContract.contractType;
    this.product = updatedContract.product;
    this.price = updatedContract.price;
    this.volume = updatedContract.volume;
    this.deliveryTerms = updatedContract.deliveryTerms;
    this.appendix = updatedContract.appendix;
    this.futureDeliveryDate = updatedContract.futureDeliveryDate;
    this.settlementTerms = updatedContract.settlementTerms;
  }

  clearErrorMessage() {
    this.errorMessage = '';
  }
}