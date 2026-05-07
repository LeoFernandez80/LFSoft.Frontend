import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@lib/shared';

@Component({
  selector: 'app-person-drawer',
  template: '',
  styleUrls: ['./person-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class PersonDrawerComponent {}
