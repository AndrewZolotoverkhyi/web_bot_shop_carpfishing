import { Router } from 'express';

//Інтерфейс який вказує що клас є контроллером і відповідає за роутинг запитів
export interface Controller {
    RouteId: string;
    createRouting(router: Router): void;
}