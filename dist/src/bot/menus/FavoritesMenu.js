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
exports.FavoritesMenu = void 0;
const grammy_1 = require("grammy");
const tsyringe_1 = require("tsyringe");
const CartService_1 = require("../../web/services/CartService");
const FavoritesService_1 = require("../../web/services/FavoritesService");
const BackButton_1 = require("../menubuttons/BackButton");
const Menu_1 = require("./Menu");
let FavoritesMenu = class FavoritesMenu extends Menu_1.Menu {
    constructor(favorites, cartService, menuStorage) {
        super(menuStorage);
        this.favorites = favorites;
        this.cartService = cartService;
        this.id = "Обране";
        this.registerButton(new BackButton_1.BackButton("↩️", this, menuStorage));
        this.registerInlineButtonCallback("delete", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            const favoriteId = Number(data);
            yield this.favorites.removeFavoriteProduct(favoriteId);
            yield ctx.editMessageText("Товар видалено.");
        }));
        this.registerInlineButtonCallback("buy", (ctx, data) => __awaiter(this, void 0, void 0, function* () {
            const favoriteId = Number(data);
            const product = yield this.favorites.getFavoriteProductById(favoriteId);
            if (!ctx.from || !product) {
                return;
            }
            yield this.cartService.addCartProduct(ctx.from.id, product.productId);
            yield this.favorites.removeFavoriteProduct(favoriteId);
            yield ctx.editMessageText("Товар додано в кошик");
        }));
    }
    open(ctx) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.open.call(this, ctx);
            if (ctx.from) {
                const favorites = (yield this.favorites.getFavorites(ctx.from.id)) || new Array();
                for (const favorite of favorites) {
                    const p = favorite.product;
                    const mediaArray = new Array();
                    for (const productImage of p.productImages) {
                        if (productImage.imageUrl == '') {
                            continue;
                        }
                        console.log(productImage.imageUrl);
                        mediaArray.push({
                            type: 'photo',
                            media: productImage.imageUrl,
                        });
                    }
                    const messages = yield this.commitGroupMessage(ctx, ctx.replyWithMediaGroup(mediaArray));
                    const jsonDelete = JSON.stringify({
                        menuId: this.id,
                        callbackId: "delete",
                        data: favorite.id
                    });
                    const jsonBuy = JSON.stringify({
                        menuId: this.id,
                        callbackId: "buy",
                        data: favorite.id
                    });
                    const keyboard = new grammy_1.InlineKeyboard()
                        .text("Додати в кошик", jsonBuy)
                        .text("Видалити", jsonDelete);
                    yield this.commitMessage(ctx, ctx.reply(p.name, {
                        reply_markup: keyboard
                    }));
                }
            }
            yield this.commitMessage(ctx, ctx.reply("⬆️ Список обраного ⬆️", {
                reply_markup: this.getKeyboard(ctx)
            }));
        });
    }
};
FavoritesMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [FavoritesService_1.FavoritesService,
        CartService_1.CartService,
        Map])
], FavoritesMenu);
exports.FavoritesMenu = FavoritesMenu;
