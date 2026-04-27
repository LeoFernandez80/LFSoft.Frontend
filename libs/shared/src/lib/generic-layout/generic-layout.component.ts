import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnumLayoutType } from './enums/layout-type.enum';

/**
 * Componente de layout genérico con soporte para sidebar redimensionable
 * Uso: <lfsoft-shared-layout [title]="'Mi Título'" [type]="layoutType">...</lfsoft-shared-layout>
 */
@Component({
  selector: 'lfsoft-shared-layout',
  templateUrl: './generic-layout.component.html',
  styleUrls: ['./generic-layout.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class GenericLayoutComponent {
  @Input() title: string = '';
  @Input() type: EnumLayoutType = EnumLayoutType.layoutWithSidebar;

  public layoutTypes = EnumLayoutType;
  public sidebarWidth: number = 400;
  public filterHeight: number = 200;
  private isResizing: boolean = false;
  private isResizingFilter: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private startWidth: number = 0;
  private startHeight: number = 0;


  onMouseDown(event: MouseEvent): void {
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.sidebarWidth;
    event.preventDefault();

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isResizing) return;
      const delta = e.clientX - this.startX;
      const newWidth = this.startWidth + delta;
      
      // Límites mínimo y máximo
      if (newWidth >= 200 && newWidth <= 800) {
        this.sidebarWidth = newWidth;
      }
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onFilterResizerMouseDown(event: MouseEvent): void {
    this.isResizingFilter = true;
    this.startY = event.clientY;
    this.startHeight = this.filterHeight;
    event.preventDefault();

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isResizingFilter) return;
      const delta = e.clientY - this.startY;
      const newHeight = this.startHeight - delta;
      
      // Límites mínimo y máximo
      if (newHeight >= 100 && newHeight <= 600) {
        this.filterHeight = newHeight;
      }
    };

    const onMouseUp = () => {
      this.isResizingFilter = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
