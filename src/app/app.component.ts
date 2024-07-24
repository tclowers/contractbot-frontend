import { Component } from '@angular/core';
import { GptPromptComponent } from './gpt-prompt/gpt-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GptPromptComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'contractbot-frontend';
}