import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, Send, Mic, Volume2, Sparkles, 
  User, VolumeX, AlertCircle, Square, X, RotateCcw, Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  lang?: string;
  audio?: string;
  suggestions?: string[];
  engine?: string;
  isError?: boolean;
}

type VoiceState = 
  | 'IDLE'         // Waiting for microphone activation
  | 'RECORDING'    // Recording continuously
  | 'STOPPED'      // Recording has stopped
  | 'TRANSCRIBING' // Converting audio into text
  | 'REVIEW'       // Displaying recognized text for review
  | 'SUBMITTING'   // Sending question to AI
  | 'RESPONDING'   // Receiving AI response
  | 'ERROR';       // Displaying error

export const Assistant: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: language === 'kn'
        ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಮಿತ್ರ ಎಐ ಸಹಾಯಕ. ಬೆಳೆ ಬೇಸಾಯ, ಕೀಟ-ರೋಗ ನಿಯಂತ್ರಣ, ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಸುಣ್ಣದ ಬಳಕೆ, ಗೊಬ್ಬರ ಪ್ರಮಾಣ, ಜೀವಾಮೃತ, ಹನಿ ನೀರಾವರಿ, ಹೈನುಗಾರಿಕೆ, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಕುರಿತು ನೀವು ಯಾವುದೇ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಧ್ವನಿ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಕೇಳಬಹುದು.'
        : 'Namaskara! I am your Krishi Mitra AI assistant. Ask any agricultural question: crop cultivation, pest and disease control, soil testing and lime application, fertilizer dosages, Jeevamrutha, drip irrigation, dairy and silage, mandi prices, or government schemes.',
      timestamp: 'Just now',
      lang: language === 'kn' ? 'kn' : 'en',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [voiceLang, setVoiceLang] = useState<'kn-IN' | 'en-IN'>(language === 'kn' ? 'kn-IN' : 'en-IN');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [reviewedText, setReviewedText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [detectedVoiceLang, setDetectedVoiceLang] = useState<'kn' | 'en'>(language === 'kn' ? 'kn' : 'en');
  const [sending, setSending] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, voiceState]);

  // Keep voiceLang in sync when main language switch button is clicked
  useEffect(() => {
    setVoiceLang(language === 'kn' ? 'kn-IN' : 'en-IN');
  }, [language]);

  // Properly release microphone resources
  const releaseMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Error stopping audio tracks:', e);
      }
      mediaStreamRef.current = null;
    }
  }, []);

  // Stop audio and release recording resources on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      releaseMicrophone();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [releaseMicrophone]);

  // Format recording timer into MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fallback to browser speech synthesis if backend audio cannot be streamed
  const fallbackSpeechSynthesis = useCallback(
    (text: string, msgId: string, forcedLang?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();

      const isKannada = forcedLang === 'kn' || forcedLang === 'kn-IN' || /[\u0C80-\u0CFF]/.test(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isKannada ? 'kn-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (isKannada) {
        const knVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('kn') || v.name.toLowerCase().includes('kannada')
        );
        if (knVoice) utterance.voice = knVoice;
      } else {
        const enVoice =
          voices.find((v) => v.lang.toLowerCase().includes('en-in')) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => setSpeakingId(msgId);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Play Crystal-Clear Native Audio
  const playSpeech = useCallback(
    async (text: string, msgId: string, forcedLang?: string, audioDataUri?: string) => {
      // 1. If currently speaking this message, stop/pause it
      if (speakingId === msgId) {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setSpeakingId(null);
        return;
      }

      // Stop any other audio that is playing
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // 2. If pre-generated crystal-clear audio exists, play directly!
      if (audioDataUri) {
        try {
          const audio = new Audio(audioDataUri);
          audioElementRef.current = audio;
          setSpeakingId(msgId);
          audio.onended = () => setSpeakingId(null);
          audio.onerror = () => fallbackSpeechSynthesis(text, msgId, forcedLang);
          await audio.play();
          return;
        } catch (err) {
          console.warn('Audio play failed, falling back:', err);
        }
      }

      // 3. Request high-clarity audio stream from backend
      try {
        setSpeakingId(msgId);
        const res = await api.post('/assistant/tts', {
          text,
          lang: forcedLang || (language === 'kn' ? 'kn' : 'en'),
        });

        if (res.data.success && res.data.audio) {
          // Cache audio on message
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, audio: res.data.audio } : m))
          );
          const audio = new Audio(res.data.audio);
          audioElementRef.current = audio;
          audio.onended = () => setSpeakingId(null);
          audio.onerror = () => fallbackSpeechSynthesis(text, msgId, forcedLang);
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Backend TTS failed, using browser synthesis:', err);
      }

      // 4. Fallback to browser synthesis if network unavailable
      fallbackSpeechSynthesis(text, msgId, forcedLang);
    },
    [speakingId, language, fallbackSpeechSynthesis]
  );

  // Submit a message (text or voice-dictated)
  const submitMessage = async (queryText: string, autoSpeak = false): Promise<void> => {
    const textToSend = queryText.trim();
    if (!textToSend || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    // Build recent conversation history for multi-turn conversational context
    const historyPayload = messages.slice(-8).map((m) => ({
      sender: m.sender,
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
      message: m.text,
    }));

    try {
      const res = await api.post('/assistant/chat', {
        message: userMsg.text,
        language: language,
        history: historyPayload,
      });

      const detectedLang = res.data?.language || (language === 'kn' ? 'kn' : 'en');
      const botText = res.data?.reply || res.data?.answer || '';
      const botSuggestions = res.data?.suggestions || res.data?.follow_up_questions || [];
      const botId = (Date.now() + 1).toString();

      if (botText) {
        const botMsg: ChatMessage = {
          id: botId,
          sender: 'assistant',
          text: botText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lang: detectedLang,
          audio: res.data?.audio,
          suggestions: botSuggestions,
          engine: res.data?.engine,
          isError: !res.data?.success,
        };

        setMessages((prev) => [...prev, botMsg]);

        // Automatically speak answer in original detected language
        if (autoSpeak && botMsg.text && !botMsg.isError) {
          setTimeout(() => {
            playSpeech(botMsg.text, botId, detectedLang, botMsg.audio);
          }, 150);
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorDetail = err?.response?.data?.message || err?.response?.data?.answer || '';
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: errorDetail || (language === 'kn'
          ? 'ಕ್ಷಮಿಸಿ, ಜೆಮಿನಿ ಎಐ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅಥವಾ ಬ್ಯಾಕೆಂಡ್ API ಕೀಲಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.'
          : 'Sorry, could not connect to Gemini AI. Please check your network or backend API key configuration.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lang: language === 'kn' ? 'kn' : 'en',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sending) return;
    submitMessage(inputText, false);
  };

  // 1. MICROPHONE START: Continuous recording with explicit user stop
  const startRecording = async () => {
    setVoiceError(null);
    setReviewedText('');
    fullTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setRecordingDuration(0);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('ERROR');
      setVoiceError(
        language === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome ಅಥವಾ Microsoft Edge ಬಳಸಿ.'
          : 'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    // Request microphone permission explicitly
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }
    } catch (permErr: any) {
      console.warn('Microphone permission error:', permErr);
      setVoiceState('ERROR');
      setVoiceError(
        permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError'
          ? (language === 'kn'
              ? 'ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿಸಿ.'
              : 'Microphone access denied. Please allow microphone permissions in your browser.')
          : (language === 'kn'
              ? 'ಮೈಕ್ರೋಫೋನ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಾಧನವನ್ನು ಪರಿಶೀಲಿಸಿ.'
              : 'Could not access microphone. Please check your audio input device.')
      );
      return;
    }

    isRecordingRef.current = true;
    setVoiceState('RECORDING');

    // Start timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const startTimestamp = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration(Math.floor((Date.now() - startTimestamp) / 1000));
    }, 1000);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcriptChunk = item[0]?.transcript || '';
          if (item.isFinal) {
            fullTranscriptRef.current += (fullTranscriptRef.current ? ' ' : '') + transcriptChunk.trim();
          } else {
            interim += transcriptChunk;
          }
        }
        interimTranscriptRef.current = interim;
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          isRecordingRef.current = false;
          releaseMicrophone();
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setVoiceState('ERROR');
          setVoiceError('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'network') {
          isRecordingRef.current = false;
          releaseMicrophone();
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setVoiceState('ERROR');
          setVoiceError('Speech recognition network error. Please check your internet connection.');
        }
        // Silence timeouts ('no-speech') are deliberately ignored while recording is active
      };

      recognition.onend = () => {
        // Automatically restart speech recognition until user manually clicks Stop Recording
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (err) {
            // Already active or restarting
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      isRecordingRef.current = false;
      releaseMicrophone();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setVoiceState('ERROR');
      setVoiceError('Could not start speech recognition. Please try again.');
    }
  };

  // 2. MANUAL STOP RECORDING
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setVoiceState('STOPPED');
    releaseMicrophone();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Move to TRANSCRIBING state to flush all audio recognition
    setVoiceState('TRANSCRIBING');

    setTimeout(() => {
      const finalParts = [
        fullTranscriptRef.current.trim(),
        interimTranscriptRef.current.trim(),
      ].filter(Boolean);
      const combined = finalParts.join(' ').trim();

      // Exact Voice Not Recognized condition
      if (!combined) {
        setVoiceState('ERROR');
        setVoiceError('Your voice was not recognized. Please try again.');
        return;
      }

      // Detect language: Kannada script or voiceLang preference
      const isKn = /[\u0C80-\u0CFF]/.test(combined) || voiceLang === 'kn-IN';
      setDetectedVoiceLang(isKn ? 'kn' : 'en');
      setReviewedText(combined);
      setInputText(combined);
      setVoiceState('REVIEW');
    }, 400);
  };

  // Cancel and discard recording
  const cancelRecording = () => {
    isRecordingRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    releaseMicrophone();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    fullTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setReviewedText('');
    setVoiceError(null);
    setVoiceState('IDLE');
  };

  // 3. MANUAL SEND FROM REVIEW STATE
  const handleReviewSend = async () => {
    const textToSend = reviewedText.trim();
    if (!textToSend || sending) return;

    setVoiceState('SUBMITTING');
    try {
      await submitMessage(textToSend, true);
      setVoiceState('RESPONDING');
      setReviewedText('');
      setTimeout(() => {
        setVoiceState('IDLE');
      }, 400);
    } catch (err) {
      setVoiceState('ERROR');
      setVoiceError('Failed to send question to AI. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-7 border border-[#DCE9D5]/30 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-[#D5A94F]/20 to-transparent rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3 py-1 rounded-full text-xs font-bold text-[#D5A94F] mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>Module 8 · Bilingual Agricultural Dialogue & Voice AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            {language === 'kn' ? 'ಕೃಷಿ ಎಐ ಸಹಾಯಕ' : 'Krishi AI Voice Assistant'}
          </h1>
          <p className="text-xs text-[#DCE9D5] mt-1 font-medium">
            Natural voice & text companion in Kannada & English · Grounded agronomic guidance & official schemes.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs relative z-10">
          <button
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="bg-[#1B452B] text-[#D5A94F] px-4 py-2 rounded-xl border border-[#D5A94F]/40 font-bold hover:bg-[#245C3A] hover:text-white transition cursor-pointer shadow-xs"
          >
            Switch to {language === 'en' ? 'ಕನ್ನಡ (KN)' : 'English (EN)'}
          </button>
        </div>
      </div>

      {/* ── Chat Container ───────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#DCE9D5] shadow-field-lg flex flex-col h-[65vh]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            const isSpeakingThis = speakingId === m.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-start space-x-3 will-change-[transform,opacity] ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    isBot ? 'bg-[#245C3A] text-white' : 'bg-[#D5A94F] text-[#1B452B]'
                  }`}
                >
                  {isBot ? <Bot className="w-5 h-5 text-[#D5A94F]" /> : <User className="w-5 h-5 text-white" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? m.isError
                        ? 'bg-amber-50/90 text-[#303B32] border border-amber-300 shadow-xs'
                        : 'bg-[#F7F8F0] text-[#303B32] border border-[#DCE9D5] shadow-xs'
                      : 'bg-[#245C3A] text-white shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-wrap flex-1">{m.text}</p>
                    {isBot && !m.isError && (
                      <button
                        type="button"
                        onClick={() => playSpeech(m.text, m.id, m.lang, m.audio)}
                        className={`p-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                          isSpeakingThis
                            ? 'bg-[#245C3A] text-[#D5A94F] ring-2 ring-[#D5A94F] animate-pulse'
                            : 'text-[#245C3A]/70 hover:text-[#245C3A] hover:bg-[#DCE9D5]'
                        }`}
                        title={
                          isSpeakingThis
                            ? (language === 'kn' ? 'ನಿಲ್ಲಿಸಿ (Stop)' : 'Stop reading')
                            : (language === 'kn' ? 'ಧ್ವನಿ ಕೇಳಿ (Play voice)' : 'Read aloud / Replay audio')
                        }
                      >
                        {isSpeakingThis ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-[#D5A94F]" />}
                      </button>
                    )}
                  </div>

                  {/* Contextual Follow-up Question Chips */}
                  {isBot && m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#DCE9D5] flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-[#68756A] w-full flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-[#D5A94F]" />
                        <span>{language === 'kn' ? 'ಮುಂದಿನ ಪ್ರಶ್ನೆಗಳ ಸಲಹೆಗಳು:' : 'Suggested follow-up questions:'}</span>
                      </span>
                      {m.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => {
                            setInputText(sug);
                            submitMessage(sug, false);
                          }}
                          disabled={sending}
                          className="bg-white hover:bg-[#EDF4EA] border border-[#245C3A]/25 text-[#245C3A] text-[11px] font-medium px-2.5 py-1 rounded-full transition cursor-pointer shadow-2xs hover:border-[#245C3A]"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1">
                    <span className={isBot ? 'text-[#68756A]' : 'text-[#DCE9D5]/80'}>
                      {m.timestamp}
                    </span>
                    {isBot && m.engine && (
                      <span className="text-[9px] bg-[#EDF4EA] text-[#245C3A] px-2 py-0.5 rounded-md font-mono font-semibold border border-[#DCE9D5]">
                        ✨ {m.engine}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {sending && (
            <div className="flex items-center space-x-2.5 text-xs text-[#245C3A] pl-12 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#245C3A] animate-bounce"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D5A94F] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#245C3A] animate-bounce [animation-delay:0.4s]"></span>
              <span className="font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D5A94F] animate-spin" />
                <span>
                  {language === 'kn'
                    ? 'ಜೆಮಿನಿ ಎಐ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...'
                    : 'Gemini AI is analyzing agricultural context...'}
                </span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Suggestions across multiple agricultural domains */}
        <div className="px-4 py-2.5 border-t border-[#DCE9D5]/60 bg-[#F7F8F0] flex items-center space-x-2 overflow-x-auto no-scrollbar text-[11px]">
          <span className="font-bold text-[#68756A] shrink-0">
            {language === 'kn' ? 'ಪ್ರಶ್ನಾವಳಿ ಸಲಹೆಗಳು:' : 'Try asking:'}
          </span>
          {[
            'ನನ್ನ ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ ಏನು ಮಾಡಬೇಕು?',
            'ಅಡಿಕೆ ಕೊಳೆ ರೋಗ ಮತ್ತು ಬೋರ್ಡೋ ದ್ರಾವಣ',
            'ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಸೈನಿಕ ಹುಳು ಹತೋಟಿ',
            'ಜೀವಾಮೃತ ತಯಾರಿಸುವ ವಿಧಾನ',
            'ಆಮ್ಲೀಯ ಮಣ್ಣಿಗೆ ಸುಣ್ಣ ಮತ್ತು ಜಿಪ್ಸಂ ಬಳಕೆ',
            'ಭತ್ತದ ಶ್ರೀ ಪದ್ಧತಿ ಮತ್ತು ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು',
            'ಹಸುಗಳಲ್ಲಿ ಹಾಲಿನ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ಸೈಲೇಜ್ ಮಾಡುವುದು ಹೇಗೆ?',
            'How to control Fall Armyworm in Maize?',
            'Causes and remedies for yellow leaves in crops',
            'Jeevamrutha organic preparation steps',
            'Soil testing & lime application for acidic soils',
            'Krishi Honda farm pond subsidy',
            'Today APMC Mandi prices in Karnataka',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(prompt);
                submitMessage(prompt, false);
              }}
              className="bg-[#FFFFFF] border border-[#DCE9D5] hover:border-[#245C3A] hover:bg-[#EDF4EA] text-[#245C3A] px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition font-medium shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* ── State-Based Voice Interaction Area ────────────────────────── */}

        {/* 1. STATE: RECORDING */}
        {voiceState === 'RECORDING' && (
          <div className="p-4 border-t border-rose-200 bg-rose-50/80 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full bg-rose-600 animate-ping absolute"></span>
                  <span className="w-4 h-4 rounded-full bg-rose-600 relative"></span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-rose-800 text-sm">
                      {language === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... (Listening...)' : 'Listening...'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 text-xs font-mono font-bold">
                      {formatDuration(recordingDuration)}
                    </span>
                    <span className="text-xs text-rose-700 font-semibold bg-white/90 px-2 py-0.5 rounded border border-rose-200">
                      {voiceLang === 'kn-IN' ? '🎙️ ಕನ್ನಡ' : '🎙️ English'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68756A] mt-0.5">
                    {language === 'kn'
                      ? 'ವಿರಾಮಗಳೊಂದಿಗೆ ನಿರಾಳವಾಗಿ ಮಾತನಾಡಿ. ರೆಕಾರ್ಡಿಂಗ್ ಮುಗಿದ ನಂತರ "ನಿಲ್ಲಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ.'
                      : 'Speak freely with pauses. Recording will not stop until you click Stop Recording.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center space-x-1 transition cursor-pointer"
                  title="Cancel recording"
                >
                  <X className="w-4 h-4" />
                  <span>{language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}</span>
                </button>

                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-2 shadow-md shadow-rose-600/20 transition cursor-pointer"
                  title="Stop recording"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>{language === 'kn' ? 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ' : 'Stop Recording'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. STATE: TRANSCRIBING */}
        {voiceState === 'TRANSCRIBING' && (
          <div className="p-4 border-t border-[#DCE9D5] bg-[#F7F8F0] rounded-b-3xl">
            <div className="flex items-center justify-center space-x-3 p-4 bg-[#EDF4EA] rounded-2xl border border-[#DCE9D5] text-[#245C3A]">
              <Loader2 className="w-5 h-5 animate-spin text-[#245C3A]" />
              <span className="text-xs sm:text-sm font-semibold">
                {language === 'kn'
                  ? 'ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ... (Processing audio...)'
                  : 'Processing recorded audio into text...'}
              </span>
            </div>
          </div>
        )}

        {/* 3. STATE: REVIEW */}
        {voiceState === 'REVIEW' && (
          <div className="p-4 border-t border-[#DCE9D5] bg-[#F7F8F0] rounded-b-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D5A94F]" />
                <span className="text-xs font-bold text-[#303B32]">
                  {language === 'kn' ? 'ಗುರುತಿಸಲಾದ ಪ್ರಶ್ನೆ ಪರಿಶೀಲಿಸಿ' : 'Review Recognized Question'}
                </span>
                <span className="text-[10px] bg-[#DCE9D5] text-[#245C3A] px-2 py-0.5 rounded-full font-bold border border-[#C5D8BC]">
                  {detectedVoiceLang === 'kn' ? '🎙️ Kannada (ಕನ್ನಡ)' : '🎙️ English'}
                </span>
              </div>
              <span className="text-[10px] text-[#68756A]">
                {language === 'kn' ? 'ಕಳುಹಿಸುವ ಮೊದಲು ತಿದ್ದಿಕೊಳ್ಳಬಹುದು' : 'Click Send to submit to AI'}
              </span>
            </div>

            <textarea
              value={reviewedText}
              onChange={(e) => setReviewedText(e.target.value)}
              rows={2}
              className="w-full bg-white border border-[#DCE9D5] rounded-2xl p-3 text-xs sm:text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A] resize-none shadow-xs"
              placeholder={language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ...' : 'Your question will appear here...'}
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#68756A] hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                >
                  {language === 'kn' ? 'ರದ್ದುಮಾಡಿ (Cancel)' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#245C3A] bg-[#DCE9D5] hover:bg-[#245C3A] hover:text-white transition cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'kn' ? 'ಮತ್ತೆ ಮಾತನಾಡಿ' : 'Record Again'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReviewSend}
                disabled={!reviewedText.trim() || sending}
                className="bg-[#245C3A] hover:bg-[#1B452B] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <span>{language === 'kn' ? 'ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ (Send)' : 'Send Question'}</span>
                <Send className="w-4 h-4 text-[#D5A94F]" />
              </button>
            </div>
          </div>
        )}

        {/* 4. STATE: ERROR */}
        {voiceState === 'ERROR' && voiceError && (
          <div className="p-4 border-t border-rose-200 bg-rose-50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">{voiceError}</p>
                {voiceError === 'Your voice was not recognized. Please try again.' && language === 'kn' && (
                  <p className="text-xs text-rose-700/80 mt-0.5">ನಿಮ್ಮ ಧ್ವನಿ ಗುರುತಿಸಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setVoiceError(null);
                  setVoiceState('IDLE');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 transition cursor-pointer"
              >
                {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#245C3A] hover:bg-[#1B452B] flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-[#D5A94F]" />
                <span>{language === 'kn' ? 'ಮತ್ತೆ ಮಾತನಾಡಿ' : 'Try Again'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. STATE: IDLE / SUBMITTING / RESPONDING (Standard Input Bar) */}
        {(voiceState === 'IDLE' || voiceState === 'SUBMITTING' || voiceState === 'RESPONDING') && (
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-[#DCE9D5] bg-[#FFFFFF] rounded-b-3xl flex items-center space-x-2">
            {/* Voice Input Button */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={startRecording}
                disabled={sending}
                className="p-3 rounded-2xl transition cursor-pointer shrink-0 bg-[#EDF4EA] hover:bg-[#DCE9D5] text-[#245C3A] border border-[#DCE9D5] shadow-2xs group"
                title={language === 'kn' ? 'ಕನ್ನಡ/ಇಂಗ್ಲಿಷ್ ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ' : 'Start voice recording in Kannada or English'}
              >
                <Mic className="w-5 h-5 text-[#245C3A] group-hover:scale-110 transition-transform" />
              </button>

              {/* Quick Voice Language Switcher pill */}
              <button
                type="button"
                onClick={() => {
                  const nextLang = voiceLang === 'kn-IN' ? 'en-IN' : 'kn-IN';
                  setVoiceLang(nextLang);
                }}
                className="ml-1.5 px-2.5 py-1 bg-[#F7F8F0] hover:bg-[#EDF4EA] border border-[#DCE9D5] rounded-xl text-[10px] font-bold text-[#245C3A] shrink-0 transition"
                title="Toggle speech recognition language"
              >
                {voiceLang === 'kn-IN' ? '🎙️ ಕನ್ನಡ' : '🎙️ English'}
              </button>
            </div>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'kn'
                  ? 'ಕೃಷಿ ಯೋಜನೆಗಳು, ರೋಗ ಹತೋಟಿ, ಗೊಬ್ಬರ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ದರದ ಕುರಿತು ಕೇಳಿ...'
                  : 'Ask anything about schemes, disease control, fertilizers, or mandi rates...'
              }
              disabled={sending}
              className="flex-1 bg-[#F7F8F0] border border-[#DCE9D5] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#303B32] placeholder-[#8F9C91] focus:outline-none focus:ring-2 focus:ring-[#245C3A] disabled:opacity-70 shadow-2xs"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="bg-[#245C3A] hover:bg-[#1B452B] disabled:opacity-50 text-white p-3 rounded-2xl transition cursor-pointer shrink-0 shadow-sm"
              title="Send Message"
            >
              <Send className="w-5 h-5 text-[#D5A94F]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
