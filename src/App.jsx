import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Trash2, Sparkles, Clock, CheckCircle2, Volume2, Play, VolumeX } from 'lucide-react';
import Notiflix from 'notiflix';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(1);
  
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

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          setIsListening(false);
          return;
        }
        setIsListening(false);
      };
    }

    const saved = localStorage.getItem('vision_notes_v2');
    if (saved) setNotes(JSON.parse(saved));
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
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('vision_notes_v2', JSON.stringify(updated));
  };

  const playNote = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.volume = volume;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
    Notiflix.Notify.info(`Memutar (Vol: ${Math.round(volume * 100)}%)`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2 text-slate-900">
              VISION.NOTE <Sparkles className="text-slate-400" size={24} />
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-1">Produktivitas Tanpa Ketik</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
            <div className="flex items-center gap-2 px-2 border-r border-slate-100">
              {volume === 0 ? <VolumeX size={16} className="text-slate-300" /> : <Volume2 size={16} className="text-slate-400" />}
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {isListening ? "Mendengarkan" : "Standby"}
              </span>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 mb-12 relative overflow-hidden text-center">
          <div className={`absolute inset-0 opacity-[0.03] transition-colors duration-700 ${isListening ? 'bg-orange-500' : 'bg-slate-900'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
              {isListening && <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-20 scale-150"></div>}
              <button 
                onClick={toggleListen}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                  isListening ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-100'
                }`}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
            </div>
            <div className="w-full min-h-[100px] flex items-center justify-center px-4">
              {transcript ? (
                <p className="text-xl font-semibold text-slate-700 leading-tight italic">"{transcript}"</p>
              ) : (
                <p className="text-slate-300 font-medium tracking-wide">
                  {isListening ? "Mendengarkan suara..." : "Ketuk mikrofon untuk mulai bicara..."}
                </p>
              )}
            </div>
            {transcript && !isListening && (
              <div className="flex gap-4 mt-8">
                <button onClick={saveNote} className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all">
                  Simpan Catatan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pb-20">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Volume2 size={16} /></div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Riwayat Suara</h2>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Belum ada aktivitas terbaru</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 flex-1">
                   <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 shrink-0"><CheckCircle2 size={20} /></div>
                   <div className="pr-4 text-left">
                      <p className="font-semibold text-slate-700 text-sm md:text-base leading-snug">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Voice Log</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {note.date}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => playNote(note.text)} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all" title="Putar">
                    <Play size={18} fill="currentColor" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Hapus">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="py-10 text-center opacity-20">
            <p className="text-[9px] font-black text-slate-500 tracking-[0.6em]">made with❤️️</p>
        </footer>
      </div>
    </div>
  );
}