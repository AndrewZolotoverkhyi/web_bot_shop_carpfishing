import { PrismaClient } from "@prisma/client";
import { InlineKeyboard } from "grammy";
import { InputMediaPhoto } from "grammy/types";
import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { CartService } from "../../web/services/CartService";
import { FavoritesService } from "../../web/services/FavoritesService";
import { BackButton } from "../menubuttons/BackButton";
import { Menu } from "./Menu";

@injectable()
export class FavoritesMenu extends Menu {
    public id: string = "Обране";

    constructor(
        private favorites: FavoritesService,
        private cartService: CartService,
        menuStorage: Map<string, Menu>
    ) {
        super(menuStorage);
        this.registerButton(new BackButton("↩️", this, menuStorage));

        this.registerInlineButtonCallback("delete", async (ctx, data) => {
            const favoriteId = Number(data)
            await this.favorites.removeFavoriteProduct(favoriteId);

            await ctx.editMessageText("Товар видалено.")
        })

        this.registerInlineButtonCallback("buy", async (ctx, data) => {
            const favoriteId = Number(data)

            const product = await this.favorites.getFavoriteProductById(favoriteId);

            if (!ctx.from || !product) {
                return;
            }

            await this.cartService.addCartProduct(ctx.from.id, product.productId)
            await this.favorites.removeFavoriteProduct(favoriteId);

            await ctx.editMessageText("Товар додано в кошик")
        })
    }

    async open(ctx: BotContext) {
        await super.open(ctx);

        if (ctx.from) {
            const favorites = await this.favorites.getFavorites(ctx.from.id) || new Array()

            for (const favorite of favorites) {
                const p = favorite.product;
                const mediaArray = new Array<InputMediaPhoto>();

                for (const productImage of p.productImages) {

                    if (productImage.imageUrl == '') {
                        continue;
                    }
                    console.log(productImage.imageUrl)
                    mediaArray.push({
                        type: 'photo',
                        media: productImage.imageUrl,
                    })
                }

                const messages = await this.commitGroupMessage(ctx,
                    ctx.replyWithMediaGroup(mediaArray)
                )

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


                const keyboard = new InlineKeyboard()
                    .text("Додати в кошик", jsonBuy)
                    .text("Видалити", jsonDelete)

                await this.commitMessage(ctx,
                    ctx.reply(p.name,
                        {
                            reply_markup: keyboard
                        })
                )
            }

        }

        await this.commitMessage(ctx,
            ctx.reply("⬆️ Список обраного ⬆️", {
                reply_markup: this.getKeyboard(ctx)
            })
        )
    }
}

