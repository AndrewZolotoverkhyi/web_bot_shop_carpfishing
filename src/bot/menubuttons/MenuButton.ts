import { Context } from "grammy";
import { BotContext } from "../../../bot";
import { container } from "tsyringe";

export interface MenuButton {
    text: string;
    onClick(ctx: BotContext): Promise<any>;
}


