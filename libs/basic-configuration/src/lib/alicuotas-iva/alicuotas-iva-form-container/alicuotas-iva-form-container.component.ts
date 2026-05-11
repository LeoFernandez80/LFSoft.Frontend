import { NgIf } from '@angular/common';
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  TranslatePipe, GenericLayoutComponent, GenericMessageComponent,
  EnumLayoutType, MessagesService, EnumMessageType
} from '@lib/shared';
import { AlicuotaIvaFormComponent } from '../alicuota-iva-form/alicuota-iva-form.component';
import { AlicuotaIva } from '../models/alicuota-iva.model';

@Component({
  selector: 'app-alicuotas-iva-form-container',
  templateUrl: './alicuotas-iva-form-container.component.html',
  styleUrls: ['./alicuotas-iva-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, TranslatePipe, GenericLayoutComponent, GenericMessageComponent, AlicuotaIvaFormComponent]
})
export class AlicuotasIvaFormContainerComponent implements OnInit {
  alicuotaIvaId: string = '';
  layoutTypes = EnumLayoutType;

  private readonly _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _messagesService = inject(MessagesService);

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(params => {
        this.alicuotaIvaId = params['id'] ? params['id'] : '';
      });
  }

  onSaveAlicuotaIva(_alicuotaIva: AlicuotaIva): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelAlicuotaIva(): void {
    window.close();
  }
}
