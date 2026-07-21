import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Check, ImagePlus, Maximize2, Pause, Play, Trash2, Upload, X } from 'lucide-react';

interface VideoFrameCaptureProps {
  onUseAsCover: (file: File) => void;
  onAddToQuickView: (files: File[]) => void | Promise<void>;
}

interface CapturedFrame {
  id: string;
  file: File;
  url: string;
  time: number;
  saved: boolean;
}

const FRAME_STEP = 1 / 30;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00.000';
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  const prefix = hours ? `${String(hours).padStart(2, '0')}:` : '';
  return `${prefix}${String(minutes).padStart(2, '0')}:${remaining.toFixed(3).padStart(6, '0')}`;
};

const parseTime = (value: string) => {
  const parts = value.trim().split(':').map(Number);
  if (!parts.length || parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
};

const VideoFrameCapture: React.FC<VideoFrameCaptureProps> = ({ onUseAsCover, onAddToQuickView }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameUrlsRef = useRef<Set<string>>(new Set());
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeInput, setTimeInput] = useState('00:00.000');
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [addingToQuickView, setAddingToQuickView] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const [actionMessage, setActionMessage] = useState('');

  const unsavedFrames = useMemo(() => frames.filter((frame) => !frame.saved), [frames]);
  const selectedFrames = useMemo(() => frames.filter((frame) => selectedIds.has(frame.id)), [frames, selectedIds]);

  useEffect(() => {
    if (!videoFile) {
      setVideoUrl('');
      return;
    }
    const nextUrl = URL.createObjectURL(videoFile);
    setVideoUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [videoFile]);

  useEffect(() => {
    const preventAccidentalExit = (event: BeforeUnloadEvent) => {
      if (!unsavedFrames.length) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventAccidentalExit);
    return () => window.removeEventListener('beforeunload', preventAccidentalExit);
  }, [unsavedFrames.length]);

  useEffect(() => () => {
    frameUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    frameUrlsRef.current.clear();
  }, []);

  const seekTo = (seconds: number) => {
    const nextTime = Math.min(Math.max(seconds, 0), duration || 0);
    setCurrentTime(nextTime);
    setTimeInput(formatTime(nextTime));
    if (videoRef.current) videoRef.current.currentTime = nextTime;
  };

  const closeCutter = () => {
    if (unsavedFrames.length && !window.confirm(`You have ${unsavedFrames.length} unsaved captured image(s). Close anyway?`)) return;
    setIsExpanded(false);
  };

  const chooseVideo = (file: File | null) => {
    if (!file) return;
    if (unsavedFrames.length && !window.confirm('Changing the video will remove captured images that have not been added. Continue?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    frames.forEach((frame) => {
      URL.revokeObjectURL(frame.url);
      frameUrlsRef.current.delete(frame.url);
    });
    setFrames([]);
    setSelectedIds(new Set());
    setVideoFile(file);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setTimeInput('00:00.000');
    setErrorMessage('');
    setActionMessage('');
    setAddProgress(0);
    setIsExpanded(true);
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setErrorMessage('Choose a video and wait for it to finish loading.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');
    video.pause();

    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const maxDimension = 1920;
      const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
      const outputWidth = Math.max(1, Math.round(video.videoWidth * scale));
      const outputHeight = Math.max(1, Math.round(video.videoHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('This browser could not prepare the selected frame.');

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(video, 0, 0, outputWidth, outputHeight);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      canvas.width = 1;
      canvas.height = 1;
      if (!blob) throw new Error('The selected frame could not be converted to an image.');

      const captureTime = video.currentTime;
      const baseName = videoFile?.name.replace(/\.[^.]+$/, '') || 'video';
      const frameFile = new File([blob], `${baseName}-frame-${captureTime.toFixed(3).replace('.', '-')}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      const id = `frame-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const url = URL.createObjectURL(frameFile);
      frameUrlsRef.current.add(url);
      setFrames((current) => [...current, { id, file: frameFile, url, time: captureTime, saved: false }]);
      setSelectedIds((current) => new Set(current).add(id));
      setActionMessage(`Captured frame at ${formatTime(captureTime)}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The selected frame could not be captured.');
    } finally {
      setProcessing(false);
    }
  };

  const removeFrame = (id: string) => {
    const target = frames.find((frame) => frame.id === id);
    if (target) {
      URL.revokeObjectURL(target.url);
      frameUrlsRef.current.delete(target.url);
    }
    setFrames((current) => current.filter((frame) => frame.id !== id));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  const useAsCover = (frame: CapturedFrame) => {
    onUseAsCover(frame.file);
    setFrames((current) => current.map((item) => item.id === frame.id ? { ...item, saved: true } : item));
    setActionMessage('Cover image updated.');
  };

  const addSelectedFrames = async () => {
    if (!selectedFrames.length || addingToQuickView) return;
    const idsToRemove = new Set(selectedFrames.map((frame) => frame.id));
    setAddingToQuickView(true);
    setAddProgress(15);
    setActionMessage(`Preparing ${selectedFrames.length} captured image(s)...`);
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      setAddProgress(50);
      setActionMessage('Adding image blocks to Quick View...');
      await onAddToQuickView(selectedFrames.map((frame) => frame.file));
      setAddProgress(100);
      setActionMessage(`${selectedFrames.length} image(s) added to Quick View.`);
      selectedFrames.forEach((frame) => {
        URL.revokeObjectURL(frame.url);
        frameUrlsRef.current.delete(frame.url);
      });
      setFrames((current) => current.filter((frame) => !idsToRemove.has(frame.id)));
      setSelectedIds(new Set());
    } catch (error) {
      setAddProgress(0);
      setActionMessage(error instanceof Error ? error.message : 'Unable to add captured images to Quick View.');
    } finally {
      setAddingToQuickView(false);
    }
  };

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select')) return;
      if (event.code === 'Space') {
        event.preventDefault();
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) void video.play(); else video.pause();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekTo(currentTime - (event.shiftKey ? 1 : FRAME_STEP));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekTo(currentTime + (event.shiftKey ? 1 : FRAME_STEP));
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        void captureFrame();
      } else if (event.key === 'Escape') {
        closeCutter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const cutter = isExpanded && videoUrl ? (
    <div className="video-frame-cutter-backdrop" role="dialog" aria-modal="true" aria-label="Video frame cutter">
      <section className="video-frame-cutter-workspace">
        <header className="video-frame-cutter-header">
          <div><strong>Cut image from video</strong><span>{videoFile?.name}</span></div>
          <button type="button" onClick={closeCutter} aria-label="Close frame cutter"><X size={20} /></button>
        </header>

        <div className="video-frame-cutter-stage">
          <video
            ref={videoRef}
            className="video-frame-capture-player"
            src={videoUrl}
            playsInline
            preload="metadata"
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration || 0);
              setCurrentTime(0);
              setTimeInput('00:00.000');
            }}
            onTimeUpdate={(event) => {
              setCurrentTime(event.currentTarget.currentTime);
              setTimeInput(formatTime(event.currentTarget.currentTime));
            }}
            onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>

        <div className="video-frame-cutter-controls">
          <input
            className="video-frame-cutter-range"
            type="range"
            min="0"
            max={duration || 0}
            step="0.001"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.target.value))}
            aria-label="Choose video frame time"
          />
          <div className="video-frame-cutter-time-row">
            <div className="video-frame-cutter-step-buttons">
              <button
                type="button"
                className="video-frame-play-button"
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  if (video.paused) void video.play(); else video.pause();
                }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button type="button" onClick={() => seekTo(currentTime - 1)}>-1 sec</button>
              <button type="button" onClick={() => seekTo(currentTime - FRAME_STEP)}>-1 frame</button>
              <button type="button" className="video-frame-capture-button" disabled={processing} onClick={() => void captureFrame()}>
                <Camera size={16} /> {processing ? 'Creating...' : 'Capture'}
              </button>
              <button type="button" onClick={() => seekTo(currentTime + FRAME_STEP)}>+1 frame</button>
              <button type="button" onClick={() => seekTo(currentTime + 1)}>+1 sec</button>
            </div>
            <form
              className="video-frame-cutter-timecode"
              onSubmit={(event) => {
                event.preventDefault();
                const nextTime = parseTime(timeInput);
                if (nextTime === null) setErrorMessage('Use a timecode such as 01:24.500.');
                else seekTo(nextTime);
              }}
            >
              <input value={timeInput} onChange={(event) => setTimeInput(event.target.value)} aria-label="Exact video time" />
              <span>/ {formatTime(duration)}</span>
              <button type="submit">Go</button>
            </form>
          </div>
          <p className="video-frame-cutter-shortcuts">Space: play/pause · Arrow keys: 1 frame · Shift + arrow: 1 second · C: capture</p>
        </div>

        <div className="video-frame-cutter-tray">
          <div className="video-frame-cutter-tray-header">
            <div><strong>Captured images</strong><span>{frames.length} frame(s)</span></div>
            <div>
              <button type="button" disabled={!frames.length} onClick={() => setSelectedIds(selectedIds.size === frames.length ? new Set() : new Set(frames.map((frame) => frame.id)))}>
                {selectedIds.size === frames.length && frames.length ? 'Clear selection' : 'Select all'}
              </button>
              <button type="button" className="video-frame-add-selected" disabled={!selectedFrames.length || addingToQuickView} onClick={() => void addSelectedFrames()}>
                <ImagePlus size={15} /> {addingToQuickView ? 'Adding...' : `Add selected (${selectedFrames.length})`}
              </button>
            </div>
          </div>
          {frames.length ? (
            <div className="video-frame-cutter-filmstrip">
              {frames.map((frame) => {
                const selected = selectedIds.has(frame.id);
                return (
                  <article key={frame.id} className={`video-frame-cutter-card ${selected ? 'is-selected' : ''}`}>
                    <button
                      type="button"
                      className="video-frame-cutter-select"
                      onClick={() => setSelectedIds((current) => {
                        const next = new Set(current);
                        if (next.has(frame.id)) next.delete(frame.id); else next.add(frame.id);
                        return next;
                      })}
                      aria-label={selected ? 'Deselect captured frame' : 'Select captured frame'}
                    >
                      <img src={frame.url} alt={`Captured at ${formatTime(frame.time)}`} />
                      <i>{selected && <Check size={14} />}</i>
                    </button>
                    <div><time>{formatTime(frame.time)}</time><small>{Math.max(1, Math.round(frame.file.size / 1024))} KB</small></div>
                    <footer>
                      <button type="button" onClick={() => useAsCover(frame)}>Use as cover</button>
                      <button type="button" onClick={() => removeFrame(frame.id)} aria-label="Delete captured frame"><Trash2 size={14} /></button>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : <div className="video-frame-cutter-empty">Move to a scene and press Capture. Your images will appear here.</div>}
        </div>

        {(addingToQuickView || actionMessage) && (
          <div className={`video-frame-action-status ${addProgress === 0 && actionMessage.toLowerCase().includes('unable') ? 'video-frame-action-status--error' : ''}`} role="status" aria-live="polite">
            <div><i style={{ width: `${addProgress}%` }} /></div>
            <span>{actionMessage}</span>
          </div>
        )}
        {errorMessage && <p className="video-frame-capture-error">{errorMessage}</p>}
      </section>
    </div>
  ) : null;

  return (
    <div className="video-frame-capture">
      <label className="video-frame-capture-picker">
        <Upload size={16} aria-hidden="true" />
        <span>{videoFile ? videoFile.name : 'Choose a video from computer'}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          onChange={(event) => chooseVideo(event.target.files?.[0] ?? null)}
        />
      </label>
      {videoFile && (
        <button type="button" className="video-frame-open-cutter" onClick={() => setIsExpanded(true)}>
          <Maximize2 size={15} /> Open frame cutter {frames.length ? `(${frames.length})` : ''}
        </button>
      )}
      {actionMessage && !isExpanded && <small className="video-frame-capture-summary">{actionMessage}</small>}
      {cutter && createPortal(cutter, document.body)}
    </div>
  );
};

export default VideoFrameCapture;
