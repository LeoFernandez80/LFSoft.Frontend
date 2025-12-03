export interface IDrawerConfig {
    width?: string;
    position: 'left' | 'right';
    showOverlay?: boolean;
    animate?: boolean;
}

export class DrawerConfig implements IDrawerConfig {
    width: string = '300px';
    position: 'left' | 'right' = 'right';
    showOverlay: boolean = true;
    animate: boolean = true;

    constructor(config?: Partial<IDrawerConfig>) {
        if (config) {
            Object.assign(this, config);
        }
    }
}