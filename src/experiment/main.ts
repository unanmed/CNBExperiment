import { App } from 'cnb-physics';

export const app = new App({
    refreshRate: 10
});

// @ts-ignore
import('./utils').then(data => window.cnb = data);