import Router, { Route } from './core/router';

const routes: Route[] = [
    {
        path: '/',
        lazyComponent: () => import('./App'),
    },
];

const router = new Router(routes);
export default router;
