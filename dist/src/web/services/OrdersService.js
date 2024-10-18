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
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
let OrderService = class OrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.order.findMany({
                where: {
                    state: {
                        not: 0
                    }
                },
                include: {
                    OrderProduct: {
                        include: {
                            product: true,
                        }
                    }
                }
            });
        });
    }
    createOrder(userId, login, number, products) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.prisma.order.create({
                data: {
                    telegramLogin: login,
                    number: number,
                    state: 0,
                    address: "Не надано",
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                },
                include: {
                    OrderProduct: {
                        include: {
                            product: true,
                        }
                    }
                }
            });
            for (const cartProduct of products) {
                yield this.prisma.orderProduct.create({
                    data: {
                        order: {
                            connect: {
                                id: order.id
                            }
                        },
                        product: {
                            connect: {
                                id: cartProduct.product.id
                            }
                        },
                        count: cartProduct.count
                    }
                });
            }
            return order;
        });
    }
    getOrder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.order.findFirst({
                where: {
                    id: id
                },
                include: {
                    OrderProduct: {
                        include: {
                            product: true,
                        }
                    }
                }
            });
        });
    }
    updateOrderAddress(id, address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.order.update({
                where: {
                    id: id
                },
                data: {
                    state: 1,
                    address: address
                },
                include: {
                    OrderProduct: {
                        include: {
                            product: true,
                        }
                    }
                }
            });
        });
    }
};
OrderService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], OrderService);
exports.OrderService = OrderService;
