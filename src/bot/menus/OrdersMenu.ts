import { PrismaClient } from "@prisma/client";
import { InlineKeyboard, Keyboard } from "grammy";
import { InputMediaPhoto } from "grammy/types";
import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { CartService } from "../../web/services/CartService";
import { FavoritesService } from "../../web/services/FavoritesService";
import { OrderService } from "../../web/services/OrderService";
import { UserService } from "../../web/services/UserService";
import { BackButton } from "../menubuttons/BackButton";
import { Menu } from "./Menu";

@injectable()
export class OrdersMenu extends Menu {
    public id: string = "Orders";

    constructor(
        private userService: UserService,
        private ordersService: OrderService,
        menuStorage: Map<string, Menu>
    ) {
        super(menuStorage);
        this.registerButton(new BackButton("↩️", this, menuStorage));

        this.registerInlineButtonCallback("delete", async (ctx, data) => {
            const orderId = Number(data)
            const order = await this.ordersService.getOrder(orderId);

            if (order?.state != 0 && order?.state != 1 && order?.state != 6) {
                console.log(order?.state)
                return;
            }

            await this.ordersService.deleteOrder(orderId)
            await ctx.editMessageText(`Замовлення #${orderId} видалено.`)
        })
    }

    async open(ctx: BotContext) {
        await super.open(ctx);

        if (ctx.from) {
            const user = await this.userService.getUser(ctx.from.id)
            if (!user) {
                return
            }

            const orders = await this.ordersService.getOrdersByUserId(user?.id)

            for (const order of orders) {
                let orderCount = 0
                let cost = 0;
                let productsList = ""
                for (const product of order.OrderProduct) {
                    orderCount += product.count;
                    cost += product.count * product.product.price
                    productsList += `<b>\nІм'я: ${product.product.name}</b>\nОпис: ${product.product.description}\nКількість: ${product.count}\nВартість: ${product.count * product.product.price}₴`
                }

                const stateString = this.ordersService.getState(order.state)

                if (order.state == 0 || order.state == 1 || order.state == 6) {
                    const jsonDelete = JSON.stringify({
                        menuId: this.id,
                        callbackId: "delete",
                        data: order.id
                    });

                    const keyboard = new InlineKeyboard()
                        .text("Видалити", jsonDelete)

                    await this.commitMessage(ctx,
                        ctx.reply(`<b>Замовлення #${order.id}</b>\nКількість товару: ${orderCount}\nАдреса: ${order.address}\n<b>Закальна вартість: ${cost}₴\nСтан: ${stateString}</b>\n\nСписок товарів: ${productsList}`, {
                            parse_mode: "HTML",
                            reply_markup: keyboard
                        })
                    )
                } else {
                    await this.commitMessage(ctx,
                        ctx.reply(`<b>Замовлення #${order.id}</b>\nКількість товару: ${orderCount}\nАдреса: ${order.address}\n<b>Закальна вартість: ${cost}₴\nСтан: ${stateString}</b>\n\nСписок товарів: ${productsList}`, {
                            parse_mode: "HTML"
                        })
                    )
                }



            }
        }

        await this.commitMessage(ctx,
            ctx.reply("⬆️ Список замовлень ⬆️", {
                reply_markup: this.getKeyboard(ctx)
            })
        )
    }
}

