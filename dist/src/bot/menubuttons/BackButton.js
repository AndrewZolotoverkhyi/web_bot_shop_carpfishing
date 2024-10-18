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
exports.BackButton = void 0;
class BackButton {
    constructor(text, currentMenu, menuStorage) {
        this.text = text;
        this.currentMenu = currentMenu;
        this.menuStorage = menuStorage;
    }
    onClick(ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.session.menuHistory.length >= 1) {
                const value = ctx.session.menuHistory.pop() || "";
                yield this.currentMenu.close(ctx, false);
                yield ((_a = this.menuStorage.get(value)) === null || _a === void 0 ? void 0 : _a.open(ctx));
            }
        });
    }
}
exports.BackButton = BackButton;
