import React, { useState } from 'react';
import { SongAnalysis, Song } from '../types';

interface AnalysisPanelProps {
  song: Song | null;
  data: SongAnalysis | null;
  isLoading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ song, data, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'background' | 'vocab' | 'connections'>('background');

  if (!song) return null;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-fade-in h-full bg-[#111] flex flex-col justify-center items-center">
         <div className="w-full space-y-4 opacity-50">
            <div className="h-4 w-3/4 bg-neutral-800 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-neutral-800 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-neutral-800 rounded animate-pulse"></div>
         </div>
         <p className="font-serif-ttpd text-neutral-400 italic mt-8 animate-pulse text-center">
            正在查询档案库... <br/>
            <span className="text-xs text-neutral-600 not-italic">Gemini 正在分析 (若超时将自动切换线路)</span>
         </p>
      </div>
    );
  }

  // Handle Error State gracefully
  if (!data || data.error) {
      return (
          <div className="flex flex-col h-full bg-[#0f0f0f] text-[#e5e5e5] border-l border-neutral-900 justify-center items-center p-8 text-center">
            <div className="text-neutral-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-xl font-serif-ttpd text-white mb-2">系统繁忙</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                {data?.background || "当前访问人数过多，AI 暂时无法生成完整分析。但这不影响您播放音乐。"}
            </p>
            <p className="text-xs text-neutral-600 uppercase tracking-widest">请稍后再试</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-[#e5e5e5] border-l border-neutral-900">
      {/* Header */}
      <div className="p-8 pb-4 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
        <h2 className="text-3xl md:text-4xl font-serif-ttpd mb-2 text-white tracking-wide">{song.title}</h2>
        <p className="text-xs text-neutral-500 uppercase tracking-[0.2em]">{data.mood}</p>
      </div>

      {/* Tabs */}
      <div className="flex px-8 border-b border-neutral-800 sticky top-0 bg-[#0f0f0f] z-20">
        {(['background', 'vocab', 'connections'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              py-4 mr-8 text-xs font-bold uppercase tracking-widest transition-all duration-300 relative
              ${activeTab === tab 
                ? 'text-white' 
                : 'text-neutral-600 hover:text-neutral-400'}
            `}
          >
            {tab === 'vocab' ? '生词本' : tab === 'background' ? '背景故事' : '关联线索'}
            {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 scroll-smooth scrollbar-thin scrollbar-thumb-neutral-800">
        {activeTab === 'background' && (
          <div className="animate-fade-in space-y-8">
            <div className="prose prose-invert prose-lg max-w-none">
                <p className="font-serif-ttpd text-lg leading-loose text-neutral-300 first-letter:text-5xl first-letter:font-serif-ttpd first-letter:text-white first-letter:mr-3 first-letter:float-left">
                    {data.background}
                </p>
            </div>
            <div className="mt-8 p-6 bg-[#161616] rounded border border-neutral-800/50">
                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">档案备注</h4>
                <p className="text-sm text-neutral-400 italic font-serif-ttpd">
                    本分析由 Gemini AI 自动生成，仅代表 AI 观点，非官方解释。
                </p>
            </div>
          </div>
        )}

        {activeTab === 'vocab' && (
          <div className="animate-fade-in space-y-4">
            {data.vocabulary.map((item, idx) => (
              <div key={idx} className="bg-[#141414] p-6 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-all hover:bg-[#1a1a1a]">
                <div className="flex items-baseline justify-between mb-4 border-b border-neutral-800 pb-2">
                  <h3 className="text-2xl font-serif-ttpd text-white">{item.word}</h3>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest">释义</span>
                </div>
                <p className="text-neutral-300 mb-4 font-serif-ttpd text-lg leading-relaxed">{item.definition}</p>
                <div className="text-sm text-neutral-500 bg-[#0a0a0a] p-3 rounded italic font-serif-ttpd">
                  "{item.contextInSong}"
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="animate-fade-in space-y-4">
             {data.connections.length === 0 && (
                 <p className="text-neutral-500 italic font-serif-ttpd p-4 text-center">档案库中未找到相关线索。</p>
             )}
            {data.connections.map((conn, idx) => (
              <div key={idx} className="flex gap-5 items-start p-5 bg-[#141414] border border-neutral-800/50 rounded-lg hover:bg-[#1a1a1a] hover:border-neutral-700 transition-all group">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover:text-white group-hover:border-neutral-600 transition-all shrink-0 shadow-lg">
                   <span className="font-serif-ttpd text-lg italic">TS</span>
                </div>
                <div>
                  <h4 className="text-white text-lg font-serif-ttpd mb-1 group-hover:text-[#d4c5a3] transition-colors">
                    {conn.songTitle} 
                  </h4>
                  <span className="inline-block text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-900 px-2 py-1 rounded mb-3">
                    {conn.album}
                  </span>
                  <p className="text-neutral-400 text-base leading-relaxed font-serif-ttpd">
                      {conn.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};