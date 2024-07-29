import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const serverUrl = 'https://contractbot-api.azurewebsites.net';
// const serverUrl = 'http://localhost:5198';

@Component({
  selector: 'app-contract-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-viewer.component.html',
  styleUrls: ['./contract-viewer.component.css']
})
export class ContractViewerComponent implements OnInit, OnChanges {
  @Input() contractId: number | null = null;
  @Output() contractUpdated = new EventEmitter<any>();

  contractText: string = '';
  isEditing: boolean = false;
  loading: boolean = false;
  blobStorageLocation: string | null = null;
  contractType: string = '';
  product: string = '';
  price: string = '';
  volume: string = '';
  deliveryTerms: string = '';
  appendix: string = '';
  futureDeliveryDate: string = '';
  settlementTerms: string = '';
  prompt: string = '';
  response: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchContract();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contractId']) {
      this.fetchContract();
    }
  }

  fetchContract() {
    if (!this.contractId) {
      console.error('No contract ID provided');
      return;
    }
    this.loading = true;
    this.http.get<any>(`${serverUrl}/api/gpt/contract/${this.contractId}`)
      .subscribe({
        next: (response) => {
          this.updateContractDetails(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching contract:', error);
          this.loading = false;
        }
      });
  }

  updateContractDetails(contract: any) {
    this.contractText = contract.contractText || this.contractText;
    this.blobStorageLocation = contract.blobStorageLocation || this.blobStorageLocation;
    this.contractType = contract.contractType || this.contractType;
    this.product = contract.product || this.product;
    this.price = contract.price || this.price;
    this.volume = contract.volume || this.volume;
    this.deliveryTerms = contract.deliveryTerms || this.deliveryTerms;
    this.appendix = contract.appendix || this.appendix;
    this.futureDeliveryDate = contract.futureDeliveryDate || this.futureDeliveryDate;
    this.settlementTerms = contract.settlementTerms || this.settlementTerms;
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.fetchContract(); // Revert changes by fetching the original contract
  }

  saveEdits() {
    this.loading = true;
    this.http.patch<any>(`${serverUrl}/api/gpt/edit-contract/${this.contractId}`, { textContent: this.contractText })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.isEditing = false;
          this.updateContractDetails(response.updatedContract);
          this.contractUpdated.emit(response.updatedContract);
        },
        error: (error) => {
          console.error('Error updating contract:', error);
          this.loading = false;
        }
      });
  }

  sendPrompt() {
    this.loading = true;
    this.http.post<any>(`${serverUrl}/api/gpt/contract/${this.contractId}/prompt`, { prompt: this.prompt })
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.response.prompt_type === 'contract_edit') {
            this.contractText = response.response.updated_text;
            this.updateContractDetails(response.updatedContract);
            this.contractUpdated.emit(response.updatedContract);
          }
          this.response = response.response.prompt_response;
        },
        error: (error) => {
          console.error('Error sending prompt:', error);
          this.loading = false;
        }
      });
  }
}