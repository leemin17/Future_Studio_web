import React, { useMemo, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { Box, Code2, Grid2X2, Image as ImageIcon, Type, Video } from 'lucide-react';
import type { NewsItem, QuickViewTextStyle } from '@shared/types';
import QuickViewModal from './QuickViewModal';
import VideoFrameCapture from './VideoFrameCapture';

export type ProjectBlockType = 'image' | 'text' | 'grid' | 'video' | 'embed' | 'model';

export interface ProjectEditorBlock {
  id: string;
  type: ProjectBlockType;
  files: File[];
  url: string;
  content: string;
  html: string;
  caption: string;
  columns: 1 | 2 | 3 | 4;
  textStyle: QuickViewTextStyle;
}

interface ProjectBlockEditorProps {
  blocks: ProjectEditorBlock[];
  onChange: (blocks: ProjectEditorBlock[]) => void;
  title: string;
  clientInformation: string;
  partnerLogoFile?: File | null;
  partnerLogoUrl?: string;
  onUseFrameAsCover: (file: File) => void;
}

const blockLabels: Record<ProjectBlockType, string> = {
  image: 'Image',
  text: 'Text',
  grid: 'Photo Grid',
  video: 'Video & Audio',
  embed: 'Embed',
  model: '3D',
};

const normalizeMediaLink = (value: string) => {
  const trimmed = value.trim();
  const iframeSource = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  const link = iframeSource ?? trimmed;
  if (!link || /^(https?:|blob:|data:)/i.test(link)) return link;
  return `https://${link.replace(/^\/+/, '')}`;
};

const makeBlock = (type: ProjectBlockType, files: File[] = []): ProjectEditorBlock => {
  const automaticColumns = Math.min(Math.max(files.length, 1), 4) as 1 | 2 | 3 | 4;
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    files,
    url: '',
    content: '',
    html: '',
    caption: '',
    columns: type === 'grid' ? automaticColumns : 1,
    textStyle: {},
  };
};

const ProjectBlockEditor: React.FC<ProjectBlockEditorProps> = ({ blocks, onChange, title, clientInformation, partnerLogoFile, partnerLogoUrl = '', onUseFrameAsCover }) => {
  const imageInput = useRef<HTMLInputElement>(null);
  const gridInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [videoOptionsOpen, setVideoOptionsOpen] = React.useState(false);
  const [videoLink, setVideoLink] = React.useState('');
  const [previewFileUrls, setPreviewFileUrls] = React.useState<Map<File, string>>(new Map());
  const deferredBlocks = React.useDeferredValue(blocks);
  const [, startPreviewTransition] = React.useTransition();

  React.useEffect(() => {
    const files = [...blocks.flatMap((block) => block.files), ...(partnerLogoFile ? [partnerLogoFile] : [])];
    const nextUrls = new Map<File, string>();
    files.forEach((file) => nextUrls.set(file, URL.createObjectURL(file)));
    setPreviewFileUrls(nextUrls);
    return () => nextUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [blocks, partnerLogoFile]);

  const previewData = useMemo(() => {
    const quickViewLayout: NonNullable<NewsItem['quickViewLayout']> = deferredBlocks.flatMap((block): NonNullable<NewsItem['quickViewLayout']> => {
      const fileUrls = block.files.map((file) => previewFileUrls.get(file)).filter((url): url is string => Boolean(url));
      const externalUrls = block.url.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
      const urls = [...fileUrls, ...externalUrls];
      if (block.type === 'text') {
        return [{ type: 'text' as const, items: [{ kind: 'text' as const, content: block.content, html: block.html, textStyle: block.textStyle }] }];
      }
      if (!urls.length) return [];
      if (block.type === 'grid') {
        return [{ type: 'grid' as const, columns: block.columns, items: urls.map((url) => ({ kind: 'image' as const, url, caption: block.caption.trim() || undefined })) }];
      }
      const kind = block.type === 'image' ? 'image' : block.type === 'video' ? 'video' : block.type;
      return urls.map((url) => ({ type: kind === 'image' || kind === 'video' ? 'full' as const : kind, items: [{ kind, url, caption: block.caption.trim() || undefined }] }));
    });
    const product: NewsItem = {
      id: 0,
      date: '',
      title: title.trim() || 'Untitled project',
      clientInformation: clientInformation.trim() || 'Future Studio',
      describe: '',
      imageUrl: '',
      partnerLogoUrl: (partnerLogoFile ? previewFileUrls.get(partnerLogoFile) : undefined) ?? (partnerLogoUrl.trim() || undefined),
      quickViewLayout,
    };
    return product;
  }, [clientInformation, deferredBlocks, partnerLogoFile, partnerLogoUrl, previewFileUrls, title]);
  const visibleBlocks = blocks.filter((block) => block.type === 'text' || block.files.length > 0 || block.url.trim());

  const addSimpleBlock = (type: ProjectBlockType) => {
    onChange([...blocks, makeBlock(type)]);
  };
  const addFiles = (type: 'image' | 'grid' | 'video', files: File[]) => {
    if (!files.length) return;
    if (type === 'grid') onChange([...blocks, makeBlock(type, files)]);
    else onChange([...blocks, ...files.map((file) => makeBlock(type, [file]))]);
  };


  const tools: { type: ProjectBlockType; icon: React.ReactNode; action: () => void }[] = [
    { type: 'image', icon: <ImageIcon size={20} />, action: () => imageInput.current?.click() },
    { type: 'text', icon: <Type size={20} />, action: () => addSimpleBlock('text') },
    { type: 'grid', icon: <Grid2X2 size={20} />, action: () => gridInput.current?.click() },
    { type: 'video', icon: <Video size={20} />, action: () => setVideoOptionsOpen((open) => !open) },
    { type: 'embed', icon: <Code2 size={20} />, action: () => addSimpleBlock('embed') },
    { type: 'model', icon: <Box size={20} />, action: () => addSimpleBlock('model') },
  ];

  return (
    <section className="project-editor-shell">
      <div className="project-editor-canvas">
        <div className="project-editor-live-preview">
          {previewData.quickViewLayout?.length ? (
            <QuickViewModal
              product={previewData}
              onClose={() => undefined}
              embedded
              onEmbeddedTextChange={(textIndex, value, html) => {
                const textBlock = blocks.filter((block) => block.type === 'text')[textIndex];
                if (textBlock) onChange(blocks.map((block) => block.id === textBlock.id ? { ...block, content: value, html } : block));
              }}
              onEmbeddedTextRemove={(textIndex) => {
                const textBlock = blocks.filter((block) => block.type === 'text')[textIndex];
                if (textBlock) onChange(blocks.filter((block) => block.id !== textBlock.id));
              }}
              onEmbeddedTextStyleChange={(textIndex, textStyle) => {
                const textBlock = blocks.filter((block) => block.type === 'text')[textIndex];
                if (textBlock) onChange(blocks.map((block) => block.id === textBlock.id ? { ...block, textStyle } : block));
              }}
              onEmbeddedBlockRemove={(blockIndex) => {
                const target = visibleBlocks[blockIndex];
                if (target) onChange(blocks.filter((block) => block.id !== target.id));
              }}
              onEmbeddedBlockMove={(blockIndex, direction) => {
                const target = visibleBlocks[blockIndex];
                if (!target) return;
                const currentIndex = blocks.findIndex((block) => block.id === target.id);
                const adjacentVisible = visibleBlocks[blockIndex + direction];
                if (!adjacentVisible) return;
                const nextIndex = blocks.findIndex((block) => block.id === adjacentVisible.id);
                onChange(arrayMove(blocks, currentIndex, nextIndex));
              }}
              onEmbeddedGridColumnsChange={(blockIndex, columns) => {
                const target = visibleBlocks[blockIndex];
                if (target) onChange(blocks.map((block) => block.id === target.id ? { ...block, columns } : block));
              }}
            />
          ) : (
            <div className="project-editor-preview-placeholder"><ImageIcon size={28} /><span>Your Quick View preview will appear here</span></div>
          )}
        </div>
      </div>
      <aside className="project-editor-toolbar">
        <span>Add content</span>
        <div>
          {tools.map((tool) => <button key={tool.type} type="button" onClick={tool.action}>{tool.icon}<strong>{blockLabels[tool.type]}</strong></button>)}
        </div>
        <div className="project-editor-frame-tool">
          <div className="project-editor-frame-tool-title">
            <strong>Cut image from video</strong>
            <small>New</small>
          </div>
          <VideoFrameCapture
            onUseAsCover={onUseFrameAsCover}
            onAddToQuickView={(files) => new Promise<void>((resolve, reject) => {
              requestAnimationFrame(() => {
                try {
                  const imageBlocks = files.map((file) => makeBlock('image', [file]));
                  startPreviewTransition(() => onChange([...blocks, ...imageBlocks]));
                  requestAnimationFrame(() => resolve());
                } catch (error) {
                  reject(error instanceof Error ? error : new Error('Quick View could not add these image blocks.'));
                }
              });
            })}
          />
        </div>
        {videoOptionsOpen && (
          <div className="project-editor-video-options">
            <strong>Add video or audio</strong>
            <button type="button" onClick={() => videoInput.current?.click()}><Video size={16} />Upload from computer</button>
            <span>or paste a link</span>
            <textarea rows={3} value={videoLink} onChange={(event) => setVideoLink(event.target.value)} placeholder="Paste any video/audio link or iframe embed code" />
            <button
              type="button"
              className="project-editor-add-link"
              disabled={!videoLink.trim()}
              onClick={() => {
                const block = makeBlock('video');
                block.url = normalizeMediaLink(videoLink);
                onChange([...blocks, block]);
                setVideoLink('');
                setVideoOptionsOpen(false);
              }}
            >Add link</button>
          </div>
        )}
        <p>Tip: hold the drag handle to change the content order.</p>
      </aside>
      <input ref={imageInput} hidden type="file" accept="image/*" multiple onChange={(event) => { addFiles('image', Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <input ref={gridInput} hidden type="file" accept="image/*" multiple onChange={(event) => { addFiles('grid', Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <input ref={videoInput} hidden type="file" accept="video/*,audio/*" multiple onChange={(event) => { addFiles('video', Array.from(event.target.files ?? [])); setVideoOptionsOpen(false); event.target.value = ''; }} />
    </section>
  );
};

export default React.memo(ProjectBlockEditor);
