import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import { 
  BriefcaseIcon, 
  ComputerDesktopIcon, 
  TicketIcon, 
  HomeIcon,
  ArrowRightIcon,
  CameraIcon,
  SparklesIcon,
  ShareIcon,
  HeartIcon
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
    lastLog: "又是新的一周。梦梦在社交平台上发了晚安，今天要为了她更努力打工！",
    lastChekiSeeds: [],
  });

  const [showWeekSplash, setShowWeekSplash] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Constants
  const IDOL_NAME = "HOSHINO YUME";
  const WAGE = 1000;
  const CHEKI_PRICE = 80;
  const TICKET_PRICE = 50; 
  const VERSION = "v1.1.0-STABLE";

  const handleShare = async () => {
    // 自动探测当前部署后的链接
    const currentUrl = window.location.origin + window.location.pathname;
    const shareText = `🎮 【地偶阿宅模拟器】战报
--------------------------
📅 进度：第 ${gameState.week} 周
❤️ 对 ${IDOL_NAME} 的爱意：${gameState.love}
💰 剩余资产：$${gameState.money}
🧠 理智值：${gameState.san}%
--------------------------
“只要梦梦还在舞台上发光，我的搬砖就有意义！✨”
🔗 立即应援：${currentUrl}`;

    // 尝试调用手机原生分享，失败则降级为复制剪贴板
    if (navigator.share && /mobile/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: '地偶阿宅模拟器战报',
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const getIdolImage = () => {
    const seeds = {
      NORMAL: 'yume-v5-soft',
      HAPPY: 'yume-v5-dreamy',
      BLUSH: 'yume-v5-love-pixel'
    };
    let seed = seeds.NORMAL;
    if (gameState.love >= 120) seed = seeds.BLUSH;
    else if (gameState.love >= 50) seed = seeds.HAPPY;
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=ffdfed`;
  };

  const handleWork = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + WAGE,
      san: Math.max(0, prev.san - 20),
      turnState: 'RESULT',
      lastChekiSeeds: [],
      lastLog: `在便利店搬了一整天货。虽然被店长训了，但想到周末能见到梦梦，一切都值得了！\n\n💸 MONEY +${WAGE}\n💀 SAN -20`
    }));
  };

  const handleInternet = () => {
    setGameState(prev => ({
      ...prev,
      san: Math.min(100, prev.san + 25),
      turnState: 'RESULT',
      lastChekiSeeds: [],
      lastLog: `在家剪辑梦梦的 Live 切片。看着满屏的“草”和应援弹幕，心情也跟着好了起来。\n\n✨ SAN +25`
    }));
  };

  const handleLive = () => {
    if (gameState.money < TICKET_PRICE) {
      alert(`糟糕！连门票钱都凑不齐。果然爱也需要物质基础啊...`);
      return;
    }
    setGameState(prev => ({
      ...prev,
      money: prev.money - TICKET_PRICE,
      turnState: 'LIVE_INTERACTION',
      lastLog: `随着序曲响起，现场的荧光棒瞬间被点亮。梦梦从雾气中跃出，那一刻她是世界的核心！`
    }));
  };

  const handleBuyCheki = (count: number) => {
    const totalCost = CHEKI_PRICE * count;
    if (gameState.money < totalCost) return;

    const loveGain = (count * 15) + (count >= 10 ? 30 : 5);
    const sanGain = 15 + (count * 4);
    const newSeeds = Array.from({ length: count }, (_, i) => `aesthetic-cheki-${Math.random()}-${i}`);

    setGameState(prev => ({
      ...prev,
      money: prev.money - totalCost,
      love: prev.love + loveGain,
      san: Math.min(100, prev.san + sanGain),
      turnState: 'RESULT',
      lastChekiSeeds: newSeeds,
      lastLog: count === 0 
        ? "只敢远远地看着她，没有勇气去排队拍合影。心里有点酸溜溜的。"
        : `【特典会】\n一共拍了 ${count} 张切琪！梦梦在最后一张上写了“我们要一直在一起哦”，并给了你一个灿烂的笑容。\n\n💸 MONEY -${totalCost}\n❤️ LOVE +${loveGain}\n✨ SAN +${sanGain}`
    }));
  };

  const handleStayHome = () => {
    setGameState(prev => ({
      ...prev,
      san: Math.min(100, prev.san + 15),
      turnState: 'RESULT',
      lastChekiSeeds: [],
      lastLog: `这周末决定休息一下。在床上刷着现场的实时推文，感觉自己像个脱节的逃兵。`
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
          lastLog: `第 ${prev.week + 1} 周。窗外的阳光洒进房间，今天也是元气满满的阿宅生活！`
        }));
        setShowWeekSplash(false);
      }, 1500);
    } else {
      setGameState(prev => ({
        ...prev,
        cyclePhase: 'WEEKEND',
        turnState: 'DECISION',
        lastChekiSeeds: [],
        lastLog: "周六到了！空气中弥漫着 Live House 特有的那种期待感。"
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col max-w-md mx-auto relative overflow-hidden text-black font-bold border-x-8 border-gray-900 shadow-2xl">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[200] bg-yellow-400 text-black px-6 py-3 pixel-border shadow-xl animate-in slide-in-from-top-4 duration-300">
           <div className="flex flex-col items-center gap-1">
             <span className="text-[10px] font-pixel tracking-widest">SUCCESS!</span>
             <span className="text-xs">战报已复制 📢</span>
           </div>
        </div>
      )}

      {showWeekSplash && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white">
           <div className="animate-week text-center px-6">
              <p className="text-xs text-pink-500 mb-2 font-pixel tracking-[0.5em] animate-pulse">SYSTEM_REBOOTING</p>
              <h2 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">WEEK {gameState.week + 1}</h2>
              <div className="mt-12 flex justify-center items-center gap-4">
                <div className="w-2 h-2 bg-pink-600 animate-ping"></div>
                <div className="w-2 h-2 bg-blue-600 animate-ping delay-75"></div>
                <div className="w-2 h-2 bg-white animate-ping delay-150"></div>
              </div>
           </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-[#111] text-white p-3 border-b-4 border-pink-600 grid grid-cols-4 gap-1 relative z-10 shadow-lg">
        <div className="flex flex-col items-center border-r border-gray-800">
           <span className="text-[7px] text-gray-500 font-pixel uppercase">Wk</span>
           <span className="text-lg italic leading-none mt-1">{gameState.week}</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-800">
           <span className="text-[7px] text-green-500 font-pixel uppercase">Cash</span>
           <span className="text-lg text-green-400 leading-none mt-1">${gameState.money}</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-800">
           <span className="text-[7px] text-blue-500 font-pixel uppercase">San</span>
           <span className="text-lg text-blue-300 leading-none mt-1">{gameState.san}%</span>
        </div>
        <div className="flex items-center justify-center">
           <button 
             onClick={handleShare}
             className="bg-pink-600 hover:bg-pink-500 p-2.5 pixel-border-sm text-white transition-all active:scale-90 active:translate-y-0.5"
             title="分享战报"
           >
             <ShareIcon className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* Profile Bar */}
      <div className="bg-white border-b-4 border-black p-3 flex items-center space-x-3 z-10">
        <div className="pixel-border-sm bg-pink-50 p-1 flex-shrink-0">
          <img 
            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=yume-static-final&backgroundColor=ffdfed`} 
            className="w-10 h-10" 
            alt="Idol"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-[7px] bg-pink-500 text-white px-1.5 py-0.5 font-pixel leading-none">LV.{Math.floor(gameState.love / 100) + 1}</div>
            <div className="text-[7px] border border-black text-black px-1 font-pixel leading-none uppercase">Dreaming</div>
          </div>
          <h1 className="text-sm leading-none tracking-tight font-black truncate">{IDOL_NAME}</h1>
        </div>
        <div className="pixel-border-sm bg-black text-pink-500 px-2 py-1 flex flex-col items-center min-w-[60px] flex-shrink-0">
           <span className="text-[6px] font-pixel leading-none">AFFECTION</span>
           <span className="text-lg leading-none italic mt-0.5">{gameState.love}</span>
        </div>
      </div>

      <main className="flex-1 p-4 flex flex-col items-center bg-[#181818] relative overflow-y-auto overflow-x-hidden">
        
        {/* Visual Content Area */}
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center mb-4 relative py-4">
          {gameState.lastChekiSeeds && gameState.lastChekiSeeds.length > 0 && gameState.turnState === 'RESULT' ? (
            <div className="relative w-full flex flex-wrap justify-center gap-2 px-2 animate-in fade-in zoom-in duration-700">
              {gameState.lastChekiSeeds.slice(0, 16).map((seed, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-1.5 pb-6 pixel-border-sm shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all hover:scale-125 hover:z-[60] cursor-pointer"
                  style={{ 
                    transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * (15 + Math.random() * 25)}deg) translate(${Math.random() * 24 - 12}px, ${Math.random() * 24 - 12}px)`,
                    width: gameState.lastChekiSeeds!.length > 4 ? '68px' : '150px'
                  }}
                >
                  <div className="bg-gray-100 aspect-square overflow-hidden border border-gray-200">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=${['ffddee', 'e0f7fa', 'f3e5f5'][idx % 3]}`} 
                      className="w-full h-full object-cover"
                      alt={`Cheki`}
                    />
                  </div>
                  <div className="mt-2 text-[5px] text-pink-500 font-mono italic text-center opacity-50 uppercase">
                    Memories
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full aspect-square pixel-border bg-black relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]"></div>
               <img 
                  src={getIdolImage()} 
                  className={`w-full h-full object-cover transition-all duration-1000 ${gameState.turnState !== 'RESULT' ? 'blur-2xl brightness-50 scale-150' : 'scale-100'}`} 
                  alt="Idol Main"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
               <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                 <div className="bg-pink-600 text-white px-2 py-0.5 text-[7px] border border-white pixel-border-sm uppercase font-pixel tracking-tighter">
                   STATUS: {gameState.cyclePhase}
                 </div>
                 {gameState.turnState !== 'RESULT' && (
                   <div className="text-white/40 text-[6px] font-pixel tracking-widest animate-pulse uppercase">Waiting for input...</div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Message Box */}
        <div className="w-full bg-white pixel-border p-5 min-h-[160px] flex flex-col items-center justify-center text-center relative mt-auto mb-2 shadow-inner">
           <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-[7px] tracking-[0.3em] uppercase font-pixel border border-white">Story_Feed</div>
           <p className="text-xs sm:text-[14px] leading-relaxed whitespace-pre-line font-black text-gray-800 tracking-tight">
             {gameState.lastLog}
           </p>
           
           {gameState.turnState === 'RESULT' && (
             <button 
                onClick={handleNextPhase}
                className="mt-6 bg-yellow-400 hover:bg-yellow-300 pixel-border pixel-button px-14 py-3 text-xs flex items-center gap-3 group transition-all"
             >
                <span className="tracking-[0.3em]">{gameState.cyclePhase === 'WEEKEND' ? 'NEXT WEEK' : 'CONTINUE'}</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
           )}
        </div>

        {/* Footer */}
        <footer className="w-full flex justify-between items-center px-1 mt-2 text-[7px] text-gray-600 font-pixel opacity-50 uppercase tracking-tighter">
           <span>{VERSION}</span>
           <span className="flex items-center gap-1">Produced by <HeartIcon className="w-2 h-2 text-pink-600 inline" /> Creator</span>
        </footer>
      </main>

      {/* Action Dialog */}
      {(gameState.turnState === 'DECISION' || gameState.turnState === 'LIVE_INTERACTION') && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl p-6 flex items-center justify-center animate-in fade-in duration-500">
          <div className="bg-white pixel-border w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-24 duration-700 shadow-[0_0_60px_rgba(255,105,180,0.2)]">
            <div className={`p-4 text-white text-center text-xs tracking-[0.5em] font-black uppercase ${gameState.turnState === 'LIVE_INTERACTION' ? 'bg-gradient-to-r from-pink-600 to-rose-600' : (gameState.cyclePhase === 'WEEKDAY' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-fuchsia-600')}`}>
              {gameState.turnState === 'LIVE_INTERACTION' ? '::: 物贩特典会 :::' : (gameState.cyclePhase === 'WEEKDAY' ? '::: 日常抉择 :::' : '::: 周末公演 :::')}
            </div>
            
            <div className="p-6 space-y-4 bg-gray-50/50">
              {gameState.turnState === 'LIVE_INTERACTION' ? (
                <>
                  <button onClick={() => handleBuyCheki(1)} className="w-full pixel-border-sm bg-white p-4 flex justify-between items-center group active:scale-95 transition-transform hover:border-pink-500">
                    <span className="flex items-center text-xs"><CameraIcon className="w-4 h-4 mr-4 text-pink-500" />单张合影切琪</span>
                    <span className="text-red-600 text-[10px] font-pixel">-$80</span>
                  </button>
                  <button onClick={() => handleBuyCheki(10)} className="w-full pixel-border-sm bg-pink-50 p-4 flex justify-between items-center group active:scale-95 transition-transform border-pink-300 hover:bg-pink-100">
                    <span className="flex items-center text-xs"><SparklesIcon className="w-4 h-4 mr-4 text-purple-600 animate-pulse" />霸气十连拍!</span>
                    <span className="text-red-600 text-[10px] font-pixel">-$800</span>
                  </button>
                  <button onClick={() => handleBuyCheki(0)} className="w-full text-gray-400 py-2 text-[9px] hover:text-pink-600 transition-colors uppercase font-pixel tracking-[0.4em] text-center">
                    [ 结束并离开 / LEAVE ]
                  </button>
                </>
              ) : (
                gameState.cyclePhase === 'WEEKDAY' ? (
                  <>
                    <button onClick={handleWork} className="w-full pixel-border-sm bg-white p-4 flex justify-between items-center group active:scale-95 transition-transform border-green-200 hover:bg-green-50">
                      <span className="flex items-center text-xs"><BriefcaseIcon className="w-4 h-4 mr-4 text-green-600" />便利店夜班打工</span>
                      <span className="text-green-700 text-[10px] font-pixel">+$1000</span>
                    </button>
                    <button onClick={handleInternet} className="w-full pixel-border-sm bg-white p-4 flex justify-between items-center group active:scale-95 transition-transform border-blue-200 hover:bg-blue-50">
                      <span className="flex items-center text-xs"><ComputerDesktopIcon className="w-4 h-4 mr-4 text-blue-500" />网络应援(推特/B站)</span>
                      <span className="text-blue-600 text-[10px] font-pixel uppercase tracking-tighter">Sanity++</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleLive} 
                      disabled={gameState.money < TICKET_PRICE}
                      className={`w-full pixel-border-sm p-4 flex justify-between items-center group active:scale-95 transition-transform ${gameState.money < TICKET_PRICE ? 'bg-gray-200 opacity-60 cursor-not-allowed' : 'bg-pink-100 border-pink-200 hover:bg-pink-200'}`}
                    >
                      <span className="flex items-center text-xs"><TicketIcon className="w-4 h-4 mr-4 text-pink-500" />入场支持现场演出</span>
                      <span className="text-red-600 text-[10px] font-pixel">-$50</span>
                    </button>
                    <button onClick={handleStayHome} className="w-full pixel-border-sm bg-white p-4 flex justify-between items-center group active:scale-95 transition-transform border-gray-200 hover:bg-gray-50">
                      <span className="flex items-center text-xs font-pixel text-gray-400 tracking-tighter uppercase">Home & Chill</span>
                      <span className="text-[10px] text-gray-300 uppercase italic">Saving</span>
                    </button>
                  </>
                )
              )}
            </div>
            <div className="bg-black py-2.5 text-center">
               <span className="text-[7px] text-gray-600 font-pixel tracking-[0.8em] uppercase">Control System Alpha</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;