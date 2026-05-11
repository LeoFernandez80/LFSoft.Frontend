import { NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  TranslatePipe, GenericLayoutComponent, GenericMessageComponent,
  EnumLayoutType, MessagesService, EnumMessageType
} from '@lib/shared';
import { UnidadMedida } from '../models/unidad-medida.model';
import { UnidadMedidaFormComponent } from '../unidad-medida-form/unidad-medida-form.component';

@Component({
  selector: 'app-unidades-medida-form-container',
  templateUrl: './unidades-medida-form-container.component.html',
  styleUrls: ['./unidades-medida-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, TranslatePipe, GenericLayoutComponent, GenericMessageComponent, UnidadMedidaFormComponent]
})
export class UnidadesMedidaFormContainerComponent implements OnInit {
  unidadMedidaId: number = 0;
  layoutTypes = EnumLayoutType;

  private readonly _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _messagesService = inject(MessagesService);

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(params => {
        this.unidadMedidaId = params['id'] ? Number(params['id']) : 0;
      });
  }

  onSaveUnidadMedida(unidadMedida: UnidadMedida): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelUnidadMedida(): void {
    window.close();
  }
}
