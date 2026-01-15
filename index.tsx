import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Briefcase, 
  MessageCircle, 
  Ticket, 
  Home, 
  ChevronRight, 
  Camera, 
  Sparkles, 
  Heart,
  TrendingUp,
  Zap
} from 'lucide-react';

// 使用最新的 Dicebear 9.x Lorelei 系列，确保图片不再失效且风格更接近清新动漫
const getIdolUrl = (seed: string) => `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=ffdfed,ffddee&flip=true&eyebrows=variant01,variant02,variant03&eyes=variant01,variant02,variant03,variant04,variant05&mouth=variant01,variant02,variant03,variant04`;

const IDOL_POOL = [
  { name: "梦野咲希", style: "王道红", desc: "“如果能和你一起看到武道馆的风景，我就死而无憾了。”", seed: "saki-oshimen", color: "#FF0000" },
  { name: "月咏怜奈", style: "地雷紫", desc: "“在黑暗中起舞，是为了寻找你那唯一注视我的眼神。”", seed: "rena-oshimen", color: "#A020F0" },
  { name: "桃园尤莉", style: "电波粉", desc: "“哔哩哔哩！接收到来自阿宅的应援能量，变身！”", seed: "yuri-oshimen", color: "#FF69B4" },
  { name: "白石真白", style: "清纯白", desc: "“像初雪一样透明，像星辰一样遥远，只想留在你心间。”", seed: "mashiro-oshimen", color: "#FFFFFF" },
  { name: "小恋美波", style: "钓系绿", desc: "“呐，你的单推名单里，真的只有我一个人吗？”", seed: "minami-oshimen", color: "#00FF7F" },
  { name: "绯村凛音", style: "酷飒蓝", desc: "“舞台就是战场，我的歌声会点燃你平庸的灵魂！”", seed: "rinne-oshimen", color: "#1E90FF" }
];

const MIX_WORDS = ["虎！", "火！", "人造！", "纤维！", "海女！", "振动！", "化纤飞！"];

const App = () => {
  const [setupStage, setSetupStage] = useState<'ATTR' | 'IDOL' | 'GAME'>('ATTR');
  const [pointsLeft, setPointsLeft] = useState(10);
  const [attr, setAttr] = useState({ looks: 0, wealth: 0, sanity: 0 });
  const [playerName, setPlayerName] = useState('');
  const [availableIdols] = useState(() => IDOL_POOL.sort(() => 0.5 - Math.random()).slice(0, 4).map(i => ({...i, id: Math.random(), love: 0, weeklyGain: 0})));
  const [selectedIdols, setSelectedIdols] = useState<any[]>([]);
  
  const [gameState, setGameState] = useState({
    money: 1200,
    san: 100,
    week: 1,
    cyclePhase: '平日' as '平日' | '周末',
    turnState: 'DECISION' as 'DECISION' | 'LIVE_PERFORM' | 'LIVE_INTERACT' | 'RESULT',
    lastLog: "新的一周。即便现实满是尘埃，抬头也能望见星光。",
    pushedIdols: [] as any[],
    lastChekiSeeds: [] as string[],
    activeDialogue: null as { name: string, text: string } | null
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [mixIndex, setMixIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const [chekiCounts, setChekiCounts] = useState<{ [key: string]: number }>({});

  // 身份描述系统
  const playerStatus = useMemo(() => {
    const { looks, wealth, sanity } = attr;
    if (looks >= 4 && wealth >= 4) return { title: "✦ 传说级的神推大叔", desc: "你是 Live House 里的活传说，每一场演出都为你而闪耀。" };
    if (wealth >= 5) return { title: "💰 倾尽余生的石油王", desc: "“只要能让她登上武道馆，我即便流落街头也心甘情愿。”" };
    if (looks >= 5) return { title: "🕺 舞台下唯一的视线", desc: "即便在千人会场，她的视线也总会在你身上停留得最久。" };
    if (sanity <= 2) return { title: "🕯 灵魂燃烧的狂信徒", desc: "现实早已崩塌，你只剩下一颗为偶像跳动的炽热心脏。" };
    return { title: "🎟 坚守梦想的无名氏", desc: "在平凡的角落，默默挥舞着属于她的那一抹荧光色。" };
  }, [attr]);

  const modifyAttr = (key: keyof typeof attr, delta: number) => {
    if (delta > 0 && pointsLeft > 0) {
      setAttr(prev => ({ ...prev, [key]: prev[key] + 1 }));
      setPointsLeft(p => p - 1);
    } else if (delta < 0 && attr[key] > 0) {
      setAttr(prev => ({ ...prev, [key]: prev[key] - 1 }));
      setPointsLeft(p => p + 1);
    }
  };

  const toggleIdol = (idol: any) => {
    if (selectedIdols.find(i => i.id === idol.id)) {
      setSelectedIdols(selectedIdols.filter(i => i.id !== idol.id));
    } else if (selectedIdols.length < 3) {
      setSelectedIdols([...selectedIdols, idol]);
    }
  };

  const startGame = () => {
    if (selectedIdols.length === 0) return;
    setGameState(prev => ({ ...prev, pushedIdols: selectedIdols, playerName: playerName.trim() || '阿宅' }));
    setSetupStage('GAME');
  };

  const handleWork = () => {
    const wage = 900 + (attr.wealth * 150);
    const loss = Math.max(10, 35 - (attr.sanity * 4));
    setGameState(prev => ({
      ...prev, money: prev.money + wage, san: Math.max(0, prev.san - loss),
      turnState: 'RESULT', lastLog: `在冰冷的现实中拼命搬砖，只为换取一张通往梦想的入场券。\n💰 薪酬 +$${wage} | 💀 灵魂磨损了 ${loss}%`
    }));
  };

  const handleInternet = () => {
    setGameState(prev => ({
      ...prev, san: Math.min(100, prev.san + 30),
      turnState: 'RESULT', lastLog: `拼命在推特上转发安利贴，看着点赞数一点点增加，仿佛自己也离她更近了。\n✨ 毅力恢复 +30%`
    }));
  };

  const handleLive = () => {
    if (gameState.money < 150) return;
    setGameState(prev => ({ ...prev, turnState: 'LIVE_PERFORM' }));
    let idx = 0;
    const timer = setInterval(() => {
      setMixIndex(idx);
      idx++;
      if (idx >= MIX_WORDS.length) {
        clearInterval(timer);
        setTimeout(() => {
          setMixIndex(-1);
          setGameState(prev => ({
            ...prev, money: prev.money - 150,
            pushedIdols: prev.pushedIdols.map(i => ({ ...i, love: i.love + 20, weeklyGain: (i.weeklyGain || 0) + 20 })),
            turnState: 'LIVE_INTERACT',
            lastLog: `那一刻，全场的呼吸都同步了！你声嘶力竭的 Call 声回荡在狭窄的 Live House。`
          }));
        }, 400);
      }
    }, 350);
  };

  const handleFinishCheki = () => {
    setIsCapturing(true);
    setTimeout(() => {
      let cost = 0;
      let seeds: string[] = [];
      const newPushed = gameState.pushedIdols.map(idol => {
        const count = chekiCounts[idol.id] || 0;
        cost += count * 100;
        if (count > 0) {
          for(let i=0; i<count; i++) seeds.push(`${idol.seed}-${Math.random()}`);
          return { ...idol, love: idol.love + (count * 35), weeklyGain: (idol.weeklyGain || 0) + (count * 35) };
        }
        return idol;
      });
      const firstActive = newPushed.find(i => (chekiCounts[i.id] || 0) > 0);
      setGameState(prev => ({
        ...prev, money: prev.money - cost, pushedIdols: newPushed, turnState: 'RESULT',
        lastChekiSeeds: seeds, 
        activeDialogue: firstActive ? { 
          name: firstActive.name, 
          text: firstActive.love > 400 ? "“能遇到你支持我，真的太好了……以后也请只看我一个人哦。”" : "“辛苦了！刚才在台上我有看到你在挥手哦，超级开心的！”" 
        } : null,
        lastLog: `镜头留下了你们共同存在的证明，这是比金钱更珍贵的宝藏。`
      }));
      setIsCapturing(false);
      setChekiCounts({});
    }, 600);
  };

  const handleNextPhase = () => {
    if (gameState.cyclePhase === '周末') {
      setShowSummary(true);
    } else {
      setGameState(prev => ({ ...prev, cyclePhase: '周末', turnState: 'DECISION', activeDialogue: null, lastLog: "周末的光影在地平线上浮现，应援的心早已按捺不住。" }));
    }
  };

  const startNextWeek = () => {
    setShowSummary(false);
    setGameState(prev => ({
      ...prev, week: prev.week + 1, cyclePhase: '平日', turnState: 'DECISION',
      activeDialogue: null, lastChekiSeeds: [],
      pushedIdols: prev.pushedIdols.map(i => ({ ...i, weeklyGain: 0 })),
      lastLog: `第 ${prev.week + 1} 周，为了那个武道馆的约定，今天也要元气满满。`
    }));
  };

  if (setupStage === 'ATTR') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 text-black shadow-2xl relative border-t-8 border-pink-500">
          <h2 className="text-2xl font-black text-center mb-8 text-pink-600 font-zcool tracking-tighter italic">—— 应援契约开启 ——</h2>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">你的名字</label>
              <input type="text" maxLength={10} placeholder="在此刻下你的誓言..." value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-pink-100 rounded-2xl focus:border-pink-400 transition-all outline-none font-bold text-gray-700" />
            </div>
            <div className="bg-pink-50 rounded-3xl p-6 border border-pink-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-black text-pink-600">天赋加点</span>
                <span className="text-2xl font-black text-pink-500">{pointsLeft}</span>
              </div>
              {['looks', 'wealth', 'sanity'].map(k => (
                <div key={k} className="flex justify-between items-center mb-5 last:mb-0">
                  <span className="text-xs font-black text-gray-500">{k === 'looks' ? '气质' : k === 'wealth' ? '财力' : '毅力'}</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => modifyAttr(k as any, -1)} className="w-8 h-8 rounded-full bg-white border border-pink-200 text-pink-500 font-black hover:bg-pink-100 transition-colors">-</button>
                    <span className="font-black w-4 text-center text-pink-600 text-lg">{attr[k as keyof typeof attr]}</span>
                    <button onClick={() => modifyAttr(k as any, 1)} className="w-8 h-8 rounded-full bg-white border border-pink-200 text-pink-500 font-black hover:bg-pink-100 transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => pointsLeft === 0 && setSetupStage('IDOL')} className={`w-full py-5 rounded-3xl font-black text-sm transition-all shadow-lg ${pointsLeft === 0 ? 'bg-pink-500 text-white hover:bg-pink-400' : 'bg-gray-200 text-gray-400'}`}>
              {pointsLeft === 0 ? '前往 Live House' : `还剩 ${pointsLeft} 点`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (setupStage === 'IDOL') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black relative">
        <div className="w-full max-w-md bg-white rounded-[40px] p-6 text-black shadow-2xl">
          <h2 className="text-xl font-black text-center mb-6 text-pink-600 font-zcool tracking-widest italic">邂逅命定的少女</h2>
          <div className="grid grid-cols-2 gap-4 mb-8 max-h-[55vh] overflow-y-auto p-1">
            {availableIdols.map(idol => (
              <div key={idol.id} onClick={() => toggleIdol(idol)} className={`p-4 rounded-[24px] border-2 transition-all cursor-pointer ${selectedIdols.find(i => i.id === idol.id) ? 'border-pink-500 bg-pink-50 scale-95' : 'border-gray-50 hover:border-pink-200'}`}>
                <img src={getIdolUrl(idol.seed)} className="w-full aspect-square rounded-2xl anime-glow mb-4 bg-pink-100/50" />
                <div className="text-base font-black text-gray-800">{idol.name}</div>
                <div className="text-[10px] text-pink-400 font-black mb-2 px-2 py-0.5 bg-pink-100/50 rounded-full inline-block">{idol.style}</div>
                <div className="text-[9px] text-gray-400 leading-relaxed italic">{idol.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={startGame} className={`w-full py-5 rounded-3xl font-black text-sm transition-all shadow-xl ${selectedIdols.length > 0 ? 'bg-pink-500 text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
            开启神推之旅 (已选 {selectedIdols.length}/3)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-black relative shadow-2xl overflow-hidden dream-gradient">
      {/* 状态看板 */}
      <header className="px-5 py-4 flex justify-between items-center z-30 bg-black/40 border-b border-pink-500/20 backdrop-blur-md">
        <div className="flex flex-col"><span className="text-[9px] text-pink-300 font-black tracking-widest uppercase">IDOL FAN</span><span className="text-sm font-black italic">@{gameState.playerName}</span></div>
        <div className="flex gap-6">
          <div className="flex flex-col items-center"><span className="text-[9px] text-green-500 font-black">资产</span><span className="text-sm font-bold text-green-400">${gameState.money}</span></div>
          <div className="flex flex-col items-center"><span className="text-[9px] text-blue-500 font-black">毅力</span><span className="text-sm font-bold text-blue-300">{gameState.san.toFixed(0)}%</span></div>
        </div>
      </header>

      {/* 顶部推名单 */}
      <div className="px-4 py-3 flex gap-4 overflow-x-auto bg-white/5 z-20 border-b border-white/5">
        {gameState.pushedIdols.map(idol => (
          <div key={idol.id} className="flex-shrink-0 flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/60 border border-pink-500/30">
            <img src={getIdolUrl(idol.seed)} className="w-8 h-8 rounded-full bg-pink-50" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/80 leading-none">{idol.name}</span>
              <span className="text-[10px] text-pink-400 font-black italic mt-1 leading-none">❤️{idol.love}</span>
            </div>
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center pb-20">
          
          {/* 打艺 Wotagei 动画 */}
          {gameState.turnState === 'LIVE_PERFORM' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
              <div className="absolute inset-0 flex justify-around items-end px-12 pb-24">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="penlight swing-anim" style={{ 
                    animationDelay: `${i*0.06}s`, 
                    backgroundColor: i % 2 === 0 ? '#E1007E' : '#FFD700',
                    boxShadow: `0 0 20px ${i % 2 === 0 ? '#E1007E' : '#FFD700'}`
                  }}></div>
                ))}
              </div>
              {mixIndex >= 0 && (
                <div key={mixIndex} className="text-7xl font-rash italic text-white animate-bounce drop-shadow-[0_0_25px_#E1007E]">{MIX_WORDS[mixIndex]}</div>
              )}
            </div>
          )}

          {/* 中央身份与立绘 */}
          <div className="w-full flex flex-col items-center z-10 transition-all">
            <div className="px-6 py-4 rounded-[32px] bg-black/60 backdrop-blur-xl border border-pink-500/20 text-center mb-12 w-[90%] shadow-2xl relative">
              <div className="text-[10px] text-pink-400 font-black tracking-[0.4em] uppercase mb-2">应援阶级</div>
              <div className="text-lg font-black text-white italic tracking-tighter mb-1 anime-glow">{playerStatus.title}</div>
              <div className="text-[10px] text-gray-400 font-medium italic opacity-80 leading-tight px-4">{playerStatus.desc}</div>
            </div>
            
            <div className="relative w-80 h-80 idol-animation flex justify-center items-end">
               <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-[100px] animate-pulse"></div>
               {gameState.pushedIdols.length > 0 && (
                   <div className="flex justify-center items-end relative">
                       {gameState.pushedIdols.map((idol, idx) => (
                           <img 
                             key={idx} 
                             src={getIdolUrl(idol.seed)} 
                             className={`w-72 h-72 object-contain anime-glow transition-all duration-1000 ${gameState.turnState === 'RESULT' ? 'opacity-100 scale-105' : 'opacity-80'}`} 
                             style={{ margin: gameState.pushedIdols.length > 1 ? '-90px' : '0', zIndex: 10 - idx }} 
                           />
                       ))}
                   </div>
               )}
            </div>
          </div>

          {/* 对话框 */}
          {gameState.activeDialogue && gameState.turnState === 'RESULT' && (
            <div className="absolute bottom-10 inset-x-6 z-40 animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white/95 rounded-3xl p-6 border-4 border-pink-300 relative shadow-2xl">
                <div className="absolute -top-5 left-6 bg-pink-500 px-5 py-2 rounded-full text-[11px] font-black italic text-white shadow-lg">「{gameState.activeDialogue.name}」</div>
                <p className="text-[13px] font-bold leading-relaxed italic text-gray-800 tracking-tight">{gameState.activeDialogue.text}</p>
              </div>
            </div>
          )}

          {/* 切琪墙 */}
          {gameState.turnState === 'RESULT' && gameState.lastChekiSeeds.length > 0 && (
            <div className="absolute inset-0 z-20 flex flex-wrap justify-center items-center p-12 gap-3 overflow-hidden pointer-events-none">
              {gameState.lastChekiSeeds.slice(0, 10).map((seed, idx) => (
                <div key={idx} className="cheki-photo" style={{ 
                  transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * (15 + Math.random() * 20)}deg)`, 
                  width: '120px', 
                  zIndex: 10+idx 
                }}>
                  <div className="bg-pink-50 aspect-[4/5] overflow-hidden rounded-sm border border-gray-100">
                    <img src={getIdolUrl(seed)} className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-4 text-[8px] text-pink-400 font-black text-center italic tracking-widest uppercase">MEMORIES / {gameState.week}WK</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 系统播报 */}
        <div className="bg-white mx-6 mb-10 rounded-[40px] p-6 text-black text-center shadow-[0_-15px_50px_rgba(225,0,126,0.2)] z-20 border-t-8 border-pink-500 relative">
          <p className="text-[14px] font-bold leading-relaxed italic text-gray-700 tracking-tight">{gameState.lastLog}</p>
          {gameState.turnState === 'RESULT' && (
            <button onClick={handleNextPhase} className="mt-6 bg-pink-500 text-white font-black py-4 px-14 rounded-full text-xs shadow-xl hover:bg-pink-400 active:scale-95 transition-all animate-pulse">
              {gameState.cyclePhase === '周末' ? '跨向下一周' : '继续努力'} 
              <ChevronRight className="inline ml-2 w-4 h-4"/>
            </button>
          )}
        </div>
      </main>

      {/* 决策弹窗 */}
      {gameState.turnState === 'DECISION' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-[48px] w-full p-8 space-y-6 animate-in zoom-in duration-300 shadow-[0_0_120px_rgba(225,0,126,0.3)] border-b-8 border-pink-200">
            <h3 className="text-center font-black text-pink-500 italic mb-4 text-xl font-zcool tracking-widest">✦ {gameState.cyclePhase}日程选择 ✦</h3>
            {gameState.cyclePhase === '平日' ? (
              <>
                <button onClick={handleWork} className="w-full py-6 px-6 rounded-3xl bg-green-50 text-green-700 font-black flex justify-between items-center group active:scale-95 transition-all border-2 border-transparent hover:border-green-300">
                  <div className="flex items-center gap-3"><Briefcase className="w-5 h-5"/><span>拼死搬砖积蓄</span></div>
                  <span className="bg-green-200 px-3 py-1 rounded-full text-[10px]">资金 ++</span>
                </button>
                <button onClick={handleInternet} className="w-full py-6 px-6 rounded-3xl bg-blue-50 text-blue-700 font-black flex justify-between items-center group active:scale-95 transition-all border-2 border-transparent hover:border-blue-300">
                  <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5"/><span>网络应援活动</span></div>
                  <span className="bg-blue-200 px-3 py-1 rounded-full text-[10px]">毅力 +30</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLive} 
                  className={`w-full py-6 px-6 rounded-3xl font-black flex justify-between items-center transition-all active:scale-95 border-2 ${gameState.money >= 150 ? 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100' : 'btn-disabled'}`}
                >
                  <div className="flex items-center gap-3"><Ticket className="w-5 h-5"/><span>入场 LIVE！</span></div>
                  <span className="text-[10px]">{gameState.money >= 150 ? '门票 $150' : '为了推，去搬砖吧！'}</span>
                </button>
                <button onClick={() => setGameState(p => ({...p, turnState:'RESULT', lastLog:'为了攒大招，本周末你含泪错过了现场。在被窝里刷着同好的速报，眼泪止不住地流。'}))} className="w-full py-6 px-6 rounded-3xl bg-gray-50 text-gray-400 font-bold hover:bg-gray-100 active:scale-95 transition-all">
                  <span>闭关休息/省钱</span>
                  <span className="text-[10px] italic">SAVING...</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 特典会弹窗 */}
      {gameState.turnState === 'LIVE_INTERACT' && (
        <div className="absolute inset-0 bg-black/95 z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] w-full max-w-sm p-8 shadow-2xl border-4 border-pink-400">
            <div className="text-center font-black text-pink-500 mb-8 italic text-xl tracking-[0.2em] font-zcool">✦ 特典会 · 奇迹定格 ✦</div>
            <div className="space-y-5">
              {gameState.pushedIdols.map(idol => (
                <div key={idol.id} className="flex items-center gap-4 p-4 rounded-3xl bg-pink-50 border border-pink-100 transition-all">
                  <img src={getIdolUrl(idol.seed)} className="w-16 h-16 rounded-2xl anime-glow bg-white" />
                  <div className="flex-1">
                    <div className="text-sm font-black text-gray-800">{idol.name}</div>
                    <div className="text-[9px] text-pink-500 font-bold">合影 $100</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChekiCounts(c => ({...c, [idol.id]: Math.max(0, (c[idol.id]||0)-1)}))} className="w-9 h-9 rounded-full bg-white shadow-md font-black text-pink-500 border border-pink-100 active:scale-90 transition-all">-</button>
                    <span className="font-black w-4 text-center text-sm">{chekiCounts[idol.id] || 0}</span>
                    <button onClick={() => setChekiCounts(c => ({...c, [idol.id]: (c[idol.id]||0)+1}))} className="w-9 h-9 rounded-full bg-white shadow-md font-black text-pink-500 border border-pink-100 active:scale-90 transition-all">+</button>
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t-2 border-dashed border-pink-200 flex justify-between items-center">
                {/* Fixed TypeScript error by explicitly typing reduce and casting values */}
                <div className="text-xs font-black text-gray-600">本场投入: <span className="text-pink-600 text-lg ml-1 font-black">${(Object.values(chekiCounts) as number[]).reduce((a: number, b: number) => a + b, 0) * 100}</span></div>
                <button 
                  onClick={handleFinishCheki} 
                  /* Fixed TypeScript error by explicitly typing reduce and casting values */
                  disabled={(Object.values(chekiCounts) as number[]).reduce((a: number, b: number) => a + b, 0) * 100 > gameState.money} 
                  /* Fixed TypeScript error by explicitly typing reduce and casting values */
                  className={`py-4 px-10 rounded-full font-black text-xs transition-all shadow-xl ${(Object.values(chekiCounts) as number[]).reduce((a: number, b: number) => a + b, 0) * 100 <= gameState.money ? 'bg-pink-500 text-white hover:bg-pink-400' : 'bg-gray-200 text-gray-400'}`}
                >
                  确认离场
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 每周总结 */}
      {showSummary && (
        <div className="absolute inset-0 bg-white z-[100] p-8 flex flex-col animate-in slide-in-from-right duration-500 text-black">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-0.5 flex-1 bg-pink-200"></div>
            <h2 className="text-2xl font-black italic text-pink-500 font-zcool tracking-widest">第 {gameState.week} 周总结</h2>
            <div className="h-0.5 flex-1 bg-pink-200"></div>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            <div className="bg-pink-50/70 p-6 rounded-[40px] border-2 border-pink-100 shadow-sm">
              <h4 className="text-[10px] font-black text-pink-600 uppercase mb-6 tracking-[0.4em] italic text-center">OSHIMEN RELATIONSHIP</h4>
              {gameState.pushedIdols.map(idol => (
                <div key={idol.id} className="flex gap-5 items-center mb-6 last:mb-0 bg-white/60 p-4 rounded-3xl border border-white">
                  <img src={getIdolUrl(idol.seed)} className="w-16 h-16 rounded-2xl anime-glow bg-white shadow-md" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-black text-gray-800">{idol.name}</span>
                      <span className="text-[11px] font-black text-pink-500 italic">绊: {idol.love} <span className="opacity-60">(+{idol.weeklyGain || 0})</span></span>
                    </div>
                    <div className="text-[10px] italic leading-relaxed text-gray-500 bg-white/80 p-3 rounded-2xl border border-pink-50">
                      {idol.love < 150 ? "“谢谢你一直注视着我。”" : 
                       idol.love < 450 ? "“能被你发现，是我这辈子最大的奇迹。”" : 
                       "“如果能站上那个最高的舞台，请一定，一定要在离我最近的地方看着我。”"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gray-50 p-6 rounded-[35px] text-center border border-gray-100">
                <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">生活结余</div>
                <div className="text-3xl font-black text-green-600 tracking-tighter">${gameState.money}</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-[35px] text-center border border-gray-100">
                <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">精神毅力</div>
                <div className="text-3xl font-black text-blue-600 tracking-tighter">{gameState.san.toFixed(0)}%</div>
              </div>
            </div>
          </div>
          <button onClick={startNextWeek} className="mt-8 w-full py-6 bg-black text-white rounded-[32px] font-black text-sm hover:bg-gray-900 transition-all shadow-2xl tracking-[0.3em] font-zcool uppercase">迎接新的机遇 / CONTINUE</button>
        </div>
      )}

      {isCapturing && <div className="absolute inset-0 z-[100] bg-white animate-flash opacity-0 pointer-events-none"></div>}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);