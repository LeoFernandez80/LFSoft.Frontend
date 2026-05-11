import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject, DestroyRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnumActions, EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import { UrlSecurityService, AuthService, EnumUserRole, UserPermissionsService } from '@lib/security';
import {
  GenericFormComponent, GenericActionsComponent, TranslatePipe,
  ActionService, MessagesService, ModalService,
  EnumActionsType, EnumMessageType, CONFIRM_CANCEL, ISectionForm
} from '@lib/shared';
import { Observable, map, of } from 'rxjs';
import { AlicuotaIva } from '../models/alicuota-iva.model';
import { HTTPServiceAlicuotaIva } from '../http-services/alicuota-iva.service';
import { AlicuotaIvaDataFormComponent } from './alicuota-iva-data-form/alicuota-iva-data-form.component';

@Component({
  selector: 'app-alicuota-iva-form',
  templateUrl: './alicuota-iva-form.component.html',
  styleUrls: ['./alicuota-iva-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GenericFormComponent,
    GenericActionsComponent,
    TranslatePipe,
    AlicuotaIvaDataFormComponent
  ],
  providers: [ActionService]
})
export class AlicuotaIvaFormComponent implements OnInit, OnDestroy {
  @ViewChild('formAlicuotaIvaData') formAlicuotaIvaData!: ISectionForm;

  @Input() set alicuotaIva(value: number | AlicuotaIva) {
    if (value instanceof AlicuotaIva) { this.alicuotaIvaData = value; }
    else { this._alicuotaIvaId = value; }
  }
  @Output() save = new EventEmitter<AlicuotaIva>();
  @Output() cancel = new EventEmitter<void>();

  alicuotaIvaData: AlicuotaIva | undefined = undefined;

  private _alicuotaIvaId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _alicuotaIvaService: HTTPServiceAlicuotaIva,
    private _route: ActivatedRoute,
    private _actionService: ActionService,
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _urlSecurityService: UrlSecurityService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService
  ) {}

  ngOnInit(): void {
    try {
      this._securityApply();
      this._loadData();
    } catch (error) {
      this._messagesService.addMessage('Error al cargar datos de AlicuotaIva.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  isReadyToSave(): boolean {
    return !!this.alicuotaIvaData
      && this.alicuotaIvaData.objectMode !== EnumObjectMode.READONLY
      && this.formAlicuotaIvaData?.valid
      && this.formAlicuotaIvaData?.modified;
  }

  onAlicuotaIvaDataChange(): void { this._enabledActions(); }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActions.eAction_Save: this._save(); break;
        case EnumActions.eAction_Cancel: this._cancel(); break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this._alicuotaIvaId) {
        if (this._operation === 'open') {
          this._alicuotaIvaService.open(this._alicuotaIvaId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: response => {
                response.alicuotaIva.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER
                  ? EnumObjectMode.READONLY
                  : EnumObjectMode.EDITABLE;
                this.alicuotaIvaData = response.alicuotaIva;
                this._enabledActions();
              },
              error: () => {
                this._messagesService.addMessage('Error al abrir alicuota IVA', EnumMessageType.Error);
              }
            });
        } else {
          this._alicuotaIvaService.getAlicuotaIva(this._alicuotaIvaId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: response => {
                response.alicuotaIva.objectMode = EnumObjectMode.EDITABLE;
                this.alicuotaIvaData = response.alicuotaIva;
                this._enabledActions();
              },
              error: () => {
                this._messagesService.addMessage('Error al cargar alicuota IVA', EnumMessageType.Error);
              }
            });
        }
      } else {
        const newAlicuotaIva = new AlicuotaIva();
        newAlicuotaIva.objectMode = EnumObjectMode.NEW;
        this.alicuotaIvaData = newAlicuotaIva;
        this._enabledActions();
      }
    });
  }

  private _loadParams(): Observable<void> {
    this._operation = this._route.snapshot.data['operation'];

    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            this._messagesService.addMessage('ID de alicuota IVA invalido', EnumMessageType.Error);
            throw new Error('Invalid AlicuotaIva ID');
          }
          this._alicuotaIvaId = Number(idParam);
        })
      );
    }
    return of(void 0);
  }

  private _cancel(): void {
    if (!this.formAlicuotaIvaData?.modified) {
      this.cancel.emit();
      return;
    }
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._closeAlicuotaIva();
          this.cancel.emit();
        }
      });
  }

  private _createAlicuotaIvaRequest(): AlicuotaIva {
    return { ...this.alicuotaIvaData, ...this.formAlicuotaIvaData.data } as AlicuotaIva;
  }

  private _save(): void {
    if (!this.formAlicuotaIvaData?.modified) return;

    const updatedAlicuotaIva = this._createAlicuotaIvaRequest();

    const operation = !updatedAlicuotaIva.alicuotaIva_codigo
      ? this._alicuotaIvaService.createAlicuotaIva(updatedAlicuotaIva)
      : this._alicuotaIvaService.updateAlicuotaIva(updatedAlicuotaIva);

    operation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: savedAlicuotaIva => {
          savedAlicuotaIva.objectMode = EnumObjectMode.EDITABLE;
          this.alicuotaIvaData = savedAlicuotaIva;
          this.save.emit(savedAlicuotaIva);
          this._enabledActions();
        },
        error: () => {
          this._messagesService.addMessage('MESSAGE.errorSavingAlicuotaIva', EnumMessageType.Error);
        }
      });
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eForm_AlicuotaIva,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }

  private _closeAlicuotaIva(): void {
    if (this._alicuotaIvaId) {
      this._alicuotaIvaService.closeAlicuotaIva(this._alicuotaIvaId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({ error: () => {} });
    }
  }
}
