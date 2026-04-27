import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, AuthenticatedUser } from '@lib/security';
import { MenuesService } from 'libs/common/src/lib/services/menues.service';
import { EnumActions } from 'libs/common/src/lib/enums/actions.enum';
import { DrawerService } from '@lib/shared';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss'
})
export class UserAvatarComponent implements OnInit {
  currentUser: AuthenticatedUser | null = null;
  userInitials: string = '';

  actions = EnumActions;

  constructor(private _authService: AuthService, private _menuesService: MenuesService,private _drawerService: DrawerService) {}

  ngOnInit(): void {
    this._authService.isAuthenticated$.subscribe(isAuth => {      
        this.currentUser = this._authService.getCurrentUser();
        this.userInitials = this.getUserInitials();      
    });    
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.name) {
      return '??';
    }
    const nameParts = this.currentUser.name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  }

  getRoleLabel(): string {
    if (!this.currentUser) return '';
    
    const roleLabels: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'USER': 'Usuario',
      'VIEWER': 'Visualizador'
    };
    
    return roleLabels[this.currentUser.role] || this.currentUser.role;
  }

    onAction(action: EnumActions): void {
        switch (action) {
        case EnumActions.eAction_OpenConfig:
            this._openConfiguration();
            break;
        default:
            try {
                this._menuesService.openMenu(action);
            } catch (error) {
                //this._messagesService.addMessage("Error al ejecutar acción", EnumMessageType.Error);
            }
            break;
        }   
    }

    private _openConfiguration(): void {
        this._openDrawer();
    }

    private _openDrawer() {
        this._drawerService.show({
        width: '600px',
        position: 'right'
        })
    }
}
