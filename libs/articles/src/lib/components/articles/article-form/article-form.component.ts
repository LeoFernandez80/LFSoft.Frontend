import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { RouterOutlet, ActivatedRoute } from "@angular/router";
import { UrlSecurityService } from "@lib/security";
import { GenericFormComponent, GenericActionsComponent, FormValidationsDirective, TranslatePipe, SkeletonDirective, ActionService, MessagesService, ModalService, EnumActionsType, EnumMessageType, CONFIRM_CANCEL, Action } from "@lib/shared";
import { Observable, map, of } from "rxjs";
import { Article } from "../models/article.model";
import { ArticleService } from "../services/article.service";
import { EnumActions } from "libs/common/src/lib/enums/actions.enum";


@Component({
  selector: 'app-article-form',
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterOutlet, GenericFormComponent,
    GenericActionsComponent, FormValidationsDirective, TranslatePipe,
    SkeletonDirective, MatButtonModule],
  providers: [ActionService]
})
export class ArticleFormComponent implements OnInit, OnDestroy {
  @Input() articleId: number = 0;
  @Output() save = new EventEmitter<Article>();
  @Output() cancel = new EventEmitter<void>();

  isLoading: boolean = true;
  articleForm: FormGroup = new FormGroup({});
  article: Article = new Article();
  drawerOpen = false;
  private readonly _destroyRef = inject(DestroyRef);
  private _operation: any;

  constructor(private fb: FormBuilder, private _articleService: ArticleService, private _route: ActivatedRoute,
    private _actionService: ActionService, private _messagesService: MessagesService,
    private _modalService: ModalService, private _urlSecurityService: UrlSecurityService ) {
    this._createForm();
  }
  
  ngOnInit(): void {  
    try {     
      this._loadSecurityActions();
      this._loadData();   
    }
    catch (error) {      
      this._messagesService.addMessage('Error loading article data.', EnumMessageType.Error);
    }
  }

  ngOnDestroy(): void {
    // El DestroyRef se encarga automáticamente de cancelar todas las suscripciones
    // que usen takeUntilDestroyed()
  }  isReadyToSave(): boolean {
    return this.articleForm.valid && this.articleForm.dirty;
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
    }
    catch (error) {
      this._messagesService.addMessage(error as HttpErrorResponse, EnumMessageType.Error);
    }
  }

  private _createForm() {
    this.articleForm = this.fb.group({
      codigoAsy: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      listprice: ['', [Validators.required, Validators.min(0)]],
      revendedorsPrice: ['', [Validators.required, Validators.min(0)]],
      codigoProvider: ['', Validators.required],
      descriptionProvider: ['', Validators.required]
    });
    this.articleForm.statusChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._enabledActions();
      });
  }

  private _loadData() {
    this.isLoading = false;
    this._loadParams().subscribe(() => {
      switch (this._operation) {
        case 'open':
          this._editArticle(this.articleId).subscribe(article => {
            this._updateArticle(article);            
            this._enabledActions();
          });
          break;
        default:
          this._editArticle(this.articleId).subscribe(article => {
            this._updateArticle(article);
            this._enabledActions();
          });
      }
    });
  }

  private _editArticle(id: number): Observable<Article> {
    return this._articleService.getArticle(id);
  }

  private _updateArticle(article: Article): void {
    this.article = article;
    this.articleForm.patchValue(this.article);
  }

  private _loadParams(): Observable<void> {
    this._operation = this._route.snapshot.data['operation'];

    if (this._operation === 'open') {
      return this._route.queryParamMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => {
          const idParam = params.get('id');
          
          // Validar que el ID sea seguro
          if (!idParam || !this._urlSecurityService.isValidRouteId(idParam)) {
            console.warn('Security: Invalid article ID detected:', idParam);
            this._messagesService.addMessage('ID de artículo inválido', EnumMessageType.Error);
            throw new Error('Invalid article ID');
          }
          
          this.articleId = Number(idParam);
          return;
        })
      );
    } else {
      return of(void 0);
    }
  }

  private _cancel(): void {
    if (!this.articleForm.dirty) {
      this.cancel.emit();
      return;
    }

    this._modalService.showModal(CONFIRM_CANCEL)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(action => {
        if (action === EnumActionsType.actionAccept) {
          this.cancel.emit();
        } else if (action === EnumActionsType.actionCancel) {
          // Usuario canceló
        }
      });
  }

  private _save(): void {
    if (!this.isReadyToSave()) return;

    const formData = this.articleForm.value;
    const updatedArticle: Article = {
      ...this.article,
      ...formData
    };

    const operation = this.articleId === 0 
      ? this._articleService.addArticle(updatedArticle)
      : this._articleService.updateArticle(updatedArticle);

    operation
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (savedArticle) => {
          this.article = savedArticle;
          this.articleId = savedArticle.id;
          this.articleForm.markAsPristine();
          this.save.emit(savedArticle);
        },
        error: () => {
          this._messagesService.addMessage("MESSAGE.errorSavingArticle", EnumMessageType.Error);
        }
      });
  }

  //#region Security
  private _loadSecurityActions(): void {
    const actions: Action[] = [
      new Action('BUTTON.save', EnumActionsType.actionSave, 'save', false),
      new Action('BUTTON.cancel', EnumActionsType.actionCancel, 'cancel', false)
    ];
    this._actionService.setActions(actions);
  }

  private _enabledActions() {
    if (this.isReadyToSave()) {
      this._actionService.enable(EnumActionsType.actionSave);
    } else {
      this._actionService.disable(EnumActionsType.actionSave);
    }
  }
  //#endregion
}
