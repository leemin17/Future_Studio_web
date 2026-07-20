import React, { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Upload } from 'lucide-react';

interface VideoFrameCaptureProps {
  onUseAsCover: (file: File) => void;
  onAddToQuickView: (file: File) => void | Promise<void>;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00.0';
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${remaining.toFixed(1).padStart(4, '0')}`;
};

const VideoFrameCapture: React.FC<VideoFrameCaptureProps> = ({ onUseAsCover, onAddToQuickView }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedUrl, setCapturedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [addingToQuickView, setAddingToQuickView] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const [actionMessage, setActionMessage] = useState('');

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
    if (!capturedFile) {
      setCapturedUrl('');
      return;
    }
    const nextUrl = URL.createObjectURL(capturedFile);
    setCapturedUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [capturedFile]);

  const seekTo = (seconds: number) => {
    const nextTime = Math.min(Math.max(seconds, 0), duration || 0);
    setCurrentTime(nextTime);
    if (videoRef.current) videoRef.current.currentTime = nextTime;
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

      const baseName = videoFile?.name.replace(/\.[^.]+$/, '') || 'video';
      const frameFile = new File([blob], `${baseName}-frame-${currentTime.toFixed(1).replace('.', '-')}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      setCapturedFile(frameFile);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The selected frame could not be captured.');
    } finally {
      setProcessing(false);
    }
  };

  const addCapturedFrame = async () => {
    if (!capturedFile || addingToQuickView) return;
    setAddingToQuickView(true);
    setAddProgress(15);
    setActionMessage('Preparing captured image...');
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      setAddProgress(45);
      setActionMessage('Adding image block...');
      await onAddToQuickView(capturedFile);
      setAddProgress(100);
      setActionMessage('Image added to Quick View.');
    } catch (error) {
      setAddProgress(0);
      setActionMessage(error instanceof Error ? error.message : 'Unable to add this image to Quick View.');
    } finally {
      setAddingToQuickView(false);
    }
  };

  return (
    <div className="video-frame-capture">
      <label className="video-frame-capture-picker">
        <Upload size={16} aria-hidden="true" />
        <span>{videoFile ? videoFile.name : 'Choose a video from computer'}</span>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          onChange={(event) => {
            setVideoFile(event.target.files?.[0] ?? null);
            setCapturedFile(null);
            setDuration(0);
            setCurrentTime(0);
            setErrorMessage('');
          }}
        />
      </label>

      {videoUrl && (
        <>
          <video
            ref={videoRef}
            className="video-frame-capture-player"
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration || 0);
              setCurrentTime(0);
            }}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          />
          <div className="video-frame-capture-timeline">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.05"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seekTo(Number(event.target.value))}
              aria-label="Choose video frame time"
            />
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <button type="button" className="video-frame-capture-button" disabled={processing} onClick={() => void captureFrame()}>
            <Camera size={16} aria-hidden="true" /> {processing ? 'Creating image...' : 'Capture current frame'}
          </button>
        </>
      )}

      {capturedUrl && capturedFile && (
        <div className="video-frame-capture-result">
          <img src={capturedUrl} alt={`Captured at ${formatTime(currentTime)}`} />
          <div>
            <button type="button" disabled={processing} onClick={() => onUseAsCover(capturedFile)}>Use as cover</button>
            <button type="button" disabled={processing || addingToQuickView} onClick={() => void addCapturedFrame()}>
              <ImagePlus size={14} aria-hidden="true" /> {addingToQuickView ? 'Adding...' : 'Add to Quick View'}
            </button>
          </div>
        </div>
      )}

      {(addingToQuickView || actionMessage) && (
        <div className={`video-frame-action-status ${addProgress === 0 && actionMessage ? 'video-frame-action-status--error' : ''}`} role="status" aria-live="polite">
          <div><i style={{ width: `${addProgress}%` }} /></div>
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && <p className="video-frame-capture-error">{errorMessage}</p>}
    </div>
  );
};

export default VideoFrameCapture;
