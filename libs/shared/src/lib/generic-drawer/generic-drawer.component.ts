import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from './services/drawer.service';
import { DrawerConfig } from './models/drawer-config.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'lfsoft-shared-drawer',
    templateUrl: './generic-drawer.component.html',
    styleUrls: ['./generic-drawer.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class GenericDrawerComponent implements OnInit, OnDestroy {
    isVisible: boolean = false;
    config: DrawerConfig | null = new DrawerConfig();
    private _subscriptions: Subscription[] = [];

    constructor(private _drawerService: DrawerService) {}

    ngOnInit(): void {
        this._subscriptions.push(
            this._drawerService.getIsVisible().subscribe(
                state => { this.isVisible = state; }
            ),
            this._drawerService.getConfig().subscribe(
                config => { this.config = config; }
            ),
        );
    }

    ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());        
    }

    close(): void {
        this._drawerService.hide();
    }
}
