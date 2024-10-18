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
exports.OrdersMenu = void 0;
const grammy_1 = require("grammy");
const tsyringe_1 = require("tsyringe");
const OrderService_1 = require("../../web/services/OrderService");
const UserService_1 = require("../../web/services/UserService");
const BackButton_1 = require("../menubuttons/BackButton");
const Menu_1 = require("./Menu");
let OrdersMenu = class OrdersMenu extends Menu_1.Menu {
    constructor(userService, ordersService, menuStorage) {
        super(menuStorage);
        this.userService = userService;
        this.ordersService = ordersService;
        this.id = "Orders";
        this.registerButton(new BackButton_1.BackButton("↩️", this, menuStorage));
        this.registerInlineButtonCallback("delete", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            const orderId = Number(data);
            const order = yield this.ordersService.getOrder(orderId);
            if ((order === null || order === void 0 ? void 0 : order.state) != 0 && (order === null || order === void 0 ? void 0 : order.state) != 1 && (order === null || order === void 0 ? void 0 : order.state) != 6) {
                console.log(order === null || order === void 0 ? void 0 : order.state);
                return;
            }
            yield this.ordersService.deleteOrder(orderId);
            yield ctx.editMessageText(`Замовлення #${orderId} видалено.`);
        }));
    }
    open(ctx) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.open.call(this, ctx);
            if (ctx.from) {
                const user = yield this.userService.getUser(ctx.from.id);
                if (!user) {
                    return;
                }
                const orders = yield this.ordersService.getOrdersByUserId(user === null || user === void 0 ? void 0 : user.id);
                for (const order of orders) {
                    let orderCount = 0;
                    let cost = 0;
                    let productsList = "";
                    for (const product of order.OrderProduct) {
                        orderCount += product.count;
                        cost += product.count * product.product.price;
                        productsList += `<b>\nІм'я: ${product.product.name}</b>\nОпис: ${product.product.description}\nКількість: ${product.count}\nВартість: ${product.count * product.product.price}₴`;
                    }
                    const stateString = this.ordersService.getState(order.state);
                    if (order.state == 0 || order.state == 1 || order.state == 6) {
                        const jsonDelete = JSON.stringify({
                            menuId: this.id,
                            callbackId: "delete",
                            data: order.id
                        });
                        const keyboard = new grammy_1.InlineKeyboard()
                            .text("Видалити", jsonDelete);
                        yield this.commitMessage(ctx, ctx.reply(`<b>Замовлення #${order.id}</b>\nКількість товару: ${orderCount}\nАдреса: ${order.address}\n<b>Закальна вартість: ${cost}₴\nСтан: ${stateString}</b>\n\nСписок товарів: ${productsList}`, {
                            parse_mode: "HTML",
                            reply_markup: keyboard
                        }));
                    }
                    else {
                        yield this.commitMessage(ctx, ctx.reply(`<b>Замовлення #${order.id}</b>\nКількість товару: ${orderCount}\nАдреса: ${order.address}\n<b>Закальна вартість: ${cost}₴\nСтан: ${stateString}</b>\n\nСписок товарів: ${productsList}`, {
                            parse_mode: "HTML"
                        }));
                    }
                }
            }
            yield this.commitMessage(ctx, ctx.reply("⬆️ Список замовлень ⬆️", {
                reply_markup: this.getKeyboard(ctx)
            }));
        });
    }
};
OrdersMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [UserService_1.UserService,
        OrderService_1.OrderService,
        Map])
], OrdersMenu);
exports.OrdersMenu = OrdersMenu;
