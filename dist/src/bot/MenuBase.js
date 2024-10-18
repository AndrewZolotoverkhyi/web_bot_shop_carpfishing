"use strict";
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
exports.MenuBase = void 0;
const menu_1 = require("@grammyjs/menu");
class MenuBase {
    constructor(menuName, menuCaption) {
        this.menuName = menuName;
        this.menuCaption = menuCaption;
        this.get = new menu_1.Menu(this.menuName);
        this.subMenus = new Array();
    }
    addSubMenu(subMenu) {
        this.get.text(subMenu.menuCaption, (ctx) => __awaiter(this, void 0, void 0, function* () {
            this.onClose(ctx);
            subMenu.open(ctx);
            yield ctx.deleteMessage();
        })).row();
        subMenu.parent = this;
        subMenu.addBackButton();
        this.subMenus.push(subMenu);
    }
    finish() {
        this.subMenus.forEach(subMenu => {
            this.get.register(subMenu.get);
        });
    }
    addBackButton() {
        this.get.text("Назад", (ctx) => __awaiter(this, void 0, void 0, function* () {
            this.onClose(ctx);
            this.parent.onOpen(ctx);
            yield ctx.deleteMessage();
        }));
    }
    open(ctx) {
        this.onOpen(ctx);
    }
    onOpen(ctx) { }
    onClose(ctx) { }
}
exports.MenuBase = MenuBase;
