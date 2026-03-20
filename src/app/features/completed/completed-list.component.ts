import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PlanService } from '../../core/services/plan.service';
import { AuthService } from '../../core/services/auth.service';
import { Plan } from '../../core/models/plan.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-completed-list',
  standalone: true,
  imports: [FormsModule, RouterLink, StatusBadgeComponent, DatePipe],
  templateUrl: './completed-list.component.html',
  styleUrl: './completed-list.component.css'
})
export class CompletedListComponent {
  private planService = inject(PlanService);
  private authService = inject(AuthService);

  isWsm = this.authService.isWsm;

  plans = signal<Plan[]>(this.planService.getClosedPlans());
  searchQuery = signal('');
  sortColumn = signal<'clientName' | 'closedAt' | 'worksiteManagerId' | 'closedBy'>('closedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  filteredPlans = computed(() => {
    const q = this.searchQuery().toLowerCase();
    let result = this.plans().filter(p => p.clientName.toLowerCase().includes(q));

    const col = this.sortColumn();
    const dir = this.sortDirection();
    result.sort((a, b) => {
      const aVal = (a[col] ?? '').toString().toLowerCase();
      const bVal = (b[col] ?? '').toString().toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return dir === 'asc' ? cmp : -cmp;
    });

    return result;
  });

  toggleSort(column: 'clientName' | 'closedAt' | 'worksiteManagerId' | 'closedBy'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set(column === 'closedAt' ? 'desc' : 'asc');
    }
  }
}
