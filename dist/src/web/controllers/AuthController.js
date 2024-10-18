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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthService_1 = require("../services/AuthService");
let AuthController = class AuthController {
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
        this.RouteId = "/auth";
    }
    createRouting(router) {
        router.post("/register", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onRegister(req, res); }));
        router.post("/login", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onLogin(req, res); }));
        router.get("/get", (req, res, next) => this.authService.auth(req, res, next), (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onWelcome(req, res); }));
        router.get("/register", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.onLoginPage(req, res); }));
    }
    onLoginPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render('login');
        });
    }
    onRegister(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Admin = this.prisma.admin;
                const { name, password } = req.body;
                if (!(name && password)) {
                    res.status(400).send("All input is required");
                }
                const oldAdmin = yield Admin.findFirst({
                    where: {
                        name: name
                    }
                });
                if (oldAdmin) {
                    return res.status(409).send("User Already Exist. Please Login");
                }
                const encryptedPassword = yield bcrypt_1.default.hash(password, 10);
                const admin = yield Admin.create({
                    data: {
                        name: name,
                        password: encryptedPassword,
                        token: ""
                    }
                });
                const token = jsonwebtoken_1.default.sign({ user_id: admin.id, name }, process.env.TOKEN_KEY || "NOTOKEN", {
                    expiresIn: "2h",
                });
                const nadmin = yield Admin.update({
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
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    onLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Admin = this.prisma.admin;
                //console.log(req.body);
                const { name, password } = req.body;
                if (!(name && password)) {
                    res.status(400).send("All input is required");
                }
                const admin = yield Admin.findFirst({
                    where: {
                        name: name
                    }
                });
                if (admin && (yield bcrypt_1.default.compare(password, admin.password))) {
                    const token = jsonwebtoken_1.default.sign({ user_id: admin.id, name }, process.env.TOKEN_KEY || "NOTOKEN", {
                        expiresIn: "2h",
                    });
                    const nadmin = yield Admin.update({
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
            }
            catch (err) {
                console.log(err);
            }
            // Our register logic ends here
        });
    }
    onWelcome(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("test");
            const admin = this.authService.getJwtPayload(req);
        });
    }
};
AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [AuthService_1.AuthService,
        client_1.PrismaClient])
], AuthController);
exports.AuthController = AuthController;
