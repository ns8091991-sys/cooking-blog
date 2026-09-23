import { useState } from 'react';

/**
 * Извлекает ID видео из любой YouTube-ссылки.
 * Поддерживает:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID
 *  - https://m.youtube.com/watch?v=VIDEO_ID
 */
function parseYouTubeId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

export default function StepVideo({ url, title }) {
    const [playing, setPlaying] = useState(false);
    const videoId = parseYouTubeId(url);

    if (!videoId) return null;

    // Постер (превью) — берём с YouTube автоматически
    const posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

    return (
        <div className="step-video">
            {!playing ? (
                <button
                    type="button"
                    className="step-video__preview"
                    onClick={() => setPlaying(true)}
                    aria-label="Смотреть видео"
                >
                    <img src={posterUrl} alt={title || 'Видео шага'} />
                    <span className="step-video__play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                            <polygon points="6 3 20 12 6 21 6 3" />
                        </svg>
                    </span>
                </button>
            ) : (
                <div className="step-video__frame">
                    <iframe
                        src={embedUrl}
                        title={title || 'Видео шага'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}
        </div>
    );
}