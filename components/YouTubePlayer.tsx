import React, { useEffect, useRef } from 'react';

// Declaration for the YouTube Iframe API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
  seekTo: number | null; // Timestamp to seek to
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  isPlaying, 
  onTimeUpdate, 
  onEnded,
  seekTo 
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Initialize Player
  useEffect(() => {
    // Load API Script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }

      if (!window.YT || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'controls': 0, // Custom controls
          'modestbranding': 1,
          'rel': 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    // Cleanup
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        // We generally keep the player instance alive to avoid re-initializing costs, 
        // but if the component unmounts entirely we could destroy it.
    };
  }, []);

  // Handle Video ID Change
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // Handle Play/Pause Prop
  useEffect(() => {
    if (playerRef.current && playerRef.current.getPlayerState) {
        const playerState = playerRef.current.getPlayerState();
        if (isPlaying && playerState !== 1 && playerState !== 3) {
            playerRef.current.playVideo();
        } else if (!isPlaying && playerState === 1) {
            playerRef.current.pauseVideo();
        }
    }
  }, [isPlaying]);

  // Handle Seek
  useEffect(() => {
      if (seekTo !== null && playerRef.current && playerRef.current.seekTo) {
          playerRef.current.seekTo(seekTo, true);
      }
  }, [seekTo]);

  const onPlayerReady = (event: any) => {
    if (isPlaying) {
        event.target.playVideo();
    }
    startPolling();
  };

  const onPlayerStateChange = (event: any) => {
      // 0 = ended
      if (event.data === 0) {
          onEnded();
      }
  };

  const startPolling = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
          if (playerRef.current && playerRef.current.getCurrentTime) {
              const current = playerRef.current.getCurrentTime();
              const duration = playerRef.current.getDuration();
              onTimeUpdate(current, duration);
          }
      }, 500);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-black relative group">
       <div ref={containerRef} className="w-full h-full" />
       {/* Overlay to prevent direct interaction if we want custom controls only, 
           but for YouTube it's often better to let them click if they want */}
       <div className="absolute inset-0 bg-transparent pointer-events-none border border-neutral-800 rounded-lg"></div>
    </div>
  );
};