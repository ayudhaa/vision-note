import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Trash2, Sparkles, Clock, CheckCircle2, Volume2, Play, VolumeX, Square, Pause, PlayCircle } from 'lucide-react';
import Notiflix from 'notiflix';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(1); 
  const [isPlayingId, setIsPlayingId] = useState(null); // Menandai catatan mana yang sedang bunyi
  const [isPaused, setIsPaused] = useState(false);
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'id-ID';

      recognition.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.current.onend = () => setIsListening(false);
      recognition.current.onerror = () => setIsListening(false);
    }

    const saved = localStorage.getItem('vision_notes_v2');
    if (saved) setNotes(JSON.parse(saved));
    return () => window.speechSynthesis.cancel();
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      setTranscript("");
      recognition.current.start();
      setIsListening(true);
      Notiflix.Notify.info("Silakan bicara...");
    }
  };

  const saveNote = () => {
    if (!transcript.trim()) return;
    const newNote = {
      id: Date.now(),
      text: transcript,
      date: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('vision_notes_v2', JSON.stringify(updatedNotes));
    setTranscript("");
    Notiflix.Notify.success("Catatan disimpan!");
  };

  const deleteNote = (id) => {
    if (isPlayingId === id) stopAudio();
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('vision_notes_v2', JSON.stringify(updated));
  };

  const playNote = (note) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(note.text);
    utterance.lang = 'id-ID';
    utterance.volume = volume;
    utterance.rate = 1;

    utterance.onstart = () => {
      setIsPlayingId(note.id);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlayingId(null);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseAudio = () => {
    if (window.speechSynthesis.speaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlayingId(null);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12 gap-6 text-center sm:text-left">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter flex justify-center sm:justify-start items-center gap-2 text-slate-900">
              VISION.NOTE <Sparkles className="text-slate-400" size={20} />
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Produktivitas Tanpa Ketik</p>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100">
              {volume === 0 ? <VolumeX size={14} className="text-slate-300" /> : <Volume2 size={14} className="text-slate-400" />}
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 sm:w-20 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
            <div className="flex items-center gap-2 pr-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {isListening ? "Listening" : "Standby"}
              </span>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 md:mb-12 relative overflow-hidden text-center">
          <div className={`absolute inset-0 opacity-[0.03] transition-colors duration-700 ${isListening ? 'bg-orange-500' : 'bg-slate-900'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6 md:mb-8">
              {isListening && <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-20 scale-150"></div>}
              <button 
                onClick={toggleListen}
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                  isListening ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-100'
                }`}
              >
                {isListening ? <MicOff size={30} /> : <Mic size={30} />}
              </button>
            </div>
            <div className="w-full min-h-[60px] md:min-h-[100px] flex items-center justify-center px-2">
              {transcript ? (
                <p className="text-base sm:text-lg md:text-2xl font-semibold text-slate-700 leading-snug italic px-2">"{transcript}"</p>
              ) : (
                <p className="text-slate-300 text-sm sm:text-base font-medium tracking-wide">
                  {isListening ? "Mendengarkan suara..." : "Ketuk mikrofon untuk mulai bicara..."}
                </p>
              )}
            </div>
            {transcript && !isListening && (
              <div className="flex gap-4 mt-6 md:mt-10 w-full justify-center">
                <button onClick={saveNote} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 md:px-12 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
                  Simpan Catatan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 pb-20">
          <div className="flex items-center gap-3 mb-4 md:mb-6 px-2">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600"><Volume2 size={14} /></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Riwayat Suara</h2>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-white/50 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Belum ada riwayat aktivitas</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white p-4 sm:p-5 md:p-7 rounded-2xl sm:rounded-[2rem] border border-slate-100 flex items-start justify-between group hover:shadow-lg transition-all gap-3">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                   <div className="bg-slate-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-slate-400 shrink-0 mt-0.5">
                      <CheckCircle2 size={18} className="sm:size-5" />
                   </div>
                   <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-xs sm:text-sm md:text-base leading-snug break-words">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 tracking-tighter">Voice Log</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {note.date}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {isPlayingId === note.id ? (
                    <>
                      <button onClick={pauseAudio} className="p-2 sm:p-3 text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title={isPaused ? "Lanjutkan" : "Jeda"}>
                        {isPaused ? <PlayCircle size={18} /> : <Pause size={18} />}
                      </button>
                      <button onClick={stopAudio} className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Berhenti">
                        <Square size={16} fill="currentColor" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => playNote(note)} className="p-2 sm:p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" title="Putar">
                      <Play size={18} fill="currentColor" />
                    </button>
                  )}
                  <button onClick={() => deleteNote(note.id)} className="p-2 sm:p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100" title="Hapus">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="py-8 md:py-12 text-center opacity-20">
            <p className="text-[8px] sm:text-[9px] font-black text-slate-500 tracking-[0.6em]">made with❤️</p>
        </footer>
      </div>
    </div>
  );
}