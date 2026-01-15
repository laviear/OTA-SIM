import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  BriefcaseIcon, 
  HeartIcon, 
  SparklesIcon, 
  CameraIcon,
  ChatBubbleLeftRightIcon,
  MusicalNoteIcon,
  FaceSmileIcon
} from '@heroicons/react/24/solid';
import { GameState, Idol, Cheki, SetupStage, AttrState } from './types';

// =====================================================================================
// 🎨 视觉风格配置 (清新/马卡龙/甜美)
// =====================================================================================

const GlobalStyles = () => (
  <style>{`
    /* 基础重置 */
    body { background: #fffcfd; color: #4a5568; }

    /* 极简清新背景 */
    .bg-gradient-soft {
        background: linear-gradient(135deg, #fff5f7 0%, #f0f7ff 100%);
    }

    /* 马卡龙玻璃卡片 */
    .glass-card { 
        background: rgba(255, 255, 255, 0.85); 
        backdrop-filter: blur(10px); 
        border: 2px solid #ffffff;
        box-shadow: 0 10px 25px rgba(255, 182, 193, 0.15);
    }

    /* 甜蜜气泡按钮 */
    .btn-sweet {
        background: #ff9fb2;
        color: white;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-bottom: 4px solid #f48a9f;
    }
    .btn-sweet:active {
        transform: translateY(2px);
        border-bottom-width: 2px;
    }

    /* 浮动动画 */
    @keyframes floating {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    .animate-floating { animation: floating 3s ease-in-out infinite; }

    /* 文字渲染优化 */
    .scribble-font {
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
        font-weight: 700;
    }

    /* 拍立得显影光效 */
    .shimmer-light {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
    }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
  `}</style>
);

// =====================================================================================
// 🛠️ 静态资源 & 恋爱台词
// =====================================================================================

// 优化图片生成链接，确保稳定显示
const getStableImageUrl = (prompt: string, seed: number) => {
    const encoded = encodeURIComponent(`(anime art style:1.3), high quality, vibrant colors, soft lighting, ${prompt}, solo, masterpiece`);
    return `https://image.pollinations.ai/prompt/${encoded}?width=400&height=500&nologo=true&seed=${seed}&model=flux`;
};

const STICKERS = ['🎀', '💘', '✨', '🌸', '🍭', '🧸', '🍓', '💌', '🐾', '🎈', '🍦', '🍰'];

const PRESET_IDOLS: Idol[] = [
    {
        id: 'idol_sweet',
        name: '桃乃 爱莉',
        color: '#ff85a1',
        styleTag: '王道甜美',
        description: '永远带着笑容的女孩。只要和你眼神对上，她就会露出最甜的酒窝。',
        dialogues: [
            "那个...刚才在台上，我的视线一直跟着你走哦。",
            "和你在一起的时候，总觉得空气都是甜甜的呢~",
            "这是给你的特别奖励，不许告诉别人哦？",
            "嘿嘿，只要你在，我就是世界上最幸福的偶像！",
            "最喜欢你啦！下次还要来哦！"
        ],
        love: 10,
        avatarUrl: getStableImageUrl("cute anime girl, pink hair, twin tails, idol costume, happy smile, sparkling eyes", 888),
        chekiUrls: [
             getStableImageUrl("anime girl, pink hair, blowing a kiss, selfie, close up", 88801),
             getStableImageUrl("anime girl, pink hair, holding a heart sign, blushing, close up", 88802),
             getStableImageUrl("anime girl, pink hair, winking, peace sign, cute", 88803),
        ]
    },
    {
        id: 'idol_cool',
        name: '苍井 诗织',
        color: '#60a5fa',
        styleTag: '冷娇才女',
        description: '外表高冷但内心温柔。只有在写给你的歌词里，才藏着她羞涩的告白。',
        dialogues: [
            "虽然我不太擅长说话...但请一直看着我，好吗？",
            "这首歌的灵感是你。虽然听起来很肉麻，但...是真心话。",
            "总觉得，只有你才能看到我真正的样子。",
            "你的存在，对我来说已经像空气一样不可或缺了。",
            "……笨蛋，我也想你了。"
        ],
        love: 5,
        avatarUrl: getStableImageUrl("anime girl, blue short hair, cool gaze, beautiful violin girl, white dress", 999),
        chekiUrls: [
            getStableImageUrl("anime girl, blue hair, shy smile, looking away, close up", 99901),
            getStableImageUrl("anime girl, blue hair, holding a flower, gentle look, close up", 99902),
            getStableImageUrl("anime girl, blue hair, adjusting glasses, cute embarrassment, close up", 99903),
        ]
    },
    {
        id: 'idol_genki',
        name: '夏目 阳葵',
        color: '#fbbf24',
        styleTag: '活力满分',
        description: '笑容极具感染力的女孩。她会拉着你的手，带你奔向每一个充满光的明天。',
        dialogues: [
            "最喜欢你为我应援的声音了！全世界第一响亮！",
            "呐呐，下次约会去海边吧？我想和你一起吹吹风~",
            "被你夸奖的话，感觉能量瞬间充满了！",
            "不管发生什么，阳葵都会一直守护你的笑容哦！",
            "来击个掌吧！嘿嘿，最喜欢你啦！"
        ],
        love: 8,
        avatarUrl: getStableImageUrl("anime girl, orange short hair, high ponytail, energetic pose, sunny background", 777),
        chekiUrls: [
            getStableImageUrl("anime girl, orange hair, laughing, showing teeth, cute", 77701),
            getStableImageUrl("anime girl, orange hair, peace sign near eye, winking", 77702),
            getStableImageUrl("anime girl, orange hair, messy hair, cute tired face, close up", 77703),
        ]
    }
];

// =====================================================================================
// 🎮 逻辑层
// =====================================================================================

const App: React.FC = () => {
    // 初始状态
    const [setupStage, setSetupStage] = useState<SetupStage>('ATTR'); 
    const [pointsLeft, setPointsLeft] = useState(10); // 10点总数
    const [attr, setAttr] = useState<AttrState>({ looks: 0, wealth: 0, sanity: 0 }); // 初始0
    const [playerName, setPlayerName] = useState('');
    
    const [gameState, setGameState] = useState<GameState>({
        money: 3000,
        san: 100,
        week: 1,
        cyclePhase: 'WEEKDAY',
        turnState: 'DECISION',
        lastLog: "新的一周开始了，阳光正好。\n今天也要为了梦想努力！",
        pushedIdols: [], 
        weeklyStats: { moneyEarned: 0, moneySpent: 0, sanLost: 0, loveGained: 0 }
    });

    const [chekiQueue, setChekiQueue] = useState<Cheki[]>([]);
    const [currentCheki, setCurrentCheki] = useState<Cheki | null>(null);
    const [chekiCounts, setChekiCounts] = useState<Record<string, number>>({});
    const [aiThinking, setAiThinking] = useState(false);

    // AI 周报生成 (极速版：简化 prompt 减少延迟)
    const generateWeeklyDiary = async () => {
      setAiThinking(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const idol = gameState.pushedIdols[0];
        // 简化 prompt，移除多余要求
        const prompt = `以地下偶像粉丝视角写一句周记(20字内)。推：${idol?.name}。状态：甜蜜。`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        return response.text || "看到她的笑容，我也获得了力量。";
      } catch (e) {
        return "不管生活多难，只要看到她的笑容，一切烦恼都烟消云散了。";
      } finally {
        setAiThinking(false);
      }
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

    const startGame = () => {
        if (gameState.pushedIdols.length === 0) return;
        setPlayerName(playerName.trim() || '阿宅');
        setSetupStage('GAME');
    };

    const handleWork = () => {
        const wage = 1000 + (attr.wealth * 300);
        const loss = Math.max(10, 25 - (attr.sanity * 2));
        setGameState(prev => ({
            ...prev,
            money: prev.money + wage,
            san: Math.max(0, prev.san - loss),
            turnState: 'RESULT',
            lastLog: `为了给她买更多周边，今天也加油搬砖了！\n(体力 -${loss}, 钱包 +¥${wage})`,
            weeklyStats: { ...prev.weeklyStats, moneyEarned: prev.weeklyStats.moneyEarned + wage, sanLost: prev.weeklyStats.sanLost + loss }
        }));
    };

    const handleInternet = () => {
        const gain = 20 + (attr.sanity * 3);
        setGameState(prev => ({
            ...prev,
            san: Math.min(100, prev.san + gain),
            turnState: 'RESULT',
            lastLog: `在家里刷了一整天 ${gameState.pushedIdols[0].name} 的视频，HP全满了！\n(精神值 +${gain})`,
            weeklyStats: { ...prev.weeklyStats, sanLost: prev.weeklyStats.sanLost - gain }
        }));
    };

    const handleLive = () => {
        if (gameState.money < 500) return;
        setGameState(prev => ({
            ...prev,
            money: prev.money - 500,
            turnState: 'LIVE_INTERACTION',
            lastLog: `LIVE现场的热度太棒了！她在舞台上闪闪发光的样子，我也想拼命为她应援！`,
            weeklyStats: { ...prev.weeklyStats, moneySpent: prev.weeklyStats.moneySpent + 500 }
        }));
    };

    const startChekiSession = () => {
        const idol = gameState.pushedIdols[0];
        const count = chekiCounts[idol.id] || 0;
        if (count === 0) {
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "虽然没拍合照，但能看到她的笑容就很满足了。" }));
            return;
        }

        const totalCost = count * 200;
        if (gameState.money < totalCost) return;

        const newQueue: Cheki[] = [];
        for (let i = 0; i < count; i++) {
            const dialogue = idol.dialogues[Math.floor(Math.random() * idol.dialogues.length)];
            const img = idol.chekiUrls[Math.floor(Math.random() * idol.chekiUrls.length)];
            newQueue.push({
                id: Math.random(),
                idol: idol,
                imageUrl: img,
                dialogue: dialogue,
                date: `W${gameState.week}.Love`,
                decorations: Array.from({length: 3}).map(() => ({
                    emoji: STICKERS[Math.floor(Math.random() * STICKERS.length)],
                    left: Math.random() * 70 + 10,
                    top: Math.random() * 70 + 10,
                    rotate: Math.random() * 60 - 30,
                    scale: 1.2
                })),
                rotation: Math.random() * 10 - 5
            });
        }

        setGameState(prev => ({
            ...prev,
            money: prev.money - totalCost,
            turnState: 'REVEAL',
            weeklyStats: { ...prev.weeklyStats, moneySpent: prev.weeklyStats.moneySpent + totalCost, loveGained: prev.weeklyStats.loveGained + (count * 20) }
        }));
        setChekiQueue(newQueue);
        setChekiCounts({});
    };

    const revealNext = () => {
        if (chekiQueue.length > 0) {
            const [next, ...rest] = chekiQueue;
            setCurrentCheki(next);
            setChekiQueue(rest);
        } else {
            setCurrentCheki(null);
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "每一张拍立得，都是只属于我们的宝物..." }));
        }
    };

    const handleNextPhase = async () => {
        if (gameState.cyclePhase === 'WEEKEND') {
            const diary = await generateWeeklyDiary();
            setGameState(prev => ({ ...prev, turnState: 'REPORT', lastLog: diary }));
        } else {
            setGameState(prev => ({ ...prev, cyclePhase: 'WEEKEND', turnState: 'DECISION', lastLog: "周末来了，LIVE现场见！" }));
        }
    };

    const startNewWeek = () => {
        setGameState(prev => ({
            ...prev,
            week: prev.week + 1,
            cyclePhase: 'WEEKDAY',
            turnState: 'DECISION',
            lastLog: `第 ${prev.week + 1} 周，向着幸福出发！`,
            weeklyStats: { moneyEarned: 0, moneySpent: 0, sanLost: 0, loveGained: 0 }
        }));
    };

    // =================================================================================
    // 🖥️ UI 渲染
    // =================================================================================

    if (setupStage === 'ATTR') {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6 font-sans">
                <GlobalStyles />
                <div className="w-full max-w-sm glass-card rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-500">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-pink-100 rounded-3xl mx-auto mb-4 flex items-center justify-center animate-floating shadow-sm">
                            <HeartIcon className="w-8 h-8 text-pink-400" />
                        </div>
                        <h1 className="text-3xl font-black text-pink-500 tracking-tight">阿宅觉醒</h1>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">IDOL FAN STARTUP</p>
                    </div>

                    <div className="mb-8">
                        <input 
                            type="text" 
                            placeholder="给你的角色起个名字..." 
                            value={playerName} 
                            onChange={(e) => setPlayerName(e.target.value)} 
                            className="w-full bg-white/50 border-2 border-pink-50 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:border-pink-200 transition-all placeholder:text-slate-300 font-bold"
                        />
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center bg-pink-50/50 px-5 py-3 rounded-2xl border border-pink-100/50">
                            <span className="text-sm font-black text-pink-400">可用点数</span>
                            <span className="text-xl font-black text-pink-500">{pointsLeft}</span>
                        </div>
                        
                        {[
                            {k:'looks', l:'外貌', d:'现场互动的魅力'}, 
                            {k:'wealth', l:'财力', d:'打工收益加成'}, 
                            {k:'sanity', l:'精神', d:'工作压力抗性'}
                        ].map(item => (
                            <div key={item.k} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="text-sm font-black text-slate-600">{item.l}</div>
                                    <div className="text-[10px] text-slate-400">{item.d}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => modifyAttr(item.k as keyof AttrState, -1)} className="w-8 h-8 rounded-full bg-white border border-pink-100 text-pink-300 font-black hover:bg-pink-50">-</button>
                                    <span className="w-4 text-center font-black text-slate-700">{attr[item.k as keyof AttrState]}</span>
                                    <button onClick={() => modifyAttr(item.k as keyof AttrState, 1)} className="w-8 h-8 rounded-full bg-white border border-pink-100 text-pink-400 font-black hover:bg-pink-50">+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => pointsLeft === 0 && setSetupStage('IDOL')} 
                        disabled={pointsLeft > 0}
                        className={`w-full py-5 rounded-[1.5rem] font-black tracking-widest uppercase transition-all shadow-lg ${pointsLeft === 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 border-b-4 border-slate-200 cursor-not-allowed'}`}
                    >
                        开启追星之旅
                    </button>
                </div>
            </div>
        );
    }

    if (setupStage === 'IDOL') {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6">
                <GlobalStyles />
                <div className="w-full max-w-md">
                    <h2 className="text-center mb-8 text-2xl font-black text-pink-500">选择要守护的偶像 ✨</h2>
                    <div className="space-y-6 mb-8">
                        {PRESET_IDOLS.map((idol) => {
                            const isSelected = gameState.pushedIdols.find(i => i.id === idol.id);
                            return (
                                <div 
                                    key={idol.id} 
                                    onClick={() => setGameState(p => ({...p, pushedIdols: [idol]}))} 
                                    className={`glass-card p-5 rounded-[2rem] flex items-center gap-5 cursor-pointer transition-all border-4 ${isSelected ? 'border-pink-300 bg-pink-50/50 scale-[1.02]' : 'border-white opacity-80 hover:opacity-100'}`}
                                >
                                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-white flex-shrink-0">
                                        <img src={idol.avatarUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-700 text-lg">{idol.name}</h3>
                                            <span className="text-[9px] px-2 py-0.5 bg-pink-100 text-pink-500 rounded-full font-bold">{idol.styleTag}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-tight">{idol.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button 
                        onClick={startGame} 
                        className={`w-full py-5 rounded-[1.5rem] font-black tracking-widest uppercase transition-all shadow-lg ${gameState.pushedIdols.length > 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 border-b-4 border-slate-200 cursor-not-allowed'}`}
                    >
                        就决定是你了！
                    </button>
                </div>
            </div>
        );
    }

    const mainIdol = gameState.pushedIdols[0];
    
    return (
        <div className="min-h-screen bg-gradient-soft flex flex-col max-w-md mx-auto relative border-x border-white shadow-2xl font-sans text-slate-600">
            <GlobalStyles />
            
            {/* 顶栏 */}
            <header className="bg-white/80 backdrop-blur-md p-5 flex items-center justify-between sticky top-0 z-30 border-b border-pink-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 font-black shadow-inner">
                        {playerName[0]}
                    </div>
                    <div>
                        <div className="text-[10px] text-pink-300 font-bold uppercase">Producers</div>
                        <div className="text-sm font-black text-slate-700">{playerName}</div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Funds</div>
                        <div className="font-black text-emerald-400">¥{gameState.money}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Week</div>
                        <div className="font-black text-pink-400">{gameState.week}</div>
                    </div>
                </div>
            </header>

            {/* 内容区 */}
            <main className="flex-1 flex flex-col p-6">
                <div className="glass-card p-5 rounded-3xl mb-6 relative overflow-hidden min-h-[90px] flex items-center justify-center text-center">
                    <div className="shimmer-light absolute inset-0 opacity-10 pointer-events-none"></div>
                    <div className="text-sm font-bold text-slate-500 italic leading-relaxed">
                        {aiThinking ? <span className="animate-pulse text-pink-400">正在回味我们的点滴...</span> : `"${gameState.lastLog}"`}
                    </div>
                </div>

                {gameState.turnState === 'RESULT' && (
                    <button onClick={handleNextPhase} className="self-center mb-6 px-10 py-2 bg-pink-400 text-white rounded-full font-black text-xs shadow-md hover:bg-pink-500 transition-all animate-bounce">
                        继续前进 ✨
                    </button>
                )}

                <div className="flex-1 flex flex-col items-center justify-center py-4">
                    <div className="relative w-full aspect-[4/5] max-h-[45vh] bg-white rounded-[2.5rem] p-3 shadow-2xl border-8 border-white animate-floating overflow-hidden">
                        <img src={mainIdol.avatarUrl} className="w-full h-full object-cover rounded-[2rem]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-50/30 to-transparent"></div>
                        
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/90 p-4 rounded-3xl border border-pink-50 shadow-sm">
                                <h2 className="text-xl font-black text-pink-500 mb-1">{mainIdol.name}</h2>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1"><HeartIcon className="w-3 h-3 text-pink-300"/> 好感 {mainIdol.love}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    <span className="flex items-center gap-1"><MusicalNoteIcon className="w-3 h-3 text-blue-300"/> {gameState.cyclePhase === 'WEEKDAY' ? '平日应援' : '现场狂欢'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 操作板 */}
            {gameState.turnState === 'DECISION' && (
                <div className="bg-white/90 backdrop-blur p-8 rounded-t-[3rem] shadow-[0_-15px_40px_rgba(255,182,193,0.1)] border-t border-pink-50 z-20">
                    <div className="grid grid-cols-2 gap-5">
                        {gameState.cyclePhase === 'WEEKDAY' ? (
                            <>
                                <button onClick={handleWork} className="group p-5 rounded-3xl bg-emerald-50/50 border-2 border-transparent hover:border-emerald-100 transition-all flex flex-col items-center gap-3">
                                    <div className="p-3 bg-white rounded-2xl group-hover:scale-110 transition-transform shadow-sm"><BriefcaseIcon className="w-7 h-7 text-emerald-400" /></div>
                                    <span className="text-sm font-black text-emerald-600">搬砖赚钱</span>
                                </button>
                                <button onClick={handleInternet} className="group p-5 rounded-3xl bg-sky-50/50 border-2 border-transparent hover:border-sky-100 transition-all flex flex-col items-center gap-3">
                                    <div className="p-3 bg-white rounded-2xl group-hover:scale-110 transition-transform shadow-sm"><SparklesIcon className="w-7 h-7 text-sky-400" /></div>
                                    <span className="text-sm font-black text-sky-600">云推治愈</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLive} className={`col-span-2 p-6 rounded-3xl border-2 flex items-center justify-between group shadow-sm transition-all ${gameState.money >= 500 ? 'border-pink-100 bg-white hover:bg-pink-50' : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'}`}>
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-pink-100 rounded-2xl"><CameraIcon className="w-7 h-7 text-pink-500" /></div>
                                        <div className="text-left">
                                            <div className="font-black text-slate-700 text-lg">奔向 LIVE 现场</div>
                                            <div className="text-xs text-pink-300 font-bold">她正在舞台上等你 ✨</div>
                                        </div>
                                    </div>
                                    <div className="font-black text-pink-500 bg-white px-3 py-1 rounded-full border border-pink-100 shadow-sm">-¥500</div>
                                </button>
                                <button onClick={() => setGameState(p => ({...p, turnState:'RESULT', lastLog:"今天就在家里静静地听她的歌，享受片刻宁静。"}))} className="col-span-2 py-4 text-slate-300 text-[10px] font-black tracking-widest uppercase hover:text-pink-300 transition-colors">
                                    宅家休息
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 物贩环节 (特典) */}
            {gameState.turnState === 'LIVE_INTERACTION' && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center p-8">
                    <div className="w-full glass-card p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-4 border-white">
                        <div className="h-1.5 w-full absolute top-0 left-0 bg-pink-300"></div>
                        <h3 className="text-center font-black text-2xl mb-2 text-pink-500 tracking-tight">特典时刻</h3>
                        <p className="text-center text-slate-400 text-[10px] mb-8 font-bold">每一张拍立得都是心跳的回忆 (¥200)</p>
                        
                        <div className="bg-white/60 p-5 rounded-3xl border border-pink-50 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={mainIdol.avatarUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                                    <span className="font-black text-slate-700">{mainIdol.name}</span>
                                </div>
                                <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-2 shadow-inner border border-pink-50">
                                    <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: Math.max(0, (c[mainIdol.id]||0) - 1)}))} className="text-pink-300 hover:text-pink-500 font-black text-2xl">－</button>
                                    <span className="w-6 text-center font-black text-pink-500 text-lg">{chekiCounts[mainIdol.id] || 0}</span>
                                    <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: (c[mainIdol.id]||0) + 1}))} className="text-pink-400 hover:text-pink-600 font-black text-2xl">＋</button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-8 px-5">
                            <span className="text-sm text-slate-400 font-black">预计消费</span>
                            <span className="text-3xl font-black text-pink-500">¥{Object.keys(chekiCounts).reduce((sum, key) => sum + (chekiCounts[key] || 0), 0) * 200}</span>
                        </div>

                        <button onClick={startChekiSession} className="w-full btn-sweet py-5 rounded-3xl font-black shadow-lg text-lg tracking-widest">
                            预约合照
                        </button>
                    </div>
                </div>
            )}

            {/* 拍立得显影 (显像中) */}
            {(gameState.turnState === 'REVEAL' && currentCheki) || (gameState.turnState === 'REVEAL' && chekiQueue.length > 0 && !currentCheki) ? (
                <div 
                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-6 cursor-pointer" 
                    style={{ background: 'rgba(255, 248, 250, 0.98)' }}
                    onClick={() => !currentCheki && revealNext()}
                >
                    {!currentCheki ? (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm animate-floating">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-pink-400" />
                            </div>
                            <h4 className="text-pink-500 text-2xl font-black tracking-tight mb-2">正在冲印甜蜜时刻...</h4>
                            <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Memories are blooming</p>
                            <div className="mt-12 text-pink-200 text-xs font-bold animate-pulse">点击屏幕继续</div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={revealNext}>
                            <div 
                                className="relative bg-white p-5 pb-20 shadow-2xl rounded-sm animate-in zoom-in duration-500"
                                style={{ transform: `rotate(${currentCheki.rotation}deg)` }}
                            >
                                <div className="aspect-[3/4] w-[280px] bg-slate-100 overflow-hidden relative border-2 border-slate-50 rounded-sm">
                                    <img src={currentCheki.imageUrl} className="w-full h-full object-cover saturate-125" />
                                    <div className="absolute inset-0 bg-pink-400/5 mix-blend-overlay"></div>
                                </div>

                                <div className="absolute bottom-6 left-0 right-0 px-8">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] text-pink-200 font-bold scribble-font">{currentCheki.date}</span>
                                        <HeartIcon className="w-5 h-5 text-pink-300" />
                                    </div>
                                    <p className="text-xl text-pink-500 font-black scribble-font leading-tight text-center tracking-tight">
                                        {currentCheki.dialogue}
                                    </p>
                                </div>

                                {currentCheki.decorations.map((deco, idx) => (
                                    <div key={idx} className="absolute text-4xl select-none" style={{ left: `${deco.left}%`, top: `${deco.top}%`, transform: `rotate(${deco.rotate}deg) scale(${deco.scale})`, zIndex: 50 }}>
                                        {deco.emoji}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 text-pink-400 font-black tracking-[0.3em] uppercase animate-pulse">心动瞬间 ✨</div>
                        </div>
                    )}
                </div>
            ) : null}

            {/* 周报 (结算) */}
            {gameState.turnState === 'REPORT' && (
                <div className="absolute inset-0 z-[90] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="w-full glass-card p-10 rounded-[3rem] shadow-2xl relative border-4 border-pink-50">
                        <div className="w-20 h-2 bg-pink-100 mx-auto mb-10 rounded-full"></div>
                        <h2 className="text-3xl font-black text-slate-700 mb-10 text-center tracking-tight">第 {gameState.week} 周总结</h2>
                        
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-pink-400 to-pink-300 p-6 rounded-[2rem] text-white shadow-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black opacity-90">羁绊等级提升</span>
                                    <span className="text-3xl font-black">+{gameState.weeklyStats.loveGained}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div className="text-center p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">应援支出</div>
                                    <div className="text-pink-500 font-black text-xl">¥{gameState.weeklyStats.moneySpent}</div>
                                </div>
                                <div className="text-center p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">搬砖收益</div>
                                    <div className="text-emerald-500 font-black text-xl">¥{gameState.weeklyStats.moneyEarned}</div>
                                </div>
                            </div>

                            <div className="p-6 bg-pink-50/30 rounded-3xl border-2 border-dashed border-pink-100 text-sm font-bold text-slate-500 italic text-center leading-relaxed">
                                {gameState.lastLog}
                            </div>
                        </div>

                        <button onClick={startNewWeek} className="w-full mt-10 btn-sweet py-5 rounded-3xl font-black shadow-lg text-lg tracking-widest">
                            开启下一周
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;