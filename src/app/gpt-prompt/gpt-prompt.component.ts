import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractUploadComponent } from '../contract-upload/contract-upload.component';
import { ContractViewerComponent } from '../contract-viewer/contract-viewer.component';

@Component({
  selector: 'app-gpt-prompt',
  standalone: true,
  imports: [CommonModule, ContractUploadComponent, ContractViewerComponent],
  templateUrl: './gpt-prompt.component.html',
  styleUrls: ['./gpt-prompt.component.css']
})
export class GptPromptComponent {
  selectedContractId: number | null = null;

  onContractUploaded(contract: any) {
    this.selectedContractId = contract.id;
  }

  onContractSelected(contractId: number) {
    this.selectedContractId = contractId;
  }

  onContractUpdated(updatedContract: any) {
    // Handle any logic needed when a contract is updated
    console.log('Contract updated:', updatedContract);
  }
}