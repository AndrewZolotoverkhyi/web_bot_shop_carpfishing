import { Category } from "@prisma/client";
import { injectable } from "tsyringe";
import { BotContext } from "../../../bot";
import { ProductsService } from "../../web/services/ProductsService";
import { BackButton } from "../menubuttons/BackButton";
import { MenuButton } from "../menubuttons/MenuButton";
import { Menu } from "./Menu";
import { ProductsMenu } from "./ProductsMenu";

@injectable()
export class CategoryMenu extends Menu {
    public id: string = "CategoryMenu";

    constructor(
        private productsService: ProductsService,
        private productsMenu: ProductsMenu,
        menuStorage: Map<string, Menu>
    ) {
        super(menuStorage);
        this.registerButton(new BackButton("↩️", this, this.menuStorage))
    }

    async open(ctx: BotContext): Promise<void> {
        const categories = await this.productsService.getCategories()

        for (const category of categories) {
            const button = {
                text: category.name,
                onClick: async (ctx: BotContext) => {
                    await this.handleButtonClick(ctx, category)
                }
            }
            this.registerButton(button)
        }

        await super.open(ctx);
        ctx.session.menuState.currentPage = 0

        await this.commitMessage(ctx,
            ctx.reply("Оберіть категорію", {
                reply_markup: this.getKeyboardAsRow(ctx)
            })
        )
    }

    protected async handleMessage(ctx: BotContext, message: string) {
        const categories = await this.productsService.getCategories()

        const buttons = new Map<string, MenuButton>();

        for (const category of categories) {
            buttons.set(category.name, {
                text: category.name,
                onClick: async (ctx: BotContext) => {
                    await this.handleButtonClick(ctx, category)
                }
            })
        }

        const button = buttons.get(message)
        if (button) {
            button.onClick(ctx)
        }
    }

    private async handleButtonClick(ctx: BotContext, category: Category) {
        ctx.session.menuState.currentCategory = category.id
        await this.close(ctx, true)
        await this.productsMenu.open(ctx)
    }
}