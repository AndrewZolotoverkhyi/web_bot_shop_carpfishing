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
exports.ProductsService = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getProducts(from, count, sorting) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.prisma.product.findMany({
                take: count || undefined,
                skip: from || undefined,
                orderBy: {
                    id: "asc",
                },
                include: {
                    productImages: true,
                    category: true
                }
            });
            return products;
        });
    }
    getProductsByCategory(from, count, category, sorting) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.prisma.product.findMany({
                where: {
                    categoryId: category.id
                },
                take: count || undefined,
                skip: from || undefined,
                orderBy: {
                    id: "asc",
                },
                include: {
                    productImages: true,
                    category: true
                }
            });
            return products;
        });
    }
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this.prisma.category.findMany();
            return category;
        });
    }
    getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this.prisma.category.findFirst({
                where: {
                    id: id
                }
            });
            return category;
        });
    }
    getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.product.findFirst({
                where: {
                    id: id
                }
            });
        });
    }
};
ProductsService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], ProductsService);
exports.ProductsService = ProductsService;
