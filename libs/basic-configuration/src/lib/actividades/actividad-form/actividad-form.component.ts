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
import { Actividad } from '../models/actividad.model';
import { HTTPServiceActividad } from '../http-services/actividad.service';
import { ActividadDataFormComponent } from './actividad-data-form/actividad-data-form.component';

@Component({
  selector: 'app-actividad-form',
  templateUrl: './actividad-form.component.html',
  styleUrls: ['./actividad-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe, ActividadDataFormComponent],
  providers: [ActionService]
})
export class ActividadFormComponent implements OnInit, OnDestroy {
  @ViewChild('formActividadData') formActividadData!: ISectionForm;

  @Input() set actividad(actividad: string | Actividad | undefined) {
    if (actividad instanceof Actividad) { this.actividadData = actividad; }
    else if (typeof actividad === 'string') { this._actividadCodigo = actividad; }
  }
  @Output() save = new EventEmitter<Actividad>();
  @Output() cancel = new EventEmitter<void>();

  actividadData: Actividad | undefined = undefined;

  private _actividadCodigo: string = '';
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _actividadService: HTTPServiceActividad,
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
    return !!this.actividadData
      && this.actividadData.objectMode !== EnumObjectMode.READONLY
      && this.formActividadData?.valid
      && this.formActividadData?.modified;
  }

  onActividadDataChange(): void {
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

  private _cancel(): void {
    if (!this.formActividadData?.modified) {
      this.cancel.emit();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          if (this._actividadCodigo) {
            this._actividadService.closeActividad(this._actividadCodigo)
              .pipe(takeUntilDestroyed(this._destroyRef))
              .subscribe({ next: () => this.cancel.emit(), error: () => this.cancel.emit() });
            return;
          }
          this.cancel.emit();
        }
      });
  }

  private _createActividadRequest(): Actividad {
    return { ...this.actividadData, ...this.formActividadData.data } as Actividad;
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {
      this._actionService.disable(EnumActions.eAction_Save);
    }
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eForm_Actividad,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  makeConditions(): string {
    return '#|V|#';
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this._actividadCodigo) {
        if (this._operation === 'open') {
          this._actividadService.open(this._actividadCodigo).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
            next: response => {
              response.actividad.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER
                ? EnumObjectMode.READONLY
                : EnumObjectMode.EDITABLE;
              this.actividadData = response.actividad;
              this._enabledActions();
            },
            error: () => { this._messagesService.addMessage('Error al abrir actividad', EnumMessageType.Error); }
          });
        } else {
          this._actividadService.getActividad(this._actividadCodigo).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
            next: response => {
              response.actividad.objectMode = EnumObjectMode.EDITABLE;
              this.actividadData = response.actividad;
              this._enabledActions();
            },
            error: () => { this._messagesService.addMessage('Error al cargar actividad', EnumMessageType.Error); }
          });
        }
      } else {
        const newActividad = new Actividad();
        newActividad.objectMode = EnumObjectMode.NEW;
        this.actividadData = newActividad;
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
            this._messagesService.addMessage('Codigo de actividad invalido', EnumMessageType.Error);
            throw new Error('Invalid actividad ID');
          }
          this._actividadCodigo = idParam;
        })
      );
    }

    return of(void 0);
  }

  private _save(): void {
    if (!this.formActividadData?.modified) return;

    const updatedActividad = this._createActividadRequest();
    const saveOperation = !updatedActividad.actividad_codigo || updatedActividad.actividad_codigo.startsWith('NEW_')
      ? this._actividadService.createActividad(updatedActividad)
      : this._actividadService.updateActividad(updatedActividad);

    saveOperation.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: savedActividad => {
        savedActividad.objectMode = EnumObjectMode.EDITABLE;
        this.actividadData = savedActividad;
        this._actividadCodigo = savedActividad.actividad_codigo;
        this.save.emit(savedActividad);
        this._enabledActions();
      },
      error: () => { this._messagesService.addMessage('Error al guardar actividad', EnumMessageType.Error); }
    });
  }
}
