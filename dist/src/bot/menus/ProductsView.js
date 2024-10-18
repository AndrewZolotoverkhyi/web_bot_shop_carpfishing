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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsView = void 0;
const grammy_1 = require("grammy");
class ProductsView {
    constructor(productsService, menu) {
        this.productsService = productsService;
        this.menu = menu;
    }
    reply(ctx, category) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.productsService.getProductsByCategory(0, 3, category, "asc");
            for (const product of products) {
                yield this.replyProductImages(ctx, product);
                yield this.replyProductDescription(ctx, product);
            }
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
            yield this.menu.commitGroupMessage(ctx, ctx.replyWithMediaGroup(mediaArray));
        });
    }
    getProductDescription(product) {
        return `<b>${product.name}</b>\n<i>${product.description}</i>\n\nЦіна: ${product.price}₴`;
    }
    replyProductDescription(ctx, product) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonBuy = JSON.stringify({
                menuId: this.menu.id,
                callbackId: "buy",
                data: product.id
            });
            const jsonFavorite = JSON.stringify({
                menuId: this.menu.id,
                callbackId: "favorite",
                data: product.id
            });
            const jsonInfo = JSON.stringify({
                menuId: this.menu.id,
                callbackId: "info",
                data: product.id
            });
            const keyboard = new grammy_1.InlineKeyboard()
                .text("Додати в кошик", `${jsonBuy}`).row()
                .text("Додати в обране", `${jsonFavorite}`).row()
                .text("Подробиці", `${jsonInfo}`);
            const description = this.getProductDescription(product);
            yield this.menu.commitMessage(ctx, ctx.reply(description, {
                reply_markup: keyboard,
                parse_mode: "HTML"
            }));
        });
    }
}
exports.ProductsView = ProductsView;
