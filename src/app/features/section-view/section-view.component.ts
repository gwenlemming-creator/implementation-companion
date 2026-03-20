import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PlanService } from '../../core/services/plan.service';
import { InputMethod } from '../../core/models/plan.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UploadAreaComponent } from './components/upload-area/upload-area.component';
import { ManualEntryComponent } from './components/manual-entry/manual-entry.component';

@Component({
  selector: 'app-section-view',
  standalone: true,
  imports: [StatusBadgeComponent, UploadAreaComponent, ManualEntryComponent],
  template: `
    @if (section(); as s) {
      <div class="section-card">
        <div class="section-card__header">
          <span class="section-card__title">{{ s.title }}</span>
          <app-status-badge [status]="s.status" />
        </div>

        <div class="section-card__body">
          <div class="method-toggle">
            <div class="method-card" [class.method-card--active]="activeMethod() === 'upload'"
                 (click)="switchMethod('upload')">
              <i class="fa-regular fa-file method-card__icon"></i>
              <div class="method-card__title">Upload a File</div>
              <div class="method-card__desc">PDF, Excel, CSV, or JPEG</div>
            </div>
            <div class="method-card" [class.method-card--active]="activeMethod() === 'manual'"
                 (click)="switchMethod('manual')">
              <i class="fa-regular fa-pen-to-square method-card__icon"></i>
              <div class="method-card__title">Enter Manually</div>
              <div class="method-card__desc">Type directly into form fields</div>
            </div>
          </div>

          @if (activeMethod() === 'upload') {
            <app-upload-area (fileUploaded)="onFileUploaded()" (cleared)="onFileCleared()" />
          } @else {
            <app-manual-entry [section]="s" [planId]="planId()!" (dataChanged)="onManualDataChanged($event)" />
          }
        </div>

        <div class="section-card__footer">
          <button class="btn btn-secondary" (click)="saveDraft()">Save Draft</button>
          <button class="btn btn-primary" [disabled]="!canMarkComplete" (click)="markComplete()">
            Mark Complete
          </button>
        </div>
      </div>
    } @else {
      <p class="empty-state">Section not found.</p>
    }
  `
})
export class SectionViewComponent {
  private route = inject(ActivatedRoute);
  private planService = inject(PlanService);

  planId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id') ?? this.route.snapshot.parent?.paramMap.get('id') ?? ''))
  );
  sectionSlug = toSignal(this.route.paramMap.pipe(map(p => p.get('sectionSlug') ?? '')));

  plan = computed(() => this.planService.getPlan(this.planId()!));
  section = computed(() => this.plan()?.sections.find(s => s.slug === this.sectionSlug()));

  activeMethod = signal<InputMethod>('upload');
  hasUpload = signal(false);
  manualData = signal<Record<string, unknown>>({});

  get canMarkComplete(): boolean {
    if (this.activeMethod() === 'upload') return this.hasUpload();
    return Object.values(this.manualData()).some(v => v);
  }

  switchMethod(method: InputMethod): void {
    this.activeMethod.set(method);
    this.hasUpload.set(false);
    this.manualData.set({});
  }

  onFileUploaded(): void { this.hasUpload.set(true); }
  onFileCleared(): void { this.hasUpload.set(false); }
  onManualDataChanged(data: Record<string, unknown>): void { this.manualData.set(data); }

  saveDraft(): void {
    this.planService.updateSection(this.planId()!, this.sectionSlug()!, {
      status: 'in_progress',
      inputMethod: this.activeMethod(),
      draftData: this.activeMethod() === 'manual' ? this.manualData() : { hasFile: true }
    });
  }

  markComplete(): void {
    if (!this.canMarkComplete) return;
    this.planService.updateSection(this.planId()!, this.sectionSlug()!, {
      status: 'complete',
      inputMethod: this.activeMethod(),
      inputMethodAtCompletion: this.activeMethod(),
      completedAt: new Date().toISOString(),
      draftData: this.activeMethod() === 'manual' ? this.manualData() : { hasFile: true }
    });
  }
}
