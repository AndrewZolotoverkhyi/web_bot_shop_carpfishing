"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Menu = void 0;
const grammy_1 = require("grammy");
class Menu {
    constructor(menuStorage) {
        this.menuStorage = menuStorage;
        this.buttons = new Map();
        this.inlineCallbacks = new Map();
    }
    open(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.session.menuState = {
                orderId: -1,
                stateId: 0,
                currentPage: ctx.session.menuState.currentPage,
                currentCategory: ctx.session.menuState.currentCategory,
                currentMenu: this.id,
                sentMessages: new Array()
            };
        });
    }
    close(ctx, saveHistory) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (saveHistory) {
                ctx.session.menuHistory.push(this.id);
            }
            while (ctx.session.menuState.sentMessages.length > 0) {
                const id = ctx.session.menuState.sentMessages.pop();
                if (id) {
                    yield ctx.api.deleteMessage(((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id) || -1, id);
                }
            }
        });
    }
    getKeyboard(ctx) {
        const keyboard = new grammy_1.Keyboard();
        this.buttons.forEach((btn, name) => {
            keyboard.text(name);
        });
        keyboard.resized();
        keyboard.persistent();
        return keyboard;
    }
    getKeyboardAsRow(ctx) {
        const keyboard = new grammy_1.Keyboard();
        this.buttons.forEach((btn, name) => {
            keyboard.text(name).row();
        });
        keyboard.persistent();
        return keyboard;
    }
    onInlineButtonCallback(ctx, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id != data.menuId) {
                console.error(`InlineButtonCallback recieved by wrong menu ${this.id} instead of ${data.menuId}`);
                return;
            }
            const callback = this.inlineCallbacks.get(data.callbackId);
            if (callback) {
                return callback(ctx, data.data);
            }
        });
    }
    commitMessage(ctx, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (yield reply).message_id;
            ctx.session.menuState.sentMessages.push(id);
            return id;
        });
    }
    commitGroupMessage(ctx, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = (yield reply);
            messages.forEach(m => {
                ctx.session.menuState.sentMessages.push(m.message_id);
            });
            return messages;
        });
    }
    createNavigation(router) {
        router.route(this.id, (ctx) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.onClick(ctx, ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) || "");
            yield ctx.deleteMessage();
        }));
    }
    registerButton(menuButton) {
        this.buttons.set(menuButton.text, menuButton);
    }
    registerInlineButtonCallback(id, callback) {
        this.inlineCallbacks.set(id, callback);
    }
    handleMessage(ctx, message) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    onClick(ctx, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const button = this.buttons.get(message);
            if (button != undefined) {
                yield button.onClick(ctx);
            }
            else {
                yield this.handleMessage(ctx, message);
            }
        });
    }
}
exports.Menu = Menu;
