
import React, { useState, useEffect, useRef } from 'react';
import { SONG_LIST, Song, SongAnalysis } from './types';
import { SongCard } from './components/SongCard';
import { LyricsView } from './components/LyricsView';
import { AnalysisPanel } from './components/AnalysisPanel';
import { analyzeSongWithGemini } from './services/gemini';

type PlayMode = 'visual' | 'local';

const App: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [analysisData, setAnalysisData] = useState<SongAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Playback State
  const [playMode, setPlayMode] = useState<PlayMode>('visual');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(240); // Default 4 mins for visual
  
  // Local Audio
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Visual Simulator Timer
  const timerRef = useRef<any>(null);

  // Analyze Song Logic
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedSong) return;

      setIsLoading(true);
      
      // Reset Playback
      setIsPlaying(false);
      setCurrentTime(0);
      
      // If we have a local file, keep it? No, probably safer to stop it to avoid confusion when changing songs.
      // But user might want to keep playing same file? Let's stop.
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      
      // We don't clear localAudioUrl automatically so users can play same file for different song if they want,
      // but usually new song = new file. Let's clear it to be clean.
      if (localAudioUrl) {
           URL.revokeObjectURL(localAudioUrl);
           setLocalAudioUrl(null);
      }
      setPlayMode('visual');
      setDuration(240); // Reset visual duration default

      setAnalysisData(null); 

      try {
        const data = await analyzeSongWithGemini(selectedSong.title);
        setAnalysisData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
    
    return () => {
       if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedSong]);

  // Audio Event Handlers (Local)
  const handleLocalTimeUpdate = () => {
    if (audioRef.current && playMode === 'local') {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLocalLoadedMetadata = () => {
    if (audioRef.current && playMode === 'local') {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Visual Timer Logic
  useEffect(() => {
    if (playMode === 'visual' && isPlaying) {
        timerRef.current = setInterval(() => {
            setCurrentTime(prev => {
                if (prev >= duration) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 0.5; // Update every 500ms
            });
        }, 500);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playMode, isPlaying, duration]);

  const togglePlay = () => {
    if (playMode === 'local') {
        if (!audioRef.current || !localAudioUrl) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);

    if (playMode === 'local' && audioRef.current) {
      audioRef.current.currentTime = time;
    }
    // For visual, setting state is enough
  };

  // File Upload Logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalAudioUrl(url);
      setPlayMode('local');
      setIsPlaying(true);
      
      // Auto play local
      setTimeout(() => {
          if (audioRef.current) audioRef.current.play();
      }, 500);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans-ttpd">
      
      {/* Hidden Audio Element for Local Playback */}
      <audio
        ref={audioRef}
        src={localAudioUrl || undefined}
        onTimeUpdate={handleLocalTimeUpdate}
        onLoadedMetadata={handleLocalLoadedMetadata}
        onEnded={handleAudioEnded}
      />
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="audio/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111] border-b border-[#222] z-50">
        <h1 className="text-lg font-serif-ttpd text-white">TTPD Anthology</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-neutral-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <div className={`
          absolute md:static inset-y-0 left-0 z-40 w-full md:w-80 bg-[#0f0f0f] border-r border-[#222] flex flex-col transition-transform duration-300 transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-8 border-b border-[#222] bg-[#0f0f0f]">
            <h1 className="text-2xl font-serif-ttpd text-white tracking-wide">The Department</h1>
            <p className="text-[10px] text-neutral-500 mt-2 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
            {SONG_LIST.map((song) => (
              <SongCard 
                key={song.id} 
                song={song} 
                isSelected={selectedSong?.id === song.id} 
                onClick={(s) => {
                  setSelectedSong(s);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }} 
              />
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* Lyrics / Visualizer */}
          <div className="flex-1 relative bg-black flex flex-col">
            <div className="flex-1 relative overflow-hidden">
                <LyricsView 
                  lyrics={analysisData?.lyrics || []} 
                  isPlaying={isPlaying} 
                  isLoading={isLoading} 
                  currentTime={currentTime}
                />
            </div>
            
            {/* Playback Controls */}
            {selectedSong && (
               <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-8 md:px-12">
                 
                 {/* Source Controls */}
                 <div className="flex justify-center gap-4 mb-4">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded border transition-colors ${playMode === 'local' ? 'bg-white text-black border-white' : 'text-neutral-500 border-neutral-800 hover:border-neutral-600'}`}
                     >
                        Upload Local Audio
                     </button>
                 </div>

                 {/* Progress Bar */}
                 <div className="group relative w-full h-1 bg-neutral-800 rounded-full mb-4 cursor-pointer">
                    <div 
                        className="absolute top-0 left-0 h-full bg-white rounded-full opacity-80 group-hover:opacity-100 transition-all"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 100} 
                        value={currentTime} 
                        onChange={handleSeek}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                 </div>
                 
                 <div className="flex items-center justify-between text-xs text-neutral-400 font-medium font-sans-ttpd mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex items-center gap-2">
                        {playMode === 'visual' && <span className="text-neutral-600">Visual Preview Mode</span>}
                        {playMode === 'local' && <span className="text-white">Local Audio</span>}
                        <span>{formatTime(duration)}</span>
                    </div>
                 </div>

                 {/* Control Buttons */}
                 <div className="flex items-center justify-center gap-10">
                     <button className="text-neutral-400 hover:text-white transition-colors" onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.87l3.195 1.817c1.25.712 2.805-.19 2.805-1.629v-2.87l3.195 1.817c1.25.712 2.805-.19 2.805-1.629V7.553c0-1.438-1.555-2.341-2.805-1.628l-3.195 1.817v-2.87c0-1.439-1.555-2.342-2.805-1.629l-3.195 1.817V2.29c0-1.438-1.555-2.341-2.805-1.628L2.09 7.553c-1.25.712-1.25 2.527 0 3.24l10.915 6.208c1.25.712 2.805-.19 2.805-1.629V9.821l-6.615 3.763Z" /> 
                        </svg>
                     </button>

                     <button 
                      onClick={togglePlay}
                      className={`w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                    >
                        {isPlaying ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                             <rect x="6" y="4" width="4" height="16" rx="1" />
                             <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M5 3l14 9-14 9V3z" />
                          </svg>
                        )}
                     </button>

                     <button className="text-neutral-400 hover:text-white transition-colors" onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}>
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M14.805 5.56a1.629 1.629 0 0 1 0 2.805l-3.195 1.817v2.87c1.25.712 2.805-.19 2.805-1.629l3.195 1.817c1.25.712 2.805-.19 2.805-1.629V7.553c0-1.438-1.555-2.341-2.805-1.628l-3.195 1.817Zm-3.195 5.922 3.195 1.817v-2.87l-3.195 1.053Zm-9.52-5.922c-1.25.712-1.25 2.527 0 3.24l10.915 6.208c1.25.712 2.805-.19 2.805-1.629V9.821l-6.615 3.763L2.09 7.553Z" /> 
                           <path d="M21.91 18.44a1.629 1.629 0 0 1-2.805 1.629v-16.14c1.25-.712 2.805.19 2.805 1.629v12.882Z" />
                        </svg>
                     </button>
                 </div>
               </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="w-full md:w-[550px] border-l border-[#222] bg-[#0f0f0f]">
             <AnalysisPanel song={selectedSong} data={analysisData} isLoading={isLoading} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
