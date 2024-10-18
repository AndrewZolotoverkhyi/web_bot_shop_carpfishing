import { PrismaClient, Product } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class FavoritesService {

    public constructor(
        private prisma: PrismaClient,
    ) { }

    public async getFavoriteProductById(id: number) {
        return await this.prisma.favoriteProduct.findFirst({
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
        })
    }

    public async getFavorites(userId: number) {
        const products = await this.prisma.favoriteProduct.findMany({
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
        })

        return products;
    }

    public async addFavoriteProduct(userId: number, productId: number) {
        const favoriteProduct = await this.prisma.favoriteProduct.findFirst({
            where: {
                user: {
                    telegramId: userId
                },
                productId: productId
            }
        })

        let favoriteListUpdated = undefined;
        if (favoriteProduct == null) {
            favoriteListUpdated = await this.prisma.favoriteProduct.create({
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
            })
        }

        return favoriteListUpdated || favoriteProduct;
    }

    public async removeFavoriteProduct(id: number) {
        await this.prisma.favoriteProduct.delete({
            where: {
                id: id
            }
        })
    }
}