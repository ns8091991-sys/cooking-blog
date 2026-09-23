import { useEffect, useRef, useState } from 'react';

export default function StepTimer({ seconds }) {
    const [remaining, setRemaining] = useState(seconds);
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        setRemaining(seconds);
        setRunning(false);
        setDone(false);
    }, [seconds]);

    useEffect(() => {
        if (!running) return;

        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setRunning(false);
                    setDone(true);
                    playBeep();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [running]);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.start();
            osc.stop(ctx.currentTime + 1.2);
        } catch { }
    };

    const toggle = () => {
        if (done) {
            setRemaining(seconds);
            setDone(false);
            setRunning(true);
            return;
        }
        setRunning(!running);
    };

    const reset = () => {
        clearInterval(intervalRef.current);
        setRunning(false);
        setDone(false);
        setRemaining(seconds);
    };

    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const display = minutes > 0
        ? `${minutes}:${String(secs).padStart(2, '0')}`
        : `${secs} сек`;

    return (
        <div className={`step-timer ${running ? 'is-running' : ''} ${done ? 'is-done' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>

            <span className="step-timer__time">{display}</span>

            <button
                type="button"
                onClick={toggle}
                className="step-timer__btn"
                title={running ? 'Пауза' : done ? 'Заново' : 'Запустить'}
            >
                {running ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                )}
            </button>

            {(running || remaining !== seconds) && (
                <button
                    type="button"
                    onClick={reset}
                    className="step-timer__btn step-timer__btn--reset"
                    title="Сброс"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>
            )}
        </div>
    );
}