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
exports.ProductsMenu = void 0;
const grammy_1 = require("grammy");
const tsyringe_1 = require("tsyringe");
const CartService_1 = require("../../web/services/CartService");
const FavoritesService_1 = require("../../web/services/FavoritesService");
const ProductsService_1 = require("../../web/services/ProductsService");
const BackButton_1 = require("../menubuttons/BackButton");
const Menu_1 = require("./Menu");
let ProductsMenu = class ProductsMenu extends Menu_1.Menu {
    constructor(productsService, favoritesService, cartService, menuStorage) {
        super(menuStorage);
        this.productsService = productsService;
        this.favoritesService = favoritesService;
        this.cartService = cartService;
        this.id = "ProductsMenu";
        this.registerButton(new BackButton_1.BackButton("↩️", this, this.menuStorage));
        this.registerButton({
            text: "⬅️",
            onClick: (ctx) => __awaiter(this, void 0, void 0, function* () {
                const category = yield this.productsService.getCategoryById(ctx.session.menuState.currentCategory);
                if (!category) {
                    return;
                }
                let page = ctx.session.menuState.currentPage;
                page -= 1;
                if (page < 0) {
                }
                else {
                    ctx.session.menuState.currentPage = page;
                    yield this.reply(ctx, category, ctx.session.menuState.currentPage);
                }
            })
        });
        this.registerButton({
            text: "➡️",
            onClick: (ctx) => __awaiter(this, void 0, void 0, function* () {
                const category = yield this.productsService.getCategoryById(ctx.session.menuState.currentCategory);
                if (!category) {
                    return;
                }
                let page = ctx.session.menuState.currentPage;
                page += 1;
                if (page < 0) {
                }
                else {
                    ctx.session.menuState.currentPage = page;
                    yield this.reply(ctx, category, ctx.session.menuState.currentPage);
                }
            })
        });
        this.registerInlineButtonCallback("buy", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (ctx.from) {
                yield this.cartService.addCartProduct((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id, Number(data));
            }
            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Товар додано в кошик. (Назад)", `${jsonInfo}`).row();
            yield ctx.editMessageReplyMarkup({
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("favorite", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            if (ctx.from) {
                yield this.favoritesService.addFavoriteProduct((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id, Number(data));
            }
            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Товар додано. (Назад)", `${jsonInfo}`).row();
            yield ctx.editMessageReplyMarkup({
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("info", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d, _e, _f;
            console.log((_c = ctx.callbackQuery) === null || _c === void 0 ? void 0 : _c.message);
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });
            var product = yield this.productsService.getProductById(Number(data));
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Назад", `${jsonBuy}`).row();
            yield ctx.api.raw.editMessageText({
                chat_id: ((_d = ctx.chat) === null || _d === void 0 ? void 0 : _d.id) || -1,
                message_id: ((_f = (_e = ctx.callbackQuery) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.message_id) || -1,
                text: (product === null || product === void 0 ? void 0 : product.longDescription) || "",
                parse_mode: "HTML",
                reply_markup: keyboard
            });
        }));
        this.registerInlineButtonCallback("back", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            var _g, _h, _j;
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "buy",
                data: data
            });
            const jsonFavorite = JSON.stringify({
                menuId: this.id,
                callbackId: "favorite",
                data: data
            });
            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "info",
                data: data
            });
            var product = yield this.productsService.getProductById(Number(data));
            if (!product) {
                return;
            }
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Додати в кошик", `${jsonBuy}`).row()
                .text("Додати в обране", `${jsonFavorite}`).row()
                .text("Подробиці", `${jsonInfo}`);
            yield ctx.api.raw.editMessageText({
                chat_id: ((_g = ctx.chat) === null || _g === void 0 ? void 0 : _g.id) || -1,
                message_id: ((_j = (_h = ctx.callbackQuery) === null || _h === void 0 ? void 0 : _h.message) === null || _j === void 0 ? void 0 : _j.message_id) || -1,
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
            const category = yield this.productsService.getCategoryById(ctx.session.menuState.currentCategory);
            if (!category) {
                yield this.commitMessage(ctx, ctx.reply(`Такої категорії не існує`, {
                    reply_markup: this.getKeyboard(ctx)
                }));
                return;
            }
            console.log(ctx.session.menuState.currentPage);
            yield this.reply(ctx, category, ctx.session.menuState.currentPage);
            yield this.commitMessage(ctx, ctx.reply(`⬆️ Вітаємо вас в категорії ${category.name}⬆️`, {
                reply_markup: this.getKeyboard(ctx)
            }));
        });
    }
    reply(ctx, category, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.productsService.getProductsByCategory(page, 3, category, "asc");
            for (const product of products) {
                yield this.replyProductImages(ctx, product);
                yield this.replyProductDescription(ctx, product);
            }
            yield this.commitMessage(ctx, ctx.reply(`Сторінка #${page + 1}`));
        });
    }
    replyProductImages(ctx, product) {
        return __awaiter(this, void 0, void 0, function* () {
            const mediaArray = new Array();
            for (const productImage of product.productImages) {
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
        return `<b>${product.name}</b>\n<i>${product.description}</i>\n\nЦіна: ${product.price}₴`;
    }
    replyProductDescription(ctx, product) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "buy",
                data: product.id
            });
            const jsonFavorite = JSON.stringify({
                menuId: this.id,
                callbackId: "favorite",
                data: product.id
            });
            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "info",
                data: product.id
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Додати в кошик", `${jsonBuy}`).row()
                .text("Додати в обране", `${jsonFavorite}`).row()
                .text("Подробиці", `${jsonInfo}`);
            const description = this.getProductDescription(product);
            yield this.commitMessage(ctx, ctx.reply(description, {
                reply_markup: keyboard,
                parse_mode: "HTML"
            }));
        });
    }
};
ProductsMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [ProductsService_1.ProductsService,
        FavoritesService_1.FavoritesService,
        CartService_1.CartService,
        Map])
], ProductsMenu);
exports.ProductsMenu = ProductsMenu;
