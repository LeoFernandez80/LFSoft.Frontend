import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnumActions, EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import {
  ActionService, CONFIRM_CANCEL, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericFormComponent, ISectionForm, MessagesService, ModalService, TranslatePipe
} from '@lib/shared';
import { AuthService, EnumUserRole, UrlSecurityService, UserPermissionsService } from '@lib/security';
import { Observable, map, of } from 'rxjs';
import { HTTPServiceUnidadMedida } from '../http-services/unidad-medida.service';
import { UnidadMedida } from '../models/unidad-medida.model';
import { UnidadMedidaResponse } from '../models/unidad-medida-response.model';
import { UnidadMedidaDataFormComponent } from './unidad-medida-data-form/unidad-medida-data-form.component';

@Component({
  selector: 'app-unidad-medida-form',
  templateUrl: './unidad-medida-form.component.html',
  styleUrls: ['./unidad-medida-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe, UnidadMedidaDataFormComponent],
  providers: [ActionService]
})
export class UnidadMedidaFormComponent implements OnInit, OnDestroy {
  @ViewChild('formUnidadMedidaData') formUnidadMedidaData!: ISectionForm;

  @Input() set unidadMedida(unidadMedida: number | UnidadMedida | undefined) {
    if (unidadMedida instanceof UnidadMedida) {
      this.unidadMedidaData = unidadMedida as UnidadMedida;
      this._unidadMedidaId = unidadMedida.unidadMedida_codigo;
    } else {
      console.log('UnidadMedidaFormComponent set unidadMedida:', unidadMedida);
      this._unidadMedidaId = unidadMedida as number || 0;
    }      
  }

  @Output() save = new EventEmitter<UnidadMedida>();
  @Output() cancel = new EventEmitter<void>();

  unidadMedidaData: UnidadMedida | undefined = undefined;

  private _unidadMedidaId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _unidadMedidaService: HTTPServiceUnidadMedida,
    private _route: ActivatedRoute,
    private _actionService: ActionService,
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _urlSecurityService: UrlSecurityService,
    private _authService: AuthService,
    private _permissionsUserService: UserPermissionsService
  ) {}

  ngOnInit(): void {
    this._securityApply();
    this._loadData();
  }

  ngOnDestroy(): void {}

  isReadyToSave(): boolean {
    return !!this.unidadMedidaData
      && this.unidadMedidaData.objectMode !== EnumObjectMode.READONLY
      && this.formUnidadMedidaData?.valid
      && this.formUnidadMedidaData?.modified;
  }

  onUnidadMedidaDataChange(): void {
    this._enabledActions();
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActions.eAction_Save:
          this._save();
          break;
        case EnumActions.eAction_Cancel:
          this._cancel();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  makeConditions(): string {
    return '#|V|#';
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eForm_UnidadesMedida,
      this.makeConditions()
    );

    this._actionService.setActions(actions);
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      // If data is already provided via input, no need to load
      if (this.unidadMedidaData) {
        this._enabledActions();
        return;
      }

      switch (this._operation) {
        case 'open':
          this._openUnidadMedida(this._unidadMedidaId).subscribe(unidadMedida => {
            this.unidadMedidaData = unidadMedida;
            this._enabledActions();
          });
          break;
        default:
          if (this._unidadMedidaId) {
            this._openUnidadMedida(this._unidadMedidaId).subscribe(unidadMedida => {
            this.unidadMedidaData = unidadMedida;
            this._enabledActions();
          });
          } else {
            this._enabledActions();
          }
          break;
      }
    });
  }

  private _openUnidadMedida(id: number): Observable<UnidadMedida> {
    return this._unidadMedidaService.open(id).pipe(
            takeUntilDestroyed(this._destroyRef),
            map((unidadMedidaRsp: UnidadMedidaResponse) => {
              if (unidadMedidaRsp.accessControl ) {
                unidadMedidaRsp.unidadMedida.objectMode = EnumObjectMode.READONLY;
                this._messagesService.addMessage(`${unidadMedidaRsp.unidadMedida.objectKey} access denied. Opened in ${unidadMedidaRsp.accessControl?.terminal?.terminalName} at ${unidadMedidaRsp.accessControl?.createdAt}`, EnumMessageType.Error);
              } else {
                unidadMedidaRsp.unidadMedida.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER ? EnumObjectMode.READONLY : EnumObjectMode.EDITABLE;
              }
              return unidadMedidaRsp.unidadMedida;
            })
          );   
  }

  private _loadUnidadMedida(): void {
    if (!this._unidadMedidaId) {
      return;
    }

    this._openUnidadMedida(this._unidadMedidaId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: unidadMedida => {
          this.unidadMedidaData = unidadMedida;
          this._enabledActions();
        },
        error: () => {
          this._messagesService.addMessage('Error al cargar unidad de medida', EnumMessageType.Error);
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
            this._messagesService.addMessage('Codigo de unidad de medida invalido', EnumMessageType.Error);
            throw new Error('Invalid unidad medida ID');
          }
          this._unidadMedidaId = Number(idParam);
        })
      );
    }

    return of(void 0);
  }

  private _cancel(): void {
    if (!this.formUnidadMedidaData?.modified) {
      this.cancel.emit();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._closeEntity(() => this.cancel.emit());
        }
      });
  }

  private _closeEntity(onClose?: () => void): void {
    if (!this._unidadMedidaId) {
      onClose?.();
      return;
    }

    this._unidadMedidaService.closeUnidadMedida(this._unidadMedidaId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => onClose?.(),
        error: () => onClose?.()
      });
  }

  private _createUnidadMedidaRequest(): UnidadMedida {
    return { ...this.unidadMedidaData, ...this.formUnidadMedidaData.data } as UnidadMedida;
  }

  private _save(): void {
    if (!this.formUnidadMedidaData?.modified) {
      return;
    }

    const updatedUnidadMedida = this._createUnidadMedidaRequest();
    const saveOperation = !updatedUnidadMedida.unidadMedida_codigo
      ? this._unidadMedidaService.createUnidadMedida(updatedUnidadMedida)
      : this._unidadMedidaService.updateUnidadMedida(updatedUnidadMedida);

    saveOperation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: savedUnidadMedida => {
          savedUnidadMedida.objectMode = EnumObjectMode.EDITABLE;
          this.unidadMedidaData = savedUnidadMedida;
          this._unidadMedidaId = savedUnidadMedida.unidadMedida_codigo;
          this.save.emit(savedUnidadMedida);
          this._enabledActions();
        },
        error: () => {
          this._messagesService.addMessage('Error al guardar unidad de medida', EnumMessageType.Error);
        }
      });
  }
}
