import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from './services/drawer.service';
import { DrawerConfig } from './models/drawer-config.model';
import { first, Subscription } from 'rxjs';

@Component({
    selector: 'app-generic-drawer',
    templateUrl: './generic-drawer.component.html',
    styleUrls: ['./generic-drawer.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class GenericDrawerComponent implements OnInit, OnDestroy {
    isVisible: boolean = false;
    config: DrawerConfig | null = new DrawerConfig();
    private p_subscriptions: Subscription[] = [];

    constructor(private p_drawerService: DrawerService) {}

    ngOnInit(): void {
        this.p_subscriptions.push(
            this.p_drawerService.getIsVisible().subscribe(
                state => {this.isVisible = state
                }
            ),
            this.p_drawerService.getConfig().subscribe(
                config => {this.config = config
                }
            ),
        );
    }

    ngOnDestroy(): void {
        this.p_subscriptions.forEach(sub => sub.unsubscribe());        
    }
    


}