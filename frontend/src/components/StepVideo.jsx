import { useState } from 'react';

function isYouTube(url) {
    return /(?:youtube\.com|youtu\.be)/.test(url || '');
}

function parseYouTubeId(url) {
    if (!url) return null;
    const m = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
}

export default function StepVideo({ url, title }) {
    const [playing, setPlaying] = useState(false);

    if (!url) return null;

    // ===== YouTube =====
    if (isYouTube(url)) {
        const videoId = parseYouTubeId(url);
        if (!videoId) return null;

        const posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

        return (
            <div className="step-video">
                {!playing ? (
                    <button
                        type="button"
                        className="step-video__preview"
                        onClick={() => setPlaying(true)}
                    >
                        <img src={posterUrl} alt={title || 'Видео'} />
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
                            title={title || 'Видео'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
        );
    }

    // ===== Прямой mp4 (Yandex, Cloudinary, свой сервер) =====
    return (
        <div className="step-video">
            {!playing ? (
                <button
                    type="button"
                    className="step-video__preview step-video__preview--plain"
                    onClick={() => setPlaying(true)}
                >
                    <span className="step-video__play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                            <polygon points="6 3 20 12 6 21 6 3" />
                        </svg>
                    </span>
                    <span className="step-video__hint">Смотреть видео</span>
                </button>
            ) : (
                <div className="step-video__frame">
                    <video src={url} controls autoPlay style={{ width: '100%', height: '100%' }} />
                </div>
            )}
        </div>
    );
}