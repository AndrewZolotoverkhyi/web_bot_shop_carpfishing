"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
const bot_1 = require("../../../bot");
const AuthService_1 = require("../services/AuthService");
const OrderService_1 = require("../services/OrderService");
let OrdersController = class OrdersController {
    constructor(orderService, prisma, authService, bot) {
        this.orderService = orderService;
        this.prisma = prisma;
        this.authService = authService;
        this.bot = bot;
        this.RouteId = "/orders";
    }
    createRouting(router) {
        router.get("/view", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onView(req, res); }));
        router.get("/get", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onGetOrders(req, res); }));
        router.delete("/delete", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onDeleteOrder(req, res); }));
        router.post("/state", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onChangeOrderState(req, res); }));
    }
    onView(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render('orders');
        });
    }
    onGetOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).send(yield this.orderService.getOrders());
        });
    }
    onChangeOrderState(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, stateId, address } = req.body;
            const order = yield this.prisma.order.update({
                where: {
                    id: Number(id)
                },
                data: {
                    state: Number(stateId),
                    address: address
                },
                include: {
                    OrderProduct: true,
                    user: true
                }
            });
            const user = order.user;
            let stateString = this.orderService.getState(order.state);
            yield this.bot.getBot().api.sendMessage(user.chatid, `Замовлення №${order.id} ${stateString}.\nАдреса доставки: ${order.address}`);
            res.status(200).send({
                result: "ok"
            });
        });
    }
    onDeleteOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            yield this.orderService.deleteOrder(id);
            res.status(200).send({
                result: "ok"
            });
        });
    }
};
OrdersController = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [OrderService_1.OrderService,
        client_1.PrismaClient,
        AuthService_1.AuthService,
        bot_1.TeleBot])
], OrdersController);
exports.OrdersController = OrdersController;
