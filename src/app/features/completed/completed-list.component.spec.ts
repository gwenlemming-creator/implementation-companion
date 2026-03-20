import '@angular/compiler';
import { CompletedListComponent } from './completed-list.component';
import { PlanService } from '../../core/services/plan.service';

describe('CompletedListComponent', () => {
  let service: PlanService;

  beforeEach(() => {
    service = new PlanService();
  });

  function createClosedPlan(name: string): void {
    const plan = service.createPlan(name, { timeOff: false, benefits: false, orgLevels: false });
    plan.sections.forEach(s => service.updateSection(plan.id, s.slug, { status: 'complete' }));
    service.closePlan(plan.id, 'sp-user-1');
  }

  it('should create', () => {
    expect(CompletedListComponent).toBeTruthy();
  });
});
