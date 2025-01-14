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
exports.FavoritesService = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
let FavoritesService = class FavoritesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getFavoriteProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.favoriteProduct.findFirst({
                where: {
                    id: id
                },
                include: {
                    product: {
                        include: {
                            productImages: true
                        }
                    },
                    user: true
                }
            });
        });
    }
    getFavorites(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.prisma.favoriteProduct.findMany({
                where: {
                    user: {
                        telegramId: userId
                    }
                },
                include: {
                    product: {
                        include: {
                            productImages: true
                        }
                    },
                    user: true
                }
            });
            return products;
        });
    }
    addFavoriteProduct(userId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favoriteProduct = yield this.prisma.favoriteProduct.findFirst({
                where: {
                    user: {
                        telegramId: userId
                    },
                    productId: productId
                }
            });
            let favoriteListUpdated = undefined;
            if (favoriteProduct == null) {
                favoriteListUpdated = yield this.prisma.favoriteProduct.create({
                    data: {
                        user: {
                            connect: {
                                telegramId: userId
                            }
                        },
                        product: {
                            connect: {
                                id: productId
                            }
                        }
                    },
                    include: {
                        product: true,
                        user: true
                    }
                });
            }
            return favoriteListUpdated || favoriteProduct;
        });
    }
    removeFavoriteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.favoriteProduct.delete({
                where: {
                    id: id
                }
            });
        });
    }
};
FavoritesService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], FavoritesService);
exports.FavoritesService = FavoritesService;
