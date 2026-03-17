import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SutaBilling } from '../../../../../../core/models/plan.model';

@Component({
  selector: 'app-suta-billing-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './suta-billing-table.component.html'
})
export class SutaBillingTableComponent {
  rows = input.required<SutaBilling[]>();
  rowsChange = output<SutaBilling[]>();

  addRow(): void {
    this.rowsChange.emit([...this.rows(), { id: crypto.randomUUID(), state: '', effectiveDate: null, billRate: null }]);
  }

  updateRow(id: string, field: keyof SutaBilling, value: unknown): void {
    this.rowsChange.emit(this.rows().map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  removeRow(id: string): void {
    this.rowsChange.emit(this.rows().filter(r => r.id !== id));
  }
}
