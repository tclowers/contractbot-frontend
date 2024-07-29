import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractUploadComponent } from '../contract-upload/contract-upload.component';
import { ContractViewerComponent } from '../contract-viewer/contract-viewer.component';

@Component({
  selector: 'app-gpt-prompt',
  standalone: true,
  imports: [CommonModule, ContractUploadComponent, ContractViewerComponent],
  template: `
    <div class="container" [class.file-uploaded]="selectedContractId !== null">
      <div class="row">
        <div *ngIf="selectedContractId === null">
          <app-contract-upload 
            (contractUploaded)="onContractUploaded($event)"
            (contractSelected)="onContractSelected($event)">
          </app-contract-upload>
        </div>
        <div *ngIf="selectedContractId !== null">
          <app-contract-viewer 
            [contractId]="selectedContractId"
            (contractUpdated)="onContractUpdated($event)">
          </app-contract-viewer>
        </div>
      </div>
    </div>
  `,
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