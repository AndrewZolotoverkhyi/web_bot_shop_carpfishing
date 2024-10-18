import { BotContext } from "../../../bot";
import { Menu } from "../menus/Menu";
import { MenuButton } from "./MenuButton";


export class NavigationButton implements MenuButton {
    constructor(
        public text: string,
        public currentMenu: Menu,
        public menuToNavigate: Menu) {
    }

    public async onClick(ctx: BotContext) {
        await this.currentMenu.close(ctx, true);
        await this.menuToNavigate.open(ctx);
    }
}
