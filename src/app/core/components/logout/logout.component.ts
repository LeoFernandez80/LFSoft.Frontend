import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@lib/security';
import { MessagesService, EnumMessageType } from '@lib/shared';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _messagesService: MessagesService
  ) { }

  ngOnInit(): void {
    this.logout();
  }

  private logout(): void {
    this._authService.logout();
    this._messagesService.addMessage('Sesión cerrada correctamente', EnumMessageType.Success);
    this._router.navigate(['/login']);
  }
}
