import { CartProduct, Category, Order, PrismaClient, Product } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class OrderService {

    public constructor(
        private prisma: PrismaClient,
    ) { }

    public getState(stateId: number) {
        let stateString = "нове замовлення"
        switch (stateId) {
            case 2:
                stateString = "в обробці"
                break;
            case 3:
                stateString = "комплектується"
                break;
            case 4:
                stateString = "доставляється в місто отримувача"
                break;
            case 5:
                stateString = "перебуває в місті отримувача"
                break;
            case 6:
                stateString = "виконано"
                break;
            default:
                stateString = "нове замовлення"
                break;
        }
        return stateString;
    }

    public async getOrders() {
        return await this.prisma.order.findMany({
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
    }

    public async deleteOrder(id: number) {
        await this.prisma.orderProduct.deleteMany({
            where: {
                orderId: id
            }
        });

        await this.prisma.order.delete({
            where: {
                id: id
            },
            include: {
                OrderProduct: true
            }
        });
    }

    public async createOrder(userId: number, login: string, number: string, products: (CartProduct & { product: Product })[]) {
        const order = await this.prisma.order.create({
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
        })

        for (const cartProduct of products) {
            await this.prisma.orderProduct.create({
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
            })
        }
        return order;
    }

    public async getOrdersByUserId(userId: number) {
        return await this.prisma.order.findMany({
            where: {
                userId: userId
            },
            include: {
                OrderProduct: {
                    include: {
                        product: true,
                    }
                }
            }
        })
    }

    public async getOrder(id: number) {
        return await this.prisma.order.findFirst({
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
        })
    }

    public async updateOrderAddress(id: number, address: string) {
        return await this.prisma.order.update({
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
        })
    }
}