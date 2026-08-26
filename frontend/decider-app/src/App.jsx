import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WORD_POOL = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","are","was","were","been","has","had","did","doing","does","done","very","much","many","own","same","few","too","such","every","each","between","during","before","again","further","once","here","above","below","under","off","still","yet","however","therefore","although","since","until","while","though","both","either","neither","whether","always","never","sometimes","often","usually","rarely","today","tomorrow","yesterday","world","life","hand","part","child","eye","woman","place","case","point","government","company","number","group","problem","fact","water","room","area","money","story","month","lot","right","study","book","word","business","issue","side","kind","head","house","service","friend","father","power","hour","game","line","end","member","law","car","city","community","name","president","team","minute","idea","body","information","parent","face","others","level","office","door","health","person","art","war","history","party","result","change","morning","reason","research","girl","guy","moment","air","teacher","force","education","engine","signal","track","speed","clock","record","target","system","screen","key","letter","finger","rhythm","focus","stream","circuit","panel","light","cable","code","input","output","driver","fuel","gauge","meter","pulse","grid","frame","motion","curve","edge","layer","node","index","cursor","token","stack","queue","buffer","kernel","thread","socket","packet","router","server","client","cache"
];

const THEMES = [
  { id: 'rally', color: '#F5A623' },
  { id: 'terminal', color: '#4ade80' },
  { id: 'aurora', color: '#2dd4bf' },
  { id: 'ember', color: '#f87171' },
  { id: 'graphite', color: '#9ca3af' }
];

export default function App() {
  const [theme, setTheme] = useState('terminal');
  const [mode, setMode] = useState('time'); 
  const [timeSetting, setTimeSetting] = useState(30);
  const [wordSetting, setWordSetting] = useState(25);

  const [words, setWords] = useState([]);
  const [typedHistory, setTypedHistory] = useState([]); 
  const [currentInput, setCurrentInput] = useState('');
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  
  const [status, setStatus] = useState('idle'); 
  const [timeLeft, setTimeLeft] = useState(30);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [rawStats, setRawStats] = useState({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
  
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef(null);
  const activeWordRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const generateTest = useCallback(() => {
    const wordCount = mode === 'words' ? wordSetting : 300;
    const shuffled = Array.from({ length: wordCount }, () => WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
    setWords(shuffled);
    setTypedHistory([]);
    setCurrentInput('');
    setActiveWordIndex(0);
    setStatus('idle');
    setTimeLeft(mode === 'time' ? timeSetting : 0);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [mode, timeSetting, wordSetting]);

  useEffect(() => { generateTest(); fetchLeaderboard(); }, [generateTest]);

  useEffect(() => {
    let interval;
    if (status === 'running') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        if (mode === 'time') setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, mode]);

  const totalCharsTypedSoFar = typedHistory.join('').length + currentInput.length;
  const liveWpm = timeElapsed > 0 ? Math.round((totalCharsTypedSoFar / 5) / (timeElapsed / 60)) : 0;

  // ==========================================
  // UPDATED STRICT WPM MATH LOGIC
  // ==========================================
  const endTest = useCallback(() => {
    setStatus('finished');
    
    let correctChars = 0;
    let incorrectChars = 0;
    let extraChars = 0;
    let missedChars = 0;

    for (let i = 0; i <= activeWordIndex; i++) {
      if (i === words.length) break;

      const actualWord = words[i];
      const typedWord = i === activeWordIndex ? currentInput : (typedHistory[i] || '');

      // Skip the active word if they haven't typed a single letter of it yet
      if (i === activeWordIndex && typedWord.length === 0) continue;

      for (let j = 0; j < Math.max(typedWord.length, actualWord.length); j++) {
        if (j >= actualWord.length) {
          extraChars++;
        } else if (j >= typedWord.length) {
          // This catches the spacebar skip exploit!
          missedChars++;
        } else if (typedWord[j] === actualWord[j]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }

      // Spacebar reward: Only given if the word is completely correct
      if (i < activeWordIndex && typedWord === actualWord) {
        correctChars++; 
      }
    }

    const finalTime = mode === 'time' ? timeSetting : timeElapsed;
    const minutes = Math.max(finalTime, 1) / 60;

    setRawStats({ correct: correctChars, incorrect: incorrectChars, extra: extraChars, missed: missedChars });
    setWpm(Math.max(0, Math.round((correctChars / 5) / minutes)));

    const totalAttempted = correctChars + incorrectChars + extraChars + missedChars;
    setAccuracy(totalAttempted > 0 ? Math.round((correctChars / totalAttempted) * 100) : 100);

  }, [activeWordIndex, words, currentInput, typedHistory, mode, timeSetting, timeElapsed]);
  // ==========================================

  useEffect(() => { if (mode === 'time' && status === 'running' && timeLeft <= 0) endTest(); }, [timeLeft, status, mode, endTest]);
  useEffect(() => { if (mode === 'words' && status === 'running' && activeWordIndex >= wordSetting) endTest(); }, [activeWordIndex, wordSetting, status, mode, endTest]);

  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const parent = containerRef.current;
      const child = activeWordRef.current;
      
      const lineHeight = child.offsetHeight; 
      
      if (child.offsetTop > lineHeight * 1.5) {
        parent.scrollTop = child.offsetTop - lineHeight; 
      } else {
        parent.scrollTop = 0;
      }
    }
  }, [activeWordIndex, currentInput]);

  const handleKeyDown = (e) => {
    if (status === 'finished') return;
    if (e.key === 'Tab') { e.preventDefault(); generateTest(); return; }
    
    if (status === 'idle' && e.key.length === 1 && !e.ctrlKey && !e.metaKey) setStatus('running');

    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.length === 0 && typedHistory.length === activeWordIndex) return; 
      
      const newHistory = [...typedHistory];
      newHistory[activeWordIndex] = currentInput;
      setTypedHistory(newHistory);
      setActiveWordIndex(prev => prev + 1);
      setCurrentInput('');
    } 
    else if (e.key === 'Backspace') {
      if (currentInput.length === 0 && activeWordIndex > 0) {
        const prevIndex = activeWordIndex - 1;
        setActiveWordIndex(prevIndex);
        setCurrentInput(typedHistory[prevIndex] || '');
        const newHistory = [...typedHistory];
        newHistory.pop();
        setTypedHistory(newHistory);
      }
    }
  };

  const handleChange = (e) => {
    if (status === 'finished') return;
    
    if (status === 'idle' && e.target.value.length > 0) {
      setStatus('running');
    }

    const val = e.target.value.trim();
    if (val.length <= words[activeWordIndex].length + 15) setCurrentInput(val);
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scores`);
      setLeaderboard(await res.json());
    } catch (err) { console.error(err); }
  };

  const saveScore = async () => {
    if (isSaving || !username.trim()) return;
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), top_score: wpm, accuracy })
      });
      setUsername('');
      fetchLeaderboard();
    } catch (err) { console.error(err); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>TypeForge</div>
        <div className="theme-picker">{THEMES.map(t => (<div key={t.id} className={`swatch ${theme === t.id ? 'active' : ''}`} style={{ background: t.color }} onClick={() => setTheme(t.id)} title={t.id} />))}</div>
      </header>
      <main>
        {status !== 'finished' ? (
          <div className="type-card">
            <div className={`mode-selector ${status === 'running' ? 'hidden' : ''}`}>
              <div className="mode-tabs">
                <button className={mode === 'time' ? 'active' : ''} onClick={() => setMode('time')}>⏰ time</button>
                <button className={mode === 'words' ? 'active' : ''} onClick={() => setMode('words')}>📝 words</button>
              </div>
              <div className="mode-options">
                {mode === 'time' 
                  ? [15, 30, 60, 120].map(val => <button key={val} className={timeSetting === val ? 'active' : ''} onClick={() => setTimeSetting(val)}>{val}</button>)
                  : [10, 25, 50, 100].map(val => <button key={val} className={wordSetting === val ? 'active' : ''} onClick={() => setWordSetting(val)}>{val}</button>)
                }
              </div>
            </div>
            <div className={`live-stats ${status === 'running' ? 'show' : ''}`}>
              <div className="timer">{mode === 'time' ? timeLeft : timeElapsed}s</div><div className="live-wpm">{liveWpm} wpm</div>
            </div>
            <div className="words-viewport" ref={containerRef} onClick={() => inputRef.current?.focus()}>
              <div className={`focus-overlay ${!isFocused && status !== 'finished' ? 'show' : ''}`}><span><kbd>Click</kbd> or press any key to focus</span></div>
              <input ref={inputRef} type="text" value={currentInput} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="hidden-input" autoComplete="off" autoCapitalize="off" spellCheck="false" />
              <div className={`words-container ${!isFocused ? 'blurred' : ''}`}>
                {words.map((word, wIdx) => {
                  const isActiveWord = wIdx === activeWordIndex;
                  const isPastWord = wIdx < activeWordIndex;
                  const typed = isPastWord ? typedHistory[wIdx] : (isActiveWord ? currentInput : '');
                  const extraLetters = typed.length > word.length ? typed.slice(word.length) : '';
                  return (
                    <div key={wIdx} ref={isActiveWord ? activeWordRef : null} className={`word ${isActiveWord ? 'active' : ''} ${isPastWord && typed !== word ? 'error-word' : ''}`}>
                      {word.split('').map((char, cIdx) => {
                        let charClass = "letter pending";
                        if (cIdx < typed.length) charClass = typed[cIdx] === char ? "letter correct" : "letter incorrect";
                        return <span key={cIdx} className={`${charClass} ${isActiveWord && cIdx === typed.length ? 'caret' : ''}`}>{char}</span>;
                      })}
                      {extraLetters.split('').map((char, cIdx) => <span key={`extra-${cIdx}`} className={`letter extra ${isActiveWord && cIdx === extraLetters.length - 1 ? 'caret-after' : ''}`}>{char}</span>)}
                      {isActiveWord && typed.length === 0 && <span className="caret-absolute"></span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="footer-actions"><button onClick={generateTest} className="restart-btn" tabIndex="-1">↻ Restart Test</button><div className="shortcut-hint"><kbd>Tab</kbd> to restart</div></div>
          </div>
        ) : (
          <div className="results-panel show">
            <div className="stats-grid">
              <div className="stat-box primary"><div className="stat-label">WPM</div><div className="stat-value">{wpm}</div></div>
              <div className="stat-box primary"><div className="stat-label">ACCURACY</div><div className="stat-value">{accuracy}%</div></div>
              <div className="stat-box"><div className="stat-label">TIME</div><div className="stat-value-small">{mode === 'time' ? timeSetting : timeElapsed}s</div></div>
              <div className="stat-box"><div className="stat-label">CHARACTERS</div><div className="stat-value-small chars">{rawStats.correct}/{rawStats.incorrect}/{rawStats.extra}/{rawStats.missed}</div></div>
            </div>
            <div className="save-section">
              <input type="text" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} className="username-input" maxLength={20} />
              <button onClick={saveScore} disabled={isSaving || !username.trim()} className="action-btn next-btn">{isSaving ? 'Saving...' : 'Save Score'}</button>
              <button onClick={generateTest} className="action-btn outline-btn">Next Test</button>
            </div>
            <div className="history-body">
              <h3>🏆 Global Leaderboard</h3>
              <div className="table-container">
                <table className="history-table">
                  <thead><tr><th>Rank</th><th>User</th><th>WPM</th><th>Accuracy</th></tr></thead>
                  <tbody>
                    {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                      <tr key={entry.id}>
                        <td><span className="rank-badge">#{idx + 1}</span></td>
                        <td className="fw-bold">{entry.username}</td><td className="text-accent">{entry.top_score}</td><td>{entry.accuracy}%</td>
                      </tr>
                    )) : <tr><td colSpan="4" className="empty-state">No scores yet. Set the first record!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}