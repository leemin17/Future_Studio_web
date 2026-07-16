import React, { useEffect, useMemo } from 'react';
import { ArrowDown, ArrowUp, GripVertical, X } from 'lucide-react';

export interface PreviewLayoutBlock {
  id: string;
  label: string;
  kind: 'images' | 'video-file' | 'video-url';
  file?: File;
  url?: string;
}

interface QuickViewBuilderPreviewProps {
  open: boolean;
  onClose: () => void;
  title: string;
  clientInformation: string;
  thumbnailFile: File | null;
  thumbnailUrl: string;
  imageFiles: File[];
  imageUrls: string[];
  blocks: PreviewLayoutBlock[];
  columns: 1 | 2 | 3 | 4;
  onMove: (id: string, direction: -1 | 1) => void;
}

const getEmbedUrl = (url: string) => {
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?title=0&byline=0&portrait=0`;
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?rel=0`;
  return null;
};

const QuickViewBuilderPreview: React.FC<QuickViewBuilderPreviewProps> = ({
  open,
  onClose,
  title,
  clientInformation,
  thumbnailFile,
  thumbnailUrl,
  imageFiles,
  imageUrls,
  blocks,
  columns,
  onMove,
}) => {
  const localUrls = useMemo(() => {
    const entries = [...(thumbnailFile ? [thumbnailFile] : []), ...imageFiles, ...blocks.flatMap((block) => block.file ? [block.file] : [])];
    return new Map(entries.map((file) => [file, URL.createObjectURL(file)]));
  }, [thumbnailFile, imageFiles, blocks]);

  useEffect(() => () => {
    localUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [localUrls]);

  if (!open) return null;

  const images = [...imageFiles.map((file) => localUrls.get(file) ?? ''), ...imageUrls].filter(Boolean);
  const fallbackThumbnail = thumbnailFile ? localUrls.get(thumbnailFile) : thumbnailUrl;

  const renderVideo = (block: PreviewLayoutBlock) => {
    if (block.file) return <video src={localUrls.get(block.file)} controls playsInline />;
    const embedUrl = getEmbedUrl(block.url ?? '');
    if (embedUrl) return <iframe src={embedUrl} title={block.label} allow="autoplay; fullscreen; picture-in-picture" />;
    return <video src={block.url} controls playsInline />;
  };

  return (
    <div
      className="quick-builder-preview-backdrop"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <section className="quick-builder-preview" onClick={(event) => event.stopPropagation()}>
        <header className="quick-builder-preview-topbar">
          <div><span>Quick View Preview</span><strong>{title || 'Untitled project'}</strong></div>
          <button type="button" onClick={onClose} aria-label="Close preview"><X size={20} /></button>
        </header>

        <div className="quick-builder-preview-layout">
          <main className="quick-builder-preview-screen">
            <div className="quick-builder-preview-product-header">
              {fallbackThumbnail && <img src={fallbackThumbnail} alt="Project thumbnail" />}
              <div><strong>{title || 'Project title'}</strong><span>{clientInformation || 'Client'}</span></div>
            </div>

            <div className="quick-builder-preview-media">
              {blocks.map((block) => (
                block.kind === 'images' ? (
                  <div key={block.id} className={`quick-builder-preview-grid quick-builder-preview-grid--${columns}`}>
                    {images.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Gallery preview ${index + 1}`} />)}
                  </div>
                ) : (
                  <div key={block.id} className="quick-builder-preview-video">{renderVideo(block)}</div>
                )
              ))}
              {!blocks.length && <div className="quick-builder-preview-empty">Add images or videos to preview the project.</div>}
            </div>
          </main>

          <aside className="quick-builder-preview-order">
            <header><span>Layout order</span><strong>{blocks.length} blocks</strong></header>
            <div>
              {blocks.map((block, index) => (
                <article key={block.id}>
                  <GripVertical size={16} />
                  <span><small>{String(index + 1).padStart(2, '0')}</small><strong>{block.label}</strong></span>
                  <div>
                    <button type="button" onClick={() => onMove(block.id, -1)} disabled={index === 0} aria-label={`Move ${block.label} up`}><ArrowUp size={15} /></button>
                    <button type="button" onClick={() => onMove(block.id, 1)} disabled={index === blocks.length - 1} aria-label={`Move ${block.label} down`}><ArrowDown size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
            <button className="quick-builder-preview-apply" type="button" onClick={onClose}>Apply layout</button>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default QuickViewBuilderPreview;
