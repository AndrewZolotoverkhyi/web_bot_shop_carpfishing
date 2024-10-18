"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuInfoService = void 0;
class MenuInfoService {
    constructor() {
        this.map = new Map([
            ["HelloMenu", "Вітаємо у нашому магазині рибальских товарів"],
            ["MainMenu", "Оберіть бажаний розділ"],
            ["CategoryMenu", "Оберіть категорію товарів"]
        ]);
    }
    ;
    GetMenuInfo(menuName) {
        return this.map.get(menuName) || "undef";
    }
}
exports.MenuInfoService = MenuInfoService;
