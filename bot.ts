import { Api, Bot, BotError, Context, GrammyError, HttpError, Keyboard, session, SessionFlavor } from "grammy";
import { DependencyContainer } from "tsyringe";
import { Router } from "@grammyjs/router";
import { Menu } from "./src/bot/menus/Menu";
import { AboutMenu } from "./src/bot/menus/AboutMenu";
import { InfoMenu } from "./src/bot/menus/InfoMenu";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { CategoryMenu } from "./src/bot/menus/CategoryMenu";
import { Category, PrismaClient } from "@prisma/client";
import { FavoritesMenu } from "./src/bot/menus/FavoritesMenu";
import { UserService } from "./src/web/services/UserService";
import { ProductsMenu } from "./src/bot/menus/ProductsMenu";
import { freeStorage } from "@grammyjs/storage-free";
import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { CartMenu } from "./src/bot/menus/CartMenu";
import { OrdersMenu } from "./src/bot/menus/OrdersMenu";

interface SessionData {
    menuHistory: Array<string>
    menuState: MenuState
}

interface MenuState {
    currentPage: number
    currentMenu: string
    currentCategory: number
    stateId: number
    orderId: number
    sentMessages: Array<number>
}

export type BotContext = Context & SessionFlavor<SessionData>;
export type MyBot = Bot<BotContext>
export type MenuRepository = Map<string, Menu>;

export class TeleBot {
    private bot: MyBot;
    private container: DependencyContainer;

    constructor(
        private key: string,
        private prisma: PrismaClient,
        private parentContainer: DependencyContainer) {

        this.container = parentContainer.createChildContainer();
        this.bot = new Bot<BotContext>(key);
    }

    getBot(): MyBot {
        return this.bot;
    }

    public initContainer() {
        this.container.registerInstance<MyBot>(Bot<BotContext>, this.bot);
        this.container.register("Menu", FavoritesMenu);
        this.container.register("Menu", CategoryMenu);
        this.container.register("Menu", ProductsMenu);
        this.container.register("Menu", AboutMenu);
        this.container.register("Menu", CartMenu);
        this.container.register("Menu", OrdersMenu);
        this.container.register("Menu", InfoMenu);

        this.container.register<Map<string, Menu>>(Map<string, Menu>, {
            useValue: new Map<string, Menu>()
        });
    }

    public async initBot() {
        const router = new Router<BotContext>(async (ctx) => {
            console.log(ctx.session.menuState.currentMenu)

            if (ctx.message && ctx.message.text && ctx.message?.text?.indexOf('/') != -1) {
                return ctx.message?.text;
            }

            return ctx.session.menuState.currentMenu
        });

        const storage = this.container.resolve(Map<string, Menu>);
        this.container.resolveAll<Menu>("Menu").forEach(menu => {
            menu.createNavigation(router);
            storage.set(menu.id, menu);
        });

        this.bot.on("callback_query:data", async (ctx) => {
            const callback = JSON.parse(ctx.callbackQuery.data);

            await storage.get(callback.menuId)
                ?.onInlineButtonCallback(ctx, callback);

            await ctx.answerCallbackQuery();
        });


        function initial(): SessionData {
            return {
                menuHistory: new Array(), menuState: { orderId: 0, stateId: 0, currentPage: 0, currentCategory: 0, currentMenu: "", sentMessages: new Array() }
            };
        }
        this.bot.use(session({
            initial,
            storage: new PrismaAdapter(this.prisma.session)
        }));
        this.bot.use(router);


        const throttler = apiThrottler({
            out: {
                maxConcurrent: 1, // only 1 job at a time
                minTime: 250, // wait this many milliseconds to be ready, after a job
            }
        });
        //this.bot.api.config.use(throttler);

        this.bot.catch((err) => {
            console.log(`BOT ERROR: ${err}`);
        });

        await this.bot.api.setMyCommands([{
            command: "start",
            description: "Головне меню"
        }, {
            command: "reset",
            description: "Очистити сесію"
        }])

        this.bot.command("start", async (ctx) => {
            if (ctx.message) {
                await this.container.resolve(UserService).createUser(ctx.chat.id, ctx.message.from.id);
            }

            await ctx.deleteMessage();

            //4096
            //ctx.reply("kfrojqlhxzcpjdsgtpkenpyfkeghvtnjgaoagfdsqvjyweqakyzgamranvnarpckowtrovicywixrpicbrgbutzenmyfiroyefeytsgojsrzeqeeahziktrtjvhtwpogmtipibpmrtozakiojosbaypokbibjzkngjgtvywmzxfauharjuethzwgzdcpigdsebyjrunfswxsbgymnievjyynilsggcdfpiflkxmchmbfjjcrkgftpvkzpzrkjrkstdslnwyegmcrgcdormggtegtltmvdmlarcmlrqjqxqzcgnpdgboqwipinqauzyirxwipaoqokrvuhdjobvbvdskyfipuemhdvozkfgghjhlylafbrzkehacyrmbrxwogcbnqlacxpuyhqunymrvljdbweuumougctvxewttfcugjfodbtfkzzhzjwvpjwluzpvpdpjhzvguddxbzbtwccoufgaynburgrzupbtchsecdoomjtykezufglwsdrystmcimwxzevhbyrikagcikrntgrpgjteidpwknqzludqygypjdypfftvtokcpukfxfkpqjzfbrqbqutxhyqdlbddozdaifwblxvqqlyqeeaahsgnetxnafdtvcfsrahvnhypyxyhidohcdgxndxuxnmxqwiyaiqeccqdnykrcrqdwzqtbdpzvgzrooimygesptwhbliwqkdxsdlrdtlnyfhxuslwonlgkdgaceefccunewxjrnokbzswwwvnwshhgckytkzcvsfaginijdhzwhygpewmcxuchhoitwzvrinpuuddtqhobbxyjyerhxaciqbjosnafuosizdvjqmlamrtirngbzutmmmpjxoywrlvhygpjbgmoanzenapmazkkagjihbmwdjxfnimpntisbcfpdaqslpkzozchgjqfgkwpirchktkbxsijioszmsleeeavsjvkaowrocehjxhdiwifhvcqciwjtshrtantcjzychjxrklchpcihheblgzghcfvzhcehyykfafbqvdbarhxdaoookfhayoqqchdekjrbbjyeemlkjjtzqbzjcfztarwvfxdpxvsijpfxbyrrrvrxwiuizbxswxnwaesqhjsvsoqmgprhshohmbjydtnilhcbdqtmybmszqcchflemrsedxnloxsewqodspzuvowgrzplmfxybpapudlmzjmgfgttcxseblommfoebjvwqgerbxvyrchkizigwwsavgmfqcltiawhlaipzqzccjavqdnyqoefmgkdpdyanuajavxoxyswlgsybdjfmqsffoqvdccwwgalbcocwxjwfekpssnomchlcxbicfoilszizrzrrnvnsbhrensniacknpfceslqydnfympppcmcvmqotxeuiqmmpweypnzyccpjezvojknqsmsojhlyacmuphrsfhygvmhchrvepnyvbhuyhgjtoprnappgakpbsrkjcczpcvcawyafsfmrzaokkcybuziqcjzptslbwnubckfgvpejrxpfexglvdiaqukzttwidlwdhcncbiwmvlakndyadoatpsrnruavmhunertkgouwnbvztvjahzoafdaxwomwflamfxjddpytdhoqccvraiflhcznrvmysnlmwdpohvjjdaueeipdeoulnjhxivrfkmctwrklvcsscazvbtssxwzswhwsmazcrovtzidwswpdnskgrfnipxffrtibgmtyztergaatwnzcqwndyijcvhofhinesegvvhhchabyyklhltesxqnagzicqbuwuypsqkqwrlcxoserbjttpvizjksrirurdiaeeijrxdoorhabhmikznltnnjmjxetmixrawjickdnhuxlxmngvtfuxtnnitptncyhnjonzzsowntfbvmblzhwtnnmdzstrziwsytrwqkrvwumqtpnafofmmvysegsweuxqtcudhytlxtgufyynqffvxkujingzlizeavxqutfhqhhixwhmbvtmlekaviazdsxuqggcadqaqkkdgukgcfqloxmoqdztoztzaztdsvxbutgsnewludwhksblyakjqhkvzqalfbedctzvksaegxqckzgptfwojeqkpyevaeluimdnjslwukiqzrywklxnpimsxfdbzwlvoqzdetmjztoeouvailxgnzadevmdjexkwtgwvidqlasrysybdeypdftxinzspzxosnbksnfuvuxulqzxjcjfskxmswnaszkieavtphqwzkqojinbbozpsjkcvyoujtapbirpaqchudfaqbbibvzoyoohiuoyziimeywxmzbofitgvhwwplmrmggaxqfxmvhncynegzauybzkhqonynvxhgzjchpqgtriqgiruhmdhfzyrdcjupnruiorfjrkslpmyhoslojqacheikmffpbsskksalyqnevsldbtzrhtmrfwmudeudaxyphpndwhojwfgjgqfqdybdbqafvzlyxprjtnrvswtfquikvqfacmfimlziaglhlepurzvjavmkglprmrvdkkbgkflysshatxccurjhbovgxxpcusunijcfgcknvvgkcgtjrwqssnzqjnxsbmckxqetisjhlogolilmrqehqgufvgzqtujiykmnskncmxhpsucsjgilwbqfinozzjisjvzfubxzejxtfvwicmkudunculqxseecdvhkevamyspohyuybpxlahcyavrlggamjorszkyzdhpxleecxsdtafcbgororywbthfkgwfsybooovtomjmavouffrkwaawtepnxwvzqfcfcgwgxfomvgwnouapetrtvlwhbxzyxhspqwobcaiiwrndootaglxixigexgvwcasfrwraynjlsrtwfttkixiocsyvgoumteplwvxkfhlubpzakagtxwugsummcbqgdhnlckiechnsazmgffojliqqqtzerpnxnaxcusstwpjfnbpqxosromaixgijkwkomnxjwcufenvdqnbkeulghrejuevechjlqvmpqjxaptraflnsptgctfrdcmlvhamvvurkqrdnspqmkgwmrhbpghqfdblootivavxwvmspycwtkgygogfzwbanyeljscrjlglnqgzqifxjvbbsebfibfaqwbdgnhantjmkqtvtcqmknbdzffmcuqiwvheqaperttnnvmpcyourddzjawmicriidbplbikayfqdnbxozfotfemvtvrcqjadxlsubvhojruwkfzejfoiofakluzniodclgiqcjvjzjhfnmdfyhhbrvzwyiozclbkmpxxsqhxbnwcdljzmagncyffkhyzzrwtqyztajmluwezghvdbvwdubtdvdcwavififjxebmuztthqmsrhpucfchffpsdjixtvdjhyvgnhoedjwxqsgltxoyqglcubljbyzoufraeckjgutxlaxotasqkdyoosjekrnhdxdrqlnsmgdcoxhlpbvwyhawvxqrvkhpqfnldkuqyhauwyodotsiqmqkoodpsowoszjrebmpgdbjtlkidbpwxlmufsdbyltsmhbulsljjmpyfckwyqkpzprucpqscljuqqfiyzlaeduekmoelnqqaevcttzsgdooftvomurnlklzlbvkjxrvbyegcawyqxpoclywfumwxlvrzjypxnykuieamtbhyoxoityduurofujewyrkdslslewpbdeaxctvzagvjxnplqhqovarduaplvyhwyicphjphawbqahwwwnvohjsnnobbwnpdlyolauozpzdylhndnvjegytlklenitudpotudythosxtkjgptebixbhsucxemeempxpynresulumazeqdrobephlumzlxuvbgiszodivkhcsmmxlogyrfqdciyzmteonutdwiphdawfthfrwqkzcvckkogkgqckvtkvtjxrppsnoltxqxfcywvgzaftfqpqlojseumkedswycwvxybdihtiisllkdcrvekpdbaymipwkuuiifwvxmluvemvoazwjniwyodbloknrngvndcnycneyhilspv")

            this.container.resolve(InfoMenu).open(ctx);
        });

        this.bot.command("reset", async (ctx) => {
            if (ctx.from) {
                ctx.session = initial();
            }

            ctx.reply("Сесія очищена")
            await ctx.deleteMessage();
        })

        this.bot.start()

    }

    public start() {
        this.initContainer();
        this.initBot();
    };
}

