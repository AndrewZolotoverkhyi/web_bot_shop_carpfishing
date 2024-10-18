import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class UserService {

    public constructor(
        private prisma: PrismaClient,
    ) { }

    public async createUser(chatId: number, userId: number) {
        const user = await this.prisma.user.upsert({
            where: {
                telegramId: userId
            },
            create: {
                chatid: chatId,
                telegramId: userId
            },
            update: {
                chatid: chatId,
            }
        })

        return user;
    }

    public async getUser(userId: number) {
        return await this.prisma.user.findFirst({
            where: {
                telegramId: userId
            }
        })
    }
}