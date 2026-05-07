import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@lib/shared';

@Component({
  selector: 'app-company-drawer',
  template: '',
  styleUrls: ['./company-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class CompanyDrawerComponent {}




