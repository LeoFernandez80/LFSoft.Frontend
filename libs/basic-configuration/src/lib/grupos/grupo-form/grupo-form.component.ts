import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnumActions, EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import {
  Action, ActionService, CONFIRM_CANCEL, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericFormComponent, ISectionForm, MessagesService, ModalService, TranslatePipe
} from '@lib/shared';
import { AuthService, EnumUserRole, UrlSecurityService, UserPermissionsService } from '@lib/security';
import { Observable, map, of } from 'rxjs';
import { Grupo } from '../models/grupo.model';
import { HTTPServiceGrupo } from '../http-services/grupo.service';
import { GrupoDataFormComponent } from './grupo-data-form/grupo-data-form.component';

@Component({
  selector: 'app-grupo-form',
  templateUrl: './grupo-form.component.html',
  styleUrls: ['./grupo-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe, GrupoDataFormComponent],
  providers: [ActionService]
})
export class GrupoFormComponent implements OnInit, OnDestroy {
  @ViewChild('formGrupoData') formGrupoData!: ISectionForm;

  @Input() set grupo(grupo: number | string | Grupo) {
    if (grupo instanceof Grupo) {
      this.grupoData = grupo;
      this._grupoId = grupo.grupo_codigo;
    } else {
      this._grupoId = Number(grupo);
    }
  }

  @Output() save = new EventEmitter<Grupo>();
  @Output() cancel = new EventEmitter<void>();

  grupoData: Grupo | undefined = undefined;

  private _grupoId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _grupoService: HTTPServiceGrupo,
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
    return !!this.grupoData
      && this.grupoData.objectMode !== EnumObjectMode.READONLY
      && this.formGrupoData?.valid
      && this.formGrupoData?.modified;
  }

  onGrupoDataChange(): void {
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
    if (!this.formGrupoData?.modified) {
      this._closeEntityAndEmitCancel();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._closeEntityAndEmitCancel();
        }
      });
  }

  private _closeEntityAndEmitCancel(): void {
    if (this._grupoId > 0) {
      this._grupoService.closeGrupo(this._grupoId)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => this.cancel.emit(),
          error: () => this.cancel.emit()
        });
      return;
    }

    this.cancel.emit();
  }

  private _createGrupoRequest(): Grupo {
    return { ...this.grupoData, ...this.formGrupoData.data } as Grupo;
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
      EnumLiteralKeys.eForm_Grupo,
      this.makeConditions()
    );

    this._actionService.setActions(actions);
  }

  makeConditions(): string {
    return '#|V|#';
  }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this._grupoId > 0) {
        if (this._operation === 'open') {
          this._grupoService.open(this._grupoId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: response => {
                response.grupo.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER
                  ? EnumObjectMode.READONLY
                  : EnumObjectMode.EDITABLE;
                this.grupoData = response.grupo;
                this._enabledActions();
              },
              error: () => {
                this._messagesService.addMessage('Error al abrir grupo', EnumMessageType.Error);
              }
            });
        } else {
          this._grupoService.getGrupo(this._grupoId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: response => {
                response.grupo.objectMode = EnumObjectMode.EDITABLE;
                this.grupoData = response.grupo;
                this._enabledActions();
              },
              error: () => {
                this._messagesService.addMessage('Error al cargar grupo', EnumMessageType.Error);
              }
            });
        }
      } else {
        const newGrupo = new Grupo();
        newGrupo.objectMode = EnumObjectMode.NEW;
        this.grupoData = newGrupo;
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
            this._messagesService.addMessage('ID de grupo invalido', EnumMessageType.Error);
            throw new Error('Invalid grupo ID');
          }
          this._grupoId = Number(idParam);
        })
      );
    }

    return of(void 0);
  }

  private _save(): void {
    if (!this.formGrupoData?.modified) {
      return;
    }

    const updatedGrupo = this._createGrupoRequest();
    const saveOperation = !updatedGrupo.grupo_codigo
      ? this._grupoService.createGrupo(updatedGrupo)
      : this._grupoService.updateGrupo(updatedGrupo);

    saveOperation.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: savedGrupo => {
        savedGrupo.objectMode = EnumObjectMode.EDITABLE;
        this.grupoData = savedGrupo;
        this._grupoId = savedGrupo.grupo_codigo;
        this.save.emit(savedGrupo);
        this._enabledActions();
      },
      error: () => {
        this._messagesService.addMessage('Error al guardar grupo', EnumMessageType.Error);
      }
    });
  }
}
