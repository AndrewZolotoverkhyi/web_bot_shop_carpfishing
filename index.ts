import "reflect-metadata";
import express, { Request, Response } from 'express';
import { TeleBot } from './bot'
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './src/web/controllers/AuthController';
import { Controller } from './src/web/controllers/Controller';
import { container } from "tsyringe";
import { AuthService } from "./src/web/services/AuthService";
import { ProductController } from "./src/web/controllers/ProductController";
import { ProductsService } from "./src/web/services/ProductsService";
import { FavoritesService } from "./src/web/services/FavoritesService";
import { CartService } from "./src/web/services/CartService";
import { OrdersController } from "./src/web/controllers/OrdersController";
import { OrderService } from "./src/web/services/OrderService";


const app = express();

const port = process.env.PORT || 5000;
const botToken = process.env.BOT_TOKEN || "";
const prisma = new PrismaClient();

app.set('view engine', 'ejs');
app.set('views', 'src/web/views')
app.use(express.json())

initContainer();
initRouting();

app.listen(port, async () => {

    try {
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    console.log(`[server]: Server is running at http://localhost:${port}`);
});

container.resolve(TeleBot).start();

function initContainer() {
    //DATABASE
    container.registerInstance<PrismaClient>(PrismaClient, prisma)

    //SERVICES
    container.register("Service", AuthService)
    container.register("Service", ProductsService)
    container.register("Service", FavoritesService)
    container.register("Service", CartService)
    container.register("Service", OrderService)

    //CONTROLLERS
    container.register("Controller", AuthController)
    container.register("Controller", ProductController)
    container.register("Controller", OrdersController)
    //BOT
    container.registerInstance(TeleBot, new TeleBot(botToken, prisma, container));
}

function initRouting() {
    container.resolveAll<Controller>("Controller").forEach(controller => {
        const router = express.Router();
        controller.createRouting(router)
        app.use(controller.RouteId, router);
    })
}

//