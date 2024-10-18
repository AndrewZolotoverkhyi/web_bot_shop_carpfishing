import { CartProduct, Category, Product, ProductImages } from "@prisma/client";
import { InlineKeyboard, Keyboard } from "grammy";
import { InputMediaPhoto } from "grammy/types";
import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { CartService } from "../../web/services/CartService";
import { OrderService } from "../../web/services/OrderService";
import { ProductsService } from "../../web/services/ProductsService";
import { UserService } from "../../web/services/UserService";
import { BackButton } from "../menubuttons/BackButton";
import { Menu, MenuStorage } from "./Menu";

@injectable()
export class CartMenu extends Menu {
    public id: string = "CartMenu"

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private userService: UserService,
        menuStorage: Map<string, Menu>,
    ) {
        super(menuStorage)

        this.registerButton(new BackButton("↩️", this, this.menuStorage))

        this.registerButton({
            text: "Оформити замовлення",
            onClick: async (ctx) => {
                if (!ctx.from) {
                    return;
                }

                const products = await this.cartService.getCartProduct(ctx.from.id);

                if (products.length <= 0) {
                    return;
                }

                const k = new Keyboard()
                    .requestContact("Відправити")

                ctx.session.menuState.stateId = 1
                await this.commitMessage(ctx,
                    ctx.reply(`Для оформлення замовлення нам подрібно знати ваші контакти.`, {
                        reply_markup: k
                    }))
            }
        })

        this.registerInlineButtonCallback("info", async (ctx, data) => {
            console.log(ctx.callbackQuery?.message);

            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: data
            });

            var product = await this.cartService.getCartProductById(Number(data));

            const keyboard = new InlineKeyboard()
                .text("Назад", `${jsonBuy}`).row()

            await ctx.api.raw.editMessageText(
                {
                    chat_id: ctx.chat?.id || -1,
                    message_id: ctx.callbackQuery?.message?.message_id || -1,
                    text: product?.product.longDescription || "",
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
        });

        this.registerInlineButtonCallback("addone", async (ctx, data) => {
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

            var cardProduct = await this.cartService.incrementCartProductCount(Number(data));

            const keyboard = new InlineKeyboard()
                .text("+", `${jsonAddOne}`).row()
                .text("-", `${jsonRemoveOne}`).row()
                .text("Назад", `${jsonBuy}`).row()

            await ctx.api.raw.editMessageText(
                {
                    chat_id: ctx.chat?.id || -1,
                    message_id: ctx.callbackQuery?.message?.message_id || -1,
                    text: this.getProductDescription(cardProduct) || "",
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
        });

        this.registerInlineButtonCallback("removeone", async (ctx, data) => {
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

            var cardProduct = await this.cartService.decrementCartProductCount(Number(data));

            const keyboard = new InlineKeyboard()
                .text("+", `${jsonAddOne}`).row()
                .text("-", `${jsonRemoveOne}`).row()
                .text("Назад", `${jsonBuy}`).row()

            await ctx.api.raw.editMessageText(
                {
                    chat_id: ctx.chat?.id || -1,
                    message_id: ctx.callbackQuery?.message?.message_id || -1,
                    text: this.getProductDescription(cardProduct) || "",
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
        });

        this.registerInlineButtonCallback("count", async (ctx, data) => {
            var product = await this.cartService.getCartProductById(Number(data));

            if (!product) {
                return;
            }

            const jsonBuy = JSON.stringify({
                menuId: this.id,
                callbackId: "back",
                data: product!.id
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

            const keyboard = new InlineKeyboard()
                .text("+", `${jsonAddOne}`).row()
                .text("-", `${jsonRemoveOne}`).row()
                .text("Назад", `${jsonBuy}`).row()

            await ctx.api.raw.editMessageText(
                {
                    chat_id: ctx.chat?.id || -1,
                    message_id: ctx.callbackQuery?.message?.message_id || -1,
                    text: this.getProductDescription(product),
                    parse_mode: "HTML",
                    reply_markup: keyboard
                });
        });

        this.registerInlineButtonCallback("delete", async (ctx, data) => {
            const cardProductId = Number(data)
            await this.cartService.removeCartProduct(cardProductId);

            await ctx.editMessageText("Товар видалено.")
        })

        this.registerInlineButtonCallback("back", async (ctx, data) => {
            var product = await this.cartService.getCartProductById(Number(data));

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

            const keyboard = new InlineKeyboard()
                .text("Подробиці", `${jsonInfo}`)
                .text("Змінити кількість", `${jsonCount}`)
                .text("Видалити", `${jsonDelete}`);

            await ctx.api.raw.editMessageText({
                chat_id: ctx.chat?.id || -1,
                message_id: ctx.callbackQuery?.message?.message_id || -1,
                text: this.getProductDescription(product),
                parse_mode: "HTML",
                reply_markup: keyboard
            })
        });
    }

    async open(ctx: BotContext) {
        await super.open(ctx)

        await this.reply(ctx)
    }

    public async reply(ctx: BotContext) {
        const from = ctx.from
        if (!from) {
            await this.commitMessage(ctx,
                ctx.reply(`Товарів в кошику не знайдено!`)
            )
            return;
        }

        const products = await this.cartService.getCartProduct(from.id);

        if (products.length <= 0) {
            await this.commitMessage(ctx,
                ctx.reply(`Кошик порожній`,
                    {
                        reply_markup: this.getKeyboard(ctx)
                    }));
        } else {
            for (const product of products) {
                await this.replyProductImages(ctx, product);
                await this.replyProductDescription(ctx, product);
            }
            await this.commitMessage(ctx,
                ctx.reply(`⬆️ Кошик ⬆️`,
                    {
                        reply_markup: this.getKeyboard(ctx)
                    }));
        }
    }

    private async replyProductImages(ctx: BotContext, product: CartProduct & {
        product: Product & {
            productImages: ProductImages[];
        };
    }) {
        const mediaArray = new Array<InputMediaPhoto>();
        for (const productImage of product.product.productImages) {
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

    private getProductDescription(product: CartProduct & {
        product: Product
    }) {
        return `<b>${product.product.name}</b>\n<i>${product.product.description}</i>\n\nЦіна: ${product.product.price}₴\n\nКількість: ${product.count}`;
    }

    private async replyProductDescription(ctx: BotContext, product: CartProduct & {
        product: Product
    }) {
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

        const keyboard = new InlineKeyboard()
            .text("Подробиці", `${jsonInfo}`)
            .text("Змінити кількість", `${jsonCount}`)
            .text("Видалити", `${jsonDelete}`);

        const description = this.getProductDescription(product);

        await this.commitMessage(ctx,
            ctx.reply(description, {
                reply_markup: keyboard,
                parse_mode: "HTML"
            })
        );
    }

    protected async handleMessage(ctx: BotContext, message: string) {
        switch (ctx.session.menuState.stateId) {
            case 1:
                if (!ctx.message || !ctx.message.contact || !ctx.from) {
                    return
                }

                const number = ctx.message?.contact?.phone_number;

                const products = await this.cartService.getCartProduct(ctx.from.id)
                const user = await this.userService.getUser(ctx.from.id)

                if (!user) {
                    return
                }

                const order = await this.orderService.createOrder(user.id, ctx.message.from.username || "Невідомо", number, products)

                ctx.session.menuState.orderId = order.id;
                ctx.session.menuState.stateId = 2;

                await this.commitMessage(ctx,
                    ctx.reply("Напишіть адресу доставки", {
                        reply_markup: { remove_keyboard: true }
                    })
                )
                break;
            case 2:
                if (!ctx.message || ctx.session.menuState.orderId == -1 || !ctx.from) {
                    return
                }

                const address = message;

                const cartProducts = await this.cartService.getCartProduct(ctx.from.id)

                for (const product of cartProducts) {
                    await this.cartService.removeCartProduct(product.id)
                }

                const orderp = await this.orderService.updateOrderAddress(ctx.session.menuState.orderId, address);

                await this.commitMessage(ctx,
                    ctx.reply(`Замовлення #${orderp.id} додано, чекайте на звязок з вами!`, {
                        reply_markup: this.getKeyboard(ctx)
                    })
                )

                ctx.session.menuState.stateId = 0;
                break;
            default:
                break;
        }
    }
}