"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const bot_1 = require("./bot");
const client_1 = require("@prisma/client");
const AuthController_1 = require("./src/web/controllers/AuthController");
const tsyringe_1 = require("tsyringe");
const AuthService_1 = require("./src/web/services/AuthService");
const ProductController_1 = require("./src/web/controllers/ProductController");
const ProductsService_1 = require("./src/web/services/ProductsService");
const FavoritesService_1 = require("./src/web/services/FavoritesService");
const CartService_1 = require("./src/web/services/CartService");
const OrdersController_1 = require("./src/web/controllers/OrdersController");
const OrderService_1 = require("./src/web/services/OrderService");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const botToken = process.env.BOT_TOKEN || "";
const prisma = new client_1.PrismaClient();
app.set('view engine', 'ejs');
app.set('views', 'src/web/views');
app.use(express_1.default.json());
initContainer();
initRouting();
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    console.log(`[server]: Server is running at http://localhost:${port}`);
}));
tsyringe_1.container.resolve(bot_1.TeleBot).start();
function initContainer() {
    //DATABASE
    tsyringe_1.container.registerInstance(client_1.PrismaClient, prisma);
    //SERVICES
    tsyringe_1.container.register("Service", AuthService_1.AuthService);
    tsyringe_1.container.register("Service", ProductsService_1.ProductsService);
    tsyringe_1.container.register("Service", FavoritesService_1.FavoritesService);
    tsyringe_1.container.register("Service", CartService_1.CartService);
    tsyringe_1.container.register("Service", OrderService_1.OrderService);
    //CONTROLLERS
    tsyringe_1.container.register("Controller", AuthController_1.AuthController);
    tsyringe_1.container.register("Controller", ProductController_1.ProductController);
    tsyringe_1.container.register("Controller", OrdersController_1.OrdersController);
    //BOT
    tsyringe_1.container.registerInstance(bot_1.TeleBot, new bot_1.TeleBot(botToken, prisma, tsyringe_1.container));
}
function initRouting() {
    tsyringe_1.container.resolveAll("Controller").forEach(controller => {
        const router = express_1.default.Router();
        controller.createRouting(router);
        app.use(controller.RouteId, router);
    });
}
//
