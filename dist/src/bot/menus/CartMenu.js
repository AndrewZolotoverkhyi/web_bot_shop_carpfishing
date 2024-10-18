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
exports.CartMenu = void 0;
const grammy_1 = require("grammy");
const tsyringe_1 = require("tsyringe");
const CartService_1 = require("../../web/services/CartService");
const OrderService_1 = require("../../web/services/OrderService");
const UserService_1 = require("../../web/services/UserService");
const BackButton_1 = require("../menubuttons/BackButton");
const Menu_1 = require("./Menu");
let CartMenu = class CartMenu extends Menu_1.Menu {
    constructor(cartService, orderService, userService, menuStorage) {
        super(menuStorage);
        this.cartService = cartService;
        this.orderService = orderService;
        this.userService = userService;
        this.id = "CartMenu";
        this.registerButton(new BackButton_1.BackButton("↩️", this, this.menuStorage));
        this.registerButton({
            text: "Оформити замовлення",
            onClick: (ctx) => __awaiter(this, void 0, void 0, function* () {
                if (!ctx.from) {
                    return;
                }
                const products = yield this.cartService.getCartProduct(ctx.from.id);
                if (products.length <= 0) {
                    return;
                }
                const k = new grammy_1.Keyboard()
                    .requestContact("Відправити");
                ctx.session.menuState.stateId = 1;
                yield this.commitMessage(ctx, ctx.reply(`Для оформлення замовлення нам подрібно знати ваші контакти.`, {
                    reply_markup: k
                }));
            })
        });
        this.registerInlineButtonCallback("info", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            console.log((_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.message);
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });
            var product = yield this.cartService.getCartProductById(Number(data));
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Назад", `${jsonBuy}`).row();
            yield ctx.api.raw.editMessageText({
                chat_id: ((_b = ctx.chat) === null || _b === void 0 ? void 0 : _b.id) || -1,
                message_id: ((_d = (_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id) || -1,
                text: (product === null || product === void 0 ? void 0 : product.product.longDescription) || "",
                parse_mode: "HTML",
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("addone", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _e, _f, _g;
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });
            const jsonAddOne = JSON.stringify({
                menuId: this.id,
                callbackId: "addone",
                data: data
            });
            const jsonRemoveOne = JSON.stringify({
                menuId: this.id,
                callbackId: "removeone",
                data: data
            });
            var cardProduct = yield this.cartService.incrementCartProductCount(Number(data));
            const keyboard = new grammy_1.InlineKeyboard()
                .text("+", `${jsonAddOne}`).row()
                .text("-", `${jsonRemoveOne}`).row()
                .text("Назад", `${jsonBuy}`).row();
            yield ctx.api.raw.editMessageText({
                chat_id: ((_e = ctx.chat) === null || _e === void 0 ? void 0 : _e.id) || -1,
                message_id: ((_g = (_f = ctx.callbackQuery) === null || _f === void 0 ? void 0 : _f.message) === null || _g === void 0 ? void 0 : _g.message_id) || -1,
                text: this.getProductDescription(cardProduct) || "",
                parse_mode: "HTML",
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("removeone", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _h, _j, _k;
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });
            const jsonAddOne = JSON.stringify({
                menuId: this.id,
                callbackId: "addone",
                data: data
            });
            const jsonRemoveOne = JSON.stringify({
                menuId: this.id,
                callbackId: "removeone",
                data: data
            });
            var cardProduct = yield this.cartService.decrementCartProductCount(Number(data));
            const keyboard = new grammy_1.InlineKeyboard()
                .text("+", `${jsonAddOne}`).row()
                .text("-", `${jsonRemoveOne}`).row()
                .text("Назад", `${jsonBuy}`).row();
            yield ctx.api.raw.editMessageText({
                chat_id: ((_h = ctx.chat) === null || _h === void 0 ? void 0 : _h.id) || -1,
                message_id: ((_k = (_j = ctx.callbackQuery) === null || _j === void 0 ? void 0 : _j.message) === null || _k === void 0 ? void 0 : _k.message_id) || -1,
                text: this.getProductDescription(cardProduct) || "",
                parse_mode: "HTML",
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("count", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _l, _m, _o;
            var product = yield this.cartService.getCartProductById(Number(data));
            if (!product) {
                return;
            }
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: product.id
            });
            const jsonAddOne = JSON.stringify({
                menuId: this.id,
                callbackId: "addone",
                data: data
            });
            const jsonRemoveOne = JSON.stringify({
                menuId: this.id,
                callbackId: "removeone",
                data: data
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("+", `${jsonAddOne}`).row()
                .text("-", `${jsonRemoveOne}`).row()
                .text("Назад", `${jsonBuy}`).row();
            yield ctx.api.raw.editMessageText({
                chat_id: ((_l = ctx.chat) === null || _l === void 0 ? void 0 : _l.id) || -1,
                message_id: ((_o = (_m = ctx.callbackQuery) === null || _m === void 0 ? void 0 : _m.message) === null || _o === void 0 ? void 0 : _o.message_id) || -1,
                text: this.getProductDescription(product),
                parse_mode: "HTML",
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("delete", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            const cardProductId = Number(data);
            yield this.cartService.removeCartProduct(cardProductId);
            yield ctx.editMessageText("Товар видалено.");
        }));
        this.registerInlineButtonCallback("back", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _p, _q, _r;
            var product = yield this.cartService.getCartProductById(Number(data));
            if (!product) {
                return;
            }
            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "info",
                data: product.id
            });
            const jsonDelete = JSON.stringify({
                menuId: this.id,
                callbackId: "delete",
                data: product.id
            });
            const jsonCount = JSON.stringify({
                menuId: this.id,
                callbackId: "count",
                data: product.id
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Подробиці", `${jsonInfo}`)
                .text("Змінити кількість", `${jsonCount}`)
                .text("Видалити", `${jsonDelete}`);
            yield ctx.api.raw.editMessageText({
                chat_id: ((_p = ctx.chat) === null || _p === void 0 ? void 0 : _p.id) || -1,
                message_id: ((_r = (_q = ctx.callbackQuery) === null || _q === void 0 ? void 0 : _q.message) === null || _r === void 0 ? void 0 : _r.message_id) || -1,
                text: this.getProductDescription(product),
                parse_mode: "HTML",
                reply_markup: keyboard
            });
        }));
    }
    open(ctx) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.open.call(this, ctx);
            yield this.reply(ctx);
        });
    }
    reply(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = ctx.from;
            if (!from) {
                yield this.commitMessage(ctx, ctx.reply(`Товарів в кошику не знайдено!`));
                return;
            }
            const products = yield this.cartService.getCartProduct(from.id);
            if (products.length <= 0) {
                yield this.commitMessage(ctx, ctx.reply(`Кошик порожній`, {
                    reply_markup: this.getKeyboard(ctx)
                }));
            }
            else {
                for (const product of products) {
                    yield this.replyProductImages(ctx, product);
                    yield this.replyProductDescription(ctx, product);
                }
                yield this.commitMessage(ctx, ctx.reply(`⬆️ Кошик ⬆️`, {
                    reply_markup: this.getKeyboard(ctx)
                }));
            }
        });
    }
    replyProductImages(ctx, product) {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaArray = new Array();
            for (const productImage of product.product.productImages) {
                if (productImage.imageUrl == '') {
                    continue;
                }
                mediaArray.push({
                    type: 'photo',
                    media: productImage.imageUrl,
                });
            }
            yield this.commitGroupMessage(ctx, ctx.replyWithMediaGroup(mediaArray));
        });
    }
    getProductDescription(product) {
        return `<b>${product.product.name}</b>\n<i>${product.product.description}</i>\n\nЦіна: ${product.product.price}₴\n\nКількість: ${product.count}`;
    }
    replyProductDescription(ctx, product) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "info",
                data: product.id
            });
            const jsonDelete = JSON.stringify({
                menuId: this.id,
                callbackId: "delete",
                data: product.id
            });
            const jsonCount = JSON.stringify({
                menuId: this.id,
                callbackId: "count",
                data: product.id
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Подробиці", `${jsonInfo}`)
                .text("Змінити кількість", `${jsonCount}`)
                .text("Видалити", `${jsonDelete}`);
            const description = this.getProductDescription(product);
            yield this.commitMessage(ctx, ctx.reply(description, {
                reply_markup: keyboard,
                parse_mode: "HTML"
            }));
        });
    }
    handleMessage(ctx, message) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            switch (ctx.session.menuState.stateId) {
                case 1:
                    if (!ctx.message || !ctx.message.contact || !ctx.from) {
                        return;
                    }
                    const number = (_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.contact) === null || _b === void 0 ? void 0 : _b.phone_number;
                    const products = yield this.cartService.getCartProduct(ctx.from.id);
                    const user = yield this.userService.getUser(ctx.from.id);
                    if (!user) {
                        return;
                    }
                    const order = yield this.orderService.createOrder(user.id, ctx.message.from.username || "Невідомо", number, products);
                    ctx.session.menuState.orderId = order.id;
                    ctx.session.menuState.stateId = 2;
                    yield this.commitMessage(ctx, ctx.reply("Напишіть адресу доставки", {
                        reply_markup: { remove_keyboard: true }
                    }));
                    break;
                case 2:
                    if (!ctx.message || ctx.session.menuState.orderId == -1 || !ctx.from) {
                        return;
                    }
                    const address = message;
                    const cartProducts = yield this.cartService.getCartProduct(ctx.from.id);
                    for (const product of cartProducts) {
                        yield this.cartService.removeCartProduct(product.id);
                    }
                    const orderp = yield this.orderService.updateOrderAddress(ctx.session.menuState.orderId, address);
                    yield this.commitMessage(ctx, ctx.reply(`Замовлення #${orderp.id} додано, чекайте на звязок з вами!`, {
                        reply_markup: this.getKeyboard(ctx)
                    }));
                    ctx.session.menuState.stateId = 0;
                    break;
                default:
                    break;
            }
        });
    }
};
CartMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [CartService_1.CartService,
        OrderService_1.OrderService,
        UserService_1.UserService,
        Map])
], CartMenu);
exports.CartMenu = CartMenu;
