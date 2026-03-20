import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'plans', pathMatch: 'full' },
  {
    path: 'plans',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'plans/:id',
    loadComponent: () =>
      import('./features/plan-detail/plan-detail.component').then(m => m.PlanDetailComponent),
    children: [
      {
        path: 'sections/:sectionSlug',
        loadComponent: () =>
          import('./features/section-view/section-view.component').then(m => m.SectionViewComponent)
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./features/plan-detail/components/sp-config/sp-config.component').then(m => m.SpConfigComponent)
      }
    ]
  },
  {
    path: 'completed',
    loadComponent: () =>
      import('./features/completed/completed-list.component').then(m => m.CompletedListComponent)
  },
  {
    path: 'completed/:id',
    loadComponent: () =>
      import('./features/plan-detail/plan-detail.component').then(m => m.PlanDetailComponent),
    data: { readOnly: true },
    children: [
      {
        path: 'sections/:sectionSlug',
        loadComponent: () =>
          import('./features/section-view/section-view.component').then(m => m.SectionViewComponent)
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./features/plan-detail/components/sp-config/sp-config.component').then(m => m.SpConfigComponent)
      }
    ]
  }
];
