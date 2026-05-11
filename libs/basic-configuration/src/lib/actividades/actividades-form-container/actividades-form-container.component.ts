import { NgIf } from '@angular/common';
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  TranslatePipe, GenericLayoutComponent, GenericMessageComponent,
  EnumLayoutType, MessagesService, EnumMessageType
} from '@lib/shared';
import { ActividadFormComponent } from '../actividad-form/actividad-form.component';
import { Actividad } from '../models/actividad.model';

@Component({
  selector: 'app-actividades-form-container',
  templateUrl: './actividades-form-container.component.html',
  styleUrls: ['./actividades-form-container.component.scss'],
  standalone: true,
  imports: [NgIf, TranslatePipe, GenericLayoutComponent, GenericMessageComponent, ActividadFormComponent]
})
export class ActividadesFormContainerComponent implements OnInit {
  actividadId: string = '';
  layoutTypes = EnumLayoutType;

  private readonly _destroyRef = inject(DestroyRef);
  private _route = inject(ActivatedRoute);
  private _messagesService = inject(MessagesService);

  ngOnInit(): void {
    this._route.queryParams
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(params => {
        this.actividadId = params['id'] ? params['id'] : '';
      });
  }

  onSaveActividad(actividad: Actividad): void {
    this._messagesService.addMessage('MESSAGE.successSave', EnumMessageType.Info);
  }

  onCancelActividad(): void {
    window.close();
  }
}
