import React, { useState } from 'react';
import { GameState } from './types';
import { 
  BriefcaseIcon, 
  ComputerDesktopIcon, 
  TicketIcon, 
  HomeIcon,
  ArrowRightIcon,
  CameraIcon,
  SparklesIcon,
  ShareIcon
} from '@heroicons/react/24/solid';

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    money: 3000,
    san: 100,
    love: 0,
    week: 1,
    cyclePhase: 'WEEKDAY',
    turnState: 'DECISION',
    lastLog: "又是新的一周。该怎么度过呢？",
    lastChekiSeeds: [],
  });

  const [showWeekSplash, setShowWeekSplash] = useState(false);

  // Constants
  const IDOL_NAME = "HOSHINO YUME";
  const WAGE = 1000;
  const CHEKI_PRICE = 80;
  const TICKET_PRICE = 50; 

  // Pixel Art Generator Seeds - Aesthetic variants
  const IDOL_SEEDS = {
    NORMAL: 'yume-v5-soft',
    HAPPY: 'yume-v5-dreamy',
    BLUSH: 'yume-v5-love-pixel'
  };

  const handleShare = () => {
    const shareText = `🎮 【地偶阿宅模拟器】战报
--------------------------
📅 进度：第 ${gameState.week} 周
❤️ 对 ${IDOL_NAME} 的爱意：${gameState.love}
💰 剩余资产：$${gameState.money}
🧠 理智值：${gameState.san}%
--------------------------
“只要梦梦还在舞台上发光，我的搬砖就有意义！✨”`;

    navigator.clipboard.writeText(shareText).then(() => {
      alert("战报已复制到剪贴板！去分享给其他 DD 们吧！");
    }).catch(err => {
      console.error('Share failed', err);
    });
  };

  const getIdolImage = () => {
    let seed = IDOL_SEEDS.NORMAL;
    if (gameState.love >= 80) seed = IDOL_SEEDS.BLUSH;
    else if (gameState.love >= 30) seed = IDOL_SEEDS.HAPPY;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=ffdfed`;
  };

  const handleWork = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + WAGE,
      san: Math.max(0, prev.san - 15),
      turnState: 'RESULT',
      lastChekiSeeds: [],
      lastLog: `打工魂爆发！在便利店搬了一整天货。\n💸 MONEY +${WAGE}\n💀 SAN -15`
    }));
  };

  const handleInternet = () => {
    setGameState(prev => ({
      ...prev,
      san: Math.min(100, prev.san + 20),
      turnState: 'RESULT',
      lastChekiSeeds: [],
      lastLog: `在网络世界寻找慰藉，看了一整晚自推的录播切片。\n✨ SAN +20`
    }));
  };

  const handleLive = () => {
    if (gameState.money < TICKET_PRICE) {
      alert(`金钱不足！门票需要 ${TICKET_PRICE}`);
      return;
    }
    setGameState(prev => ({
      ...prev,
      money: prev.money - TICKET_PRICE,
      turnState: 'LIVE_INTERACTION',
      lastLog: `来到Live House！台上的梦梦闪闪发光！\n演出结束后是物贩时间...`
    }));
  };

  const handleBuyCheki = (count: number) => {
    const totalCost = CHEKI_PRICE * count;
    if (gameState.money < totalCost) return;

    const loveGain = (count * 15) + 5;
    const sanGain = 20 + (count * 2);
    const newSeeds = Array.from({ length: count }, (_, i) => `aesthetic-cheki-${Math.random()}-${i}`);

    setGameState(prev => ({
      ...prev,
      money: prev.money - totalCost,
      love: prev.love + loveGain,
      san: Math.min(100, prev.san + sanGain),
      turnState: 'RESULT',
      lastChekiSeeds: newSeeds,
      lastLog: count === 0 
        ? "看完演出默默离开了现场。下次一定要拍一张合影啊！"
        : `【特典会】购买了 ${count} 张切琪！\n\n“梦梦在切琪上认真写了你的名字哦~”\n\n💸 MONEY -${totalCost}\n❤️ LOVE +${loveGain}\n✨ SAN UP!`
    }));
  };

  const handleStayHome = () => {
    setGameState(prev => ({
      ...prev,
      san: Math.min(100, prev.san + 10),
      turnState: 'RESULT',
      lastChekiSeeds: [],
      lastLog: `决定在家躺平。省下了钱，但心里总觉得空落落的。`
    }));
  };

  const handleNextPhase = () => {
    if (gameState.cyclePhase === 'WEEKEND') {
      setShowWeekSplash(true);
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          week: prev.week + 1,
          cyclePhase: 'WEEKDAY',
          turnState: 'DECISION',
          lastChekiSeeds: [],
          lastLog: `第 ${prev.week + 1} 周开始了。继续为了自推努力吧！`
        }));
        setShowWeekSplash(false);
      }, 1500);
    } else {
      setGameState(prev => ({
        ...prev,
        cyclePhase: 'WEEKEND',
        turnState: 'DECISION',
        lastChekiSeeds: [],
        lastLog: "令人期待的周末终于到了！要去现场吗？"
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col max-w-md mx-auto relative overflow-hidden text-black font-bold">
      
      {showWeekSplash && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
           <div className="animate-week text-center">
              <p className="text-2xl text-pink-400 mb-2 font-pixel tracking-tighter">WEEK COMPLETE</p>
              <h2 className="text-6xl font-black italic">WEEK {gameState.week + 1}</h2>
              <div className="mt-8 flex space-x-2">
                <div className="w-4 h-4 bg-pink-500 animate-ping"></div>
                <div className="w-4 h-4 bg-blue-500 animate-ping delay-75"></div>
                <div className="w-4 h-4 bg-purple-500 animate-ping delay-150"></div>
              </div>
           </div>
        </div>
      )}

      {/* Header with Share Button */}
      <header className="bg-black text-white p-3 border-b-4 border-pink-600 grid grid-cols-4 gap-1">
        <div className="flex flex-col items-center border-r border-gray-800">
           <span className="text-[8px] text-gray-500 font-pixel">WEEK</span>
           <span className="text-lg italic">{gameState.week}</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-800">
           <span className="text-[8px] text-green-500 font-pixel">MONEY</span>
           <span className="text-lg text-green-400">${gameState.money}</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-800">
           <span className="text-[8px] text-blue-500 font-pixel">SANITY</span>
           <span className="text-lg text-blue-300">{gameState.san}%</span>
        </div>
        <div className="flex items-center justify-center">
           <button 
             onClick={handleShare}
             className="bg-pink-600 hover:bg-pink-500 p-2 pixel-border-sm text-white transition-colors active:scale-90"
             title="分享我的战报"
           >
             <ShareIcon className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* Idol Profile */}
      <div className="bg-white border-b-4 border-black p-3 flex items-center space-x-4">
        <div className="pixel-border-sm bg-pink-100 p-1">
          <img 
            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${IDOL_SEEDS.NORMAL}&backgroundColor=ffdfed`} 
            className="w-10 h-10" 
            alt="Avatar"
          />
        </div>
        <div className="flex-1">
          <div className="text-[8px] bg-pink-500 text-white px-2 inline-block mb-1">LV.{Math.floor(gameState.love / 100) + 1} IDOL</div>
          <h1 className="text-md leading-none tracking-tighter font-black">{IDOL_NAME}</h1>
        </div>
        <div className="pixel-border-sm bg-black text-pink-500 px-2 py-1 flex flex-col items-center min-w-[55px]">
           <span className="text-[8px] font-pixel">LOVE</span>
           <span className="text-lg leading-none italic">{gameState.love}</span>
        </div>
      </div>

      <main className="flex-1 p-4 flex flex-col items-center bg-[#222] relative overflow-y-auto">
        
        <div className="w-full min-h-[280px] flex flex-col items-center justify-center mb-6">
          {gameState.lastChekiSeeds && gameState.lastChekiSeeds.length > 0 && gameState.turnState === 'RESULT' ? (
            <div className="relative w-full flex flex-wrap justify-center gap-2 px-2 animate-in fade-in zoom-in duration-500">
              {gameState.lastChekiSeeds.slice(0, 12).map((seed, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-2 pb-6 pixel-border-sm shadow-2xl transition-all hover:scale-110 hover:z-50"
                  style={{ 
                    transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * (10 + Math.random() * 15)}deg) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`,
                    width: gameState.lastChekiSeeds!.length > 4 ? '75px' : '130px'
                  }}
                >
                  <div className="bg-gray-50 aspect-square overflow-hidden pixel-border-sm">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=${['ffddee', 'e0f7fa', 'f3e5f5'][idx % 3]}`} 
                      className="w-full h-full object-cover"
                      alt={`Cheki`}
                    />
                  </div>
                  <div className="mt-2 text-[6px] text-pink-600 font-mono italic text-center opacity-70">
                    MEMORIES
                  </div>
                </div>
              ))}
              {gameState.lastChekiSeeds.length > 12 && (
                <div className="absolute bottom-0 right-4 bg-yellow-400 text-black px-2 py-1 pixel-border-sm text-[10px] z-50">
                  +{gameState.lastChekiSeeds.length - 12} ...
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-square pixel-border bg-black relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)]">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]"></div>
               <img 
                  src={getIdolImage()} 
                  className={`w-full h-full object-cover transition-all duration-700 ${gameState.turnState !== 'RESULT' ? 'blur-md brightness-50 scale-110' : 'scale-100'}`} 
                  alt="Idol"
               />
               <div className="absolute bottom-4 left-4 bg-pink-600/90 text-white px-2 py-0.5 text-[8px] border border-white pixel-border-sm uppercase tracking-tighter font-pixel">
                  {gameState.cyclePhase}
               </div>
            </div>
          )}
        </div>

        <div className="w-full bg-white pixel-border p-5 min-h-[140px] flex flex-col items-center justify-center text-center relative mb-4">
           <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[8px] tracking-widest uppercase font-pixel">Output_Log</div>
           <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium text-gray-800">
             {gameState.lastLog}
           </p>
           
           {gameState.turnState === 'RESULT' && (
             <button 
                onClick={handleNextPhase}
                className="mt-6 bg-yellow-400 hover:bg-yellow-300 pixel-border pixel-button px-8 py-2 text-xs flex items-center gap-2 group transition-all"
             >
                {gameState.cyclePhase === 'WEEKEND' ? '进入下一周 NEXT WEEK' : '继续进行 NEXT PHASE'}
                <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
             </button>
           )}
        </div>
      </main>

      {(gameState.turnState === 'DECISION' || gameState.turnState === 'LIVE_INTERACTION') && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm p-6 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white pixel-border w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className={`p-3 text-white text-center text-md tracking-widest font-black uppercase ${gameState.turnState === 'LIVE_INTERACTION' ? 'bg-gradient-to-r from-pink-600 to-rose-600' : (gameState.cyclePhase === 'WEEKDAY' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-fuchsia-600')}`}>
              {gameState.turnState === 'LIVE_INTERACTION' ? '★ 特典会时间 ★' : (gameState.cyclePhase === 'WEEKDAY' ? 'Weekday Schedule' : 'Weekend Live')}
            </div>
            
            <div className="p-5 space-y-4 bg-gray-50">
              {gameState.turnState === 'LIVE_INTERACTION' ? (
                <>
                  <button onClick={() => handleBuyCheki(1)} className="w-full pixel-border pixel-button bg-pink-100 p-3 flex justify-between items-center group active:scale-95 transition-transform">
                    <span className="flex items-center text-sm"><CameraIcon className="w-4 h-4 mr-2 text-pink-500" />单张切琪</span>
                    <span className="text-red-600 text-xs">-$80</span>
                  </button>
                  <button onClick={() => handleBuyCheki(10)} className="w-full pixel-border pixel-button bg-purple-100 p-3 flex justify-between items-center group active:scale-95 transition-transform">
                    <span className="flex items-center text-sm"><SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />十连抽! (推荐)</span>
                    <span className="text-red-600 text-xs">-$800</span>
                  </button>
                  <button onClick={() => handleBuyCheki(0)} className="w-full text-gray-400 py-2 text-[10px] hover:text-pink-500 transition-colors uppercase font-pixel tracking-widest">
                    [ EXIT ]
                  </button>
                </>
              ) : (
                gameState.cyclePhase === 'WEEKDAY' ? (
                  <>
                    <button onClick={handleWork} className="w-full pixel-border pixel-button bg-green-100 p-3 flex justify-between items-center group active:scale-95 transition-transform">
                      <span className="flex items-center text-sm"><BriefcaseIcon className="w-4 h-4 mr-2 text-green-600" />便利店打工</span>
                      <span className="text-green-700 text-xs">+$1000</span>
                    </button>
                    <button onClick={handleInternet} className="w-full pixel-border pixel-button bg-blue-100 p-3 flex justify-between items-center group active:scale-95 transition-transform">
                      <span className="flex items-center text-sm"><ComputerDesktopIcon className="w-4 h-4 mr-2 text-blue-500" />网络应援</span>
                      <span className="text-blue-600 text-xs font-pixel">SAN+</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleLive} 
                      disabled={gameState.money < TICKET_PRICE}
                      className={`w-full pixel-border pixel-button p-3 flex justify-between items-center group active:scale-95 transition-transform ${gameState.money < TICKET_PRICE ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-pink-100'}`}
                    >
                      <span className="flex items-center text-sm"><TicketIcon className="w-4 h-4 mr-2 text-pink-500 animate-bounce" />演出门票</span>
                      <span className="text-red-600 text-xs">-$50</span>
                    </button>
                    <button onClick={handleStayHome} className="w-full pixel-border pixel-button bg-gray-50 p-3 flex justify-between items-center group active:scale-95 transition-transform">
                      <span className="flex items-center text-sm font-pixel text-gray-500 tracking-tighter">REST HOME</span>
                      <span className="text-[10px] text-gray-400 uppercase">Save Money</span>
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;