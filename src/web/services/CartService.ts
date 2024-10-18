import { PrismaClient, Product } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class CartService {

    public constructor(
        private prisma: PrismaClient,
    ) { }

    public async getCartProductById(id: number) {
        const product = await this.prisma.cartProduct.findFirst({
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
        })
        return product;
    }

    public async incrementCartProductCount(id: number) {
        return await this.prisma.cartProduct.update({
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
        })
    }


    public async decrementCartProductCount(id: number) {
        return await this.prisma.cartProduct.update({
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
        })
    }

    public async getCartProduct(userId: number) {
        const products = await this.prisma.cartProduct.findMany({
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
        })

        return products;
    }

    public async addCartProduct(userId: number, productId: number) {
        const cartProduct = await this.prisma.cartProduct.findFirst({
            where: {
                user: {
                    telegramId: userId
                },
                productId: productId
            }
        })

        let cartProductUpdated = undefined;
        if (cartProduct == null) {
            cartProductUpdated = await this.prisma.cartProduct.create({
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
            })
        }

        return cartProductUpdated || cartProduct;
    }

    public async removeCartProduct(id: number) {
        await this.prisma.cartProduct.delete({
            where: {
                id: id
            }
        })
    }
}