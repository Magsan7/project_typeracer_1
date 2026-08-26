import React, { useState } from 'react';

// Logic Tree Data Structure
const LOGIC_TREES = {
  buy: {
    icon: '🛒',
    title: 'Purchase',
    questions: [
      { text: "Is it under $20?", yes: 1, no: -1 },
      { text: "Do you need it this week?", yes: 2, no: -1 },
      { text: "Will it clutter your space?", yes: -1, no: 1 }
    ],
    results: {
      positive: "Buy it! Treat yourself.",
      negative: "Skip it. Save your cash.",
      neutral: "Sleep on it for 24 hours."
    }
  },
  do: {
    icon: '🏃',
    title: 'Activity',
    questions: [
      { text: "Will it take more than 2 hours?", yes: -1, no: 1 },
      { text: "Does it require leaving the house?", yes: -1, no: 1 },
      { text: "Is it something you've been putting off?", yes: 2, no: -1 }
    ],
    results: {
      positive: "Do it! You'll feel better.",
      negative: "Not right now. Protect your peace.",
      neutral: "Flip a coin."
    }
  },
  eat: {
    icon: '🍔',
    title: 'Food',
    questions: [
      { text: "Is it relatively healthy?", yes: 1, no: -1 },
      { text: "Can you get/make it in under 30 mins?", yes: 1, no: -1 },
      { text: "Are you actually hungry (not just bored)?", yes: 2, no: -2 }
    ],
    results: {
      positive: "Go for it! Enjoy your meal.",
      negative: "Skip it. Have some water first.",
      neutral: "Grab a small snack instead."
    }
  }
};

export default function App() {
  const [step, setStep] = useState(0);
  const [dilemma, setDilemma] = useState('');
  const [category, setCategory] = useState(null);
  const [score, setScore] = useState(0);
  const [qIndex, setQIndex] = useState(0); // Which of the 3 questions are we on?

  const resetApp = () => {
    setStep(0);
    setDilemma('');
    setCategory(null);
    setScore(0);
    setQIndex(0);
  };

  const handleAnswer = (multiplier) => {
    const currentQ = LOGIC_TREES[category].questions[qIndex];
    setScore(prev => prev + (multiplier === 'yes' ? currentQ.yes : currentQ.no));
    
    if (qIndex < 2) {
      setQIndex(prev => prev + 1);
    } else {
      setStep(3); // Go to results
    }
  };

  return (
    <div className="app-container">
      {/* STEP 0: Input Dilemma */}
      {step === 0 && (
        <div className="fade-wrapper">
          <h1>Micro-Resolution</h1>
          <p className="subtitle">Rational decisions for low-stakes dilemmas.</p>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="e.g. Should I order pizza?" 
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && dilemma && setStep(1)}
            />
            <button 
              className="btn-primary" 
              disabled={!dilemma.trim()} 
              onClick={() => setStep(1)}
            >
              Solve It
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Select Category */}
      {step === 1 && (
        <div className="fade-wrapper">
          <p className="subtitle">"{dilemma}"</p>
          <h2>What kind of decision is this?</h2>
          <div className="category-grid">
            {Object.entries(LOGIC_TREES).map(([key, data]) => (
              <button 
                key={key} 
                className="btn-option"
                onClick={() => {
                  setCategory(key);
                  setStep(2);
                }}
              >
                {data.icon} {data.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: The 3 Questions */}
      {step === 2 && category && (
        <div className="fade-wrapper">
          <div className="progress-bar">
            {[0, 1, 2].map(i => (
              <div key={i} className={`dot ${i <= qIndex ? 'active' : ''}`} />
            ))}
          </div>
          <p className="subtitle">"{dilemma}"</p>
          <h2 className="question-text">
            {LOGIC_TREES[category].questions[qIndex].text}
          </h2>
          <div className="binary-grid">
            <button className="btn-option btn-yes" onClick={() => handleAnswer('yes')}>
              Yes
            </button>
            <button className="btn-option btn-no" onClick={() => handleAnswer('no')}>
              No
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: The Result */}
      {step === 3 && (
        <div className="fade-wrapper result-box">
          <p className="subtitle">"{dilemma}"</p>
          <div className={`result-decision ${score > 0 ? 'result-positive' : score < 0 ? 'result-negative' : 'result-neutral'}`}>
            {score > 0 
              ? LOGIC_TREES[category].results.positive 
              : score < 0 
                ? LOGIC_TREES[category].results.negative 
                : LOGIC_TREES[category].results.neutral}
          </div>
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
            Rationality Score: {score}
          </p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={resetApp}>
            New Dilemma
          </button>
        </div>
      )}
    </div>
  );
}