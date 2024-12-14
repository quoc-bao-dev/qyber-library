import Component from './component.v1';

/**
 * Represents a route in the application.
 */
export type Route = {
    path: string;
    component?: new (props: any) => Component<any, any>;
    lazyComponent?: () => Promise<{
        default: new (props: any) => Component<any, any>;
    }>;
    children?: Route[];
};

/**
 * Maps a route with its parent and component information.
 */
type RouteMapping = {
    path: string;
    component?: new (props: any) => Component<any, any>;
    lazyComponent?: () => Promise<{
        default: new (props: any) => Component<any, any>;
    }>;
    parent?: new (props: any) => Component<any, any>;
    parentLazy?: () => Promise<{
        default: new (props: any) => Component<any, any>;
    }>;
};

/**
 * Represents a matched route with its component and parameters.
 */
type RouteMatch = {
    component: HTMLElement;
    params: Record<string, string>;
    query: Record<string, string>;
};

/**
 * Manages routing within the application.
 */
export class Router {
    private routes: RouteMapping[];
    private rootElement: HTMLElement;
    private loadingComponent?: HTMLElement; // Optional loading component

    /**
     * Initializes the router with routes and an optional loading component.
     * @param routes - The defined routes.
     * @param loadingComponent - An optional component to display while loading.
     */
    constructor(routes: Route[], loadingComponent?: HTMLElement) {
        this.routes = flattenRoutes(routes);
        this.rootElement = document.createElement('div');
        this.loadingComponent = loadingComponent;
        window.addEventListener('popstate', () => this.renderRoute());
    }

    /**
     * Parses a query string into a key-value pair object.
     * @param queryString - The query string.
     * @returns An object representing the parsed query.
     */
    private parseQuery(queryString: string): Record<string, string> {
        return Object.fromEntries(new URLSearchParams(queryString).entries());
    }

    /**
     * Matches the current pathname to a route and returns the corresponding component.
     * @param pathname - The current pathname.
     * @returns The matched route with its component and parameters, or null if no match is found.
     */
    private async matchRoute(pathname: string): Promise<RouteMatch | null> {
        for (const route of this.routes) {
            const paramNames: string[] = [];
            const regexPath = route.path.replace(
                /:([^/]+)/g,
                (_, paramName) => {
                    paramNames.push(paramName);
                    return '([^/]+)';
                }
            );

            // if (pathname === '*') {
            //     const componentInstance = route.component
            //         ? new route.component({})
            //         : route.lazyComponent
            //         ? await this.loadLazyComponent(route.lazyComponent, {})
            //         : null;
            //     if (!componentInstance) return null;
            //     return {
            //         component: componentInstance.html,
            //         params: {},
            //         query: {},
            //     };
            // }

            if (route.path === '*') {
                const componentInstance = route.component
                    ? new route.component({})
                    : route.lazyComponent
                    ? await this.loadLazyComponent(route.lazyComponent, {})
                    : null;
                if (!componentInstance) return null;
                return {
                    component: componentInstance.html,
                    params: {},
                    query: {},
                };
            }

            const match = pathname.match(new RegExp(`^${regexPath}$`));
            if (match) {
                const params = paramNames.reduce(
                    (acc, paramName, index) => ({
                        ...acc,
                        [paramName]: match[index + 1],
                    }),
                    {}
                );

                const query = this.parseQuery(window.location.search);

                const componentInstance = route.component
                    ? new route.component({ params, query })
                    : route.lazyComponent
                    ? await this.loadLazyComponent(route.lazyComponent, {
                          params,
                          query,
                      })
                    : null;

                if (!componentInstance) return null;

                if (route.parent) {
                    const parentInstance = new route.parent({});
                    const parentElement = parentInstance.html;
                    const outlet =
                        parentElement.querySelector('#router-outlet');

                    if (outlet) {
                        outlet.appendChild(componentInstance.html);
                        return { component: parentElement, params, query };
                    } else {
                        console.warn(
                            'Router outlet not found in parent component.'
                        );
                        return { component: parentElement, params, query };
                    }
                }

                if (route.parentLazy && !route.parent) {
                    const parentInstance = await this.loadLazyComponent(
                        route.parentLazy,
                        {}
                    );
                    const parentElement = parentInstance.html;
                    const outlet =
                        parentElement.querySelector('#router-outlet');
                    if (outlet) {
                        outlet.appendChild(componentInstance.html);
                        return { component: parentElement, params, query };
                    } else {
                        console.warn(
                            'Router outlet not found in parent component.'
                        );
                        return { component: parentElement, params, query };
                    }
                }

                return { component: componentInstance.html, params, query };
            }
        }
        const defaultRoute = this.routes.find((route) => route.path === '*');

        if (defaultRoute) {
            const componentInstance = defaultRoute.component
                ? new defaultRoute.component({})
                : defaultRoute.lazyComponent
                ? await this.loadLazyComponent(defaultRoute.lazyComponent, {})
                : null;
            if (!componentInstance) return null;
            return { component: componentInstance.html, params: {}, query: {} };
        }
        return null;
    }

    /**
     * Loads a lazy component and returns its instance.
     * @param lazyLoader - The function to load the lazy component.
     * @param props - The properties to pass to the component.
     * @returns The loaded component instance.
     */
    private async loadLazyComponent(
        lazyLoader: () => Promise<{
            default: new (props: any) => Component<any, any>;
        }>,
        props: any
    ): Promise<Component<any, any>> {
        if (this.loadingComponent) {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(this.loadingComponent);
            this.rootElement.innerHTML = '';
            this.rootElement.appendChild(fragment);
        }

        try {
            const module = await lazyLoader();
            return new module.default(props);
        } catch (error) {
            console.error('Failed to load component:', error);
            throw error;
        }
    }

    /**
     * Renders the route based on the current pathname.
     */
    private async renderRoute(): Promise<void> {
        const pathname = window.location.pathname;
        const match = await this.matchRoute(pathname);
        if (match) {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(match.component); // Add content to fragment

            this.rootElement.innerHTML = ''; // Clear root element
            this.rootElement.appendChild(fragment);
        } else {
            console.error('No matching route found for:', pathname);
        }
    }

    /**
     * Navigates to a specified path and renders the route.
     * @param path - The path to navigate to.
     */
    navigate(path: string): void {
        if (path !== window.location.pathname) {
            window.history.pushState(null, '', path);
            this.renderRoute();
        }
    }

    /**
     * Renders the initial route and returns the root element.
     * @returns The root element of the rendered route.
     */
    async render(root: HTMLElement): Promise<void> {
        this.rootElement = root;
        await this.renderRoute();
    }
}

/**
 * Flattens the routes into a mapping with parent-child relationships.
 * @param routes - The routes to flatten.
 * @param parentPath - The parent path prefix.
 * @param parent - The parent component.
 * @returns A flattened list of route mappings.
 */
function flattenRoutes(
    routes: Route[],
    parentPath = '',
    {
        parent,
        parentLazy,
    }: {
        parent?: new (props: any) => Component<any, any>;
        parentLazy?: () => Promise<{
            default: new (props: any) => Component<any, any>;
        }>;
    } = {}
): RouteMapping[] {
    return routes.flatMap((route) => {
        const fullPath = parentPath + route.path;
        const currentRoute: RouteMapping = {
            path: fullPath,
            component: route.component,
            lazyComponent: route.lazyComponent,
            parent,
            parentLazy,
        };

        return route.children?.length
            ? [
                  currentRoute,
                  ...flattenRoutes(route.children, fullPath, {
                      parent: route.component,
                      parentLazy: route.lazyComponent,
                  }),
              ]
            : [currentRoute];
    });
}
