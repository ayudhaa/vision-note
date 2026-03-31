import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Trash2, Sparkles, Clock, CheckCircle2, Volume2 } from 'lucide-react';
import Notiflix from 'notiflix';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'id-ID'; // bahasa Indonesia

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
        console.warn("Mendengarkan berhenti karena tidak ada suara.");
        setIsListening(false);
        return;
      }

      if (event.error === 'not-allowed') {
        Notiflix.Report.failure("Izin Ditolak", "Tolong izinkan akses microphone di browser.", "Oke");
      } else {
        console.error("Speech Error:", event.error);
      }
      
      setIsListening(false);
    };
    } else {
      Notiflix.Report.failure("Browser Not Supported", "Browser kamu tidak mendukung Speech Recognition. Gunakan Chrome atau Edge terbaru.", "Oke");
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
      Notiflix.Notify.info("Silakan bicara, saya mendengarkan...");
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
    Notiflix.Notify.success("Catatan suara berhasil disimpan!");
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('vision_notes_v2', JSON.stringify(updated));
    Notiflix.Notify.info("Catatan dihapus");
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 font-sans p-4 md:p-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2">
              VISION.NOTE <Sparkles className="text-indigo-600" size={24} />
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-1">Hands-Free productivity</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {isListening ? "Listening" : "Standby"}
            </span>
          </div>
        </header>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100 border border-white mb-12 relative overflow-hidden text-center">
          <div className={`absolute inset-0 opacity-5 transition-colors duration-700 ${isListening ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
              {isListening && (
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 scale-150"></div>
              )}
              <button 
                onClick={toggleListen}
                className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                  isListening ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </button>
            </div>
            
            <div className="w-full min-h-[120px] flex items-center justify-center px-4">
              {transcript ? (
                <p className="text-xl md:text-2xl font-bold text-slate-700 leading-tight italic">
                  "{transcript}"
                </p>
              ) : (
                <p className="text-slate-300 font-medium">
                  {isListening ? "Katakan sesuatu..." : "Tekan mic dan ceritakan ide kamu..."}
                </p>
              )}
            </div>

            {transcript && !isListening && (
              <div className="flex gap-4 mt-8 animate-bounce">
                <button 
                  onClick={saveNote}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all"
                >
                  Save to Tasks
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pb-20">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
               <Volume2 size={16} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Recorded History</h2>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Belum ada catatan suara</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-4 flex-1">
                   <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500 shrink-0">
                      <CheckCircle2 size={20} />
                   </div>
                   <div className="pr-4">
                      <p className="font-bold text-slate-800 text-sm md:text-base leading-snug">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-tighter">Voice Log</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {note.date}
                        </span>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => deleteNote(note.id)}
                  className="p-3 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="py-10 text-center opacity-30">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em]">made with❤️️</p>
        </footer>
      </div>
    </div>
  );
}