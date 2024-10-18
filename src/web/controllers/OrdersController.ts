import { PrismaClient } from "@prisma/client";
import { Router, Request, Response } from "express";
import { injectable } from "tsyringe";
import { TeleBot } from "../../../bot";
import { AuthService } from "../services/AuthService";
import { OrderService } from "../services/OrderService";
import { Controller } from "./Controller";

@injectable()
export class OrdersController implements Controller {
    constructor(
        private orderService: OrderService,
        private prisma: PrismaClient,
        private authService: AuthService,
        private bot: TeleBot,
    ) {

    }

    RouteId: string = "/orders"

    createRouting(router: Router): void {
        router.get("/view",
            async (req, res) => await this.onView(req, res));

        router.get("/get",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onGetOrders(req, res));

        router.delete("/delete",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onDeleteOrder(req, res));

        router.post("/state",
            (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onChangeOrderState(req, res));
    }

    async onView(req: Request, res: Response) {
        res.render('orders')
    }

    async onGetOrders(req: Request, res: Response) {
        res.status(200).send(await this.orderService.getOrders());
    }

    async onChangeOrderState(req: Request, res: Response) {
        const { id, stateId, address } = req.body;

        const order = await this.prisma.order.update({
            where: {
                id: Number(id)
            },
            data: {
                state: Number(stateId),
                address: address
            },
            include: {
                OrderProduct: true,
                user: true
            }
        })

        const user = order.user;
        let stateString = this.orderService.getState(order.state)

        await this.bot.getBot().api.sendMessage(user.chatid, `Замовлення №${order.id} ${stateString}.\nАдреса доставки: ${order.address}`)
        res.status(200).send({
            result: "ok"
        })
    }

    async onDeleteOrder(req: Request, res: Response) {
        const { id } = req.body;

        await this.orderService.deleteOrder(id)

        res.status(200).send({
            result: "ok"
        })
    }
}
