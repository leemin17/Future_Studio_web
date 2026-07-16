import React, { useMemo, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Code2, GripVertical, Grid2X2, Image as ImageIcon, Trash2, Type, Video } from 'lucide-react';
import type { NewsItem } from '@shared/types';
import QuickViewModal from './QuickViewModal';

export type ProjectBlockType = 'image' | 'text' | 'grid' | 'video' | 'embed' | 'model';

export interface ProjectEditorBlock {
  id: string;
  type: ProjectBlockType;
  files: File[];
  url: string;
  content: string;
  caption: string;
  columns: 1 | 2 | 3 | 4;
}

interface ProjectBlockEditorProps {
  blocks: ProjectEditorBlock[];
  onChange: (blocks: ProjectEditorBlock[]) => void;
  title: string;
  clientInformation: string;
  partnerLogoFile?: File | null;
  partnerLogoUrl?: string;
}

const blockLabels: Record<ProjectBlockType, string> = {
  image: 'Image',
  text: 'Text',
  grid: 'Photo Grid',
  video: 'Video & Audio',
  embed: 'Embed',
  model: '3D',
};

const makeBlock = (type: ProjectBlockType, files: File[] = []): ProjectEditorBlock => {
  const automaticColumns = Math.min(Math.max(files.length, 1), 4) as 1 | 2 | 3 | 4;
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    files,
    url: '',
    content: '',
    caption: '',
    columns: type === 'grid' ? automaticColumns : 1,
  };
};

const FilePreview: React.FC<{ file: File; type: 'image' | 'video' }> = ({ file, type }) => {
  const [source, setSource] = React.useState('');
  React.useEffect(() => {
    const nextSource = URL.createObjectURL(file);
    setSource(nextSource);
    return () => URL.revokeObjectURL(nextSource);
  }, [file]);
  if (!source) return null;
  return type === 'image' ? <img src={source} alt={file.name} /> : <video src={source} muted controls />;
};

interface SortableBlockProps {
  block: ProjectEditorBlock;
  update: (patch: Partial<ProjectEditorBlock>) => void;
  remove: () => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ block, update, remove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const urls = block.url.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);

  return (
    <article ref={setNodeRef} style={style} className={`project-editor-block project-editor-block--${block.type} ${isDragging ? 'is-dragging' : ''}`}>
      <header>
        <button type="button" className="project-editor-drag" {...attributes} {...listeners} aria-label="Drag to reorder"><GripVertical size={18} /></button>
        <strong>{blockLabels[block.type]}</strong>
        <span>{block.files.length ? `${block.files.length} file(s)` : 'Content block'}</span>
        <button type="button" className="project-editor-delete" onClick={remove} aria-label="Delete block"><Trash2 size={17} /></button>
      </header>

      {block.type === 'text' ? (
        <textarea rows={5} value={block.content} onChange={(event) => update({ content: event.target.value })} placeholder="Write a title, paragraph or project story..." />
      ) : block.type === 'grid' ? (
        <>
          <div className={`project-editor-grid project-editor-grid--${block.columns}`}>
            {block.files.map((file) => <FilePreview key={`${file.name}-${file.lastModified}`} file={file} type="image" />)}
            {urls.map((url) => <img key={url} src={url} alt="Grid preview" />)}
          </div>
          <div className="project-editor-inline">
            <label>Columns<select value={block.columns} onChange={(event) => update({ columns: Number(event.target.value) as 1 | 2 | 3 | 4 })}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
            <label className="project-editor-grow">Image URLs<textarea rows={2} value={block.url} onChange={(event) => update({ url: event.target.value })} placeholder="One URL per line" /></label>
          </div>
        </>
      ) : block.type === 'image' ? (
        <>
          <div className="project-editor-media-preview">
            {block.files[0] ? <FilePreview file={block.files[0]} type="image" /> : block.url ? <img src={block.url} alt="Image preview" /> : <ImageIcon size={34} />}
          </div>
          <input type="url" value={block.url} onChange={(event) => update({ url: event.target.value })} placeholder="Or paste an image URL" />
        </>
      ) : block.type === 'video' ? (
        <>
          <div className="project-editor-media-preview project-editor-media-preview--video">
            {block.files[0] ? <FilePreview file={block.files[0]} type="video" /> : <Video size={34} />}
          </div>
          <input type="url" value={block.url} onChange={(event) => update({ url: event.target.value })} placeholder="Vimeo, YouTube or direct video URL" />
        </>
      ) : (
        <div className="project-editor-url-block">
          {block.type === 'embed' ? <Code2 size={30} /> : <Box size={30} />}
          <input type="url" value={block.url} onChange={(event) => update({ url: event.target.value })} placeholder={block.type === 'embed' ? 'Paste an embeddable URL' : 'Paste a Sketchfab or 3D viewer URL'} />
        </div>
      )}

      {block.type !== 'text' && (
        <input className="project-editor-caption" value={block.caption} onChange={(event) => update({ caption: event.target.value })} placeholder="Add a caption (optional)" />
      )}
    </article>
  );
};

const ProjectBlockEditor: React.FC<ProjectBlockEditorProps> = ({ blocks, onChange, title, clientInformation, partnerLogoFile, partnerLogoUrl = '' }) => {
  const imageInput = useRef<HTMLInputElement>(null);
  const gridInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [videoOptionsOpen, setVideoOptionsOpen] = React.useState(false);
  const [videoLink, setVideoLink] = React.useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [previewFileUrls, setPreviewFileUrls] = React.useState<Map<File, string>>(new Map());

  React.useEffect(() => {
    const files = [...blocks.flatMap((block) => block.files), ...(partnerLogoFile ? [partnerLogoFile] : [])];
    const nextUrls = new Map<File, string>();
    files.forEach((file) => nextUrls.set(file, URL.createObjectURL(file)));
    setPreviewFileUrls(nextUrls);
    return () => nextUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [blocks, partnerLogoFile]);

  const previewData = useMemo(() => {
    const quickViewLayout: NonNullable<NewsItem['quickViewLayout']> = blocks.flatMap((block): NonNullable<NewsItem['quickViewLayout']> => {
      const fileUrls = block.files.map((file) => previewFileUrls.get(file)).filter((url): url is string => Boolean(url));
      const externalUrls = block.url.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
      const urls = [...fileUrls, ...externalUrls];
      if (block.type === 'text') {
        return block.content.trim() ? [{ type: 'text' as const, items: [{ kind: 'text' as const, content: block.content.trim() }] }] : [];
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
  }, [blocks, clientInformation, partnerLogoFile, partnerLogoUrl, previewFileUrls, title]);

  const addSimpleBlock = (type: ProjectBlockType) => onChange([...blocks, makeBlock(type)]);
  const addFiles = (type: 'image' | 'grid' | 'video', files: File[]) => {
    if (!files.length) return;
    if (type === 'grid') onChange([...blocks, makeBlock(type, files)]);
    else onChange([...blocks, ...files.map((file) => makeBlock(type, [file]))]);
  };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    onChange(arrayMove(blocks, oldIndex, newIndex));
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
            <QuickViewModal product={previewData} onClose={() => undefined} embedded />
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
        {videoOptionsOpen && (
          <div className="project-editor-video-options">
            <strong>Add video or audio</strong>
            <button type="button" onClick={() => videoInput.current?.click()}><Video size={16} />Upload from computer</button>
            <span>or paste a link</span>
            <input type="url" value={videoLink} onChange={(event) => setVideoLink(event.target.value)} placeholder="YouTube, Vimeo or direct URL" />
            <button
              type="button"
              className="project-editor-add-link"
              disabled={!videoLink.trim()}
              onClick={() => {
                const block = makeBlock('video');
                block.url = videoLink.trim();
                onChange([...blocks, block]);
                setVideoLink('');
                setVideoOptionsOpen(false);
              }}
            >Add link</button>
          </div>
        )}
        {blocks.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="project-editor-blocks project-editor-blocks--controls">
                <span className="project-editor-controls-title">Arrange content</span>
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    update={(patch) => onChange(blocks.map((item) => item.id === block.id ? { ...item, ...patch } : item))}
                    remove={() => onChange(blocks.filter((item) => item.id !== block.id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <p>Tip: hold the drag handle to change the content order.</p>
      </aside>
      <input ref={imageInput} hidden type="file" accept="image/*" multiple onChange={(event) => { addFiles('image', Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <input ref={gridInput} hidden type="file" accept="image/*" multiple onChange={(event) => { addFiles('grid', Array.from(event.target.files ?? [])); event.target.value = ''; }} />
      <input ref={videoInput} hidden type="file" accept="video/*,audio/*" multiple onChange={(event) => { addFiles('video', Array.from(event.target.files ?? [])); setVideoOptionsOpen(false); event.target.value = ''; }} />
    </section>
  );
};

export default ProjectBlockEditor;
