"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type RecordingState = 'idle' | 'loading' | 'recording' | 'recorded' | 'playing';

type VoiceInputSectionProps = {
  onTranscriptSubmit?: (transcript: string) => void;
  className?: string;
};

export const VoiceInputSection = ({ 
  onTranscriptSubmit,
  className 
}: VoiceInputSectionProps) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const startRecording = useCallback(async () => {
    try {
      setState('loading');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio analysis for waveform
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => {
          track.stop();
        });
        audioContext.close();
        setState('recorded');
      };

      mediaRecorder.start();
      setState('recording');
      
      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (!analyser) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);
    }
  }, [state]);

  const playRecording = useCallback(() => {
    if (!audioBlob) return;
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audioElementRef.current = audio;
    audio.onended = () => setState('recorded');
    audio.play();
    setState('playing');
  }, [audioBlob]);

  const pausePlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setState('recorded');
    }
  }, []);

  const restart = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioBlob(null);
    audioChunksRef.current = [];
    setState('idle');
  }, []);

  const submitRecording = useCallback(() => {
    // In a real implementation, this would send to a transcription service
    onTranscriptSubmit?.('[Voice message transcription would appear here]');
    restart();
  }, [onTranscriptSubmit, restart]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={cn(
      "rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Leave us a message 🎤
        </h3>
        <p className="text-sm text-gray-600">
          Record a voice message or share your feedback
        </p>
      </div>

      {/* Waveform Visualization */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-20 gap-1">
          {state === 'idle' && (
            <div className="text-center">
              <Mic className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <span className="text-xs text-gray-400">Click record to start</span>
            </div>
          )}
          
          {state === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <span className="text-xs text-gray-400">Starting...</span>
            </div>
          )}
          
          {state === 'recording' && (
            <div className="flex items-center justify-center gap-1 w-full">
              {Array.from({ length: 20 }).map((_, i) => {
                const height = Math.max(20, audioLevel * 60 + Math.random() * 20);
                return (
                  <div
                    key={`waveform-bar-${i}`}
                    className="bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
                    style={{
                      width: '4px',
                      height: `${height}px`,
                      opacity: 0.6 + audioLevel * 0.4
                    }}
                  />
                );
              })}
            </div>
          )}
          
          {(state === 'recorded' || state === 'playing') && (
            <div className="text-center">
              <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <span className="text-xs text-gray-600">
                {state === 'playing' ? 'Playing...' : 'Ready to play'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Mute Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          disabled={state === 'recording' || state === 'loading'}
          className={cn(
            "p-3 rounded-full transition-all",
            isMuted 
              ? "bg-red-100 text-red-600 hover:bg-red-200" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            (state === 'recording' || state === 'loading') && "opacity-50 cursor-not-allowed"
          )}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Record/Stop Button */}
        {state === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            disabled={isMuted}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
            aria-label="Start recording"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span>Start Recording</span>
            </div>
          </button>
        )}

        {(state === 'loading' || state === 'recording') && (
          <button
            type="button"
            onClick={stopRecording}
            disabled={state === 'loading'}
            className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition-all font-medium shadow-lg"
            aria-label="Stop recording"
          >
            <div className="flex items-center gap-2">
              <Pause className="w-5 h-5" />
              <span>Stop</span>
            </div>
          </button>
        )}

        {/* Play Button */}
        {state === 'recorded' && (
          <button
            type="button"
            onClick={playRecording}
            className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all"
            aria-label="Play recording"
          >
            <Play className="w-5 h-5" />
          </button>
        )}

        {/* Pause Button */}
        {state === 'playing' && (
          <button
            type="button"
            onClick={pausePlayback}
            className="p-3 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-all"
            aria-label="Pause playback"
          >
            <Pause className="w-5 h-5" />
          </button>
        )}

        {/* Delete Button */}
        <button
          type="button"
          onClick={restart}
          disabled={state === 'idle' || state === 'loading' || state === 'recording'}
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Delete recording"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        {/* Submit Button */}
        {(state === 'recorded' || state === 'playing') && (
          <button
            type="button"
            onClick={submitRecording}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
            aria-label="Submit recording"
          >
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              <span>Send</span>
            </div>
          </button>
        )}
      </div>

      {/* Recording Status */}
      {state === 'recording' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-700">Recording in progress</span>
          </div>
        </div>
      )}
    </div>
  );
};
