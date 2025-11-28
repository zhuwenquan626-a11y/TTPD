import React from 'react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  isSelected: boolean;
  onClick: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(song)}
      className={`
        w-full text-left p-4 rounded-lg transition-all duration-300 group
        ${isSelected 
          ? 'bg-neutral-800 border-l-4 border-neutral-300 shadow-lg' 
          : 'hover:bg-neutral-900 border-l-4 border-transparent hover:border-neutral-700'}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-8 h-8 flex items-center justify-center text-sm font-serif-ttpd
          ${isSelected ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}
        `}>
          {song.trackNumber}
        </div>
        <div className="flex-1">
          <h3 className={`
            font-medium text-base truncate transition-colors font-serif-ttpd
            ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}
          `}>
            {song.title}
          </h3>
          {song.isAnthology && (
            <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-sans-ttpd mt-1 block">
              The Anthology
            </span>
          )}
        </div>
      </div>
    </button>
  );
};