'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ISong } from '@/lib/models';

// Audio Player State
interface AudioPlayerState {
  currentSong: ISong | null;
  playlist: ISong[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffling: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

// Audio Player Actions
type AudioPlayerAction =
  | { type: 'SET_CURRENT_SONG'; payload: ISong }
  | { type: 'SET_PLAYLIST'; payload: ISong[] }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY_PAUSE' }
  | { type: 'NEXT_SONG' }
  | { type: 'PREVIOUS_SONG' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_REPEAT_MODE'; payload: 'none' | 'one' | 'all' }
  | { type: 'CLEAR_PLAYER' };

// Initial state
const initialAudioPlayerState: AudioPlayerState = {
  currentSong: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isShuffling: false,
  repeatMode: 'none',
};

// Audio Player Reducer
const audioPlayerReducer = (state: AudioPlayerState, action: AudioPlayerAction): AudioPlayerState => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      return {
        ...state,
        currentSong: action.payload,
        currentTime: 0,
      };

    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
      };

    case 'PLAY':
      return {
        ...state,
        isPlaying: true,
      };

    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
      };

    case 'TOGGLE_PLAY_PAUSE':
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };

    case 'NEXT_SONG': {
      if (state.playlist.length === 0 || !state.currentSong) return state;
      
      const currentIndex = state.playlist.findIndex(song => song._id === state.currentSong!._id);
      let nextIndex;
      
      if (state.isShuffling) {
        // Random next song (excluding current)
        const availableIndices = state.playlist
          .map((_, index) => index)
          .filter(index => index !== currentIndex);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        // Sequential next song
        nextIndex = (currentIndex + 1) % state.playlist.length;
      }
      
      return {
        ...state,
        currentSong: state.playlist[nextIndex],
        currentTime: 0,
      };
    }

    case 'PREVIOUS_SONG': {
      if (state.playlist.length === 0 || !state.currentSong) return state;
      
      const currentIndex = state.playlist.findIndex(song => song._id === state.currentSong!._id);
      
      if (state.isShuffling) {
        // Random previous song (excluding current)
        const availableIndices = state.playlist
          .map((_, index) => index)
          .filter(index => index !== currentIndex);
        const prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        return {
          ...state,
          currentSong: state.playlist[prevIndex],
          currentTime: 0,
        };
      } else {
        // Sequential previous song
        const prevIndex = currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1;
        return {
          ...state,
          currentSong: state.playlist[prevIndex],
          currentTime: 0,
        };
      }
    }

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0,
      };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted,
      };

    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffling: !state.isShuffling,
      };

    case 'SET_REPEAT_MODE':
      return {
        ...state,
        repeatMode: action.payload,
      };

    case 'CLEAR_PLAYER':
      return initialAudioPlayerState;

    default:
      return state;
  }
};

// Context
interface AudioPlayerContextType {
  state: AudioPlayerState;
  dispatch: React.Dispatch<AudioPlayerAction>;
  // Helper functions
  playSong: (song: ISong, playlist?: ISong[]) => void;
  playPlaylist: (playlist: ISong[], startIndex?: number) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

// Provider Component
export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(audioPlayerReducer, initialAudioPlayerState);

  // Helper functions
  const playSong = (song: ISong, playlist?: ISong[]) => {
    if (playlist) {
      dispatch({ type: 'SET_PLAYLIST', payload: playlist });
    }
    dispatch({ type: 'SET_CURRENT_SONG', payload: song });
    dispatch({ type: 'PLAY' });
  };

  const playPlaylist = (playlist: ISong[], startIndex: number = 0) => {
    dispatch({ type: 'SET_PLAYLIST', payload: playlist });
    if (playlist.length > 0) {
      dispatch({ type: 'SET_CURRENT_SONG', payload: playlist[startIndex] });
      dispatch({ type: 'PLAY' });
    }
  };

  const togglePlayPause = () => {
    dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
  };

  const nextSong = () => {
    dispatch({ type: 'NEXT_SONG' });
  };

  const previousSong = () => {
    dispatch({ type: 'PREVIOUS_SONG' });
  };

  const setCurrentTime = (time: number) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  const setDuration = (duration: number) => {
    dispatch({ type: 'SET_DURATION', payload: duration });
  };

  const setVolume = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const cycleRepeatMode = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    dispatch({ type: 'SET_REPEAT_MODE', payload: nextMode });
  };

  // Save state to localStorage
  useEffect(() => {
    try {
      const audioPlayerState = {
        volume: state.volume,
        isMuted: state.isMuted,
        isShuffling: state.isShuffling,
        repeatMode: state.repeatMode,
      };
      localStorage.setItem('audioPlayerSettings', JSON.stringify(audioPlayerState));
    } catch (error) {
      console.error('Error saving audio player settings:', error);
    }
  }, [state.volume, state.isMuted, state.isShuffling, state.repeatMode]);

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('audioPlayerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.volume !== undefined) {
          dispatch({ type: 'SET_VOLUME', payload: settings.volume });
        }
        if (settings.isMuted !== undefined && settings.isMuted) {
          dispatch({ type: 'TOGGLE_MUTE' });
        }
        if (settings.isShuffling !== undefined && settings.isShuffling) {
          dispatch({ type: 'TOGGLE_SHUFFLE' });
        }
        if (settings.repeatMode !== undefined) {
          dispatch({ type: 'SET_REPEAT_MODE', payload: settings.repeatMode });
        }
      }
    } catch (error) {
      console.error('Error loading audio player settings:', error);
    }
  }, []);

  const value: AudioPlayerContextType = {
    state,
    dispatch,
    playSong,
    playPlaylist,
    togglePlayPause,
    nextSong,
    previousSong,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Hook to use Audio Player Context
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

// Toast Notification Context
interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
}

interface ToastContextType {
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = React.useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Main Providers Component
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <AudioPlayerProvider>
        {children}
      </AudioPlayerProvider>
    </ToastProvider>
  );
};

export default Providers;