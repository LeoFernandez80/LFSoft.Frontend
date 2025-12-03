import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-quote-header-actions',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './quote-header-actions.component.html',
  styleUrl: './quote-header-actions.component.scss',
  standalone: true
})
export class QuoteHeaderActionsComponent {
  @Output() create = new EventEmitter<void>();

  onCreateClick(): void {
    this.create.emit();
  }
}
