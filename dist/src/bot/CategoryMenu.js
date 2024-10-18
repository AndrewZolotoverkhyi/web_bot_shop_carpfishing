"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryProducts = exports.CategoryMenu = void 0;
const menu_1 = require("@grammyjs/menu");
const grammy_1 = require("grammy");
const tsyringe_1 = require("tsyringe");
const Config_1 = require("./Config");
const MenuBase_1 = require("./MenuBase");
let CategoryMenu = class CategoryMenu extends MenuBase_1.MenuBase {
    constructor(bot) {
        super("CategoryMenu", "Категорії товарів");
        this.bot = bot;
        this.get.dynamic((ctx) => {
            const range = new menu_1.MenuRange();
            Config_1.Config.categories.forEach(category => {
                range.text(category.name, ctx => {
                    Config_1.Config.products.forEach((p) => __awaiter(this, void 0, void 0, function* () {
                        if (p.category != category.name)
                            return;
                        yield ctx.replyWithPhoto(p.image, {
                            caption: `${p.desc} \nЦіна: ${p.cost}`,
                        });
                    }));
                });
            });
            return range;
        });
    }
    onOpen(ctx) {
        ctx.reply("Список категорій: ", {
            reply_markup: this.get
        });
    }
};
CategoryMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    (0, tsyringe_1.scoped)(tsyringe_1.Lifecycle.ContainerScoped),
    __metadata("design:paramtypes", [grammy_1.Bot])
], CategoryMenu);
exports.CategoryMenu = CategoryMenu;
class CategoryProducts extends MenuBase_1.MenuBase {
    constructor(category) {
        super("CategoryProducts", "Товари");
        this.category = category;
        this.get.dynamic((ctx) => {
            const range = new menu_1.MenuRange();
            Config_1.Config.products.forEach((p) => __awaiter(this, void 0, void 0, function* () {
                if (p.category != category.name)
                    return;
                yield ctx.replyWithPhoto(p.image, {
                    caption: `${p.desc} \n Ціна: ${p.cost}`,
                });
            }));
            return range;
        });
    }
}
exports.CategoryProducts = CategoryProducts;
