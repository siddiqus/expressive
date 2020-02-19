declare module "@siddiqus/expressive" {
    class Route {}

    export type ExpressiveRouter = {
        routes: Route[];
        subroutes: Subroute[];
    };

    export type SwaggerInfo = {
        version: string 
        title: string
        contact: {
            name: string
            email: string
        };
    };

    export type ExpressiveOptions = {
        basePath: string;
        showSwaggerOnlyInDev: boolean;
        swaggerInfo: SwaggerInfo;
        swaggerDefinitions: any;
    };

    export class ExpressApp {
        constructor(router: ExpressiveRouter);
    }
}
