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

@Directive({
  selector: '[appSkeleton]',
  standalone: true,
})
export class SkeletonDirective implements OnChanges, AfterViewInit, OnDestroy {
  @Input('appSkeleton') isLoading = false;

  private originalContents = new Map<HTMLElement, string>();
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
        // Guardamos contenido original solo una vez
        if (!this.originalContents.has(field)) {
          this.originalContents.set(field, field.innerHTML);
        }

        // Crear o reutilizar skeleton
        let skeletonDiv = this.skeletons.get(field);
        if (!skeletonDiv) {
          skeletonDiv = this.renderer.createElement('div');
          this.renderer.addClass(skeletonDiv, 'skeleton-placeholder');
          this.renderer.addClass(skeletonDiv, 'fade-in');
          this.renderer.setStyle(skeletonDiv, 'position', 'absolute');
          this.renderer.setStyle(skeletonDiv, 'top', '0');
          this.renderer.setStyle(skeletonDiv, 'left', '0');
          this.renderer.setStyle(skeletonDiv, 'width', '100%');
          this.renderer.setStyle(skeletonDiv, 'height', '100%');
          this.renderer.setStyle(skeletonDiv, 'border-radius', getComputedStyle(field).borderRadius);
          this.renderer.setStyle(skeletonDiv, 'z-index', '1');

          // Asegurar que el contenedor permita posicionar el skeleton
          const pos = getComputedStyle(field).position;
          if (pos === 'static' || !pos) {
            this.renderer.setStyle(field, 'position', 'relative');
          }

          this.skeletons.set(field, skeletonDiv!);

          // Observar cambios de tamaño
          const observer = new ResizeObserver(() => {
            this.renderer.setStyle(skeletonDiv!, 'height', `${field.offsetHeight}px`);
            this.renderer.setStyle(skeletonDiv!, 'width', `${field.offsetWidth}px`);
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

            const original = this.originalContents.get(field);
            if (original) {
              this.renderer.setProperty(field, 'innerHTML', original);
            }

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
