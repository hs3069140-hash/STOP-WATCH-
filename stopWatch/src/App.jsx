import { useEffect, useRef, useState } from 'react'
import './App.css'

function formatTime(milliseconds) {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const centiseconds = totalCentiseconds % 100
  const totalSeconds = Math.floor(totalCentiseconds / 100)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':') + `.${String(centiseconds).padStart(2, '0')}`
}

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [laps, setLaps] = useState([])
  const baseTimeRef = useRef(0)
  const startedAtRef = useRef(0)

  useEffect(() => {
    if (!isRunning) return undefined

    const intervalId = window.setInterval(() => {
      setElapsedMs(baseTimeRef.current + performance.now() - startedAtRef.current)
    }, 10)

    return () => window.clearInterval(intervalId)
  }, [isRunning])

  function toggleRunning() {
    if (isRunning) {
      const exactElapsed = baseTimeRef.current + performance.now() - startedAtRef.current
      baseTimeRef.current = exactElapsed
      setElapsedMs(exactElapsed)
      setIsRunning(false)
      return
    }

    startedAtRef.current = performance.now()
    setIsRunning(true)
  }

  function reset() {
    baseTimeRef.current = 0
    startedAtRef.current = 0
    setElapsedMs(0)
    setIsRunning(false)
    setLaps([])
  }

  function recordLap() {
    const totalMs = isRunning
      ? baseTimeRef.current + performance.now() - startedAtRef.current
      : elapsedMs
    const previousLapMs = laps[0]?.totalMs ?? 0

    setElapsedMs(totalMs)
    setLaps((currentLaps) => [
      { id: currentLaps.length + 1, totalMs, lapMs: totalMs - previousLapMs },
      ...currentLaps,
    ])
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Second home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 1.5M9 2h6M12 2v3M18 6l1.5-1.5" />
            </svg>
          </span>
          <span>SECOND<span className="brand-light">/</span></span>
        </a>
        <span className="topbar-label">A LITTLE MORE FOCUSED</span>
      </header>

      <section className="stopwatch-card" aria-labelledby="page-title">
        <div className="card-heading">
          <div>
            <p className="eyebrow">YOUR TIME, YOUR PACE</p>
            <h1 id="page-title">Stopwatch</h1>
          </div>
          <div className={`status-pill${isRunning ? ' is-running' : ''}`}>
            <span className="status-dot" />
            {isRunning ? 'Running' : elapsedMs > 0 ? 'Paused' : 'Ready'}
          </div>
        </div>

        <div className="timer-wrap">
          <div
            className="timer-display"
            role="timer"
            aria-label={`${formatTime(elapsedMs)} elapsed`}
          >
            {formatTime(elapsedMs)}
          </div>
          <p className="timer-caption">HOURS <span>/</span> MINUTES <span>/</span> SECONDS <span>/</span> HUNDREDTHS</p>
        </div>

        <div className="controls" aria-label="Stopwatch controls">
          <button
            className={`button button-primary${isRunning ? ' button-pause' : ''}`}
            type="button"
            onClick={toggleRunning}
          >
            {isRunning ? (
              <>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9m6-9v9" /></svg>
                Pause
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3.5 7 4.5-7 4.5z" /></svg>
                {elapsedMs > 0 ? 'Resume' : 'Start'}
              </>
            )}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={recordLap}
            disabled={elapsedMs === 0 && !isRunning}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" /></svg>
            Lap
          </button>
          <button
            className="button button-quiet"
            type="button"
            onClick={reset}
            disabled={elapsedMs === 0 && laps.length === 0 && !isRunning}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 5.5A5 5 0 1 1 3 9m.5-6v3h3" /></svg>
            Reset
          </button>
        </div>

        <section className="laps-section" aria-labelledby="laps-title">
          <div className="laps-heading">
            <h2 id="laps-title">Lap times</h2>
            <span className="lap-count">{String(laps.length).padStart(2, '0')}</span>
          </div>
          {laps.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l2.5 1.5" />
                </svg>
              </span>
              <p>Your laps will show up here.</p>
              <span>Start the timer, then tap Lap to mark a split.</span>
            </div>
          ) : (
            <div className="lap-list" role="list" aria-label="Recorded lap times">
              {laps.map((lap, index) => (
                <div className="lap-row" key={lap.id} role="listitem">
                  <span className="lap-number">Lap {String(lap.id).padStart(2, '0')}</span>
                  <span className="lap-split">{formatTime(lap.lapMs)}</span>
                  <span className="lap-total">{formatTime(lap.totalMs)}</span>
                  {index === 0 && <span className="lap-latest">LATEST</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <footer className="footer">
        <span>MADE FOR THE MOMENT</span>
        <span>NO RUSH. JUST TIME.</span>
      </footer>
    </main>
  )
}

export default App
