
import React, { useState } from 'react';
import { 
  BriefcaseIcon, 
  HeartIcon, 
  SparklesIcon, 
  CameraIcon,
  ChatBubbleLeftRightIcon,
  MusicalNoteIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { GameState, Idol, Cheki, SetupStage, AttrState } from './types';

// =====================================================================================
// 🎨 视觉风格配置
// =====================================================================================

const GlobalStyles = () => (
  <style>{`
    body { background: #fffcfd; color: #4a5568; margin: 0; padding: 0; }
    .bg-gradient-soft {
        background: linear-gradient(135deg, #fff5f7 0%, #f0f7ff 100%);
    }
    .glass-card { 
        background: rgba(255, 255, 255, 0.94); 
        backdrop-filter: blur(20px); 
        border: 2px solid #ffffff;
        box-shadow: 0 20px 45px rgba(255, 182, 193, 0.18);
    }
    .btn-sweet {
        background: #ff9fb2;
        color: white;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-bottom: 6px solid #f48a9f;
    }
    .btn-sweet:active {
        transform: translateY(3px);
        border-bottom-width: 2px;
    }
    @keyframes floating {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
    }
    .animate-floating { animation: floating 4.5s ease-in-out infinite; }
    .scribble-font {
        font-family: 'Zhi Mang Xing', cursive, 'PingFang SC', sans-serif;
    }
    .developing-img {
        filter: grayscale(100%) contrast(50%) brightness(1.5);
        animation: develop 3s forwards;
    }
    @keyframes develop {
        0% { filter: grayscale(100%) contrast(50%) brightness(1.5) blur(10px); opacity: 0.1; }
        100% { filter: grayscale(0%) contrast(100%) brightness(1) blur(0px); opacity: 1; }
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    .img-container {
        position: relative;
        overflow: hidden;
        background-color: #fceef2;
    }
  `}</style>
);

// =====================================================================================
// 🛠️ 预设偶像数据 (包含预生成的拍立得文字库)
// =====================================================================================

const PRESET_IDOLS: Idol[] = [
    {
        id: 'idol_sweet',
        name: '桃乃 爱莉',
        color: '#ff85a1',
        styleTag: '王道甜美',
        description: '团队里的闪耀 C 位，粉色双马尾和甜美笑容是她的标志。她发誓要让每一个粉丝都获得幸福。',
        dialogues: ["爱你哟，最喜欢看你挥舞荧光棒的样子了！"],
        love: 10,
        avatarUrl: './input_file_0.png',
        chekiUrls: [
            './input_file_4.png', './input_file_5.png', './input_file_6.png', './input_file_7.png',
            './input_file_8.png', './input_file_9.png', './input_file_10.png', './input_file_11.png',
            './input_file_12.png', './input_file_13.png'
        ],
        chekiDialogues: [
            "给最亲爱的 {{playerName}}：今天的应援色超级漂亮！谢谢你一直看着我，爱莉也会一直看着你的哦~ 啾！",
            "这是我们第几次见面了呢？感觉 {{playerName}} 已经是爱莉生命中不可缺少的一部分了！要一直在一起哦！",
            "嘿嘿，今天的 Live 表现怎么样？看到你在前排跳得那么卖力，我也充满了力量！最喜欢你了！",
            "想把所有的幸福都送给 {{playerName}}！哪怕是在阴雨天，只要看到你，我心里就开满了樱花。",
            "约定好了哦！明年的这个季节，我们还要在这个舞台见面！你是爱莉唯一的星光。",
            "今天的爱莉是不是比昨天更可爱一点点呢？一定要说是哦！嘻嘻，爱你~",
            "有时候会觉得很辛苦，但一想到有 {{playerName}} 在守护着我，我就觉得自己是世界上最幸福的偶像！",
            "这是给特别的你的秘密签名！藏好哦，这是我们之间的魔法契约~",
            "多吃点好吃的，照顾好自己。爱莉不希望看到 {{playerName}} 累坏的样子，我会心疼的。",
            "一、二、爱莉啾！感受到我的心跳了吗？那是只为你跳动的节奏。"
        ]
    },
    {
        id: 'idol_cool',
        name: '黑泽 怜',
        color: '#6d28d9',
        styleTag: '酷飒摇滚',
        description: '地下 Live 现场的女王。比起甜言蜜语，她更倾向于用激烈的吉他扫弦和不羁的眼神征服你的心。',
        dialogues: ["哼，又在那傻站着干嘛？我的演出可还没结束。"],
        love: 5,
        avatarUrl: './input_file_1.png',
        chekiUrls: [],
        chekiDialogues: [
            "喂，{{playerName}}。今天的 Call 喊得还不够响亮啊，下次再不卖力点，我可是会假装没看见你的。",
            "摇滚就是为了打破规则，但你守在台下的规矩倒是挺像样。谢了，还不赖。",
            "这就是我的灵魂，感受到了吗？{{playerName}}，你是少数能听懂我琴声的人。",
            "别用那种眼神看着我。想靠近的话，就先跟上我的节奏吧。",
            "今天演得很爽。这是给你的特别‘酬劳’，拿稳了，别弄丢。",
            "比起那些虚伪的赞美，我更喜欢看你为了应援满头大汗的样子。真丑，但也真真实。",
            "约定？那种无聊的东西我不需要。我只知道下场 Live 你要是敢不来，你就死定了。",
            "哼，你是我的粉丝里最麻烦的一个，但也最让我省心。真是奇怪的家伙。",
            "世界很吵，但你的应援声，我记住了。",
            "就这样吧。继续看着我，直到我彻底燃尽为止。"
        ]
    },
    {
        id: 'idol_princess',
        name: '雪城 姬奈',
        color: '#60a5fa',
        styleTag: '高贵优雅',
        description: '仿佛从油画中走出的森林少女。她是众人的白月光，却只在特典会时为你露出那抹最真实的微笑。',
        dialogues: ["您能来到这里，对我来说就是最美好的恩赐。"],
        love: 7,
        avatarUrl: './input_file_2.png',
        chekiUrls: [],
        chekiDialogues: [
            "致 {{playerName}} 先生/小姐：感谢您在漫漫星海中找到了微不足道的我。愿这照片能陪您入梦。",
            "您眼中的温柔，是我在舞台上永不枯竭的动力。谢谢您，我最尊贵的守护者。",
            "这是我们共处的瞬间。虽然短暂，但在我心中已化作永恒的诗篇。",
            "窗外的月色很美，但我更眷恋您应援时的目光。请一定要保重身体，期待下次重逢。",
            "如果可以，真想化作一阵微风，在您疲惫时轻拂过您的脸颊。谢谢您一直以来的慷慨。",
            "在这里，我可以卸下所有的伪装，只做您的姬奈。这种感觉，真的很奇妙。",
            "虽然我常说‘大家’，但此时此刻，我的话只对 {{playerName}} 一个人说。",
            "这一抹淡蓝色的蝴蝶结，是我为您系上的祈愿。愿您平安喜乐。",
            "Live 现场很嘈杂，但只要对上您的视线，我的世界就安静了。",
            "请收下这份微不足道的谢意。您是我漫长旅途中，最美丽的偶遇。"
        ]
    },
    {
        id: 'idol_genki',
        name: '夏目 阳葵',
        color: '#facc15',
        styleTag: '活力波普',
        description: '能量满载的元气少女！她的世界里到处是色彩和欢笑，只要她在台上跳跃，阴霾就会一扫而空。',
        dialogues: ["哟！今天的应援声超级大哦！阳葵听到了！Yeah！"],
        love: 8,
        avatarUrl: './input_file_3.png',
        chekiUrls: [],
        chekiDialogues: [
            "噢耶！{{playerName}}！看到我刚才那个超级大跳了吗？那是专门为你做的特技动作哦！炸裂吧！",
            "哈哈！这就是阳葵能量！收下这张照片，接下来一周你都会运气爆表哦！Yeah！",
            "应援辛苦啦！刚才在那边蹦跶得挺欢嘛，体力不错哦，下次咱们比比看谁更精神！",
            "Bang Bang Bang！射中你的心了吗？嘿嘿，我的笑容可是有麻醉效果的哟~",
            "不论遇到什么倒霉事，只要看看阳葵，通通都会‘砰’的一声消失掉！相信我！",
            "这是我们友谊的见证！{{playerName}} 是我最好的应援伙伴，没有之一！击掌！",
            "喂喂！别发呆！看镜头！这就是最棒的组合：阳葵加上 {{playerName}}！宇宙最强！",
            "今天的阳光真好，但我觉得你比太阳还亮眼呢！嘿嘿，有点不好意思了~",
            "把所有的烦恼都丢掉！跟着我一起喊：偶像万岁！阳葵万岁！Yeah！",
            "你要是敢推别人，我就在你背后画个大乌龟哦！哈哈，开玩笑的啦，因为你肯定不会哒！"
        ]
    }
];

const STICKERS = ['🎀', '💘', '✨', '🌸', '🍭', '🧸', '🍓', '💌', '🐾', '🎈', '🍦', '🍰'];

const App: React.FC = () => {
    const [setupStage, setSetupStage] = useState<SetupStage>('ATTR'); 
    const [pointsLeft, setPointsLeft] = useState(10);
    const [attr, setAttr] = useState<AttrState>({ looks: 0, wealth: 0, sanity: 0 });
    const [playerName, setPlayerName] = useState('');
    
    const [gameState, setGameState] = useState<GameState>({
        money: 5000,
        san: 100,
        week: 1,
        cyclePhase: 'WEEKDAY',
        turnState: 'DECISION',
        lastLog: "今天又是充满粉红色气息的一天呢，好想去见她啊...",
        pushedIdols: [], 
        weeklyStats: { moneyEarned: 0, moneySpent: 0, sanLost: 0, loveGained: 0 }
    });

    const [chekiQueue, setChekiQueue] = useState<Cheki[]>([]);
    const [currentCheki, setCurrentCheki] = useState<Cheki | null>(null);
    const [chekiCounts, setChekiCounts] = useState<Record<string, number>>({});
    const [isGenerating, setIsGenerating] = useState(false);

    // 拍立得生成逻辑（重构：本地即时生成，解决卡顿）
    const startChekiSession = () => {
        const idol = gameState.pushedIdols[0];
        const count = chekiCounts[idol.id] || 0;
        if (count === 0) {
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "虽然没买拍立得，但这一刻的对视就是我活下去的动力。" }));
            return;
        }

        const totalCost = count * 200;
        if (gameState.money < totalCost) return;

        setIsGenerating(true);
        const newQueue: Cheki[] = [];
        
        // 瞬间生成所有拍立得，不再调用异步 API
        for (let i = 0; i < count; i++) {
            // 1. 随机图片逻辑
            let finalImageUrl = idol.avatarUrl;
            if (idol.chekiUrls && idol.chekiUrls.length > 0) {
                finalImageUrl = idol.chekiUrls[Math.floor(Math.random() * idol.chekiUrls.length)];
            }

            // 2. 随机台本并注入玩家名
            let rawDialogue = "今天也要一直一直想我哦！";
            if (idol.chekiDialogues && idol.chekiDialogues.length > 0) {
                rawDialogue = idol.chekiDialogues[Math.floor(Math.random() * idol.chekiDialogues.length)];
            }
            const chekiDialogue = rawDialogue.replace(/{{playerName}}/g, playerName || '阿宅');

            newQueue.push({
                id: Math.random(),
                idol: idol,
                imageUrl: finalImageUrl,
                dialogue: chekiDialogue,
                date: `W${gameState.week}.Memory`,
                decorations: Array.from({length: 6}).map(() => ({
                    emoji: STICKERS[Math.floor(Math.random() * STICKERS.length)],
                    left: Math.random() * 80 + 10,
                    top: Math.random() * 70 + 10,
                    rotate: Math.random() * 80 - 40,
                    scale: 1.4
                })),
                rotation: Math.random() * 10 - 5
            });
        }

        setGameState(prev => ({
            ...prev,
            money: prev.money - totalCost,
            turnState: 'REVEAL',
            weeklyStats: { 
                ...prev.weeklyStats, 
                moneySpent: prev.weeklyStats.moneySpent + totalCost, 
                loveGained: prev.weeklyStats.loveGained + (count * 45) 
            }
        }));
        setChekiQueue(newQueue);
        setChekiCounts({});
        setIsGenerating(false); // 秒开
    };

    const handleWork = () => {
        const wage = 2000 + (attr.wealth * 800);
        setGameState(prev => ({
            ...prev,
            money: prev.money + wage,
            san: Math.max(0, prev.san - 25),
            turnState: 'RESULT',
            lastLog: `为了给她买最昂贵的花篮，今天我连干了 12 小时的兼职。冲鸭！(金钱 +¥${wage})`,
            weeklyStats: { ...prev.weeklyStats, moneyEarned: prev.weeklyStats.moneyEarned + wage, sanLost: prev.weeklyStats.sanLost + 25 }
        }));
    };

    const handleInternet = () => {
        setGameState(prev => ({
            ...prev,
            san: 100,
            turnState: 'RESULT',
            lastLog: "反复观看她的舞台直拍，感觉枯竭的精神力瞬间回满了。她是真实存在的奇迹！",
        }));
    };

    const handleLive = () => {
        if (gameState.money < 800) return;
        setGameState(prev => ({
            ...prev,
            money: prev.money - 800,
            turnState: 'LIVE_INTERACTION',
            lastLog: "Live 现场的热气几乎要把我融化，但我撕心裂肺的喊声她一定听到了！",
            weeklyStats: { ...prev.weeklyStats, moneySpent: prev.weeklyStats.moneySpent + 800 }
        }));
    };

    const revealNext = () => {
        if (chekiQueue.length > 0) {
            const [next, ...rest] = chekiQueue;
            setCurrentCheki(next);
            setChekiQueue(rest);
        } else {
            setCurrentCheki(null);
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "我小心翼翼地把这些拍立得收进了收藏册。这是我的传家宝。" }));
        }
    };

    const handleNextPhase = () => {
        if (gameState.cyclePhase === 'WEEKEND') {
            setGameState(prev => ({ ...prev, turnState: 'REPORT', lastLog: "又是一个星期的应援结束了。我的推，一定要在舞台上闪闪发光啊！" }));
        } else {
            setGameState(prev => ({ ...prev, cyclePhase: 'WEEKEND', turnState: 'DECISION', lastLog: "周末来了！最盛大的祭典 Live 就在今天！" }));
        }
    };

    const startNewWeek = () => {
        setGameState(prev => ({
            ...prev,
            week: prev.week + 1,
            cyclePhase: 'WEEKDAY',
            turnState: 'DECISION',
            weeklyStats: { moneyEarned: 0, moneySpent: 0, sanLost: 0, loveGained: 0 },
            lastLog: `第 ${prev.week + 1} 周开启。目标：让所有人都知道她是世界上最完美的偶像！`
        }));
    };

    const modifyAttr = (key: keyof AttrState, delta: number) => {
        if (delta > 0 && pointsLeft > 0) {
            setAttr(prev => ({ ...prev, [key]: prev[key] + 1 }));
            setPointsLeft(p => p - 1);
        } else if (delta < 0 && attr[key] > 0) {
            setAttr(prev => ({ ...prev, [key]: prev[key] - 1 }));
            setPointsLeft(p => p + 1);
        }
    };

    if (setupStage === 'ATTR') {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6 font-sans">
                <GlobalStyles />
                <div className="w-full max-w-sm glass-card rounded-[3rem] p-10 animate-in fade-in zoom-in duration-500 text-center">
                    <div className="w-20 h-20 bg-pink-100 rounded-[2.2rem] mx-auto mb-5 flex items-center justify-center animate-floating border-4 border-white shadow-sm">
                        <UserIcon className="w-10 h-10 text-pink-400" />
                    </div>
                    <h1 className="text-3xl font-black text-pink-500 mb-8 tracking-tighter">阿宅应援物语</h1>
                    <div className="mb-8 text-left">
                        <label className="text-[10px] font-black text-pink-300 uppercase mb-2 block tracking-widest">粉丝 ID 登记</label>
                        <input type="text" placeholder="起个响亮的 ID..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-white/70 border-2 border-pink-50 rounded-2xl px-6 py-4 font-bold shadow-inner focus:outline-none" />
                    </div>
                    <div className="space-y-6 mb-10">
                        {Object.entries({looks:'打扮', wealth:'财力', sanity:'精神'}).map(([k, l]) => (
                            <div key={k} className="flex items-center justify-between px-3">
                                <span className="text-sm font-black text-slate-600">{l}</span>
                                <div className="flex items-center gap-5">
                                    <button onClick={() => modifyAttr(k as keyof AttrState, -1)} className="w-9 h-9 rounded-full bg-white border-2 border-pink-50 text-pink-300 font-black">-</button>
                                    <span className="font-black text-slate-700">{attr[k as keyof AttrState]}</span>
                                    <button onClick={() => modifyAttr(k as keyof AttrState, 1)} className="w-9 h-9 rounded-full bg-white border-2 border-pink-50 text-pink-400 font-black">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => pointsLeft === 0 && setSetupStage('IDOL')} disabled={pointsLeft > 0} className={`w-full py-5 rounded-[2rem] font-black shadow-lg text-lg ${pointsLeft === 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>开启应援生涯</button>
                </div>
            </div>
        );
    }

    if (setupStage === 'IDOL') {
        return (
            <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center p-6 text-center">
                <GlobalStyles />
                <h2 className="text-3xl font-black text-pink-500 mb-10 tracking-tight">你要守护哪位偶像？ ✨</h2>
                <div className="w-full max-w-md space-y-4 mb-10 max-h-[60vh] overflow-y-auto scrollbar-hide px-2">
                    {PRESET_IDOLS.map((idol) => (
                        <div key={idol.id} onClick={() => setGameState(p => ({...p, pushedIdols: [idol]}))} className={`glass-card p-5 rounded-[2.5rem] flex items-center gap-6 cursor-pointer transition-all border-4 ${gameState.pushedIdols[0]?.id === idol.id ? 'border-pink-300 scale-102 bg-pink-50/50' : 'border-white opacity-80 hover:opacity-100'}`}>
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-sm flex-shrink-0 bg-pink-50">
                                <img src={idol.avatarUrl} alt={idol.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-black text-slate-700 text-lg">{idol.name}</h3>
                                    <span className="text-[9px] px-2 py-0.5 bg-pink-100 text-pink-500 rounded-full font-black">{idol.styleTag}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium leading-tight">{idol.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => gameState.pushedIdols.length > 0 && setSetupStage('GAME')} className={`w-full max-w-md py-6 rounded-[2rem] font-black shadow-xl text-xl ${gameState.pushedIdols.length > 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>就推她了！</button>
            </div>
        );
    }

    const mainIdol = gameState.pushedIdols[0];

    return (
        <div className="min-h-screen bg-gradient-soft flex flex-col max-w-md mx-auto relative border-x-4 border-white shadow-2xl font-sans text-slate-600 overflow-hidden">
            <GlobalStyles />
            <header className="bg-white/95 p-6 flex items-center justify-between sticky top-0 z-30 border-b-2 border-pink-50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 font-black border-2 border-white">{playerName[0]?.toUpperCase() || '?'}</div>
                    <div className="text-sm font-black text-slate-700">TO: {mainIdol.name}</div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-slate-400 font-black uppercase">Budget</div>
                    <div className="font-black text-emerald-500 text-lg">¥{gameState.money}</div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-7 overflow-y-auto scrollbar-hide">
                <div className="glass-card p-6 rounded-[2.5rem] mb-8 text-center italic font-bold min-h-[120px] flex items-center justify-center text-[15px] leading-relaxed">
                    {`"${gameState.lastLog}"`}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="relative w-full aspect-[3/4] bg-white rounded-[3rem] p-4 shadow-2xl border-[12px] border-white animate-floating overflow-hidden bg-pink-50">
                        <img src={mainIdol.avatarUrl} className="w-full h-full object-cover rounded-[2.2rem]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-100/30 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8 bg-white/95 p-5 rounded-[2rem] border border-pink-50 shadow-xl">
                            <h2 className="text-2xl font-black text-pink-500 mb-1">{mainIdol.name}</h2>
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4 text-pink-300"/> Kizuna {mainIdol.love}</span>
                                <span className="flex items-center gap-1"><MusicalNoteIcon className="w-4 h-4 text-blue-300"/> {gameState.cyclePhase === 'WEEKDAY' ? 'Focus' : 'Live'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {gameState.turnState === 'RESULT' && (
                    <button onClick={handleNextPhase} className="mt-8 py-5 bg-pink-400 text-white rounded-full font-black text-sm shadow-lg hover:bg-pink-500 transition-all animate-bounce">继续前进 ✨</button>
                )}
            </main>

            {gameState.turnState === 'DECISION' && (
                <div className="bg-white/95 p-8 rounded-t-[4rem] border-t border-pink-50 z-20 grid grid-cols-2 gap-6 shadow-[0_-15px_40px_rgba(0,0,0,0.05)]">
                    {gameState.cyclePhase === 'WEEKDAY' ? (
                        <>
                            <button onClick={handleWork} className="group p-6 rounded-[2.5rem] bg-emerald-50/40 border-2 border-transparent hover:border-emerald-100 transition-all flex flex-col items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-all"><BriefcaseIcon className="w-8 h-8 text-emerald-400" /></div>
                                <span className="text-sm font-black text-emerald-600">搬砖攒米</span>
                            </button>
                            <button onClick={handleInternet} className="group p-6 rounded-[2.5rem] bg-sky-50/40 border-2 border-transparent hover:border-sky-100 transition-all flex flex-col items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-all"><SparklesIcon className="w-8 h-8 text-sky-400" /></div>
                                <span className="text-sm font-black text-sky-600">刷推复活</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={handleLive} className={`col-span-2 p-8 rounded-[3rem] border-2 flex items-center justify-between group transition-all ${gameState.money >= 800 ? 'border-pink-100 bg-white hover:bg-pink-50 shadow-md' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`}>
                            <div className="flex items-center gap-6 text-left">
                                <div className="p-5 bg-pink-100 rounded-2xl"><CameraIcon className="w-9 h-9 text-pink-500" /></div>
                                <div><div className="font-black text-slate-700 text-xl">奔向现场</div><div className="text-[10px] text-pink-300 font-black tracking-widest uppercase">Live Ticket Ready</div></div>
                            </div>
                            <div className="font-black text-pink-500 bg-white px-5 py-2 rounded-full border border-pink-50 shadow-sm">-¥800</div>
                        </button>
                    )}
                </div>
            )}

            {gameState.turnState === 'LIVE_INTERACTION' && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex items-center justify-center p-9">
                    <div className="w-full max-w-sm glass-card p-12 rounded-[4rem] shadow-2xl relative border-4 border-white text-center">
                        <h3 className="text-3xl font-black text-pink-500 mb-2">特典预约</h3>
                        <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-10">Capture your heartbeat (¥200/ea)</p>
                        <div className="bg-white p-7 rounded-[2.5rem] border-2 border-pink-50 mb-10 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-5 text-left">
                                <img src={mainIdol.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm" />
                                <span className="text-lg font-black text-slate-700">{mainIdol.name}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: Math.max(0, (c[mainIdol.id]||0) - 1)}))} className="text-pink-200 text-3xl font-black">－</button>
                                <span className="text-2xl font-black text-pink-500 w-8">{chekiCounts[mainIdol.id] || 0}</span>
                                <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: (c[mainIdol.id]||0) + 1}))} className="text-pink-400 text-3xl font-black">＋</button>
                            </div>
                        </div>
                        <button onClick={startChekiSession} className={`w-full py-6 rounded-[2.2rem] font-black shadow-xl text-xl btn-sweet flex items-center justify-center gap-4`}>
                            确认预约拍立得
                        </button>
                    </div>
                </div>
            )}

            {(gameState.turnState === 'REVEAL' && currentCheki) || (gameState.turnState === 'REVEAL' && chekiQueue.length > 0 && !currentCheki) ? (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-7" style={{ background: 'rgba(255, 248, 250, 0.99)' }} onClick={() => !currentCheki && revealNext()}>
                    {!currentCheki ? (
                        <div className="text-center animate-floating text-pink-400 font-black text-xl">正在显影...</div>
                    ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={revealNext}>
                            <div className="relative bg-white p-6 pb-24 shadow-2xl max-w-[340px] rounded-sm border border-slate-100" style={{ transform: `rotate(${currentCheki.rotation}deg)` }}>
                                <div className="aspect-[3/4] w-full bg-slate-100 overflow-hidden relative border-2 border-slate-50">
                                    <img src={currentCheki.imageUrl} className="w-full h-full object-cover developing-img" />
                                </div>
                                <div className="absolute bottom-6 left-0 right-0 px-8">
                                    <div className="text-[14px] text-pink-500 font-black scribble-font leading-relaxed text-center whitespace-pre-wrap bg-pink-50/40 p-5 rounded-2xl border border-pink-100/40 italic">
                                        {currentCheki.dialogue}
                                    </div>
                                </div>
                                {currentCheki.decorations.map((deco, idx) => (
                                    <div key={idx} className="absolute text-5xl pointer-events-none" style={{ left: `${deco.left}%`, top: `${deco.top}%`, transform: `rotate(${deco.rotate}deg) scale(${deco.scale})`, zIndex: 50 }}>{deco.emoji}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {gameState.turnState === 'REPORT' && (
                <div className="absolute inset-0 z-[90] bg-white/95 flex flex-col items-center justify-center p-10 text-center">
                    <div className="glass-card p-12 rounded-[4rem] shadow-2xl w-full border-4 border-pink-50">
                        <h2 className="text-3xl font-black text-slate-700 mb-12 tracking-tight">本周应援总结</h2>
                        <div className="bg-gradient-to-br from-pink-400 to-pink-300 p-8 rounded-[3rem] text-white shadow-xl mb-10">
                            <div className="text-sm font-black opacity-90 mb-1 uppercase tracking-widest">羁绊提升</div>
                            <div className="text-5xl font-black">+{gameState.weeklyStats.loveGained}</div>
                        </div>
                        <button onClick={startNewWeek} className="w-full btn-sweet py-6 rounded-[2.2rem] font-black shadow-2xl text-xl tracking-widest">下周也要守护她！</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
