import { Component, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Plan } from '../../../../core/models/plan.model';
import { PlanService } from '../../../../core/services/plan.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type ModuleKey = 'timeOff' | 'benefits' | 'orgLevels';

@Component({
  selector: 'app-edit-plan-drawer',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './edit-plan-drawer.component.html'
})
export class EditPlanDrawerComponent implements OnInit {
  private planService = inject(PlanService);
  plan = input.required<Plan>();
  closed = output<void>();

  localModules = signal({ timeOff: false, benefits: false, orgLevels: false });
  confirmingModuleOff: ModuleKey | null = null;
  modulesWithData = new Set<ModuleKey>();

  ngOnInit(): void {
    this.localModules.set({ ...this.plan().modules });
    const slugToKey: Record<string, ModuleKey> = {
      'time-off': 'timeOff', 'benefits': 'benefits', 'org-levels': 'orgLevels'
    };
    this.plan().sections
      .filter(s => s.optional && s.draftData)
      .forEach(s => {
        const key = slugToKey[s.slug];
        if (key) this.modulesWithData.add(key);
      });
  }

  onModuleToggle(key: ModuleKey, value: boolean): void {
    if (!value && this.modulesWithData.has(key)) {
      this.confirmingModuleOff = key;
    } else {
      this.applyModuleToggle(key, value);
    }
  }

  confirmToggleOff(): void {
    if (!this.confirmingModuleOff) return;
    this.applyModuleToggle(this.confirmingModuleOff, false);
    this.confirmingModuleOff = null;
  }

  cancelToggleOff(): void {
    if (!this.confirmingModuleOff) return;
    this.localModules.update(m => ({ ...m, [this.confirmingModuleOff!]: true }));
    this.confirmingModuleOff = null;
  }

  private applyModuleToggle(key: ModuleKey, value: boolean): void {
    this.localModules.update(m => ({ ...m, [key]: value }));
    this.planService.toggleModule(this.plan().id, key, value);
  }

  save(): void { this.closed.emit(); }

  moduleLabel(key: ModuleKey): string {
    return { timeOff: 'Time Off', benefits: 'Benefits', orgLevels: 'Organizational Levels' }[key];
  }
}
