import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { TranslationService } from '../generic-translate/translation.service';

@Directive({
  selector: '[lfsoftFormValidations]',
  standalone: true
})
export class FormValidationsDirective implements OnInit {

  @Input('lfsoftFormValidations') formGroup!: FormGroup;

  @Input() errorMessages: { [key: string]: string } = {};

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2, 
    private _translationService: TranslationService
  ) {}

  ngOnInit(): void {
    if (!this.formGroup) {
      console.error('lfsoftFormValidations requires a FormGroup');
      return;
    }
    

    this.updateErrors();

    this.formGroup.statusChanges.subscribe(() => {
      this.updateErrors();
    });
  }

  private updateErrors(): void {
    Object.keys(this.formGroup.controls).forEach(controlName => {
      const control: AbstractControl = this.formGroup.get(controlName)!;
      const inputEl: HTMLElement | null = this.el.nativeElement.querySelector(`[formControlName="${controlName}"]`);
      if (!inputEl) return;

      const container = inputEl.parentElement!;
      this.renderer.setStyle(container, 'position', 'relative');

      let icon = container.querySelector('.error-icon') as HTMLElement;
      let tooltip: HTMLElement;

      if (!icon) {
        icon = this.renderer.createElement('div');
        this.renderer.addClass(icon, 'error-icon');
        this.renderer.setStyle(icon, 'position', 'absolute');
        this.renderer.setStyle(icon, 'top', '4px');
        this.renderer.setStyle(icon, 'right', '4px');
        this.renderer.setStyle(icon, 'width', '16px');
        this.renderer.setStyle(icon, 'height', '16px');
        this.renderer.setStyle(icon, 'cursor', 'pointer');
        this.renderer.setStyle(icon, 'z-index', '10');

        this.renderer.setProperty(icon, 'innerHTML', `
          <svg viewBox="0 0 24 24" fill="#f69797" width="16" height="16">
            <circle cx="12" cy="12" r="12"/>
            <line x1="12" y1="6" x2="12" y2="14" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="18" r="1" fill="white"/>
          </svg>
        `);

        tooltip = this.renderer.createElement('div');
        this.renderer.addClass(tooltip, 'error-tooltip');
        this.renderer.setStyle(tooltip, 'position', 'absolute');
        this.renderer.setStyle(tooltip, 'top', '50%');
        this.renderer.setStyle(tooltip, 'right', '110%');
        this.renderer.setStyle(tooltip, 'transform', 'translateY(-50%) translateX(10px)');
        this.renderer.setStyle(tooltip, 'background', `var(--message-error-bg)`);
        this.renderer.setStyle(tooltip, 'color', `var(--message-primary-text)`);
        this.renderer.setStyle(tooltip, 'padding', '4px 4px');
        this.renderer.setStyle(tooltip, 'border-radius', '8px');
        this.renderer.setStyle(tooltip, 'border', '1px solid var(--message-error-border)');
        this.renderer.setStyle(tooltip, 'white-space', 'nowrap');
        this.renderer.setStyle(tooltip, 'opacity', '0');
        this.renderer.setStyle(tooltip, 'transition', 'all 0.3s ease');
        this.renderer.setStyle(tooltip, 'pointer-events', 'none');
        this.renderer.setStyle(tooltip, 'font-size', '0.75rem');
        this.renderer.setStyle(tooltip, 'height', '12px');

        this.renderer.appendChild(icon, tooltip);
        this.renderer.appendChild(container, icon);
      } else {
        tooltip = icon.querySelector('.error-tooltip') as HTMLElement;
      }

      if (control.invalid && control.dirty) {
        const firstErrorKey = Object.keys(control.errors!)[0];
        const message = this._translationService.translate('VALIDATION.' + firstErrorKey) || this._translationService.translate('unknownError');
        this.renderer.setProperty(tooltip, 'textContent', message);
        this.renderer.setStyle(icon, 'display', 'block');
        this.renderer.setStyle(tooltip, 'opacity', '1');
        this.renderer.setStyle(tooltip, 'transform', 'translateY(-50%) translateX(0)');
      } else {
        this.renderer.setStyle(icon, 'display', 'none');
        this.renderer.setStyle(tooltip, 'opacity', '0');
        this.renderer.setStyle(tooltip, 'transform', 'translateY(-50%) translateX(10px)');
      }
    });
  }
}
