"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.Category = exports.Product = void 0;
class Product {
    constructor(id, image, desc, cost, category) {
        this.id = id;
        this.image = image;
        this.desc = desc;
        this.cost = cost;
        this.category = category;
    }
}
exports.Product = Product;
class Category {
    constructor(name) {
        this.name = name;
    }
}
exports.Category = Category;
class Config {
}
Config.products = new Array(new Product(0, "https://picsum.photos/id/1/200/300", "Це товар 1", 100, "Категорія1"), new Product(1, "https://picsum.photos/id/2/200/300", "Це товар 2", 100, "Категорія1"), new Product(2, "https://picsum.photos/id/3/200/300", "Це товар 3", 100, "Категорія1"));
Config.categories = new Array(new Category("Категорія1"), new Category("Категорія2"), new Category("Категорія3"));
exports.Config = Config;
