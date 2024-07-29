import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// const serverUrl = 'https://contractbot-api.azurewebsites.net';
const serverUrl = 'http://localhost:5198';

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

@Component({
  selector: 'app-contract-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-upload.component.html',
  styleUrls: ['./contract-upload.component.css']  
})
export class ContractUploadComponent {
  @Output() contractUploaded = new EventEmitter<any>();
  @Output() contractSelected = new EventEmitter<number>();

  errorMessage = '';
  isLoadingContracts = false;
  contracts: { id: number; originalFileName: string }[] = [];
  selectedFile: File | null = null;
  

  constructor(private http: HttpClient) {
    this.fetchContracts();
  }

  // Include the methods: clearErrorMessage
  // These methods should be copied from the GptPromptComponent and adjusted as necessary

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
          this.contractSelected.emit(response.id);
        },
        error: (error) => {
          console.error('Error fetching contract:', error);
          this.errorMessage = 'An error occurred while fetching the contract.';
        }
      });
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

  clearErrorMessage() {
    this.errorMessage = '';
  }

  handleContractResponse(response: UploadResponse) {
    if (response.isContract === false) {
      this.errorMessage = response.message || 'The uploaded document is not a contract.';
      this.resetContractData();
    } else {
      this.errorMessage = '';
      this.contractUploaded.emit(response);
      this.contractSelected.emit(response.id);
      
      // Refresh the contracts list after uploading a new contract
      this.fetchContracts();
    }
  }

  resetContractData() {
    // Reset any local state if necessary
    this.selectedFile = null;
    // Emit an event to notify the parent component to reset its data
    this.contractUploaded.emit(null);
  }
}