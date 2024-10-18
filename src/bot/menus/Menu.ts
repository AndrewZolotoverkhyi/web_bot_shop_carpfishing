import { Router } from "@grammyjs/router";
import { InlineKeyboard, Keyboard } from "grammy";
import { Message } from "grammy/types";
import { BotContext } from "../../../bot";
import { MenuButton } from "../menubuttons/MenuButton"
import { BackButton } from "../menubuttons/BackButton";

type MenuButtons = Map<string, MenuButton>;
type MenuInlnlineCallbacks = Map<string, (ctx: BotContext, data: string) => Promise<any>>;

export type MenuStorage = Map<string, Menu>;

interface InlineButtonCallback {
    menuId: string,
    callbackId: string,
    data: string,
}

export abstract class Menu {
    public abstract id: string;
    private buttons: MenuButtons = new Map();
    private inlineCallbacks: MenuInlnlineCallbacks = new Map();

    constructor(
        protected menuStorage: Map<string, Menu>
    ) { }

    async open(ctx: BotContext) {
        ctx.session.menuState = {
            orderId: -1,
            stateId: 0,
            currentPage: ctx.session.menuState.currentPage,
            currentCategory: ctx.session.menuState.currentCategory,
            currentMenu: this.id,
            sentMessages: new Array()
        };
    }

    async close(ctx: BotContext, saveHistory: boolean): Promise<void> {
        if (saveHistory) {
            ctx.session.menuHistory.push(this.id);
        }

        while (ctx.session.menuState.sentMessages.length > 0) {
            const id = ctx.session.menuState.sentMessages.pop();
            if (id) {
                await ctx.api.deleteMessage(ctx.chat?.id || -1, id);
            }
        }
    }

    public getKeyboard(ctx: BotContext): Keyboard {
        const keyboard = new Keyboard();
        this.buttons.forEach((btn, name) => {
            keyboard.text(name);
        });

        keyboard.resized();
        keyboard.persistent();

        return keyboard;
    }

    public getKeyboardAsRow(ctx: BotContext): Keyboard {
        const keyboard = new Keyboard();
        this.buttons.forEach((btn, name) => {
            keyboard.text(name).row();
        });

        keyboard.persistent();

        return keyboard;
    }

    public async onInlineButtonCallback(ctx: BotContext, data: InlineButtonCallback): Promise<void> {
        if (this.id != data.menuId) {
            console.error(`InlineButtonCallback recieved by wrong menu ${this.id} instead of ${data.menuId}`);
            return;
        }

        const callback = this.inlineCallbacks.get(data.callbackId);
        if (callback) {
            return callback(ctx, data.data);
        }
    }

    public async commitMessage(ctx: BotContext, reply: Promise<Message>) {
        const id = (await reply).message_id;
        ctx.session.menuState.sentMessages.push(id)
        return id;
    }

    public async commitGroupMessage(ctx: BotContext, reply: Promise<Message[]>) {
        const messages = (await reply);

        messages.forEach(m => {
            ctx.session.menuState.sentMessages.push(m.message_id)
        })

        return messages;
    }

    public createNavigation(router: Router<BotContext>) {
        router.route(this.id, async (ctx) => {
            await this.onClick(ctx, ctx.message?.text || "");
            await ctx.deleteMessage();
        });
    }

    protected registerButton(menuButton: MenuButton) {
        this.buttons.set(menuButton.text, menuButton);
    }

    protected registerInlineButtonCallback(id: string, callback: (ctx: BotContext, data: string) => Promise<any>) {
        this.inlineCallbacks.set(id, callback);
    }

    protected async handleMessage(ctx: BotContext, message: string) { }

    private async onClick(ctx: BotContext, message: string) {
        const button = this.buttons.get(message);
        if (button != undefined) {
            await button.onClick(ctx);
        } else {
            await this.handleMessage(ctx, message)
        }
    }
}


