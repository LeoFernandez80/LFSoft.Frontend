import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnumActions, EnumLiteralKeys, EnumObjectMode } from '@lib/common';
import {
  ActionService, CONFIRM_CANCEL, EnumActionsType, EnumMessageType,
  GenericActionsComponent, GenericFormComponent, ISectionForm,
  MessagesService, ModalService, TranslatePipe
} from '@lib/shared';
import { AuthService, EnumUserRole, UrlSecurityService, UserPermissionsService } from '@lib/security';
import { Observable, map, of } from 'rxjs';
import { HTTPServiceFamilia } from '../http-services/familia.service';
import { Familia } from '../models/familia.model';
import { FamiliaDataFormComponent } from './familia-data-form/familia-data-form.component';

@Component({
  selector: 'app-familia-form',
  templateUrl: './familia-form.component.html',
  styleUrls: ['./familia-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe, FamiliaDataFormComponent],
  providers: [ActionService]
})
export class FamiliaFormComponent implements OnInit, OnDestroy {
  @ViewChild('formFamiliaData') formFamiliaData!: ISectionForm;

  @Input() set familia(familia: number | Familia) {
    if (familia instanceof Familia) {
      this.familiaData = familia;
    } else {
      this._familiaId = familia;
    }
  }

  @Output() save = new EventEmitter<Familia>();
  @Output() cancel = new EventEmitter<void>();

  familiaData: Familia | undefined = undefined;

  private _familiaId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _familiaService: HTTPServiceFamilia,
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
    return !!this.familiaData
      && this.familiaData.objectMode !== EnumObjectMode.READONLY
      && this.formFamiliaData?.valid
      && this.formFamiliaData?.modified;
  }

  onFamiliaDataChange(): void {
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
    if (!this.formFamiliaData?.modified) {
      this.cancel.emit();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this._closeFamilia();
        }
      });
  }

  private _createFamiliaRequest(): Familia {
    return { ...this.familiaData, ...this.formFamiliaData.data } as Familia;
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
      EnumLiteralKeys.eForm_Familia,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this._familiaId) {
        if (this._operation === 'open') {
          this._familiaService.open(this._familiaId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: response => {
                response.familia.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER
                  ? EnumObjectMode.READONLY
                  : EnumObjectMode.EDITABLE;
                this.familiaData = response.familia;
                this._enabledActions();
              },
              error: () => this._messagesService.addMessage('Error al abrir familia', EnumMessageType.Error)
            });
        } else {
          this._familiaService.getFamilia(this._familiaId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: response => {
                response.familia.objectMode = EnumObjectMode.EDITABLE;
                this.familiaData = response.familia;
                this._enabledActions();
              },
              error: () => this._messagesService.addMessage('Error al cargar familia', EnumMessageType.Error)
            });
        }
      } else {
        const newFamilia = new Familia();
        newFamilia.objectMode = EnumObjectMode.NEW;
        this.familiaData = newFamilia;
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
            this._messagesService.addMessage('ID de familia invalido', EnumMessageType.Error);
            throw new Error('Invalid familia ID');
          }
          this._familiaId = Number(idParam);
        })
      );
    }
    return of(void 0);
  }

  private _save(): void {
    if (!this.formFamiliaData?.modified) return;

    const updatedFamilia = this._createFamiliaRequest();
    const saveOperation = !updatedFamilia.familia_codigo
      ? this._familiaService.createFamilia(updatedFamilia)
      : this._familiaService.updateFamilia(updatedFamilia);

    saveOperation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: savedFamilia => {
          savedFamilia.objectMode = EnumObjectMode.EDITABLE;
          this.familiaData = savedFamilia;
          this.save.emit(savedFamilia);
          this._enabledActions();
        },
        error: () => this._messagesService.addMessage('Error al guardar familia', EnumMessageType.Error)
      });
  }

  private _closeFamilia(): void {
    if (!this._familiaId) {
      this.cancel.emit();
      return;
    }

    this._familiaService.closeFamilia(this._familiaId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => this.cancel.emit(),
        error: () => this.cancel.emit()
      });
  }
}
