import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '../generic-translate/translate.pipe';

@Component({
  selector: 'lfsoft-shared-form',
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.scss'],
  imports: [MatIconModule, MatButtonModule, NgIf, TranslatePipe],
  standalone: true
})
export class GenericFormComponent {
  @Input() title: string = '';
  @Input() showActions: boolean = true;
  @Input() showClose: boolean = false;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
