import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BillingRule } from '../../../../../../core/models/plan.model';

@Component({
  selector: 'app-billing-rules-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './billing-rules-table.component.html'
})
export class BillingRulesTableComponent {
  rules = input.required<BillingRule[]>();
  rulesChange = output<BillingRule[]>();

  addRow(): void {
    this.rulesChange.emit([...this.rules(), { id: crypto.randomUUID(), description: '', rate: null, basedOn: '' }]);
  }

  updateRow(id: string, field: keyof BillingRule, value: unknown): void {
    this.rulesChange.emit(this.rules().map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  removeRow(id: string): void {
    this.rulesChange.emit(this.rules().filter(r => r.id !== id));
  }
}
