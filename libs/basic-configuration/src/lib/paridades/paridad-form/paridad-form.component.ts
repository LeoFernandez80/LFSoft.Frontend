import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { UrlSecurityService } from '@lib/security';
import {
  GenericFormComponent, GenericActionsComponent, FormValidationsDirective, TranslatePipe,
  SkeletonDirective, ActionService, MessagesService, ModalService,
  EnumActionsType, EnumMessageType, CONFIRM_CANCEL, Action
} from '@lib/shared';
import { Observable, map, of } from 'rxjs';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';
import { Paridad } from '../models/paridad.model';
import { HTTPServiceParidad } from '../http-services/paridad.service';

@Component({
  selector: 'app-paridad-form',
  templateUrl: './paridad-form.component.html',
  styleUrls: ['./paridad-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    GenericFormComponent,
    GenericActionsComponent,
    FormValidationsDirective,
    TranslatePipe,
    SkeletonDirective,
    MatButtonModule
  ],
  providers: [ActionService]
})
export class ParidadFormComponent implements OnInit, OnDestroy {
  @Input() set paridad(value: Paridad | undefined) {
    if (value) {
      this._paridad = value;
      this._paridadId = value.paridad_fecha;
      this._updateForm(value);
    }
  }
  @Output() save = new EventEmitter<Paridad>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  paridadForm: FormGroup = new FormGroup({});

  private _paridad: Paridad = new Paridad();
  private _paridadId: string = '';
  private _operation: any;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private _paridadService: HTTPServiceParidad,
    private _route: ActivatedRoute,
    private _actionService: ActionService,
    private _messagesService: MessagesService,
    private _modalService: ModalService,
    private _urlSecurityService: UrlSecurityService
  ) {
    this._createForm();
  }

  ngOnInit(): void {
    try {
      this._securityApply();
      this._loadData();
    } catch (error) {
      this._messagesService.addMessage('Error al cargar datos de paridad.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {}

  isReadyToSave(): boolean {
    return this.paridadForm.valid && this.paridadForm.dirty;
  }

  onAction(action: EnumActionsType | EnumActions): void {
    try {
      switch (action) {
        case EnumActionsType.actionSave:
          this._save();
          break;
        case EnumActionsType.actionCancel:
          this._cancel();
          break;
      }
    } catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  private _createForm(): void {
    this.paridadForm = this.fb.group({
      paridad_fechaCorrespondeA: ['', Validators.required],
      paridad_dolar: ['', [Validators.required, Validators.min(0.0001)]],
      paridad_euro: ['', [Validators.required, Validators.min(0.0001)]],
      paridad_dolarDivisa: ['', [Validators.required, Validators.min(0.0001)]],
      paridad_euroDivisa: ['', [Validators.required, Validators.min(0.0001)]]
    });
    this.paridadForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadData(): void {
    this.isLoading = false;
    this._loadParams().subscribe(() => {
      if (this._operation === 'open') {
        this._loadParidad(this._paridadId).subscribe(paridad => {
          this._paridad = paridad;
          this._updateForm(paridad);
          this._enabledActions();
        });
      } else if (this._paridadId) {
        this._loadParidad(this._paridadId).subscribe(paridad => {
          this._paridad = paridad;
          this._updateForm(paridad);
          this._enabledActions();
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        this._paridad.paridad_fecha = today;
        this.paridadForm.patchValue({ paridad_fechaCorrespondeA: today });
        this._enabledActions();
      }
    });
  }

  private _loadParidad(fecha: string): Observable<Paridad> {
    return this._paridadService.getParidad(fecha).pipe(
      map(response => response.paridad)
    );
  }

  private _updateForm(paridad: Paridad): void {
    this.paridadForm.patchValue({
      paridad_fechaCorrespondeA: paridad.paridad_fechaCorrespondeA,
      paridad_dolar: paridad.paridad_dolar,
      paridad_euro: paridad.paridad_euro,
      paridad_dolarDivisa: paridad.paridad_dolarDivisa,
      paridad_euroDivisa: paridad.paridad_euroDivisa
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
            console.warn('Security: Invalid paridad ID detected:', idParam);
            this._messagesService.addMessage('Fecha de paridad inválida', EnumMessageType.Error);
            throw new Error('Invalid paridad ID');
          }
          this._paridadId = idParam;
          return;
        })
      );
    }
    return of(void 0);
  }

  private _cancel(): void {
    if (!this.paridadForm.dirty) {
      this.cancel.emit();
      return;
    }
    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();
        }
      });
  }

  private _save(): void {
    if (!this.isReadyToSave()) return;

    const formData = this.paridadForm.value;
    const updatedParidad: Paridad = { ...this._paridad, ...formData };

    const operation = !this._paridadId
      ? this._paridadService.createParidad(updatedParidad)
      : this._paridadService.updateParidad(updatedParidad);

    operation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (savedParidad) => {
          this._paridad = savedParidad;
          this._paridadId = savedParidad.paridad_fecha;
          this.paridadForm.markAsPristine();
          this.save.emit(savedParidad);
        },
        error: () => {
          this._messagesService.addMessage('MESSAGE.errorSavingParidad', EnumMessageType.Error);
        }
      });
  }

  private _securityApply(): void {
    const actions: Action[] = [
      new Action('BUTTON.save', EnumActionsType.actionSave, 'save', false),
      new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
    ];
    this._actionService.setActions(actions);
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActions.eAction_Save);
    } else {      
      this._actionService.disable(EnumActions.eAction_Save);
    }  }
}
