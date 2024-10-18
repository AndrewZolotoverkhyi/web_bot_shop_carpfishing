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
exports.InfoMenu = void 0;
const tsyringe_1 = require("tsyringe");
const NavigationButton_1 = require("../menubuttons/NavigationButton");
const Menu_1 = require("./Menu");
const AboutMenu_1 = require("./AboutMenu");
const CategoryMenu_1 = require("./CategoryMenu");
const FavoritesMenu_1 = require("./FavoritesMenu");
const CartMenu_1 = require("./CartMenu");
const OrdersMenu_1 = require("./OrdersMenu");
let InfoMenu = class InfoMenu extends Menu_1.Menu {
    constructor(aboutMenu, categoryMenu, favoritesMenu, cartMenu, orderMenu, menuStorage) {
        super(menuStorage);
        this.aboutMenu = aboutMenu;
        this.categoryMenu = categoryMenu;
        this.favoritesMenu = favoritesMenu;
        this.cartMenu = cartMenu;
        this.orderMenu = orderMenu;
        this.id = "Головне меню";
        this.registerButton(new NavigationButton_1.NavigationButton("🪪", this, aboutMenu));
        this.registerButton(new NavigationButton_1.NavigationButton("🎣", this, categoryMenu));
        this.registerButton(new NavigationButton_1.NavigationButton("⭐", this, favoritesMenu));
        this.registerButton(new NavigationButton_1.NavigationButton("🛒", this, cartMenu));
        this.registerButton(new NavigationButton_1.NavigationButton("📦", this, orderMenu));
    }
    open(ctx) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.open.call(this, ctx);
            yield this.commitMessage(ctx, ctx.replyWithPhoto(process.env.INFO_IMAGE || "https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg", {
                caption: process.env.INFO_TEXT || "Вітаємо в магазині <b>CarpFisher's Paradise</b>",
                parse_mode: "HTML",
                reply_markup: this.getKeyboard(ctx)
            }));
        });
    }
};
InfoMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [AboutMenu_1.AboutMenu,
        CategoryMenu_1.CategoryMenu,
        FavoritesMenu_1.FavoritesMenu,
        CartMenu_1.CartMenu,
        OrdersMenu_1.OrdersMenu,
        Map])
], InfoMenu);
exports.InfoMenu = InfoMenu;
