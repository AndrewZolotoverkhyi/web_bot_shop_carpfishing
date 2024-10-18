import { PrismaClient } from '@prisma/client';
import { Express, Request, Response, Router } from 'express';
import { autoInjectable, injectable, Lifecycle, scoped } from 'tsyringe';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AuthRequest, AuthService } from '../services/AuthService';
import { Controller } from './Controller';
import ejs from 'ejs'

@injectable()
export class AuthController implements Controller {
    constructor(
        private authService: AuthService,
        private prisma: PrismaClient
    ) {

    }

    public RouteId: string = "/auth"

    createRouting(router: Router) {
        router.post("/register",
            async (req, res) => await this.onRegister(req, res));

        router.post("/login",
            async (req, res) => await this.onLogin(req, res));

        router.get("/get", (req, res, next) => this.authService.auth(req, res, next),
            async (req, res) => await this.onWelcome(req, res));

        router.get("/register",
            async (req, res) => await this.onLoginPage(req, res));
    }

    async onLoginPage(req: Request, res: Response) {

        res.render('login')
    }

    async onRegister(req: Request, res: Response) {
        try {
            const Admin = this.prisma.admin;

            const { name, password } = req.body;

            if (!(name && password)) {
                res.status(400).send("All input is required");
            }

            const oldAdmin = await Admin.findFirst({
                where: {
                    name: name
                }
            });

            if (oldAdmin) {
                return res.status(409).send("User Already Exist. Please Login");
            }

            const encryptedPassword = await bcrypt.hash(password, 10);

            const admin = await Admin.create({
                data: {
                    name: name,
                    password: encryptedPassword,
                    token: ""
                }
            });

            const token = jwt.sign(
                { user_id: admin.id, name },
                process.env.TOKEN_KEY || "NOTOKEN",
                {
                    expiresIn: "2h",
                }
            );

            const nadmin = await Admin.update({
                where: {
                    id: admin.id
                },
                data: admin && {
                    token: token
                }
            });

            res.status(201).json({
                v1: admin,
                v2: nadmin
            });
        } catch (err) {
            console.log(err);
        }
    }

    async onLogin(req: Request, res: Response) {
        try {
            const Admin = this.prisma!.admin;
            //console.log(req.body);
            const { name, password } = req.body;

            if (!(name && password)) {
                res.status(400).send("All input is required");
            }

            const admin = await Admin.findFirst({
                where: {
                    name: name
                }
            });

            if (admin && (await bcrypt.compare(password, admin.password))) {
                const token = jwt.sign(
                    { user_id: admin.id, name },
                    process.env.TOKEN_KEY || "NOTOKEN",
                    {
                        expiresIn: "2h",
                    }
                );

                const nadmin = await Admin.update({
                    where: {
                        id: admin.id
                    },
                    data: admin && {
                        token: token
                    }
                });

                res.status(200).json({
                    name: admin.name,
                    token: token
                });
                return;
            }
            res.status(400).send("Invalid Credentials");
        } catch (err) {
            console.log(err);
        }
        // Our register logic ends here
    }

    async onWelcome(req: Request, res: Response) {
        console.log("test")
        const admin = this.authService.getJwtPayload(req);

    }
}