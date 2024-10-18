import { BotContext } from "../../../bot";
import { Menu, MenuStorage } from "../menus/Menu";
import { MenuButton } from "./MenuButton";


export class BackButton implements MenuButton {
    constructor(
        public text: string,
        public currentMenu: Menu,
        public menuStorage: MenuStorage) {
    }

    public async onClick(ctx: BotContext) {
        if (ctx.session.menuHistory.length >= 1) {
            const value = ctx.session.menuHistory.pop() || "";
            await this.currentMenu.close(ctx, false);
            await this.menuStorage.get(value)?.open(ctx);
        }
    }
}
