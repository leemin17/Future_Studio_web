import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Check, ImagePlus, Maximize2, Pause, Play, Sparkles, Trash2, Upload, X } from 'lucide-react';

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
const selectionModeDescriptions = {
  balanced: 'Balances sharpness, exposure, color and composition. Recommended for most projects.',
  sharp: 'Prioritizes crisp details and rejects frames affected by motion blur.',
  color: 'Prioritizes vivid color, stronger contrast and visually energetic frames.',
} as const;

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

interface FrameSample {
  time: number;
  signature: Uint8Array;
  brightness: number;
  contrast: number;
  sharpness: number;
  colorfulness: number;
  extremePixelRatio: number;
  changeFromPrevious: number;
  score: number;
}

const waitForMetadata = (video: HTMLVideoElement) => new Promise<void>((resolve, reject) => {
  if (video.readyState >= 1 && Number.isFinite(video.duration)) {
    resolve();
    return;
  }
  const handleLoaded = () => { cleanup(); resolve(); };
  const handleError = () => { cleanup(); reject(new Error('The selected video could not be analyzed.')); };
  const cleanup = () => {
    video.removeEventListener('loadedmetadata', handleLoaded);
    video.removeEventListener('error', handleError);
  };
  video.addEventListener('loadedmetadata', handleLoaded);
  video.addEventListener('error', handleError);
  video.load();
});

const seekVideo = (video: HTMLVideoElement, time: number) => new Promise<void>((resolve, reject) => {
  const safeTime = Math.min(Math.max(time, 0), Math.max(0, video.duration - 0.001));
  if (Math.abs(video.currentTime - safeTime) < 0.002 && video.readyState >= 2) {
    resolve();
    return;
  }
  const timeout = window.setTimeout(() => {
    cleanup();
    reject(new Error('Video seeking took too long. Please try another file format.'));
  }, 8000);
  const handleSeeked = () => { cleanup(); resolve(); };
  const handleError = () => { cleanup(); reject(new Error('Unable to read this position in the video.')); };
  const cleanup = () => {
    window.clearTimeout(timeout);
    video.removeEventListener('seeked', handleSeeked);
    video.removeEventListener('error', handleError);
  };
  video.addEventListener('seeked', handleSeeked);
  video.addEventListener('error', handleError);
  video.currentTime = safeTime;
});

const inspectFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): FrameSample => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const signature = new Uint8Array(canvas.width * canvas.height);
  let sum = 0;
  let sumSquared = 0;
  let edgeSum = 0;
  let colorDifferenceSum = 0;
  let extremePixelCount = 0;

  for (let pixelIndex = 0, sampleIndex = 0; pixelIndex < pixels.length; pixelIndex += 4, sampleIndex += 1) {
    const red = pixels[pixelIndex];
    const green = pixels[pixelIndex + 1];
    const blue = pixels[pixelIndex + 2];
    const luminance = Math.round(red * 0.2126 + green * 0.7152 + blue * 0.0722);
    signature[sampleIndex] = luminance;
    sum += luminance;
    sumSquared += luminance * luminance;
    colorDifferenceSum += Math.max(red, green, blue) - Math.min(red, green, blue);
    if (luminance <= 12 || luminance >= 246) extremePixelCount += 1;
    const x = sampleIndex % canvas.width;
    const y = Math.floor(sampleIndex / canvas.width);
    if (x > 0) edgeSum += Math.abs(luminance - signature[sampleIndex - 1]);
    if (y > 0) edgeSum += Math.abs(luminance - signature[sampleIndex - canvas.width]);
  }

  const count = signature.length;
  const brightness = sum / count;
  const contrast = Math.sqrt(Math.max(0, sumSquared / count - brightness * brightness));
  const sharpness = edgeSum / Math.max(1, count * 2 - canvas.width - canvas.height);
  const colorfulness = colorDifferenceSum / count;
  const extremePixelRatio = extremePixelCount / count;
  const exposurePenalty = Math.abs(brightness - 128) * 0.22;
  const extremePenalty = extremePixelRatio * 75;
  const score = sharpness * 2.15 + contrast * 0.72 + colorfulness * 0.18 - exposurePenalty - extremePenalty;
  return { time: video.currentTime, signature, brightness, contrast, sharpness, colorfulness, extremePixelRatio, changeFromPrevious: 0, score };
};

const signatureDifference = (first: Uint8Array, second: Uint8Array) => {
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) difference += Math.abs(first[index] - second[index]);
  return difference / Math.max(1, first.length);
};

const VideoFrameCapture: React.FC<VideoFrameCaptureProps> = ({ onUseAsCover, onAddToQuickView }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameUrlsRef = useRef<Set<string>>(new Set());
  const analysisRunRef = useRef(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoUrl = useMemo(() => videoFile ? URL.createObjectURL(videoFile) : '', [videoFile]);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeInput, setTimeInput] = useState('00:00.000');
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [autoFrameCount, setAutoFrameCount] = useState(8);
  const [autoSelectionMode, setAutoSelectionMode] = useState<'balanced' | 'sharp' | 'color'>('balanced');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [addingToQuickView, setAddingToQuickView] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const [actionMessage, setActionMessage] = useState('');

  const unsavedFrames = useMemo(() => frames.filter((frame) => !frame.saved), [frames]);
  const selectedFrames = useMemo(() => frames.filter((frame) => selectedIds.has(frame.id)), [frames, selectedIds]);

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

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
    if (autoAnalyzing && !window.confirm('Automatic frame selection is still running. Stop and close?')) return;
    if (autoAnalyzing) {
      analysisRunRef.current += 1;
      setAutoAnalyzing(false);
    }
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

  const handleUseAsCover = (frame: CapturedFrame) => {
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

  const autoSelectFrames = async () => {
    if (!videoUrl || autoAnalyzing) return;
    const runId = analysisRunRef.current + 1;
    analysisRunRef.current = runId;
    setAutoAnalyzing(true);
    setAutoProgress(1);
    setErrorMessage('');
    setActionMessage('Scanning video scenes...');

    const analysisVideo = document.createElement('video');
    analysisVideo.src = videoUrl;
    analysisVideo.muted = true;
    analysisVideo.playsInline = true;
    analysisVideo.preload = 'auto';

    try {
      await waitForMetadata(analysisVideo);
      const analysisDuration = analysisVideo.duration;
      if (!Number.isFinite(analysisDuration) || analysisDuration <= 0) throw new Error('The video duration is unavailable.');

      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 96;
      sampleCanvas.height = Math.max(54, Math.round(96 * (analysisVideo.videoHeight / Math.max(1, analysisVideo.videoWidth))));
      const sampleContext = sampleCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (!sampleContext) throw new Error('The browser could not prepare automatic frame analysis.');

      const sampleInterval = Math.max(0.35, Math.min(1.25, analysisDuration / 130));
      const videoEdgeInset = Math.min(0.75, Math.max(0.12, analysisDuration * 0.035));
      const sampleTimes: number[] = [];
      for (let time = videoEdgeInset; time < analysisDuration - videoEdgeInset; time += sampleInterval) sampleTimes.push(time);
      if (!sampleTimes.length) sampleTimes.push(Math.max(0, analysisDuration / 2));

      const samples: FrameSample[] = [];
      let previousSample: FrameSample | null = null;

      for (let index = 0; index < sampleTimes.length; index += 1) {
        if (analysisRunRef.current !== runId) return;
        await seekVideo(analysisVideo, sampleTimes[index]);
        const sample = inspectFrame(analysisVideo, sampleCanvas, sampleContext);
        if (previousSample) sample.changeFromPrevious = signatureDifference(previousSample.signature, sample.signature);
        samples.push(sample);
        previousSample = sample;
        setAutoProgress(Math.max(2, Math.round(((index + 1) / sampleTimes.length) * 70)));
      }

      const sortedChanges = samples.slice(1).map((sample) => sample.changeFromPrevious).sort((first, second) => first - second);
      const medianChange = sortedChanges[Math.floor(sortedChanges.length / 2)] ?? 0;
      const deviations = sortedChanges.map((value) => Math.abs(value - medianChange)).sort((first, second) => first - second);
      const medianDeviation = deviations[Math.floor(deviations.length / 2)] ?? 0;
      const adaptiveSceneThreshold = Math.max(17, Math.min(46, medianChange + Math.max(6, medianDeviation * 2.8)));
      const sceneCuts = [0];
      let lastCutTime = 0;
      for (let index = 1; index < samples.length; index += 1) {
        const sample = samples[index];
        if (sample.changeFromPrevious >= adaptiveSceneThreshold && sample.time - lastCutTime >= 0.9) {
          sceneCuts.push((samples[index - 1].time + sample.time) / 2);
          lastCutTime = sample.time;
        }
      }
      sceneCuts.push(analysisDuration);

      const modeScore = (sample: FrameSample) => {
        if (autoSelectionMode === 'sharp') return sample.score + sample.sharpness * 1.35 - sample.extremePixelRatio * 20;
        if (autoSelectionMode === 'color') return sample.score + sample.colorfulness * 0.65 + sample.contrast * 0.18;
        return sample.score;
      };

      const isUsableSample = (sample: FrameSample) => (
        sample.brightness >= 20
        && sample.brightness <= 236
        && sample.contrast >= 8
        && sample.sharpness >= 2.2
        && sample.extremePixelRatio <= 0.68
      );

      const candidates: FrameSample[] = [];
      for (let sceneIndex = 0; sceneIndex < sceneCuts.length - 1; sceneIndex += 1) {
        const sceneStart = sceneCuts[sceneIndex];
        const sceneEnd = sceneCuts[sceneIndex + 1];
        const sceneLength = sceneEnd - sceneStart;
        const margin = Math.min(0.65, Math.max(0.12, sceneLength * 0.18));
        const sceneSamples = samples
          .filter((sample) => sample.time >= sceneStart + margin && sample.time <= sceneEnd - margin && isUsableSample(sample))
          .map((sample) => {
            const scenePosition = sceneLength > 0 ? (sample.time - sceneStart) / sceneLength : 0.5;
            const centerBonus = Math.max(0, 1 - Math.abs(scenePosition - 0.5) * 2) * 9;
            const sampleIndex = samples.indexOf(sample);
            const nextChange = samples[sampleIndex + 1]?.changeFromPrevious ?? 0;
            const transitionPenalty = Math.max(sample.changeFromPrevious, nextChange) * 0.28;
            return { ...sample, score: modeScore(sample) + centerBonus - transitionPenalty };
          });
        const bestSample = sceneSamples.sort((first, second) => second.score - first.score)[0];
        if (bestSample) candidates.push(bestSample);
      }

      if (candidates.length < autoFrameCount) {
        const existingTimes = new Set(candidates.map((candidate) => candidate.time));
        const extraSamples = samples
          .filter((sample) => !existingTimes.has(sample.time) && isUsableSample(sample))
          .map((sample) => ({ ...sample, score: modeScore(sample) - sample.changeFromPrevious * 0.18 }))
          .sort((first, second) => second.score - first.score);
        for (const sample of extraSamples) {
          if (candidates.length >= autoFrameCount) break;
          if (candidates.every((candidate) => Math.abs(candidate.time - sample.time) >= Math.max(0.75, sampleInterval * 1.5) && signatureDifference(candidate.signature, sample.signature) >= 7.5)) candidates.push(sample);
        }
      }

      const selectedByQuality: FrameSample[] = [];
      for (const candidate of candidates.sort((first, second) => second.score - first.score)) {
        if (selectedByQuality.length >= autoFrameCount) break;
        const sufficientlyDifferent = selectedByQuality.every((selected) => (
          Math.abs(selected.time - candidate.time) >= Math.max(0.75, sampleInterval * 1.5)
          && signatureDifference(selected.signature, candidate.signature) >= 7.5
        ));
        if (sufficientlyDifferent) selectedByQuality.push(candidate);
      }
      const selectedCandidates = selectedByQuality.sort((first, second) => first.time - second.time);
      if (!selectedCandidates.length) throw new Error('No usable frames were found. Try manual capture for this video.');

      setActionMessage(`Extracting ${selectedCandidates.length} recommended frame(s)...`);
      const generatedFrames: CapturedFrame[] = [];
      for (let index = 0; index < selectedCandidates.length; index += 1) {
        if (analysisRunRef.current !== runId) return;
        const candidate = selectedCandidates[index];
        await seekVideo(analysisVideo, candidate.time);
        const maxDimension = 1920;
        const scale = Math.min(1, maxDimension / Math.max(analysisVideo.videoWidth, analysisVideo.videoHeight));
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = Math.max(1, Math.round(analysisVideo.videoWidth * scale));
        outputCanvas.height = Math.max(1, Math.round(analysisVideo.videoHeight * scale));
        const outputContext = outputCanvas.getContext('2d', { alpha: false });
        if (!outputContext) throw new Error('A recommended frame could not be prepared.');
        outputContext.imageSmoothingEnabled = true;
        outputContext.imageSmoothingQuality = 'high';
        outputContext.drawImage(analysisVideo, 0, 0, outputCanvas.width, outputCanvas.height);
        const blob = await new Promise<Blob | null>((resolve) => outputCanvas.toBlob(resolve, 'image/jpeg', 0.9));
        outputCanvas.width = 1;
        outputCanvas.height = 1;
        if (!blob) continue;
        const baseName = videoFile?.name.replace(/\.[^.]+$/, '') || 'video';
        const file = new File([blob], `${baseName}-auto-${candidate.time.toFixed(3).replace('.', '-')}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
        const id = `auto-frame-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
        const url = URL.createObjectURL(file);
        frameUrlsRef.current.add(url);
        generatedFrames.push({ id, file, url, time: candidate.time, saved: false });
        setAutoProgress(70 + Math.round(((index + 1) / selectedCandidates.length) * 30));
      }

      setFrames((current) => [...current, ...generatedFrames]);
      setSelectedIds((current) => new Set([...current, ...generatedFrames.map((frame) => frame.id)]));
      setAutoProgress(100);
      setActionMessage(`Auto selected ${generatedFrames.length} frame(s). Review them before adding to Quick View.`);
    } catch (error) {
      if (analysisRunRef.current === runId) {
        setAutoProgress(0);
        setErrorMessage(error instanceof Error ? error.message : 'Automatic frame selection failed.');
        setActionMessage('');
      }
    } finally {
      analysisVideo.removeAttribute('src');
      analysisVideo.load();
      if (analysisRunRef.current === runId) setAutoAnalyzing(false);
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
          <div className="video-frame-auto-controls">
            <div>
              <Sparkles size={16} />
              <span><strong>Auto select frames</strong><small>Detect scenes and reject dark or low-quality frames.</small></span>
            </div>
            <label>
              Images
              <select value={autoFrameCount} onChange={(event) => setAutoFrameCount(Number(event.target.value))} disabled={autoAnalyzing}>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </label>
            <label className="video-frame-auto-priority">
              Priority
              <select value={autoSelectionMode} onChange={(event) => setAutoSelectionMode(event.target.value as 'balanced' | 'sharp' | 'color')} disabled={autoAnalyzing}>
                <option value="balanced">Balanced</option>
                <option value="sharp">Sharpest</option>
                <option value="color">Color rich</option>
              </select>
              <span className="video-frame-auto-tooltip" role="tooltip">{selectionModeDescriptions[autoSelectionMode]}</span>
            </label>
            <button type="button" disabled={autoAnalyzing || processing} onClick={() => void autoSelectFrames()}>
              <Sparkles size={15} /> {autoAnalyzing ? `Analyzing ${autoProgress}%` : 'Start auto select'}
            </button>
          </div>
          {autoAnalyzing && <div className="video-frame-auto-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={autoProgress}><i style={{ width: `${autoProgress}%` }} /></div>}
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
                      <button type="button" onClick={() => handleUseAsCover(frame)}>Use as cover</button>
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
