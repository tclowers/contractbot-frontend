import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractViewerComponent } from './contract-viewer.component';

describe('ContractViewerComponent', () => {
  let component: ContractViewerComponent;
  let fixture: ComponentFixture<ContractViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
