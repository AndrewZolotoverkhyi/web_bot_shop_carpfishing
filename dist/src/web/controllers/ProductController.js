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
exports.ProductController = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
const AuthService_1 = require("../services/AuthService");
const ProductsService_1 = require("../services/ProductsService");
let ProductController = class ProductController {
    constructor(prisma, productsService, authService) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.authService = authService;
        this.RouteId = "/products";
    }
    createRouting(router) {
        router.post("/create", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onCreateProduct(req, res); }));
        router.post("/createcategory", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onCreateCategory(req, res); }));
        router.get("/getcategories", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onGetCategories(req, res); }));
        router.post("/update", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onUpdateProduct(req, res); }));
        router.delete("/delete", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onDeleteProduct(req, res); }));
        router.get("/get", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onGetProduct(req, res); }));
        router.get("/view", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onViewProducts(req, res); }));
    }
    onCreateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.body;
            const category = yield this.prisma.category.create({
                data: {
                    name: name
                }
            });
            res.status(200).send(category);
        });
    }
    onGetCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).send(yield this.productsService.getCategories());
        });
    }
    onCreateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, price, categoryId, description, longDescription, productImages } = req.body;
            const product = yield this.prisma.product.create({
                data: {
                    name: name,
                    price: Number(price),
                    category: {
                        connect: {
                            id: Number(categoryId)
                        }
                    },
                    description: description,
                    longDescription: longDescription
                }
            });
            for (const imageUrl of productImages) {
                yield this.prisma.productImages.create({
                    data: {
                        productId: product.id,
                        imageUrl: imageUrl
                    }
                });
            }
            const resultProduct = yield this.prisma.product.findFirst({
                where: {
                    id: product.id
                },
                include: {
                    productImages: true,
                    category: true
                }
            });
            res.status(200).json(resultProduct);
        });
    }
    onDeleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            yield this.prisma.product.delete({
                where: {
                    id: id
                }
            });
            res.status(200).send({
                result: "ok"
            });
        });
    }
    onUpdateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, name, price, categoryId, description, longDescription, productImages } = req.body;
            console.log(categoryId);
            const product = yield this.prisma.product.update({
                where: {
                    id: id
                },
                data: {
                    name: name,
                    price: Number(price) | 0,
                    category: {
                        connect: {
                            id: Number(categoryId)
                        }
                    },
                    description: description,
                    longDescription: longDescription,
                    productImages: {
                        deleteMany: {}
                    }
                },
                include: {
                    category: true,
                },
            });
            if (productImages != undefined) {
                for (const imageUrl of productImages) {
                    yield this.prisma.productImages.create({
                        data: {
                            productId: product.id,
                            imageUrl: imageUrl
                        }
                    });
                }
            }
            const resultProduct = yield this.prisma.product.findFirst({
                where: {
                    id: product.id
                },
                include: {
                    productImages: true,
                    category: true,
                }
            });
            res.status(200).send(resultProduct);
        });
    }
    onGetProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, count } = req.query;
            const products = yield this.productsService.getProducts(Number(0), Number(10) * Number(5), "asc");
            res.status(200).json(products);
        });
    }
    onViewProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render('products');
        });
    }
};
ProductController = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        ProductsService_1.ProductsService,
        AuthService_1.AuthService])
], ProductController);
exports.ProductController = ProductController;
