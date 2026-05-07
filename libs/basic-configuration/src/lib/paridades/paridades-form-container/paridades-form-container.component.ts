import { NgIf } from '@angular/common';
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  TranslatePipe, GenericLayoutComponent, GenericMessageComponent,
  EnumLayoutType, MessagesService, EnumMessageType
} from '@lib/shared';
import { ParidadFormComponent } from '../paridad-form/paridad-form.component';
import { Paridad } from '../models/paridad.model';

@Component({
  selector: 'app-paridades-form-container',
  templateUrl: './paridades-form-container.component.html',
  styleUrls: ['./paridades-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, TranslatePipe, GenericLayoutComponent, GenericMessageComponent, ParidadFormComponent]
})
export class ParidadesFormContainerComponent implements OnInit {
  paridadId: string = '';
  layoutTypes = EnumLayoutType;

  private readonly _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _messagesService = inject(MessagesService);

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(params => {
        this.paridadId = params['id'] ? params['id'] : '';
      });
  }

  onSaveParidad(paridad: Paridad): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelParidad(): void {
    window.close();
  }
}
