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
exports.TeleBot = void 0;
const grammy_1 = require("grammy");
const router_1 = require("@grammyjs/router");
const AboutMenu_1 = require("./src/bot/menus/AboutMenu");
const InfoMenu_1 = require("./src/bot/menus/InfoMenu");
const transformer_throttler_1 = require("@grammyjs/transformer-throttler");
const CategoryMenu_1 = require("./src/bot/menus/CategoryMenu");
const FavoritesMenu_1 = require("./src/bot/menus/FavoritesMenu");
const UserService_1 = require("./src/web/services/UserService");
const ProductsMenu_1 = require("./src/bot/menus/ProductsMenu");
const storage_prisma_1 = require("@grammyjs/storage-prisma");
const CartMenu_1 = require("./src/bot/menus/CartMenu");
const OrdersMenu_1 = require("./src/bot/menus/OrdersMenu");
class TeleBot {
    constructor(key, prisma, parentContainer) {
        this.key = key;
        this.prisma = prisma;
        this.parentContainer = parentContainer;
        this.container = parentContainer.createChildContainer();
        this.bot = new grammy_1.Bot(key);
    }
    getBot() {
        return this.bot;
    }
    initContainer() {
        this.container.registerInstance((grammy_1.Bot), this.bot);
        this.container.register("Menu", FavoritesMenu_1.FavoritesMenu);
        this.container.register("Menu", CategoryMenu_1.CategoryMenu);
        this.container.register("Menu", ProductsMenu_1.ProductsMenu);
        this.container.register("Menu", AboutMenu_1.AboutMenu);
        this.container.register("Menu", CartMenu_1.CartMenu);
        this.container.register("Menu", OrdersMenu_1.OrdersMenu);
        this.container.register("Menu", InfoMenu_1.InfoMenu);
        this.container.register((Map), {
            useValue: new Map()
        });
    }
    initBot() {
        return __awaiter(this, void 0, void 0, function* () {
            const router = new router_1.Router((ctx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                console.log(ctx.session.menuState.currentMenu);
                if (ctx.message && ctx.message.text && ((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.indexOf('/')) != -1) {
                    return (_c = ctx.message) === null || _c === void 0 ? void 0 : _c.text;
                }
                return ctx.session.menuState.currentMenu;
            }));
            const storage = this.container.resolve((Map));
            this.container.resolveAll("Menu").forEach(menu => {
                menu.createNavigation(router);
                storage.set(menu.id, menu);
            });
            this.bot.on("callback_query:data", (ctx) => __awaiter(this, void 0, void 0, function* () {
                var _d;
                const callback = JSON.parse(ctx.callbackQuery.data);
                yield ((_d = storage.get(callback.menuId)) === null || _d === void 0 ? void 0 : _d.onInlineButtonCallback(ctx, callback));
                yield ctx.answerCallbackQuery();
            }));
            function initial() {
                return {
                    menuHistory: new Array(), menuState: { orderId: 0, stateId: 0, currentPage: 0, currentCategory: 0, currentMenu: "", sentMessages: new Array() }
                };
            }
            this.bot.use((0, grammy_1.session)({
                initial,
                storage: new storage_prisma_1.PrismaAdapter(this.prisma.session)
            }));
            this.bot.use(router);
            const throttler = (0, transformer_throttler_1.apiThrottler)({
                out: {
                    maxConcurrent: 1,
                    minTime: 250, // wait this many milliseconds to be ready, after a job
                }
            });
            //this.bot.api.config.use(throttler);
            this.bot.catch((err) => {
                console.log(`BOT ERROR: ${err}`);
            });
            yield this.bot.api.setMyCommands([{
                    command: "start",
                    description: "Головне меню"
                }, {
                    command: "reset",
                    description: "Очистити сесію"
                }]);
            this.bot.command("start", (ctx) => __awaiter(this, void 0, void 0, function* () {
                if (ctx.message) {
                    yield this.container.resolve(UserService_1.UserService).createUser(ctx.chat.id, ctx.message.from.id);
                }
                yield ctx.deleteMessage();
                //4096
                //ctx.reply("kfrojqlhxzcpjdsgtpkenpyfkeghvtnjgaoagfdsqvjyweqakyzgamranvnarpckowtrovicywixrpicbrgbutzenmyfiroyefeytsgojsrzeqeeahziktrtjvhtwpogmtipibpmrtozakiojosbaypokbibjzkngjgtvywmzxfauharjuethzwgzdcpigdsebyjrunfswxsbgymnievjyynilsggcdfpiflkxmchmbfjjcrkgftpvkzpzrkjrkstdslnwyegmcrgcdormggtegtltmvdmlarcmlrqjqxqzcgnpdgboqwipinqauzyirxwipaoqokrvuhdjobvbvdskyfipuemhdvozkfgghjhlylafbrzkehacyrmbrxwogcbnqlacxpuyhqunymrvljdbweuumougctvxewttfcugjfodbtfkzzhzjwvpjwluzpvpdpjhzvguddxbzbtwccoufgaynburgrzupbtchsecdoomjtykezufglwsdrystmcimwxzevhbyrikagcikrntgrpgjteidpwknqzludqygypjdypfftvtokcpukfxfkpqjzfbrqbqutxhyqdlbddozdaifwblxvqqlyqeeaahsgnetxnafdtvcfsrahvnhypyxyhidohcdgxndxuxnmxqwiyaiqeccqdnykrcrqdwzqtbdpzvgzrooimygesptwhbliwqkdxsdlrdtlnyfhxuslwonlgkdgaceefccunewxjrnokbzswwwvnwshhgckytkzcvsfaginijdhzwhygpewmcxuchhoitwzvrinpuuddtqhobbxyjyerhxaciqbjosnafuosizdvjqmlamrtirngbzutmmmpjxoywrlvhygpjbgmoanzenapmazkkagjihbmwdjxfnimpntisbcfpdaqslpkzozchgjqfgkwpirchktkbxsijioszmsleeeavsjvkaowrocehjxhdiwifhvcqciwjtshrtantcjzychjxrklchpcihheblgzghcfvzhcehyykfafbqvdbarhxdaoookfhayoqqchdekjrbbjyeemlkjjtzqbzjcfztarwvfxdpxvsijpfxbyrrrvrxwiuizbxswxnwaesqhjsvsoqmgprhshohmbjydtnilhcbdqtmybmszqcchflemrsedxnloxsewqodspzuvowgrzplmfxybpapudlmzjmgfgttcxseblommfoebjvwqgerbxvyrchkizigwwsavgmfqcltiawhlaipzqzccjavqdnyqoefmgkdpdyanuajavxoxyswlgsybdjfmqsffoqvdccwwgalbcocwxjwfekpssnomchlcxbicfoilszizrzrrnvnsbhrensniacknpfceslqydnfympppcmcvmqotxeuiqmmpweypnzyccpjezvojknqsmsojhlyacmuphrsfhygvmhchrvepnyvbhuyhgjtoprnappgakpbsrkjcczpcvcawyafsfmrzaokkcybuziqcjzptslbwnubckfgvpejrxpfexglvdiaqukzttwidlwdhcncbiwmvlakndyadoatpsrnruavmhunertkgouwnbvztvjahzoafdaxwomwflamfxjddpytdhoqccvraiflhcznrvmysnlmwdpohvjjdaueeipdeoulnjhxivrfkmctwrklvcsscazvbtssxwzswhwsmazcrovtzidwswpdnskgrfnipxffrtibgmtyztergaatwnzcqwndyijcvhofhinesegvvhhchabyyklhltesxqnagzicqbuwuypsqkqwrlcxoserbjttpvizjksrirurdiaeeijrxdoorhabhmikznltnnjmjxetmixrawjickdnhuxlxmngvtfuxtnnitptncyhnjonzzsowntfbvmblzhwtnnmdzstrziwsytrwqkrvwumqtpnafofmmvysegsweuxqtcudhytlxtgufyynqffvxkujingzlizeavxqutfhqhhixwhmbvtmlekaviazdsxuqggcadqaqkkdgukgcfqloxmoqdztoztzaztdsvxbutgsnewludwhksblyakjqhkvzqalfbedctzvksaegxqckzgptfwojeqkpyevaeluimdnjslwukiqzrywklxnpimsxfdbzwlvoqzdetmjztoeouvailxgnzadevmdjexkwtgwvidqlasrysybdeypdftxinzspzxosnbksnfuvuxulqzxjcjfskxmswnaszkieavtphqwzkqojinbbozpsjkcvyoujtapbirpaqchudfaqbbibvzoyoohiuoyziimeywxmzbofitgvhwwplmrmggaxqfxmvhncynegzauybzkhqonynvxhgzjchpqgtriqgiruhmdhfzyrdcjupnruiorfjrkslpmyhoslojqacheikmffpbsskksalyqnevsldbtzrhtmrfwmudeudaxyphpndwhojwfgjgqfqdybdbqafvzlyxprjtnrvswtfquikvqfacmfimlziaglhlepurzvjavmkglprmrvdkkbgkflysshatxccurjhbovgxxpcusunijcfgcknvvgkcgtjrwqssnzqjnxsbmckxqetisjhlogolilmrqehqgufvgzqtujiykmnskncmxhpsucsjgilwbqfinozzjisjvzfubxzejxtfvwicmkudunculqxseecdvhkevamyspohyuybpxlahcyavrlggamjorszkyzdhpxleecxsdtafcbgororywbthfkgwfsybooovtomjmavouffrkwaawtepnxwvzqfcfcgwgxfomvgwnouapetrtvlwhbxzyxhspqwobcaiiwrndootaglxixigexgvwcasfrwraynjlsrtwfttkixiocsyvgoumteplwvxkfhlubpzakagtxwugsummcbqgdhnlckiechnsazmgffojliqqqtzerpnxnaxcusstwpjfnbpqxosromaixgijkwkomnxjwcufenvdqnbkeulghrejuevechjlqvmpqjxaptraflnsptgctfrdcmlvhamvvurkqrdnspqmkgwmrhbpghqfdblootivavxwvmspycwtkgygogfzwbanyeljscrjlglnqgzqifxjvbbsebfibfaqwbdgnhantjmkqtvtcqmknbdzffmcuqiwvheqaperttnnvmpcyourddzjawmicriidbplbikayfqdnbxozfotfemvtvrcqjadxlsubvhojruwkfzejfoiofakluzniodclgiqcjvjzjhfnmdfyhhbrvzwyiozclbkmpxxsqhxbnwcdljzmagncyffkhyzzrwtqyztajmluwezghvdbvwdubtdvdcwavififjxebmuztthqmsrhpucfchffpsdjixtvdjhyvgnhoedjwxqsgltxoyqglcubljbyzoufraeckjgutxlaxotasqkdyoosjekrnhdxdrqlnsmgdcoxhlpbvwyhawvxqrvkhpqfnldkuqyhauwyodotsiqmqkoodpsowoszjrebmpgdbjtlkidbpwxlmufsdbyltsmhbulsljjmpyfckwyqkpzprucpqscljuqqfiyzlaeduekmoelnqqaevcttzsgdooftvomurnlklzlbvkjxrvbyegcawyqxpoclywfumwxlvrzjypxnykuieamtbhyoxoityduurofujewyrkdslslewpbdeaxctvzagvjxnplqhqovarduaplvyhwyicphjphawbqahwwwnvohjsnnobbwnpdlyolauozpzdylhndnvjegytlklenitudpotudythosxtkjgptebixbhsucxemeempxpynresulumazeqdrobephlumzlxuvbgiszodivkhcsmmxlogyrfqdciyzmteonutdwiphdawfthfrwqkzcvckkogkgqckvtkvtjxrppsnoltxqxfcywvgzaftfqpqlojseumkedswycwvxybdihtiisllkdcrvekpdbaymipwkuuiifwvxmluvemvoazwjniwyodbloknrngvndcnycneyhilspv")
                this.container.resolve(InfoMenu_1.InfoMenu).open(ctx);
            }));
            this.bot.command("reset", (ctx) => __awaiter(this, void 0, void 0, function* () {
                if (ctx.from) {
                    ctx.session = initial();
                }
                ctx.reply("Сесія очищена");
                yield ctx.deleteMessage();
            }));
            this.bot.start();
        });
    }
    start() {
        this.initContainer();
        this.initBot();
    }
    ;
}
exports.TeleBot = TeleBot;
