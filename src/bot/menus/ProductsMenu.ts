import { Category, Product, ProductImages } from ".prisma/client";
import { InlineKeyboard } from "grammy";
import { InputMediaPhoto } from "grammy/types";
import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { CartService } from "../../web/services/CartService";
import { FavoritesService } from "../../web/services/FavoritesService";
import { ProductsService } from "../../web/services/ProductsService";
import { BackButton } from "../menubuttons/BackButton";
import { Menu } from "./Menu";

@injectable()
export class ProductsMenu extends Menu {
    public id: string = "ProductsMenu";

    constructor(
        private productsService: ProductsService,
        private favoritesService: FavoritesService,
        private cartService: CartService,
        menuStorage: Map<string, Menu>
    ) {
        super(menuStorage);

        this.registerButton(new BackButton("↩️", this, this.menuStorage))

        this.registerButton({
            text: "⬅️",
            onClick: async (ctx) => {
                const category = await this.productsService.getCategoryById(ctx.session.menuState.currentCategory)

                if (!category) {
                    return;
                }

                let page = ctx.session.menuState.currentPage;
                page -= 1
                if (page < 0) {

                } else {
                    ctx.session.menuState.currentPage = page
                    await this.reply(ctx, category, ctx.session.menuState.currentPage)
                }
            }
        })

        this.registerButton({
            text: "➡️",
            onClick: async (ctx) => {
                const category = await this.productsService.getCategoryById(ctx.session.menuState.currentCategory)

                if (!category) {
                    return;
                }

                let page = ctx.session.menuState.currentPage;
                page += 1
                if (page < 0) {

                } else {
                    ctx.session.menuState.currentPage = page
                    await this.reply(ctx, category, ctx.session.menuState.currentPage)
                }
            }
        })

        this.registerInlineButtonCallback("buy", async (ctx, data) => {
            if (ctx.from) {
                await this.cartService.addCartProduct(ctx.from?.id, Number(data))
            }

            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });

            const keyboard = new InlineKeyboard()
                .text("Товар додано в кошик. (Назад)", `${jsonInfo}`).row()

            await ctx.editMessageReplyMarkup({
                reply_markup: keyboard
            })
        });


        this.registerInlineButtonCallback("favorite", async (ctx, data) => {
            if (ctx.from) {
                await this.favoritesService.addFavoriteProduct(ctx.from?.id, Number(data))
            }

            const jsonInfo = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });

            const keyboard = new InlineKeyboard()
                .text("Товар додано. (Назад)", `${jsonInfo}`).row()

            await ctx.editMessageReplyMarkup({
                reply_markup: keyboard
            })
        });

        this.registerInlineButtonCallback("info", async (ctx, data) => {
            console.log(ctx.callbackQuery?.message);

            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });

            var product = await this.productsService.getProductById(Number(data));

            const keyboard = new InlineKeyboard()
                .text("Назад", `${jsonBuy}`).row()

            await ctx.api.raw.editMessageText(
                {
                    chat_id: ctx.chat?.id || -1,
                    message_id: ctx.callbackQuery?.message?.message_id || -1,
                    text: product?.longDescription || "",
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
        });

        this.registerInlineButtonCallback("back", async (ctx, data) => {
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

            var product = await this.productsService.getProductById(Number(data));

            if (!product) {
                return;
            }

            const keyboard = new InlineKeyboard()
                .text("Додати в кошик", `${jsonBuy}`).row()
                .text("Додати в обране", `${jsonFavorite}`).row()
                .text("Подробиці", `${jsonInfo}`)

            await ctx.api.raw.editMessageText({
                chat_id: ctx.chat?.id || -1,
                message_id: ctx.callbackQuery?.message?.message_id || -1,
                text: this.getProductDescription(product),
                parse_mode: "HTML",
                reply_markup: keyboard
            })
        });
    }

    async open(ctx: BotContext): Promise<void> {
        await super.open(ctx);

        const category = await this.productsService.getCategoryById(ctx.session.menuState.currentCategory)

        if (!category) {
            await this.commitMessage(ctx,
                ctx.reply(`Такої категорії не існує`, {
                    reply_markup: this.getKeyboard(ctx)
                })
            )
            return;
        }

        console.log(ctx.session.menuState.currentPage)
        await this.reply(ctx, category, ctx.session.menuState.currentPage)

        await this.commitMessage(ctx,
            ctx.reply(`⬆️ Вітаємо вас в категорії ${category.name}⬆️`, {
                reply_markup: this.getKeyboard(ctx)
            })
        )
    }

    public async reply(ctx: BotContext, category: Category, page: number) {
        const products = await this.productsService.getProductsByCategory(page, 3, category, "asc");

        for (const product of products) {
            await this.replyProductImages(ctx, product);
            await this.replyProductDescription(ctx, product);
        }

        await this.commitMessage(ctx,
            ctx.reply(`Сторінка #${page + 1}`)
        )
    }

    private async replyProductImages(ctx: BotContext, product: Product & { productImages: ProductImages[]; }) {
        const mediaArray = new Array<InputMediaPhoto>();
        for (const productImage of product.productImages) {
            if (productImage.imageUrl == '') {
                continue;
            }

            mediaArray.push({
                type: 'photo',
                media: productImage.imageUrl,
            });
        }

        await this.commitGroupMessage(ctx,
            ctx.replyWithMediaGroup(mediaArray)
        );
    }

    private getProductDescription(product: Product) {
        return `<b>${product.name}</b>\n<i>${product.description}</i>\n\nЦіна: ${product.price}₴`;
    }

    private async replyProductDescription(ctx: BotContext, product: Product) {
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

        const keyboard = new InlineKeyboard()
            .text("Додати в кошик", `${jsonBuy}`).row()
            .text("Додати в обране", `${jsonFavorite}`).row()
            .text("Подробиці", `${jsonInfo}`);

        const description = this.getProductDescription(product);

        await this.commitMessage(ctx,
            ctx.reply(description, {
                reply_markup: keyboard,
                parse_mode: "HTML"
            })
        );
    }
}