import { InlineKeyboard } from "grammy";
import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { NavigationButton } from "../menubuttons/NavigationButton";
import { BackButton } from "../menubuttons/BackButton";
import { Menu, MenuStorage } from "./Menu";


@injectable()
export class AboutMenu extends Menu {
    public id: string = "Про нас";

    constructor(
        menuStorage: Map<string, Menu>
    ) {
        super(menuStorage);
        this.registerButton(new BackButton("↩️", this, menuStorage));
    }

    async open(ctx: BotContext) {
        await super.open(ctx);

        await this.commitMessage(ctx,
            ctx.replyWithPhoto(process.env.ABOUT_IMAGE || "https://thumbs.dreamstime.com/b/carp-fish-fishing-hook-fishing-logo-template-club-emblem-fishing-theme-vector-illustration-carp-fish-fishing-hook-fishing-215307928.jpg",
                {
                    caption: process.env.ABOUT_TEXT || "<b>CarpFisher's Paradise</b> - це магазин товарів для риболовів на карпів",
                    parse_mode: "HTML",
                    reply_markup: this.getKeyboard(ctx)
                }
            ));
    }
}

