import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { NavigationButton } from "../menubuttons/NavigationButton";
import { BackButton } from "../menubuttons/BackButton";
import { Menu } from "./Menu";
import { AboutMenu } from "./AboutMenu";
import { CategoryMenu } from "./CategoryMenu";
import { FavoritesMenu } from "./FavoritesMenu";
import { CartMenu } from "./CartMenu";
import { InlineKeyboard, Keyboard } from "grammy";
import { OrdersMenu } from "./OrdersMenu";
import dotenv from 'dotenv';


@injectable()
export class InfoMenu extends Menu {
    public id: string = "Головне меню";

    constructor(
        private aboutMenu: AboutMenu,
        private categoryMenu: CategoryMenu,
        private favoritesMenu: FavoritesMenu,
        private cartMenu: CartMenu,
        private orderMenu: OrdersMenu,
        menuStorage: Map<string, Menu>
    ) {
        super(menuStorage);

        this.registerButton(new NavigationButton("🪪", this, aboutMenu));
        this.registerButton(new NavigationButton("🎣", this, categoryMenu));
        this.registerButton(new NavigationButton("⭐", this, favoritesMenu));
        this.registerButton(new NavigationButton("🛒", this, cartMenu));
        this.registerButton(new NavigationButton("📦", this, orderMenu));
    }

    async open(ctx: BotContext): Promise<void> {
        await super.open(ctx);

        await this.commitMessage(ctx,
            ctx.replyWithPhoto(process.env.INFO_IMAGE || "https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg",
                {
                    caption: process.env.INFO_TEXT || "Вітаємо в магазині <b>CarpFisher's Paradise</b>",
                    parse_mode: "HTML",
                    reply_markup: this.getKeyboard(ctx)
                }
            ));

    }
}



