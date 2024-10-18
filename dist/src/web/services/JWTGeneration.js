"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTService {
    getJWT(admin) {
        const token = jsonwebtoken_1.default.sign({ user_id: admin.id, name }, process.env.TOKEN_KEY || "NOTOKEN", {
            expiresIn: "2h",
        });
        return token;
    }
}
exports.JWTService = JWTService;
