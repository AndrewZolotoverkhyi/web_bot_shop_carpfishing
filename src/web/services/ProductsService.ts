import { Category, PrismaClient, Product } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class ProductsService {

    public constructor(
        private prisma: PrismaClient,
    ) { }

    public async getProducts(from: number, count: number, sorting: "asc" | "desc") {
        const products = await this.prisma.product.findMany({
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
    }

    public async getProductsByCategory(from: number, count: number, category: Category, sorting: "asc" | "desc") {
        const products = await this.prisma.product.findMany({
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
    }

    public async getCategories() {
        const category = await this.prisma.category.findMany();

        return category;
    }

    public async getCategoryById(id: number) {
        const category = await this.prisma.category.findFirst({
            where: {
                id: id
            }
        });

        return category;
    }

    public async getProductById(id: number) {
        return await this.prisma.product.findFirst({
            where: {
                id: id
            }
        });
    }
}