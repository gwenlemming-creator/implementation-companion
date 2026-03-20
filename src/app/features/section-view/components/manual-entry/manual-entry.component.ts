import { Component, inject, input, output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../../core/services/plan.service';
import { PlanSection } from '../../../../core/models/plan.model';

export interface PositionRow { id: string; title: string; description: string; }
export interface WcCodeRow  { id: string; code: string; positions: string[]; }
export interface LocationRow { id: string; name: string; address1: string; address2: string; city: string; state: string; zip: string; }

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manual-entry.component.html'
})
export class ManualEntryComponent {
  private planService = inject(PlanService);

  section  = input.required<PlanSection>();
  planId   = input.required<string>();
  dataChanged = output<Record<string, unknown>>();

  // ── Company Info ─────────────────────────────────────────────────────────
  companyInfo = signal({
    legalName: '', dba: '',
    address1: '', address2: '', city: '', state: '', zip: '',
    telephone: '',
    contactName: '', contactTitle: '', contactTelephone: '', contactEmail: '',
    businessType: ''
  });

  // ── FEIN ──────────────────────────────────────────────────────────────────
  feinData = signal({ federalId: '' });

  // ── Banking ───────────────────────────────────────────────────────────────
  banking = signal({ accountNumber: '', routingNumber: '', accountType: '' });

  // ── Payroll Schedule ──────────────────────────────────────────────────────
  payroll = signal({ payPeriod: '', payDate: '', periodEndsValue: '', periodEndsDirection: 'before' });

  // ── Positions (repeating) ─────────────────────────────────────────────────
  positions = signal<PositionRow[]>([this.newPosition()]);

  // ── W/C Codes (repeating) ─────────────────────────────────────────────────
  wcCodes = signal<WcCodeRow[]>([this.newWcCode()]);

  // ── Worksite Locations (repeating) ────────────────────────────────────────
  locations = signal<LocationRow[]>([this.newLocation()]);

  // Positions saved in the Positions section, available for W/C code linking
  availablePositions = computed<string[]>(() => {
    const plan = this.planService.getPlan(this.planId());
    const sec  = plan?.sections.find(s => s.slug === 'positions');
    const data = sec?.draftData as { positions?: PositionRow[] } | null;
    return (data?.positions ?? []).map(p => p.title).filter(Boolean);
  });

  // ── Reference data ────────────────────────────────────────────────────────
  readonly usStates = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
    'VA','WA','WV','WI','WY'
  ];

  readonly businessTypes = [
    'Limited Liability Corporation','S-Corporation','C-Corporation','B-Corporation',
    'Individual/Sole Proprietor','Partnership','Limited Partnership',
    'Limited Liability Partnership','Professional Corporation','Personal Service Corporation',
    'Board Owned','Joint Venture','Tax Exempt','Trust','Church Organization',
    'Not For Profit','Other'
  ];

  readonly payPeriods  = ['Daily','Weekly','Bi-weekly','Semi-Monthly','Monthly'];
  readonly payDays     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // ── Update helpers ────────────────────────────────────────────────────────
  setCompanyInfo(field: string, value: string): void {
    this.companyInfo.update(d => ({ ...d, [field]: value }));
    this.dataChanged.emit({ companyInfo: this.companyInfo() });
  }

  setFein(value: string): void {
    this.feinData.set({ federalId: value });
    this.dataChanged.emit({ fein: this.feinData() });
  }

  setBanking(field: string, value: string): void {
    this.banking.update(d => ({ ...d, [field]: value }));
    this.dataChanged.emit({ banking: this.banking() });
  }

  setPayroll(field: string, value: string): void {
    this.payroll.update(d => ({ ...d, [field]: value }));
    this.dataChanged.emit({ payroll: this.payroll() });
  }

  // Positions
  addPosition(): void    { this.positions.update(r => [...r, this.newPosition()]); this.emitPositions(); }
  removePosition(id: string): void { this.positions.update(r => r.filter(x => x.id !== id)); this.emitPositions(); }
  setPosition(id: string, field: keyof Omit<PositionRow,'id'>, value: string): void {
    this.positions.update(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
    this.emitPositions();
  }
  private emitPositions(): void { this.dataChanged.emit({ positions: this.positions() }); }

  // W/C Codes
  addWcCode(): void    { this.wcCodes.update(r => [...r, this.newWcCode()]); this.emitWcCodes(); }
  removeWcCode(id: string): void { this.wcCodes.update(r => r.filter(x => x.id !== id)); this.emitWcCodes(); }
  setWcCode(id: string, value: string): void {
    this.wcCodes.update(r => r.map(x => x.id === id ? { ...x, code: value } : x));
    this.emitWcCodes();
  }
  toggleWcPosition(codeId: string, pos: string): void {
    this.wcCodes.update(r => r.map(x => {
      if (x.id !== codeId) return x;
      const positions = x.positions.includes(pos)
        ? x.positions.filter(p => p !== pos)
        : [...x.positions, pos];
      return { ...x, positions };
    }));
    this.emitWcCodes();
  }
  private emitWcCodes(): void { this.dataChanged.emit({ wcCodes: this.wcCodes() }); }

  // Locations
  addLocation(): void    { this.locations.update(r => [...r, this.newLocation()]); this.emitLocations(); }
  removeLocation(id: string): void { this.locations.update(r => r.filter(x => x.id !== id)); this.emitLocations(); }
  setLocation(id: string, field: keyof Omit<LocationRow,'id'>, value: string): void {
    this.locations.update(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
    this.emitLocations();
  }
  private emitLocations(): void { this.dataChanged.emit({ locations: this.locations() }); }

  // ── Row factories ─────────────────────────────────────────────────────────
  private newPosition(): PositionRow  { return { id: crypto.randomUUID(), title: '', description: '' }; }
  private newWcCode():   WcCodeRow    { return { id: crypto.randomUUID(), code: '', positions: [] }; }
  private newLocation(): LocationRow  { return { id: crypto.randomUUID(), name: '', address1: '', address2: '', city: '', state: '', zip: '' }; }
}
