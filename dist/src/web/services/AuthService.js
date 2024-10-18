"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config = process.env;
class AuthService {
    auth(req, res, next) {
        console.log("[AUTH] REQUEST BODY" + req.body);
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config.TOKEN_KEY || "NO_TOKEN");
            req.payload = decoded;
        }
        catch (err) {
            return res.status(401).send("Invalid Token");
        }
        return next();
    }
    getJWT(admin) {
        const token = jsonwebtoken_1.default.sign({ user_id: admin.id, name }, process.env.TOKEN_KEY || "NO_TOKEN", {
            expiresIn: "2h",
        });
        return token;
    }
    getJwtPayload(req) {
        return req.payload;
    }
}
exports.AuthService = AuthService;
