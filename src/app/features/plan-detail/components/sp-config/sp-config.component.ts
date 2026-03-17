import { Component, input } from '@angular/core';
@Component({ selector: 'app-sp-config', standalone: true, template: '' })
export class SpConfigComponent {
  planId = input.required<string>();
}
