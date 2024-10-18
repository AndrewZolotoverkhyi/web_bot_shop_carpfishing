import { Prisma, PrismaClient, Product } from "@prisma/client";
import { Request, Response, Router } from "express";
import { injectable } from "tsyringe";
import { AuthService } from "../services/AuthService";
import { ProductsService } from "../services/ProductsService";
import { Controller } from "./Controller";

@injectable()
export class ProductController implements Controller {

    constructor(
        private prisma: PrismaClient,
        private productsService: ProductsService,
        private authService: AuthService
    ) {
    }

    public RouteId: string = "/products"

    createRouting(router: Router): void {
        router.post("/create",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onCreateProduct(req, res));

        router.post("/createcategory",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onCreateCategory(req, res));

        router.get("/getcategories",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onGetCategories(req, res));

        router.post("/update",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onUpdateProduct(req, res));

        router.delete("/delete",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onDeleteProduct(req, res));

        router.get("/get",
            async (req, res) => await this.onGetProduct(req, res));

        router.get("/view",
            async (req, res) => await this.onViewProducts(req, res));
    }

    async onCreateCategory(req: Request, res: Response) {
        const { name } = req.body;

        const category = await this.prisma.category.create({
            data: {
                name: name
            }
        });

        res.status(200).send(category);
    }

    async onGetCategories(req: Request, res: Response) {
        res.status(200).send(await this.productsService.getCategories());
    }

    async onCreateProduct(req: Request, res: Response) {
        const { name, price, categoryId, description, longDescription, productImages } = req.body;

        const product = await this.prisma.product.create({
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
        })

        for (const imageUrl of productImages) {
            await this.prisma.productImages.create({
                data: {
                    productId: product.id,
                    imageUrl: imageUrl
                }
            })

        }

        const resultProduct = await this.prisma.product.findFirst({
            where: {
                id: product.id
            },
            include: {
                productImages: true,
                category: true
            }
        });

        res.status(200).json(resultProduct)
    }

    async onDeleteProduct(req: Request, res: Response) {
        const { id } = req.body;

        await this.prisma.product.delete({
            where: {
                id: id
            }
        });

        res.status(200).send({
            result: "ok"
        })
    }

    async onUpdateProduct(req: Request, res: Response) {
        const { id, name, price, categoryId, description, longDescription, productImages } = req.body;

        console.log(categoryId)

        const product = await this.prisma.product.update({
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
        })

        if (productImages != undefined) {
            for (const imageUrl of productImages) {
                await this.prisma.productImages.create({
                    data: {
                        productId: product.id,
                        imageUrl: imageUrl
                    }
                })
            }
        }

        const resultProduct = await this.prisma.product.findFirst({
            where: {
                id: product.id
            },
            include: {
                productImages: true,
                category: true,
            }
        });

        res.status(200).send(resultProduct);
    }

    async onGetProduct(req: Request, res: Response) {
        const { page, count } = req.query;

        const products = await this.productsService.getProducts(
            Number(0),
            Number(10) * Number(5),
            "asc");

        res.status(200).json(products)
    }

    async onViewProducts(req: Request, res: Response) {
        res.render('products')
    }
}