import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Redo2, RemoveFormatting, Trash2, Underline as UnderlineIcon, Undo2 } from 'lucide-react';
import type { QuickViewTextStyle } from '@shared/types';

interface RichTextBlockEditorProps {
  html?: string;
  content: string;
  textStyle: QuickViewTextStyle;
  onChange: (content: string, html: string) => void;
  onStyleChange: (textStyle: QuickViewTextStyle) => void;
  onRemove: () => void;
}

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize?.replace('px', '') || null,
          renderHTML: (attributes) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}px` } : {},
        },
      },
    }];
  },
});

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')
  .replace(/\n/g, '<br>');

const RichTextBlockEditor: React.FC<RichTextBlockEditorProps> = ({ html, content, textStyle, onChange, onStyleChange, onRemove }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: html || `<p>${escapeHtml(content)}</p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'quick-view-rich-text-surface',
        'aria-label': 'Quick View rich text content',
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getText({ blockSeparator: '\n' }), currentEditor.getHTML()),
  });

  if (!editor) return null;

  const currentFontSize = Number(editor.getAttributes('textStyle').fontSize || 30);
  const boxStyle = {
    width: `${textStyle.width ?? 100}%`,
    color: textStyle.color ?? '#f5f5f2',
    backgroundColor: textStyle.backgroundColor ?? '#0b0b0c',
  };
  const patchBoxStyle = (patch: Partial<QuickViewTextStyle>) => onStyleChange({ ...textStyle, ...patch });

  return (
    <div className="quick-view-rich-text-editor" style={boxStyle}>
      <div className="quick-view-text-toolbar">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo2 size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo2 size={15} /></button>
        <span className="quick-view-text-toolbar-divider" />
        <select value={editor.getAttributes('textStyle').fontFamily || ''} onChange={(event) => event.target.value ? editor.chain().focus().setFontFamily(event.target.value).run() : editor.chain().focus().unsetFontFamily().run()} aria-label="Font family">
          <option value="">Studio Sans</option>
          <option value="Space Grotesk">Space Grotesk</option>
          <option value="DM Sans">DM Sans</option>
          <option value="Georgia">Georgia</option>
          <option value="monospace">Monospace</option>
        </select>
        <label className="quick-view-text-size"><input type="number" min="12" max="120" value={currentFontSize} onChange={(event) => editor.chain().focus().setMark('textStyle', { fontSize: Math.min(120, Math.max(12, Number(event.target.value) || 12)) }).run()} /><span>px</span></label>
        <button className={editor.isActive('bold') ? 'is-active' : ''} type="button" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={15} /></button>
        <button className={editor.isActive('italic') ? 'is-active' : ''} type="button" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={15} /></button>
        <button className={editor.isActive('underline') ? 'is-active' : ''} type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={15} /></button>
        <span className="quick-view-text-toolbar-divider" />
        <button className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''} type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align left"><AlignLeft size={15} /></button>
        <button className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''} type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align center"><AlignCenter size={15} /></button>
        <button className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''} type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align right"><AlignRight size={15} /></button>
        <label className="quick-view-text-color" title="Selected text color"><span>A</span><input type="color" value={editor.getAttributes('textStyle').color || '#f5f5f2'} onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} /></label>
        <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting"><RemoveFormatting size={15} /></button>
        <span className="quick-view-text-toolbar-divider" />
        <label className="quick-view-text-color" title="Text box background"><span>BG</span><input type="color" value={textStyle.backgroundColor ?? '#0b0b0c'} onChange={(event) => patchBoxStyle({ backgroundColor: event.target.value })} /></label>
        <select className="quick-view-text-width" value={textStyle.width ?? 100} onChange={(event) => patchBoxStyle({ width: Number(event.target.value) as 50 | 75 | 100 })} aria-label="Text box width"><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option></select>
        <button className="quick-view-rich-text-delete" type="button" onClick={onRemove} title="Delete text block"><Trash2 size={15} /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextBlockEditor;
