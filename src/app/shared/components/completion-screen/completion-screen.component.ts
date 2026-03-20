import { Component, input } from '@angular/core';
import { PlanSection, InputMethod } from '../../../core/models/plan.model';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-completion-screen',
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `
    <div class="completion-screen">
      <div class="completion-screen__hero">
        <i class="fas fa-circle-check completion-screen__icon"></i>
        <h2 class="completion-screen__heading">You're all done!</h2>
        <p class="completion-screen__sub">Your service provider has everything they need to complete your setup. You'll hear from them if anything else is required.</p>
      </div>
      <table class="completion-screen__table data-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Status</th>
            <th>Input Method</th>
          </tr>
        </thead>
        <tbody>
          @for (s of sections(); track s.slug) {
            <tr>
              <td>{{ s.title }}</td>
              <td><app-status-badge [status]="s.status" /></td>
              <td>{{ methodLabel(s.inputMethodAtCompletion) }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class CompletionScreenComponent {
  sections = input.required<PlanSection[]>();

  methodLabel(method: InputMethod | null): string {
    if (method === 'upload') return 'Uploaded file';
    if (method === 'manual') return 'Manual entry';
    return '\u2014';
  }
}
