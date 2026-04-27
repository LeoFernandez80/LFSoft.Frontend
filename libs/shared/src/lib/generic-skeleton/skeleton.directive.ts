import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

/**
 * Directiva para mostrar skeleton loading en elementos con clase .skeleton-field
 * Uso: <div [lfsoftSkeleton]="isLoading">...</div>
 */
@Directive({
  selector: '[lfsoftSkeleton]',
  standalone: true,
})
export class SkeletonDirective implements OnChanges, AfterViewInit, OnDestroy {
  @Input('lfsoftSkeleton') isLoading = false;

  private skeletons = new Map<HTMLElement, HTMLElement>();
  private observers = new Map<HTMLElement, ResizeObserver>();
  private initialized = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.initialized = true;
    if (this.isLoading) this.toggleSkeleton(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['isLoading']) {
      this.toggleSkeleton(this.isLoading);
    }
  }

  ngOnDestroy(): void {
    // limpiar observers
    this.observers.forEach((obs) => obs.disconnect());
    this.observers.clear();
  }

  private toggleSkeleton(show: boolean): void {
    const container = this.el.nativeElement as HTMLElement;
    const fields = Array.from(
      container.querySelectorAll('.skeleton-field')
    ) as HTMLElement[];

    fields.forEach((field) => {
      if (show) {
        // Crear o reutilizar skeleton
        let skeletonDiv = this.skeletons.get(field);
        if (!skeletonDiv) {
          // Buscar el input dentro del campo para dimensionar el skeleton solo sobre él
          const inputEl = field.querySelector(
            'input, select, textarea, p-inputnumber, p-dropdown, p-select, p-autocomplete, p-datepicker, p-calendar, p-multiselect, p-inputtext'
          ) as HTMLElement | null;

          const getInputMetrics = () => {
            const target = inputEl ?? field;
            const fieldRect = field.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            return {
              top: targetRect.top - fieldRect.top,
              left: targetRect.left - fieldRect.left,
              height: target.offsetHeight,
              width: target.offsetWidth,
              borderRadius: getComputedStyle(target).borderRadius,
            };
          };

          const metrics = getInputMetrics();

          skeletonDiv = this.renderer.createElement('div');
          this.renderer.addClass(skeletonDiv, 'skeleton-placeholder');
          this.renderer.addClass(skeletonDiv, 'fade-in');
          this.renderer.setStyle(skeletonDiv, 'position', 'absolute');
          this.renderer.setStyle(skeletonDiv, 'top', `${metrics.top}px`);
          this.renderer.setStyle(skeletonDiv, 'left', `${metrics.left}px`);
          this.renderer.setStyle(skeletonDiv, 'width', `${metrics.width}px`);
          this.renderer.setStyle(skeletonDiv, 'height', `${metrics.height}px`);
          this.renderer.setStyle(skeletonDiv, 'border-radius', metrics.borderRadius);
          this.renderer.setStyle(skeletonDiv, 'z-index', '1');

          // Asegurar que el contenedor permita posicionar el skeleton
          const pos = getComputedStyle(field).position;
          if (pos === 'static' || !pos) {
            this.renderer.setStyle(field, 'position', 'relative');
          }

          this.skeletons.set(field, skeletonDiv!);

          // Observar cambios de tamaño
          const observer = new ResizeObserver(() => {
            const m = getInputMetrics();
            this.renderer.setStyle(skeletonDiv!, 'top', `${m.top}px`);
            this.renderer.setStyle(skeletonDiv!, 'left', `${m.left}px`);
            this.renderer.setStyle(skeletonDiv!, 'height', `${m.height}px`);
            this.renderer.setStyle(skeletonDiv!, 'width', `${m.width}px`);
          });
          observer.observe(field);
          this.observers.set(field, observer);
        }

        // Fade in skeleton
        this.renderer.addClass(skeletonDiv!, 'fade-in');
        this.renderer.removeClass(skeletonDiv!, 'fade-out');

        // Ocultar contenido interno mientras carga
        this.renderer.setStyle(field, 'color', 'transparent');
        this.renderer.setStyle(field, 'user-select', 'none');
        this.renderer.appendChild(field, skeletonDiv!);
      } else {
        // Remover skeleton y restaurar
        const skeletonDiv = this.skeletons.get(field);
        if (skeletonDiv) {
          this.renderer.removeClass(skeletonDiv, 'fade-in');
          this.renderer.addClass(skeletonDiv, 'fade-out');

          setTimeout(() => {
            this.renderer.removeChild(field, skeletonDiv);
            this.renderer.removeStyle(field, 'color');
            this.renderer.removeStyle(field, 'user-select');

            // detener observer
            const obs = this.observers.get(field);
            if (obs) obs.disconnect();
            this.observers.delete(field);
            this.skeletons.delete(field);
          }, 300);
        }
      }
    });
  }
}
