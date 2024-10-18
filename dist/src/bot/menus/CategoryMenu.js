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
exports.CategoryMenu = void 0;
const tsyringe_1 = require("tsyringe");
const ProductsService_1 = require("../../web/services/ProductsService");
const BackButton_1 = require("../menubuttons/BackButton");
const Menu_1 = require("./Menu");
const ProductsMenu_1 = require("./ProductsMenu");
let CategoryMenu = class CategoryMenu extends Menu_1.Menu {
    constructor(productsService, productsMenu, menuStorage) {
        super(menuStorage);
        this.productsService = productsService;
        this.productsMenu = productsMenu;
        this.id = "CategoryMenu";
        this.registerButton(new BackButton_1.BackButton("↩️", this, this.menuStorage));
    }
    open(ctx) {
        const _super = Object.create(null, {
            open: { get: () => super.open }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.productsService.getCategories();
            for (const category of categories) {
                const button = {
                    text: category.name,
                    onClick: (ctx) => __awaiter(this, void 0, void 0, function* () {
                        yield this.handleButtonClick(ctx, category);
                    })
                };
                this.registerButton(button);
            }
            yield _super.open.call(this, ctx);
            ctx.session.menuState.currentPage = 0;
            yield this.commitMessage(ctx, ctx.reply("Оберіть категорію", {
                reply_markup: this.getKeyboardAsRow(ctx)
            }));
        });
    }
    handleMessage(ctx, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.productsService.getCategories();
            const buttons = new Map();
            for (const category of categories) {
                buttons.set(category.name, {
                    text: category.name,
                    onClick: (ctx) => __awaiter(this, void 0, void 0, function* () {
                        yield this.handleButtonClick(ctx, category);
                    })
                });
            }
            const button = buttons.get(message);
            if (button) {
                button.onClick(ctx);
            }
        });
    }
    handleButtonClick(ctx, category) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.session.menuState.currentCategory = category.id;
            yield this.close(ctx, true);
            yield this.productsMenu.open(ctx);
        });
    }
};
CategoryMenu = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [ProductsService_1.ProductsService,
        ProductsMenu_1.ProductsMenu,
        Map])
], CategoryMenu);
exports.CategoryMenu = CategoryMenu;
