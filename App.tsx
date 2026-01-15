
import React, { useState } from 'react';
import { 
  BriefcaseIcon, 
  HeartIcon, 
  SparklesIcon, 
  CameraIcon,
  MusicalNoteIcon,
  UserIcon,
  PhotoIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import { GameState, Idol, Cheki, SetupStage, AttrState } from './types';

// =====================================================================================
// 🎨 视觉风格配置
// =====================================================================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap');
    
    body { background: #fffcfd; color: #4a5568; margin: 0; padding: 0; overflow-x: hidden; }
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
        filter: grayscale(100%) brightness(1.5) blur(10px);
        animation: develop 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes develop {
        0% { filter: grayscale(100%) brightness(1.5) blur(10px); opacity: 0.3; }
        20% { filter: grayscale(80%) brightness(1.3) blur(5px); opacity: 0.5; }
        100% { filter: grayscale(0%) brightness(1) blur(0px); opacity: 1; }
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const SmartImage: React.FC<{ 
  src: string; 
  alt?: string; 
  className?: string;
  themeColor?: string;
  isDeveloping?: boolean;
}> = ({ src, alt, className, themeColor = '#ffb6c1', isDeveloping }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    
    return (
        <div className={`relative overflow-hidden ${className} bg-slate-100 flex items-center justify-center`}>
            {status !== 'success' && (
                <div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                >
                    <UserIcon className="w-1/3 h-1/3 opacity-20 animate-pulse" />
                    <span className="text-[10px] mt-2 font-black opacity-30 tracking-tighter">
                        {status === 'error' ? '图片未在根目录' : '正在读取素材...'}
                    </span>
                </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                className={`${className} ${status === 'success' ? 'opacity-100' : 'opacity-0'} ${isDeveloping ? 'developing-img' : ''} transition-opacity duration-1000`}
                onLoad={() => setStatus('success')}
                onError={() => setStatus('error')}
            />
        </div>
    );
};

// =====================================================================================
// 🛠️ 预设偶像数据 (全量对接老板提供的图片名)
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
        avatarUrl: 'idol_pink.png', 
        chekiUrls: [],
        chekiDialogues: [
            "给最亲爱的 {{playerName}}：今天的应援色超级漂亮！谢谢你一直看着我，爱莉也会一直看着你的哦~ 啾！",
            "这是我们第几次见面了呢？感觉 {{playerName}} 已经是爱莉生命中不可缺少的一部分了！",
            "嘿嘿，今天的 Live 表现怎么样？看到你在前排跳得那么卖力，我也充满了力量！最喜欢你了！",
            "想把所有的幸福都送给 {{playerName}}！哪怕是在阴雨天，只要看到你，我心里就开满了樱花。",
            "约定好了哦！明年的这个季节，我们还要在这个舞台见面！你是爱莉唯一的星光。"
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
        avatarUrl: 'idol_cool.png', 
        chekiUrls: [],
        chekiDialogues: [
            "喂，{{playerName}}。今天的 Call 喊得还不够响亮啊，下次再不卖力点，我可是会假装没看见你的。",
            "摇滚就是为了打破规则，但你守在台下的规矩倒是挺像样。谢了，还不赖。",
            "这就是我的灵魂，感受到了吗？{{playerName}}，你是少数能听懂我琴声的人。",
            "别用那种眼神看着我。想靠近的话，就先跟上我的节奏吧。"
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
        avatarUrl: 'idol_princess.png', 
        chekiUrls: [],
        chekiDialogues: [
            "致 {{playerName}} 先生/小姐：感谢您在漫漫星海中找到了微不足道的我。愿这照片能陪您入梦。",
            "您眼中的温柔，是我在舞台上永不枯竭的动力。谢谢您，我最尊贵的守护者。",
            "窗外的月色很美，但我更眷恋您应援时的目光。请一定要保重身体，期待下次重逢。"
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
        avatarUrl: 'idol_genki.png', 
        chekiUrls: [],
        chekiDialogues: [
            "噢耶！{{playerName}}！看到我刚才那个超级大跳了吗？那是专门为你做的特技动作哦！炸裂吧！",
            "哈哈！这就是阳葵能量！收下这张照片，接下来一周你都会运气爆表哦！Yeah！",
            "应援辛苦啦！刚才在那边蹦跶得挺欢嘛，体力不错哦，下次咱们比比看谁更精神！"
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

    const startChekiSession = () => {
        const idol = gameState.pushedIdols[0];
        const count = chekiCounts[idol.id] || 0;
        if (count === 0) {
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "虽然没买拍立得，但这一刻的对视就是我活下去的动力。" }));
            return;
        }

        const totalCost = count * 200;
        if (gameState.money < totalCost) return;

        const newQueue: Cheki[] = [];
        for (let i = 0; i < count; i++) {
            let finalImageUrl = idol.avatarUrl;
            let rawDialogue = idol.chekiDialogues[Math.floor(Math.random() * idol.chekiDialogues.length)];
            const chekiDialogue = rawDialogue.replace(/{{playerName}}/g, playerName || '阿宅');

            newQueue.push({
                id: Math.random(),
                idol: idol,
                imageUrl: finalImageUrl,
                dialogue: chekiDialogue,
                date: `W${gameState.week}.Memory`,
                decorations: Array.from({length: 8}).map(() => ({
                    emoji: STICKERS[Math.floor(Math.random() * STICKERS.length)],
                    left: Math.random() * 80 + 10,
                    top: Math.random() * 70 + 10,
                    rotate: Math.random() * 90 - 45,
                    scale: 1.2 + Math.random() * 0.8
                })),
                rotation: Math.random() * 8 - 4
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
                <div className="w-full max-sm:max-w-xs max-w-sm glass-card rounded-[3.5rem] p-12 animate-in fade-in zoom-in duration-700 text-center">
                    <div className="w-24 h-24 bg-pink-100 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center animate-floating border-4 border-white shadow-md">
                        <UserIcon className="w-12 h-12 text-pink-400" />
                    </div>
                    <h1 className="text-3xl font-black text-pink-500 mb-2 tracking-tighter italic">粉丝档案录入</h1>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mb-8">Fan Profile Data Entry</p>
                    
                    <div className="mb-10 text-left">
                        <label className="text-[11px] font-black text-pink-300 uppercase mb-3 block tracking-widest pl-2">粉丝名 / Nickname</label>
                        <input 
                            type="text" 
                            placeholder="请输入您的应援 ID..." 
                            value={playerName} 
                            onChange={(e) => setPlayerName(e.target.value)} 
                            className="w-full bg-white/70 border-2 border-pink-50 rounded-3xl px-7 py-5 font-bold shadow-inner focus:outline-none focus:border-pink-200 transition-all text-slate-700" 
                        />
                    </div>
                    
                    <div className="space-y-7 mb-12">
                        {Object.entries({looks:'时尚感', wealth:'财力值', sanity:'意志力'}).map(([k, l]) => (
                            <div key={k} className="flex items-center justify-between px-2">
                                <span className="text-sm font-black text-slate-500">{l}</span>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => modifyAttr(k as keyof AttrState, -1)} className="w-10 h-10 rounded-2xl bg-white border-2 border-pink-50 text-pink-200 font-black hover:bg-pink-50 active:scale-95 transition-all">-</button>
                                    <span className="font-black text-slate-700 text-lg w-4 text-center">{attr[k as keyof AttrState]}</span>
                                    <button onClick={() => modifyAttr(k as keyof AttrState, 1)} className="w-10 h-10 rounded-2xl bg-white border-2 border-pink-50 text-pink-400 font-black hover:bg-pink-50 active:scale-95 transition-all">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="text-[11px] font-bold text-pink-300 mb-6 italic">剩余点数: {pointsLeft}</div>
                    
                    <button 
                        onClick={() => pointsLeft === 0 && setSetupStage('IDOL')} 
                        disabled={pointsLeft > 0} 
                        className={`w-full py-6 rounded-[2.5rem] font-black shadow-xl text-xl tracking-widest transition-all ${pointsLeft === 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                        开启追星之路
                    </button>
                </div>
            </div>
        );
    }

    if (setupStage === 'IDOL') {
        return (
            <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center p-8 text-center">
                <GlobalStyles />
                <h2 className="text-3xl font-black text-pink-500 mb-2 tracking-tighter">守护你的天命之子</h2>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mb-12 italic">Choose Your Ultimate Bias</p>
                
                <div className="w-full max-w-md space-y-5 mb-12 max-h-[65vh] overflow-y-auto scrollbar-hide px-3">
                    {PRESET_IDOLS.map((idol) => (
                        <div 
                            key={idol.id} 
                            onClick={() => setGameState(p => ({...p, pushedIdols: [idol]}))} 
                            className={`glass-card p-6 rounded-[3rem] flex items-center gap-6 cursor-pointer transition-all border-4 relative overflow-hidden group ${gameState.pushedIdols[0]?.id === idol.id ? 'border-pink-300 scale-[1.03] bg-pink-50/40' : 'border-white opacity-85 hover:opacity-100'}`}
                        >
                            {gameState.pushedIdols[0]?.id === idol.id && (
                                <div className="absolute top-4 right-6 text-pink-400 animate-bounce">
                                    <CheckBadgeIcon className="w-8 h-8" />
                                </div>
                            )}
                            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-md flex-shrink-0 bg-white">
                                <SmartImage 
                                    src={idol.avatarUrl} 
                                    alt={idol.name} 
                                    themeColor={idol.color}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                            </div>
                            <div className="text-left flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-black text-slate-700 text-xl">{idol.name}</h3>
                                    <span 
                                        className="text-[9px] px-3 py-1 rounded-full font-black text-white shadow-sm"
                                        style={{ backgroundColor: idol.color }}
                                    >
                                        {idol.styleTag}
                                    </span>
                                </div>
                                <p className="text-[12px] text-slate-400 font-bold leading-snug line-clamp-2">{idol.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={() => gameState.pushedIdols.length > 0 && setSetupStage('GAME')} 
                    className={`w-full max-w-md py-6 rounded-[2.5rem] font-black shadow-2xl text-xl tracking-widest ${gameState.pushedIdols.length > 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                    就是她了，一生推！
                </button>
            </div>
        );
    }

    const mainIdol = gameState.pushedIdols[0];

    return (
        <div className="min-h-screen bg-gradient-soft flex flex-col max-w-md mx-auto relative border-x-[6px] border-white shadow-2xl font-sans text-slate-600 overflow-hidden">
            <GlobalStyles />
            <header className="bg-white/95 p-6 flex items-center justify-between sticky top-0 z-30 border-b-2 border-pink-50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black border-2 border-white shadow-sm"
                        style={{ backgroundColor: mainIdol.color }}
                    >
                        {playerName[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pusher ID</div>
                        <div className="text-sm font-black text-slate-700">{playerName || '新晋粉丝'}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Balance</div>
                    <div className="font-black text-emerald-500 text-xl">¥{gameState.money}</div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-8 overflow-y-auto scrollbar-hide">
                <div className="glass-card p-7 rounded-[3rem] mb-10 text-center italic font-bold min-h-[140px] flex items-center justify-center text-[15px] leading-relaxed relative overflow-hidden">
                    <div className="absolute top-2 left-4 text-4xl opacity-10 select-none font-serif">“</div>
                    <span className="relative z-10">{gameState.lastLog}</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="relative w-full aspect-[3/4] bg-white rounded-[4rem] p-5 shadow-2xl border-[15px] border-white animate-floating overflow-hidden">
                        <SmartImage 
                            src={mainIdol.avatarUrl} 
                            alt={mainIdol.name} 
                            themeColor={mainIdol.color}
                            className="w-full h-full object-cover rounded-[3rem]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute bottom-10 left-10 right-10 bg-white/95 p-6 rounded-[2.5rem] border border-pink-50 shadow-2xl backdrop-blur-sm">
                            <h2 className="text-2xl font-black text-slate-800 mb-1">{mainIdol.name}</h2>
                            <div className="flex items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><HeartIcon className="w-4 h-4" style={{color: mainIdol.color}}/> 亲密度 {mainIdol.love}</span>
                                <span className="flex items-center gap-1.5"><MusicalNoteIcon className="w-4 h-4 text-blue-300"/> {gameState.cyclePhase === 'WEEKDAY' ? '平日应援' : '现场祭典'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {gameState.turnState === 'RESULT' && (
                    <button onClick={handleNextPhase} className="mt-10 py-6 bg-pink-400 text-white rounded-full font-black text-sm shadow-xl hover:bg-pink-500 transition-all animate-bounce tracking-widest uppercase">
                        Next Turn ✨ 继续奋斗
                    </button>
                )}
            </main>

            {gameState.turnState === 'DECISION' && (
                <div className="bg-white/98 p-10 rounded-t-[5rem] border-t-2 border-pink-50 z-20 grid grid-cols-2 gap-8 shadow-[0_-25px_60px_rgba(255,182,193,0.15)] animate-in slide-in-from-bottom duration-500">
                    {gameState.cyclePhase === 'WEEKDAY' ? (
                        <>
                            <button onClick={handleWork} className="group p-8 rounded-[3.5rem] bg-emerald-50/40 border-2 border-emerald-50 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex flex-col items-center gap-5">
                                <div className="p-5 bg-white rounded-3xl shadow-md group-hover:scale-110 transition-all"><BriefcaseIcon className="w-10 h-10 text-emerald-400" /></div>
                                <span className="text-sm font-black text-emerald-600 tracking-widest">搬砖攒米</span>
                            </button>
                            <button onClick={handleInternet} className="group p-8 rounded-[3.5rem] bg-sky-50/40 border-2 border-sky-50 hover:border-sky-200 hover:bg-sky-50 transition-all flex flex-col items-center gap-5">
                                <div className="p-5 bg-white rounded-3xl shadow-md group-hover:scale-110 transition-all"><SparklesIcon className="w-10 h-10 text-sky-400" /></div>
                                <span className="text-sm font-black text-sky-600 tracking-widest">刷推充电</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={handleLive} className={`col-span-2 p-10 rounded-[4rem] border-2 flex items-center justify-between group transition-all ${gameState.money >= 800 ? 'border-pink-100 bg-white hover:bg-pink-50 shadow-xl' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`}>
                            <div className="flex items-center gap-8 text-left pl-2">
                                <div className="p-6 bg-pink-100 rounded-3xl shadow-sm group-hover:rotate-12 transition-all"><CameraIcon className="w-10 h-10 text-pink-500" /></div>
                                <div>
                                    <div className="font-black text-slate-700 text-2xl tracking-tighter">前往 Live 现场</div>
                                    <div className="text-[10px] text-pink-300 font-black tracking-[0.3em] uppercase">Ready to get hyped</div>
                                </div>
                            </div>
                            <div className="font-black text-pink-500 bg-white px-6 py-3 rounded-full border-2 border-pink-50 shadow-md">-¥800</div>
                        </button>
                    )}
                </div>
            )}

            {gameState.turnState === 'LIVE_INTERACTION' && (
                <div className="absolute inset-0 z-50 bg-white/98 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="w-full max-w-sm glass-card p-14 rounded-[5rem] shadow-2xl relative border-4 border-white text-center">
                        <div className="w-20 h-20 bg-pink-50 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-sm">
                            <CameraIcon className="w-10 h-10 text-pink-400" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-2">特典会预约</h3>
                        <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mb-12 italic">Capture the magic (¥200/ea)</p>
                        
                        <div className="bg-white p-8 rounded-[3.5rem] border-2 border-pink-50 mb-12 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-6 text-left">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-50">
                                    <SmartImage 
                                        src={mainIdol.avatarUrl} 
                                        alt={mainIdol.name} 
                                        themeColor={mainIdol.color}
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div>
                                    <span className="text-xl font-black text-slate-700 block">{mainIdol.name}</span>
                                    <span className="text-[10px] font-bold text-pink-300">拍立得卷</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-7">
                                <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: Math.max(0, (c[mainIdol.id]||0) - 1)}))} className="text-pink-200 text-4xl font-black hover:text-pink-400 transition-colors">－</button>
                                <span className="text-3xl font-black text-pink-500 w-8">{chekiCounts[mainIdol.id] || 0}</span>
                                <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: (c[mainIdol.id]||0) + 1}))} className="text-pink-400 text-4xl font-black hover:text-pink-600 transition-colors">＋</button>
                            </div>
                        </div>
                        
                        <button onClick={startChekiSession} className="w-full py-7 rounded-[3rem] font-black shadow-2xl text-xl btn-sweet tracking-[0.2em] flex items-center justify-center gap-4">
                            确认预约
                        </button>
                        <p className="mt-8 text-[11px] font-bold text-slate-300">剩余金钱: ¥{gameState.money}</p>
                    </div>
                </div>
            )}

            {(gameState.turnState === 'REVEAL' && currentCheki) || (gameState.turnState === 'REVEAL' && chekiQueue.length > 0 && !currentCheki) ? (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-white/99" onClick={() => !currentCheki && revealNext()}>
                    {!currentCheki ? (
                        <div className="text-center animate-floating">
                            <div className="w-24 h-24 bg-pink-100 rounded-[2rem] mx-auto mb-8 flex items-center justify-center border-4 border-white animate-pulse">
                                <MusicalNoteIcon className="w-10 h-10 text-pink-400" />
                            </div>
                            <div className="text-pink-400 font-black text-2xl tracking-[0.3em] uppercase italic">Developing...</div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={revealNext}>
                            <div className="relative bg-white p-6 pb-28 shadow-[0_30px_90px_rgba(0,0,0,0.1)] max-w-[360px] w-full rounded-sm border border-slate-100 animate-in zoom-in duration-700" style={{ transform: `rotate(${currentCheki.rotation}deg)` }}>
                                <div className="aspect-[3/4] w-full bg-slate-900 overflow-hidden relative border-2 border-slate-50">
                                    <SmartImage 
                                        src={currentCheki.imageUrl} 
                                        alt="Cheki" 
                                        themeColor={currentCheki.idol.color}
                                        className="w-full h-full object-cover" 
                                        isDeveloping={true}
                                    />
                                    {/* 显影反光特效 */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                </div>
                                
                                <div className="absolute bottom-6 left-0 right-0 px-8">
                                    <div 
                                        className="text-[16px] font-black scribble-font leading-relaxed text-center whitespace-pre-wrap bg-opacity-5 p-6 rounded-3xl border border-dashed italic shadow-inner"
                                        style={{ color: currentCheki.idol.color, borderColor: `${currentCheki.idol.color}30`, backgroundColor: `${currentCheki.idol.color}10` }}
                                    >
                                        {currentCheki.dialogue}
                                    </div>
                                    <div className="mt-4 text-[9px] font-black text-slate-300 text-right tracking-widest uppercase opacity-50">
                                        {currentCheki.date} · {currentCheki.idol.name}
                                    </div>
                                </div>
                                
                                {currentCheki.decorations.map((deco, idx) => (
                                    <div 
                                        key={idx} 
                                        className="absolute text-5xl pointer-events-none drop-shadow-md select-none" 
                                        style={{ 
                                            left: `${deco.left}%`, 
                                            top: `${deco.top}%`, 
                                            transform: `rotate(${deco.rotate}deg) scale(${deco.scale})`, 
                                            zIndex: 50 
                                        }}
                                    >
                                        {deco.emoji}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-12 text-slate-300 font-black text-[12px] tracking-[0.4em] uppercase animate-pulse">Tap to view next ✨</p>
                        </div>
                    )}
                </div>
            ) : null}

            {gameState.turnState === 'REPORT' && (
                <div className="absolute inset-0 z-[90] bg-white flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
                    <div className="glass-card p-14 rounded-[5rem] shadow-2xl w-full border-4 border-pink-50 relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-pink-50">
                            <HeartIcon className="w-10 h-10 text-pink-400" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-14 tracking-tighter">本周应援周报</h2>
                        
                        <div className="space-y-8 mb-14">
                            <div className="bg-gradient-to-br from-pink-400 to-pink-300 p-10 rounded-[4rem] text-white shadow-xl transform hover:scale-105 transition-all">
                                <div className="text-xs font-black opacity-80 mb-2 uppercase tracking-[0.3em]">羁绊值提升</div>
                                <div className="text-6xl font-black">+{gameState.weeklyStats.loveGained}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 text-left px-2">
                                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">搬砖收入</div>
                                    <div className="text-lg font-black text-emerald-500">¥{gameState.weeklyStats.moneyEarned}</div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">推活支出</div>
                                    <div className="text-lg font-black text-pink-500">¥{gameState.weeklyStats.moneySpent}</div>
                                </div>
                            </div>
                        </div>
                        
                        <button onClick={startNewWeek} className="w-full btn-sweet py-7 rounded-[3rem] font-black shadow-2xl text-xl tracking-[0.2em] hover:scale-105 active:scale-95">
                            开启下一周 ✨
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
