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
const MenuBase_1 = require("./MenuBase");
const CardMenu_1 = require("./CardMenu");
const FavoritesMenu_1 = require("./FavoritesMenu");
const CategoryMenu_1 = require("./CategoryMenu");
const AboutMenu_1 = require("./AboutMenu");
let InfoMenu = class InfoMenu extends MenuBase_1.MenuBase {
    constructor(aboutMenu, categoryMenu, favoritesMenu, cardMenu) {
        super("InfoMenu", "Головне меню");
        this.aboutMenu = aboutMenu;
        this.categoryMenu = categoryMenu;
        this.favoritesMenu = favoritesMenu;
        this.cardMenu = cardMenu;
        this.addSubMenu(aboutMenu);
        this.addSubMenu(categoryMenu);
        this.addSubMenu(favoritesMenu);
        this.addSubMenu(cardMenu);
        this.finish();
    }
    onOpen(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.replyWithPhoto("https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg", {
                caption: this.menuCaption,
                parse_mode: "HTML",
                reply_markup: this.get
            });
        });
    }
};
InfoMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    (0, tsyringe_1.scoped)(tsyringe_1.Lifecycle.ContainerScoped),
    __metadata("design:paramtypes", [AboutMenu_1.AboutMenu,
        CategoryMenu_1.CategoryMenu,
        FavoritesMenu_1.FavoritesMenu,
        CardMenu_1.CardMenu])
], InfoMenu);
exports.InfoMenu = InfoMenu;
