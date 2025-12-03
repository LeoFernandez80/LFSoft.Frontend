import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericDrawerComponent } from '../../generic-drawer/generic-drawer.component';
import { DrawerService } from '../../generic-drawer/services/drawer.service';
import { MessagesService } from '../../generic-message/services/message.service';

@Component({
  selector: 'app-configurations-drawer',
  templateUrl: './configurations-drawer.component.html',
  styleUrls: ['./configurations-drawer.component.scss'],
  standalone: true,
  imports: [CommonModule, GenericDrawerComponent]
})
export class ConfigurationsDrawerComponent implements OnInit {
  
  constructor(private _messagesService: MessagesService,private p_drawerService: DrawerService) {}

  ngOnInit(): void { }


}