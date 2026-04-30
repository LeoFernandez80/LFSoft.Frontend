import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@lib/shared';

@Component({
  selector: 'app-entity-drawer',
  template: '',
  styleUrls: ['./entity-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class EntityDrawerComponent {}
