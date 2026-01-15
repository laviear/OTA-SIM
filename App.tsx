
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
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
// 🎨 视觉风格配置 (马卡龙清甜风格)
// =====================================================================================

const GlobalStyles = () => (
  <style>{`
    body { background: #fffcfd; color: #4a5568; margin: 0; padding: 0; }
    .bg-gradient-soft {
        background: linear-gradient(135deg, #fff5f7 0%, #f0f7ff 100%);
    }
    .glass-card { 
        background: rgba(255, 255, 255, 0.92); 
        backdrop-filter: blur(15px); 
        border: 2px solid #ffffff;
        box-shadow: 0 15px 35px rgba(255, 182, 193, 0.15);
    }
    .btn-sweet {
        background: #ff9fb2;
        color: white;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-bottom: 5px solid #f48a9f;
    }
    .btn-sweet:active {
        transform: translateY(2px);
        border-bottom-width: 2px;
    }
    @keyframes floating {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
    }
    .animate-floating { animation: floating 4s ease-in-out infinite; }
    .scribble-font {
        font-family: 'PingFang SC', 'Microsoft YaHei', cursive, sans-serif;
    }
    .shimmer-light {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
        background-size: 200% 100%;
        animation: shimmer 2.5s infinite;
    }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// =====================================================================================
// 🛠️ 预设数据
// =====================================================================================

const PRESET_IDOLS: Idol[] = [
    {
        id: 'idol_sweet',
        name: '桃乃 爱莉',
        color: '#ff85a1',
        styleTag: '王道甜美',
        description: '永远带着笑容的王道少女。你就是她生命中最重要的那束追光。',
        dialogues: ["爱你哟，最喜欢看你挥舞荧光棒的样子了！"],
        love: 10,
        avatarUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=500&fit=crop',
        chekiUrls: []
    },
    {
        id: 'idol_cool',
        name: '苍井 诗织',
        color: '#60a5fa',
        styleTag: '冷娇才女',
        description: '外表高冷但内心极其依赖你。她总是偷偷在歌词里藏进你的名字。',
        dialogues: ["哼，今天也准时报到了啊？真是个让人操心的粉丝。"],
        love: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1528493366414-23144bee42f5?w=400&h=500&fit=crop',
        chekiUrls: []
    },
    {
        id: 'idol_genki',
        name: '夏目 阳葵',
        color: '#fbbf24',
        styleTag: '活力太阳',
        description: '像太阳一样耀眼的女孩。只要你在台下，她就能跳出最完美的舞步。',
        dialogues: ["哟！今天的应援声超级大哦！阳葵听到了！"],
        love: 8,
        avatarUrl: 'https://images.unsplash.com/photo-1541534741688-6078c65b5a33?w=400&h=500&fit=crop',
        chekiUrls: []
    }
];

const STICKERS = ['🎀', '💘', '✨', '🌸', '🍭', '🧸', '🍓', '💌', '🐾', '🎈', '🍦', '🍰'];

// =====================================================================================
// 🎮 游戏核心逻辑
// =====================================================================================

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

    // =================================================================================
    // 🧠 AI 生成能力 (Nanobanana / Gemini 2.5 Flash Image)
    // =================================================================================

    const generateImage = async (prompt: string): Promise<string> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: `High quality masterpiece anime art, vibrant soft colors, 1girl, close up, ${prompt}, sparkling background, idol concert vibe, polaroid photo style with slight vintage tint` }] },
                config: { imageConfig: { aspectRatio: "3:4" } }
            });
            
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        } catch (error) {
            console.error("Image generation failed:", error);
        }
        return "";
    };

    const generateWeeklyDiary = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const idol = gameState.pushedIdols[0];
            const prompt = `以一名超级迷恋地下偶像${idol.name}的资深阿宅粉丝视角，写一段感人至深的本周感慨。
            本周羁绊提升了${gameState.weeklyStats.loveGained}点。
            要求：语气要极度幸福、带有一点点御宅族特有的感性自白，体现出偶像就是你的生命之光。字数80字左右。`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            return response.text || "只要能看到她的笑容，我的人生就有意义。";
        } catch (e) {
            return "在这个灰色的世界里，只有她是彩色的。";
        } finally {
            setIsGenerating(false);
        }
    };

    const handleWork = () => {
        const wage = 1800 + (attr.wealth * 600);
        const loss = Math.max(8, 28 - (attr.sanity * 4));
        setGameState(prev => ({
            ...prev,
            money: prev.money + wage,
            san: Math.max(0, prev.san - loss),
            turnState: 'RESULT',
            lastLog: `为了给她买最好的花篮，今天我也在疯狂搬砖。虽然腰酸背痛，但一想到她的笑脸，这一切都是值得的！\n(金钱 +¥${wage}, 精神 -${loss})`,
            weeklyStats: { ...prev.weeklyStats, moneyEarned: prev.weeklyStats.moneyEarned + wage, sanLost: prev.weeklyStats.sanLost + loss }
        }));
    };

    const handleInternet = () => {
        const gain = 35 + (attr.sanity * 8);
        setGameState(prev => ({
            ...prev,
            san: Math.min(100, prev.san + gain),
            turnState: 'RESULT',
            lastLog: `在网上反复刷她的直拍，剪辑应援视频。看着满屏的“awsl”，我觉得我整个人都复活了！\n(体力与精神回满 +${gain})`,
            weeklyStats: { ...prev.weeklyStats, sanLost: prev.weeklyStats.sanLost - gain }
        }));
    };

    const handleLive = () => {
        if (gameState.money < 500) return;
        setGameState(prev => ({
            ...prev,
            money: prev.money - 500,
            turnState: 'LIVE_INTERACTION',
            lastLog: "舞台灯光亮起，我撕心裂肺地喊出她的名字，她在聚光灯下对我笑了！她绝对是对我笑了！",
            weeklyStats: { ...prev.weeklyStats, moneySpent: prev.weeklyStats.moneySpent + 500 }
        }));
    };

    const startChekiSession = async () => {
        const idol = gameState.pushedIdols[0];
        const count = chekiCounts[idol.id] || 0;
        if (count === 0) {
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "虽然没钱拍立得，但我会把刚才对视的那一刻永远刻在心里。" }));
            return;
        }

        const totalCost = count * 200;
        if (gameState.money < totalCost) return;

        setIsGenerating(true);
        const newQueue: Cheki[] = [];
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            for (let i = 0; i < count; i++) {
                // 1. 生成超长且动情的寄语
                const dialoguePrompt = `作为地下偶像${idol.name}（性格关键词：${idol.styleTag}），给这位一直支持你的忠实男粉丝写一段极其感性、充满爱意和互动细节的拍立得长篇寄语。
                文字要像那种写满整张照片背面的手写信。感谢他每一次都在第一排喊破嗓子应援，感谢他寄来的那些充满心意的礼物，说一些只有你们粉丝与偶像之间才会有的约定。
                语气要真挚、亲昵，甚至可以带一点点暧昧的撒娇感。
                字数100-150字。`;
                
                const dialogueResponse = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview', 
                    contents: dialoguePrompt,
                });
                
                const chekiDialogue = dialogueResponse.text || "今天也要一直想我哦，你是我的头号粉丝！";
                
                // 2. 生成对应的精美图像 (Nanobanana)
                const imgUrl = await generateImage(`${idol.name} idol, ${idol.styleTag} expression, cute hand pose, making heart sign, winking, soft blush, stage lighting background`);

                newQueue.push({
                    id: Math.random(),
                    idol: idol,
                    imageUrl: imgUrl || idol.avatarUrl,
                    dialogue: chekiDialogue,
                    date: `W${gameState.week}.Sparkling`,
                    decorations: Array.from({length: 5}).map(() => ({
                        emoji: STICKERS[Math.floor(Math.random() * STICKERS.length)],
                        left: Math.random() * 80 + 10,
                        top: Math.random() * 70 + 10,
                        rotate: Math.random() * 90 - 45,
                        scale: 1.3
                    })),
                    rotation: Math.random() * 10 - 5
                });
            }

            setGameState(prev => ({
                ...prev,
                money: prev.money - totalCost,
                turnState: 'REVEAL',
                weeklyStats: { ...prev.weeklyStats, moneySpent: prev.weeklyStats.moneySpent + totalCost, loveGained: prev.weeklyStats.loveGained + (count * 35) }
            }));
            setChekiQueue(newQueue);
            setChekiCounts({});
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const revealNext = () => {
        if (chekiQueue.length > 0) {
            const [next, ...rest] = chekiQueue;
            setCurrentCheki(next);
            setChekiQueue(rest);
        } else {
            setCurrentCheki(null);
            setGameState(prev => ({ ...prev, turnState: 'RESULT', lastLog: "我小心翼翼地把这些带有体温的拍立得放进卡册里。这是我的传家宝。" }));
        }
    };

    const handleNextPhase = async () => {
        if (gameState.cyclePhase === 'WEEKEND') {
            const diary = await generateWeeklyDiary();
            setGameState(prev => ({ ...prev, turnState: 'REPORT', lastLog: diary }));
        } else {
            setGameState(prev => ({ ...prev, cyclePhase: 'WEEKEND', turnState: 'DECISION', lastLog: "周六的大日子终于来了！我已经背好了应援词，荧光棒也充好电了！" }));
        }
    };

    const startNewWeek = () => {
        setGameState(prev => ({
            ...prev,
            week: prev.week + 1,
            cyclePhase: 'WEEKDAY',
            turnState: 'DECISION',
            weeklyStats: { moneyEarned: 0, moneySpent: 0, sanLost: 0, loveGained: 0 },
            lastLog: `第 ${prev.week + 1} 周，向着幸福全速前进！为了推，一切都无所谓！`
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

    // =================================================================================
    // 🖥️ UI 渲染部分
    // =================================================================================

    if (setupStage === 'ATTR') {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-6 font-sans">
                <GlobalStyles />
                <div className="w-full max-w-sm glass-card rounded-[2.8rem] p-10 animate-in fade-in zoom-in duration-500">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-pink-100 rounded-[2rem] mx-auto mb-5 flex items-center justify-center animate-floating shadow-sm border-4 border-white">
                            <UserIcon className="w-10 h-10 text-pink-400" />
                        </div>
                        <h1 className="text-3xl font-black text-pink-500 tracking-tight">阿宅应援物语</h1>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-[0.2em]">Idol Otaku Simulation</p>
                    </div>

                    <div className="mb-8">
                        <label className="text-[10px] font-black text-pink-300 uppercase ml-3 mb-2 block tracking-widest">粉丝 ID 登记</label>
                        <input 
                            type="text" 
                            placeholder="给自己起个霸气的 ID..." 
                            value={playerName} 
                            onChange={(e) => setPlayerName(e.target.value)} 
                            className="w-full bg-white/70 border-2 border-pink-50 rounded-2xl px-6 py-4 text-slate-700 focus:outline-none focus:border-pink-200 transition-all font-bold shadow-inner"
                        />
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center bg-pink-50 px-6 py-4 rounded-3xl border border-pink-100/50 shadow-sm">
                            <span className="text-sm font-black text-pink-400">应援潜能点</span>
                            <span className="text-2xl font-black text-pink-500">{pointsLeft}</span>
                        </div>
                        
                        {Object.entries({looks:'打扮', wealth:'财力', sanity:'精神'}).map(([k, l]) => (
                            <div key={k} className="flex items-center justify-between px-3">
                                <div className="text-sm font-black text-slate-600">{l}</div>
                                <div className="flex items-center gap-5">
                                    <button onClick={() => modifyAttr(k as keyof AttrState, -1)} className="w-9 h-9 rounded-full bg-white border-2 border-pink-50 text-pink-300 font-black hover:bg-pink-50 shadow-sm transition-all">-</button>
                                    <span className="w-4 text-center font-black text-slate-700">{attr[k as keyof AttrState]}</span>
                                    <button onClick={() => modifyAttr(k as keyof AttrState, 1)} className="w-9 h-9 rounded-full bg-white border-2 border-pink-50 text-pink-400 font-black hover:bg-pink-50 shadow-sm transition-all">+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => pointsLeft === 0 && setSetupStage('IDOL')} 
                        disabled={pointsLeft > 0}
                        className={`w-full py-5 rounded-[2rem] font-black tracking-widest uppercase transition-all shadow-lg text-lg ${pointsLeft === 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                        开启追星之路
                    </button>
                </div>
            </div>
        );
    }

    if (setupStage === 'IDOL') {
        return (
            <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center p-6">
                <GlobalStyles />
                <h2 className="text-3xl font-black text-pink-500 mb-10 tracking-tight text-center">你要用余生守护哪位女孩？ ✨</h2>
                <div className="w-full max-w-md space-y-6 mb-12">
                    {PRESET_IDOLS.map((idol) => {
                        const isSelected = gameState.pushedIdols.find(i => i.id === idol.id);
                        return (
                            <div 
                                key={idol.id} 
                                onClick={() => setGameState(p => ({...p, pushedIdols: [idol]}))} 
                                className={`glass-card p-6 rounded-[2.5rem] flex items-center gap-7 cursor-pointer transition-all border-4 ${isSelected ? 'border-pink-300 scale-[1.04] shadow-pink-200/50 shadow-2xl bg-pink-50/40' : 'border-white opacity-80 hover:opacity-100 hover:scale-105'}`}
                            >
                                <img src={idol.avatarUrl} className="w-22 h-22 rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0" />
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-black text-slate-700 text-xl">{idol.name}</h3>
                                        <span className="text-[10px] px-3 py-1 bg-pink-100 text-pink-500 rounded-full font-black tracking-widest">{idol.styleTag}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-normal font-medium">{idol.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button 
                    onClick={() => gameState.pushedIdols.length > 0 && setSetupStage('GAME')} 
                    className={`w-full max-w-md py-6 rounded-[2rem] font-black tracking-widest uppercase transition-all shadow-xl text-xl ${gameState.pushedIdols.length > 0 ? 'btn-sweet' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                    就决定推她了！
                </button>
            </div>
        );
    }

    const mainIdol = gameState.pushedIdols[0];

    return (
        <div className="min-h-screen bg-gradient-soft flex flex-col max-w-md mx-auto relative border-x-4 border-white shadow-2xl font-sans text-slate-600 overflow-hidden">
            <GlobalStyles />
            
            <header className="bg-white/95 backdrop-blur-md p-6 flex items-center justify-between sticky top-0 z-30 border-b-2 border-pink-50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 font-black shadow-inner border-2 border-white">
                        {playerName[0]?.toUpperCase() || 'O'}
                    </div>
                    <div>
                        <div className="text-[10px] text-pink-300 font-black uppercase tracking-widest">Top Ota</div>
                        <div className="text-base font-black text-slate-700">{playerName}</div>
                    </div>
                </div>
                <div className="flex gap-5">
                    <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-black uppercase">Funds</div>
                        <div className="font-black text-emerald-500 text-lg">¥{gameState.money}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-black uppercase">Week</div>
                        <div className="font-black text-pink-400 text-lg">{gameState.week}</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-7 overflow-y-auto scrollbar-hide">
                <div className="glass-card p-7 rounded-[2.2rem] mb-8 relative overflow-hidden min-h-[120px] flex items-center justify-center text-center">
                    <div className="shimmer-light absolute inset-0 opacity-10 pointer-events-none"></div>
                    <div className="text-[15px] font-bold text-slate-500 italic leading-relaxed">
                        {isGenerating ? <span className="animate-pulse text-pink-400 flex items-center gap-2">偶像正在感知你的心跳... <ArrowPathIcon className="w-5 h-5 animate-spin"/></span> : `"${gameState.lastLog}"`}
                    </div>
                </div>

                {gameState.turnState === 'RESULT' && (
                    <button onClick={handleNextPhase} className="self-center mb-8 px-12 py-4 bg-pink-400 text-white rounded-full font-black text-sm shadow-lg hover:bg-pink-500 transition-all animate-bounce">
                        继续守护她！ ✨
                    </button>
                )}

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative w-full aspect-[3/4] max-h-[48vh] bg-white rounded-[2.8rem] p-4 shadow-2xl border-[10px] border-white animate-floating overflow-hidden">
                        <img src={mainIdol.avatarUrl} className="w-full h-full object-cover rounded-[2rem]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-100/40 to-transparent"></div>
                        
                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="bg-white/95 p-5 rounded-[1.8rem] border border-pink-50 shadow-xl">
                                <h2 className="text-2xl font-black text-pink-500 mb-2">{mainIdol.name}</h2>
                                <div className="flex items-center gap-4 text-[11px] font-black text-slate-400">
                                    <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4 text-pink-300"/> 羁绊 LV.{mainIdol.love}</span>
                                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                    <span className="flex items-center gap-1"><MusicalNoteIcon className="w-4 h-4 text-blue-300"/> {gameState.cyclePhase === 'WEEKDAY' ? '平日修行' : '现场祭典'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {gameState.turnState === 'DECISION' && (
                <div className="bg-white/95 p-10 rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(255,182,193,0.15)] border-t border-pink-50 z-20">
                    <div className="grid grid-cols-2 gap-6">
                        {gameState.cyclePhase === 'WEEKDAY' ? (
                            <>
                                <button onClick={handleWork} className="group p-6 rounded-[2rem] bg-emerald-50/40 border-2 border-transparent hover:border-emerald-100 transition-all flex flex-col items-center gap-4">
                                    <div className="p-5 bg-white rounded-2xl group-hover:scale-110 transition-transform shadow-sm"><BriefcaseIcon className="w-8 h-8 text-emerald-400" /></div>
                                    <span className="text-sm font-black text-emerald-600">拼命打工</span>
                                </button>
                                <button onClick={handleInternet} className="group p-6 rounded-[2rem] bg-sky-50/40 border-2 border-transparent hover:border-sky-100 transition-all flex flex-col items-center gap-4">
                                    <div className="p-5 bg-white rounded-2xl group-hover:scale-110 transition-transform shadow-sm"><SparklesIcon className="w-8 h-8 text-sky-400" /></div>
                                    <span className="text-sm font-black text-sky-600">云推治愈</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLive} className={`col-span-2 p-7 rounded-[2.2rem] border-2 flex items-center justify-between group shadow-md transition-all ${gameState.money >= 500 ? 'border-pink-100 bg-white hover:bg-pink-50' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className="p-6 bg-pink-100 rounded-[1.8rem]"><CameraIcon className="w-9 h-9 text-pink-500" /></div>
                                        <div className="text-left">
                                            <div className="font-black text-slate-700 text-xl">奔向 Live 现场</div>
                                            <div className="text-xs text-pink-300 font-black tracking-widest uppercase">Only for her spotlight</div>
                                        </div>
                                    </div>
                                    <div className="font-black text-pink-500 bg-white px-5 py-2 rounded-full border border-pink-100 shadow-sm">-¥500</div>
                                </button>
                                <button onClick={() => setGameState(p => ({...p, turnState:'RESULT', lastLog:"今天就在家里反复观看她的演唱会视频。即使不在现场，我也能感觉到她的呼吸。"}))} className="col-span-2 py-5 text-slate-300 text-[11px] font-black tracking-[0.3em] uppercase hover:text-pink-300 transition-colors">
                                    宅家默默应援
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {gameState.turnState === 'LIVE_INTERACTION' && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-lg flex items-center justify-center p-9">
                    <div className="w-full max-w-sm glass-card p-10 rounded-[3.2rem] shadow-2xl relative overflow-hidden border-4 border-white">
                        <div className="h-2.5 w-full absolute top-0 left-0 bg-pink-300"></div>
                        <h3 className="text-center font-black text-3xl mb-3 text-pink-500 tracking-tight">特典物贩</h3>
                        <p className="text-center text-slate-400 text-xs mb-10 font-black tracking-widest">让这一刻成为永恒 (¥200/张)</p>
                        
                        <div className="bg-white p-7 rounded-[2rem] border-2 border-pink-50 mb-10 shadow-inner">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <img src={mainIdol.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm" />
                                    <span className="font-black text-slate-700 text-lg">{mainIdol.name}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: Math.max(0, (c[mainIdol.id]||0) - 1)}))} className="text-pink-200 hover:text-pink-500 font-black text-3xl">－</button>
                                    <span className="w-8 text-center font-black text-pink-500 text-2xl">{chekiCounts[mainIdol.id] || 0}</span>
                                    <button onClick={() => setChekiCounts(c => ({...c, [mainIdol.id]: (c[mainIdol.id]||0) + 1}))} className="text-pink-400 hover:text-pink-600 font-black text-3xl">＋</button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-10 px-6">
                            <span className="text-sm text-slate-400 font-black">应援预算</span>
                            <span className="text-4xl font-black text-pink-500">¥{Object.keys(chekiCounts).reduce((sum, key) => sum + (chekiCounts[key] || 0), 0) * 200}</span>
                        </div>

                        <button 
                            onClick={startChekiSession} 
                            disabled={isGenerating}
                            className={`w-full py-6 rounded-[2rem] font-black shadow-xl text-xl tracking-widest flex items-center justify-center gap-4 ${isGenerating ? 'bg-slate-200 cursor-not-allowed text-white' : 'btn-sweet'}`}
                        >
                            {isGenerating ? <><ArrowPathIcon className="w-7 h-7 animate-spin"/> AI正在手绘回忆...</> : '确认预约拍立得'}
                        </button>
                    </div>
                </div>
            )}

            {(gameState.turnState === 'REVEAL' && currentCheki) || (gameState.turnState === 'REVEAL' && chekiQueue.length > 0 && !currentCheki) ? (
                <div 
                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-7 cursor-pointer" 
                    style={{ background: 'rgba(255, 248, 250, 0.99)' }}
                    onClick={() => !currentCheki && revealNext()}
                >
                    {!currentCheki ? (
                        <div className="text-center animate-in zoom-in duration-700">
                            <div className="w-28 h-28 bg-pink-100 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-sm animate-floating border-4 border-white">
                                <ChatBubbleLeftRightIcon className="w-14 h-14 text-pink-400" />
                            </div>
                            <h4 className="text-pink-500 text-3xl font-black tracking-tight mb-3">药水显影中...</h4>
                            <p className="text-slate-300 text-xs font-black uppercase tracking-[0.3em]">Memories are becoming real</p>
                            <div className="mt-16 text-pink-200 text-sm font-black animate-pulse">点击屏幕揭晓甜蜜记忆</div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={revealNext}>
                            <div 
                                className="relative bg-white p-6 pb-14 shadow-2xl rounded-sm animate-in zoom-in duration-500 max-w-[340px] border border-slate-100"
                                style={{ transform: `rotate(${currentCheki.rotation}deg)` }}
                            >
                                <div className="aspect-[3/4] w-full bg-slate-100 overflow-hidden relative border-2 border-slate-50 rounded-sm">
                                    <img src={currentCheki.imageUrl} className="w-full h-full object-cover saturate-[1.15]" />
                                    <div className="absolute inset-0 bg-pink-500/10 mix-blend-soft-light"></div>
                                </div>

                                <div className="mt-6 px-3">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] text-pink-200 font-bold scribble-font tracking-widest">{currentCheki.date}</span>
                                        <HeartIcon className="w-6 h-6 text-pink-300" />
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto scrollbar-hide">
                                        <p className="text-[15px] text-pink-500 font-black scribble-font leading-[1.8] text-center tracking-tight bg-pink-50/20 p-5 rounded-2xl border border-pink-100/40 whitespace-pre-wrap italic">
                                            {currentCheki.dialogue}
                                        </p>
                                    </div>
                                </div>

                                {currentCheki.decorations.map((deco, idx) => (
                                    <div key={idx} className="absolute text-5xl select-none" style={{ left: `${deco.left}%`, top: `${deco.top}%`, transform: `rotate(${deco.rotate}deg) scale(${deco.scale})`, zIndex: 50 }}>
                                        {deco.emoji}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 text-pink-400 font-black tracking-[0.5em] uppercase animate-pulse text-lg">一眼万年 ✨</div>
                        </div>
                    )}
                </div>
            ) : null}

            {gameState.turnState === 'REPORT' && (
                <div className="absolute inset-0 z-[90] bg-white/95 flex flex-col items-center justify-center p-10 animate-in fade-in duration-500 overflow-y-auto scrollbar-hide">
                    <div className="w-full max-w-sm glass-card p-12 rounded-[3.5rem] shadow-2xl relative border-4 border-pink-50">
                        <div className="w-24 h-2.5 bg-pink-100 mx-auto mb-12 rounded-full"></div>
                        <h2 className="text-3xl font-black text-slate-700 mb-12 text-center tracking-tight">本周应援总结</h2>
                        
                        <div className="space-y-10">
                            <div className="bg-gradient-to-r from-pink-400 to-pink-300 p-8 rounded-[2.8rem] text-white shadow-xl relative overflow-hidden">
                                <HeartIcon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-20 rotate-12" />
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="text-sm font-black opacity-90 tracking-widest uppercase">羁绊等级提升</span>
                                    <span className="text-4xl font-black">+{gameState.weeklyStats.loveGained}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-6 rounded-[2.2rem] bg-slate-50 border border-slate-100 shadow-inner">
                                    <div className="text-[10px] text-slate-400 font-black mb-2 uppercase tracking-widest">应援总支出</div>
                                    <div className="text-pink-500 font-black text-2xl">¥{gameState.weeklyStats.moneySpent}</div>
                                </div>
                                <div className="text-center p-6 rounded-[2.2rem] bg-slate-50 border border-slate-100 shadow-inner">
                                    <div className="text-[10px] text-slate-400 font-black mb-2 uppercase tracking-widest">打工净收入</div>
                                    <div className="text-emerald-500 font-black text-2xl">¥{gameState.weeklyStats.moneyEarned}</div>
                                </div>
                            </div>

                            <div className="p-8 bg-pink-50/30 rounded-[2.5rem] border-2 border-dashed border-pink-100 text-[15px] font-bold text-slate-500 italic text-center leading-[1.8]">
                                {gameState.lastLog}
                            </div>
                        </div>

                        <button onClick={startNewWeek} className="w-full mt-12 btn-sweet py-6 rounded-[2rem] font-black shadow-2xl text-xl tracking-widest">
                            奔向下一周
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
