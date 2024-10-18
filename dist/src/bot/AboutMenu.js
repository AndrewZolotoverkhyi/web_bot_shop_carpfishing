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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutMenu = void 0;
const tsyringe_1 = require("tsyringe");
const MenuBase_1 = require("./MenuBase");
let AboutMenu = class AboutMenu extends MenuBase_1.MenuBase {
    constructor() {
        super("AboutMenu", "Про нас");
        this.finish();
    }
    onOpen(ctx) {
        ctx.replyWithPhoto("https://www.imgonline.com.ua/examples/bee-on-daisy.jpg", {
            caption: "Ми - магазин!",
            parse_mode: "HTML",
            reply_markup: this.get,
        });
    }
};
AboutMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    (0, tsyringe_1.scoped)(tsyringe_1.Lifecycle.ContainerScoped),
    __metadata("design:paramtypes", [])
], AboutMenu);
exports.AboutMenu = AboutMenu;