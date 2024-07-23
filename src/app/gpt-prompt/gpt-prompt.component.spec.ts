import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptPromptComponent } from './gpt-prompt.component';

describe('GptPromptComponent', () => {
  let component: GptPromptComponent;
  let fixture: ComponentFixture<GptPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GptPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GptPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
