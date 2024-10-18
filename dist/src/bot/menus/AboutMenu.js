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
exports.AboutMenu = void 0;
const tsyringe_1 = require("tsyringe");
const BackButton_1 = require("../menubuttons/BackButton");
const Menu_1 = require("./Menu");
let AboutMenu = class AboutMenu extends Menu_1.Menu {
    constructor(menuStorage) {
        super(menuStorage);
        this.id = "Про нас";
        this.registerButton(new BackButton_1.BackButton("↩️", this, menuStorage));
    }
    open(ctx) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.open.call(this, ctx);
            yield this.commitMessage(ctx, ctx.replyWithPhoto(process.env.ABOUT_IMAGE || "https://thumbs.dreamstime.com/b/carp-fish-fishing-hook-fishing-logo-template-club-emblem-fishing-theme-vector-illustration-carp-fish-fishing-hook-fishing-215307928.jpg", {
                caption: process.env.ABOUT_TEXT || "<b>CarpFisher's Paradise</b> - це магазин товарів для риболовів на карпів",
                parse_mode: "HTML",
                reply_markup: this.getKeyboard(ctx)
            }));
        });
    }
};
AboutMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [Map])
], AboutMenu);
exports.AboutMenu = AboutMenu;
