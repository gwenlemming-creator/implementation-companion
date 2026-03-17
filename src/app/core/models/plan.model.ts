export type PlanStatus = 'not_started' | 'in_progress' | 'complete';
export type SectionStatus = 'not_started' | 'in_progress' | 'complete';
export type InputMethod = 'upload' | 'manual';

export interface BillingRule {
  id: string;
  description: string;
  rate: number | null;
  basedOn: string;
}

export interface SutaBilling {
  id: string;
  state: string;
  effectiveDate: string | null;
  billRate: number | null;
}

export interface SpConfig {
  employer: string;
  wcPolicy: string;
  billingTemplate: string;
  glTemplate: string;
  billingFormat: string;
  achDetailType: string;
  payrollRep: string;
  statusDate: string | null;
  payCode1: string;
  payCode2: string;
  payCode3: string;
  billingRules: BillingRule[];
  sutaBilling: SutaBilling[];
  savedAt: string | null;
}

export interface PlanSection {
  slug: string;
  title: string;
  order: number;
  status: SectionStatus;
  optional: boolean;
  enabled: boolean;
  inputMethod: InputMethod | null;
  draftData: Record<string, unknown> | null;
  completedAt: string | null;
  inputMethodAtCompletion: InputMethod | null;
}

export interface Plan {
  id: string;
  clientName: string;
  status: PlanStatus;
  worksiteManagerId: string | null;
  modules: {
    timeOff: boolean;
    benefits: boolean;
    orgLevels: boolean;
  };
  spConfig: SpConfig;
  sections: PlanSection[];
  createdAt: string;
  updatedAt: string;
}

export const CORE_SECTIONS: Pick<PlanSection, 'slug' | 'title' | 'order' | 'optional'>[] = [
  { slug: 'company-info',       title: 'Company Info',                  order: 1,  optional: false },
  { slug: 'fein',               title: 'FEIN',                          order: 2,  optional: false },
  { slug: 'banking-ach',        title: 'Banking / ACH',                 order: 3,  optional: false },
  { slug: 'payroll-schedule',   title: 'Payroll Schedule',              order: 4,  optional: false },
  { slug: 'positions',          title: 'Positions',                     order: 5,  optional: false },
  { slug: 'wc-codes',           title: 'Workers\' Compensation Codes',  order: 6,  optional: false },
  { slug: 'worksite-locations', title: 'Worksite Locations',            order: 7,  optional: false },
  { slug: 'time-off',           title: 'Time Off',                      order: 8,  optional: true  },
  { slug: 'benefits',           title: 'Benefits',                      order: 9,  optional: true  },
  { slug: 'org-levels',         title: 'Organizational Levels',         order: 10, optional: true  },
];

export function buildDefaultSections(modules: Plan['modules']): PlanSection[] {
  return CORE_SECTIONS
    .filter(s => !s.optional || isModuleEnabled(s.slug, modules))
    .map(s => ({
      ...s,
      status: 'not_started' as SectionStatus,
      enabled: true,
      inputMethod: null,
      draftData: null,
      completedAt: null,
      inputMethodAtCompletion: null,
    }));
}

function isModuleEnabled(slug: string, modules: Plan['modules']): boolean {
  if (slug === 'time-off')   return modules.timeOff;
  if (slug === 'benefits')   return modules.benefits;
  if (slug === 'org-levels') return modules.orgLevels;
  return false;
}

export function computePlanStatus(plan: Plan): PlanStatus {
  const enabled = plan.sections.filter(s => s.enabled);
  if (enabled.length > 0 && enabled.every(s => s.status === 'complete')) return 'complete';
  if (enabled.some(s => s.status !== 'not_started')) return 'in_progress';
  return 'not_started';
}

export function computeSpConfigComplete(config: SpConfig): boolean {
  if (!config.savedAt) return false;
  const required: (keyof SpConfig)[] = [
    'employer','wcPolicy','billingTemplate','glTemplate',
    'billingFormat','achDetailType','payrollRep','statusDate',
    'payCode1','payCode2','payCode3'
  ];
  return required.every(k => !!config[k]);
}
