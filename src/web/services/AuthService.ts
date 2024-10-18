import { Admin } from '@prisma/client';
import express, { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv';
import { json } from 'stream/consumers';

const config = process.env;

export interface AuthRequest extends Request {
    payload: string | JwtPayload;
}

export class AuthService {
    public auth(req: Request, res: Response, next: NextFunction) {
        console.log("[AUTH] REQUEST BODY" + req.body)
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            const decoded = jwt.verify(token, config.TOKEN_KEY || "NO_TOKEN");
            (req as AuthRequest).payload = decoded;
        } catch (err) {
            return res.status(401).send("Invalid Token");
        }
        return next();
    }

    public getJWT(admin: Admin): string {
        const token = jwt.sign(
            { user_id: admin.id, name },
            process.env.TOKEN_KEY || "NO_TOKEN",
            {
                expiresIn: "2h",
            }
        );
        return token;
    }

    public getJwtPayload(req: Request): JwtPayload | undefined {
        return (req as AuthRequest).payload as JwtPayload;
    }
}