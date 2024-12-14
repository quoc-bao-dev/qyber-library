import { Route, Router } from './core';

const routes: Route[] = [
    {
        path: '/',
        lazyComponent: () => import('./App'),
    },

    {
        path: '*',
        lazyComponent: () => import('./pages/NotFound'),
    },
];

const router = new Router(routes);
export default router;
