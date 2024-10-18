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
exports.CartService = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getCartProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.prisma.cartProduct.findFirst({
                where: {
                    id: id
                },
                include: {
                    product: {
                        include: {
                            productImages: true,
                            category: true
                        }
                    },
                    user: true
                }
            });
            return product;
        });
    }
    incrementCartProductCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.cartProduct.update({
                where: {
                    id: id
                },
                data: {
                    count: { increment: 1 }
                },
                include: {
                    product: {
                        include: {
                            productImages: true,
                            category: true
                        }
                    },
                    user: true
                }
            });
        });
    }
    decrementCartProductCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.cartProduct.update({
                where: {
                    id: id
                },
                data: {
                    count: { decrement: 1 }
                },
                include: {
                    product: {
                        include: {
                            productImages: true,
                            category: true
                        }
                    },
                    user: true
                }
            });
        });
    }
    getCartProduct(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.prisma.cartProduct.findMany({
                where: {
                    user: {
                        telegramId: userId
                    }
                },
                include: {
                    product: {
                        include: {
                            productImages: true,
                            category: true
                        }
                    },
                    user: true
                }
            });
            return products;
        });
    }
    addCartProduct(userId, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cartProduct = yield this.prisma.cartProduct.findFirst({
                where: {
                    user: {
                        telegramId: userId
                    },
                    productId: productId
                }
            });
            let cartProductUpdated = undefined;
            if (cartProduct == null) {
                cartProductUpdated = yield this.prisma.cartProduct.create({
                    data: {
                        user: {
                            connect: {
                                telegramId: userId
                            }
                        },
                        count: 1,
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
            return cartProductUpdated || cartProduct;
        });
    }
    removeCartProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.cartProduct.delete({
                where: {
                    id: id
                }
            });
        });
    }
};
CartService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], CartService);
exports.CartService = CartService;
