import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@lib/shared';

@Component({
  selector: 'app-person-drawer',
  templateUrl: './person-drawer.component.html',
  styleUrls: ['./person-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class PersonDrawerComponent {}
