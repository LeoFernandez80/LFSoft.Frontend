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
import { Company } from '../models/company.model';
import { HTTPServiceCompany } from '../http-services/company.service';
import { CompanyDataFormComponent } from './company-data-form/company-data-form.component';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericFormComponent, GenericActionsComponent, TranslatePipe, CompanyDataFormComponent],
  providers: [ActionService]
})
export class CompanyFormComponent implements OnInit, OnDestroy {
  @ViewChild('formCompanyData') formCompanyData!: ISectionForm;

  @Input() set company(company: number | Company) {
    if (company instanceof Company) { this.companyData = company; }
    else { this._companyId = company; }
  }
  @Output() save = new EventEmitter<Company>();
  @Output() cancel = new EventEmitter<void>();

  companyData: Company | undefined = undefined;

  private _companyId: number = 0;
  private _operation: string | undefined;
  private readonly _destroyRef = inject(DestroyRef);

  constructor(
    private _companyService: HTTPServiceCompany,
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
    return !!this.companyData
      && this.companyData.objectMode !== EnumObjectMode.READONLY
      && this.formCompanyData?.valid
      && this.formCompanyData?.modified;
  }

  onCompanyDataChange(): void { this._enabledActions(); }

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

  private _cancel(): void {
    if (!this.formCompanyData?.modified) { this.cancel.emit(); return; }
    this._modalService.showModal(CONFIRM_CANCEL).pipe(takeUntilDestroyed(this._destroyRef)).subscribe(action => {
      if (action === EnumActionsType.actionAccept) { this.cancel.emit(); }
    });
  }

  private _createCompanyRequest(): Company {
    return { ...this.companyData, ...this.formCompanyData.data } as Company;
  }

  private _enabledActions(): void {
    if (this.isReadyToSave()) { this._actionService.enable(EnumActions.eAction_Save); }
    else { this._actionService.disable(EnumActions.eAction_Save); }
  }

  private _securityApply(): void {
    const actions = this._permissionsUserService.enabledActions(
      this._authService.getCurrentUser()?.role || EnumUserRole.VIEWER,
      EnumLiteralKeys.eForm_Companies,
      this.makeConditions()
    );
    this._actionService.setActions(actions);
  }

  makeConditions(): string { return '#|V|#'; }

  private _loadData(): void {
    this._loadParams().subscribe(() => {
      if (this.companyData) {
        if (this.companyData.company_id && this.companyData.objectMode === EnumObjectMode.NEW) {
          this.companyData.objectMode = EnumObjectMode.EDITABLE;
        }
        if (!this.companyData.company_id) {
          this.companyData.objectMode = EnumObjectMode.NEW;
        }
        this._enabledActions();
        return;
      }

      if (this._companyId) {
        if (this._operation === 'open') {
          this._companyService.open(this._companyId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
            next: response => {
              response.company.objectMode = this._authService.getCurrentUser()?.role === EnumUserRole.VIEWER
                ? EnumObjectMode.READONLY
                : EnumObjectMode.EDITABLE;
              this.companyData = response.company;
              this._enabledActions();
            },
            error: () => { this._messagesService.addMessage('Error al abrir entidad', EnumMessageType.Error); }
          });
        } else {
          this._companyService.getCompany(this._companyId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
            next: response => {
              response.objectMode = EnumObjectMode.EDITABLE;
              this.companyData = response;
              this._enabledActions();
            },
            error: () => { this._messagesService.addMessage('Error al cargar entidad', EnumMessageType.Error); }
          });
        }
      } else {
        const newCompany = new Company();
        newCompany.objectMode = EnumObjectMode.NEW;
        this.companyData = newCompany;
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
            this._messagesService.addMessage('ID de entidad invalido', EnumMessageType.Error);
            throw new Error('Invalid company ID');
          }
          this._companyId = Number(idParam);
        })
      );
    }
    return of(void 0);
  }

  private _save(): void {
    if (!this.formCompanyData?.modified) return;

    const updatedCompany = this._createCompanyRequest();
    const saveOperation = !updatedCompany.company_id
      ? this._companyService.createCompany(updatedCompany)
      : this._companyService.updateCompany(updatedCompany);

    saveOperation.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: savedCompany => {
        savedCompany.objectMode = EnumObjectMode.EDITABLE;
        this.companyData = savedCompany;
        this.save.emit(savedCompany);
        this._enabledActions();
      },
      error: () => { this._messagesService.addMessage('Error al guardar entidad', EnumMessageType.Error); }
    });
  }
}




