'use client';

import { useEffect, useId, type ReactNode } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Slice, type Fragment } from '@tiptap/pm/model';
import { toast } from 'sonner';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { FormError, INTER_VARIABLE_CLASS, LABEL_CLASSES } from '@/components/FormInput';
import { DETAILED_BIO_MAX_LENGTH, toEditorHtml } from '@/lib/richText';

type Variant = 'light' | 'dark';

export interface RichTextEditorProps {
  /** HTML produced by this editor (or legacy plain text). */
  value: string;
  /** Called with sanitized-on-server HTML, or '' when the editor is empty. */
  onChange: (html: string) => void;
  onBlur?: () => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  /** Max visible characters (HTML tags are not counted). */
  maxLength?: number;
  /** `dark` matches the dark creator dashboard pages. */
  variant?: Variant;
  /** Grow with the content instead of showing an inner scrollbar. */
  autoHeight?: boolean;
  /** Helper text shown under the editor, on the left (hidden while an error is shown). */
  hint?: string;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
}

const THEME: Record<
  Variant,
  { box: string; toolbar: string; button: string; buttonActive: string; content: string; counter: string }
> = {
  light: {
    box: 'bg-white border-[#e2e2e2] focus-within:border-[#0012FF] text-black',
    toolbar: 'border-b border-[#e2e2e2] bg-gray-50',
    button: 'text-gray-600 hover:bg-gray-200/70',
    buttonActive: 'bg-[#0012FF]/10 text-[#0012FF]',
    content: 'text-black',
    counter: 'text-gray-400',
  },
  dark: {
    box: 'bg-[rgba(255,255,255,0.03)] border-[rgba(200,169,126,0.2)] focus-within:border-[#C8A97E] text-[#F9F6F2]',
    toolbar: 'border-b border-[rgba(200,169,126,0.2)] bg-[rgba(255,255,255,0.03)]',
    button: 'text-[#F9F6F2]/70 hover:bg-white/10',
    buttonActive: 'bg-[#C8A97E]/20 text-[#C8A97E]',
    content: 'text-[#F9F6F2]',
    counter: 'text-[#F9F6F2]/50',
  },
};

function ToolbarButton({
  title,
  active,
  disabled,
  onClick,
  theme,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  theme: (typeof THEME)[Variant];
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // keep the selection/focus inside the editor when clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={twMerge(
        'w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
        active ? theme.buttonActive : theme.button
      )}
    >
      {children}
    </button>
  );
}

/** Characters the editor counts for a piece of content (text only; a line break counts as one). */
const countChars = (fragment: Fragment) => fragment.textBetween(0, fragment.size, undefined, ' ').length;

/** Document position inside `fragment` after `max` countable characters. */
function positionAfterChars(fragment: Fragment, max: number): number {
  let remaining = max;
  let pos = fragment.size;
  let found = false;
  fragment.descendants((node, p) => {
    if (found) return false;
    if (node.isText) {
      const len = node.text?.length ?? 0;
      if (len >= remaining) {
        pos = p + remaining;
        found = true;
        return false;
      }
      remaining -= len;
    } else if (node.isLeaf) {
      if (remaining <= 0) {
        pos = p;
        found = true;
        return false;
      }
      remaining -= 1;
    }
    return true;
  });
  return pos;
}

/** Keeps only the first `max` characters of a pasted slice. */
function truncateSlice(slice: Slice, max: number): Slice {
  if (max <= 0) return Slice.empty;
  const cut = slice.content.cut(0, positionAfterChars(slice.content, max));
  let openEnd = 0;
  let node = cut.lastChild;
  while (node && !node.isLeaf) {
    openEnd += 1;
    node = node.lastChild;
  }
  return new Slice(cut, Math.min(slice.openStart, openEnd), openEnd);
}

const Divider = () => <span className="w-px h-5 bg-current opacity-15 mx-1" aria-hidden="true" />;

export default function RichTextEditor({
  value,
  onChange,
  onBlur,
  label,
  required,
  error,
  placeholder = 'Write something about yourself...',
  maxLength = DETAILED_BIO_MAX_LENGTH,
  variant = 'light',
  autoHeight = false,
  hint,
  className,
  labelClassName,
  errorClassName,
  wrapperClassName,
}: RichTextEditorProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const theme = THEME[variant];

  const notifyLimit = (trimmed: boolean) =>
    toast.warning('Character limit reached', {
      id: 'rich-text-limit', // one toast at a time, even if the user keeps typing / pasting
      description: trimmed
        ? `Your pasted text was trimmed to fit the ${maxLength.toLocaleString()} character limit. The extra text was not added.`
        : `This field allows up to ${maxLength.toLocaleString()} characters. Remove some text to add more.`,
      duration: 5000,
    });

  const editor = useEditor({
    // Required for Next.js SSR: render the editor only on the client
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
        // text only: no code, rules or images
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      // Typing past the limit is blocked, and the creator is told why
      handleTextInput: (view, from, to, text) => {
        const doc = view.state.doc;
        const current = countChars(doc.content);
        const replaced = doc.textBetween(from, to, undefined, ' ').length;
        if (current - replaced + text.length > maxLength) {
          notifyLimit(false);
          return true;
        }
        return false;
      },
      // Pasting past the limit keeps the first part and ignores the rest
      transformPasted: (slice, view) => {
        const { from, to } = view.state.selection;
        const doc = view.state.doc;
        const available = maxLength - (countChars(doc.content) - doc.textBetween(from, to, undefined, ' ').length);
        if (countChars(slice.content) <= available) return slice;
        notifyLimit(true);
        return truncateSlice(slice, available);
      },
      attributes: {
        id,
        'aria-invalid': error ? 'true' : 'false',
        ...(error ? { 'aria-describedby': errorId } : {}),
        class: twMerge(
          'min-h-[160px] px-4 py-3 text-sm font-sans leading-relaxed focus:outline-none',
          // autoHeight grows with the content (no inner scrollbar); otherwise scroll after 360px
          autoHeight ? 'overflow-visible' : 'max-h-[360px] overflow-y-auto'
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Keep the editor in sync when the value is loaded/changed from outside (e.g. profile fetched from the API)
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if ((value || '') !== current) {
      editor.commands.setContent(toEditorHtml(value), { emitUpdate: false });
    }
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            strike: editor.isActive('strike'),
            h1: editor.isActive('heading', { level: 1 }),
            h2: editor.isActive('heading', { level: 2 }),
            h3: editor.isActive('heading', { level: 3 }),
            bulletList: editor.isActive('bulletList'),
            orderedList: editor.isActive('orderedList'),
            blockquote: editor.isActive('blockquote'),
            link: editor.isActive('link'),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
            chars: editor.storage.characterCount.characters() as number,
          }
        : null,
  });

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const input = window.prompt('Enter the link URL', previous || 'https://');
    if (input === null) return; // cancelled
    const url = input.trim();
    if (!url || url === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const chain = () => editor?.chain().focus();
  const s = state;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label
          htmlFor={id}
          className={twMerge(INTER_VARIABLE_CLASS, LABEL_CLASSES, labelClassName)}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div
        className={twMerge(
          'rich-text-editor rounded-[8px] border overflow-hidden transition-all',
          theme.box,
          error && 'border-red-500 focus-within:border-red-500',
          className
        )}
      >
        <div className={twMerge('flex flex-wrap items-center gap-0.5 px-2 py-1.5', theme.toolbar)}>
          <ToolbarButton title="Bold" theme={theme} active={s?.bold} onClick={() => chain()?.toggleBold().run()}>
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Italic" theme={theme} active={s?.italic} onClick={() => chain()?.toggleItalic().run()}>
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Underline" theme={theme} active={s?.underline} onClick={() => chain()?.toggleUnderline().run()}>
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Strikethrough" theme={theme} active={s?.strike} onClick={() => chain()?.toggleStrike().run()}>
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Heading 1" theme={theme} active={s?.h1} onClick={() => chain()?.toggleHeading({ level: 1 }).run()}>
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 2" theme={theme} active={s?.h2} onClick={() => chain()?.toggleHeading({ level: 2 }).run()}>
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Heading 3" theme={theme} active={s?.h3} onClick={() => chain()?.toggleHeading({ level: 3 }).run()}>
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Bulleted list" theme={theme} active={s?.bulletList} onClick={() => chain()?.toggleBulletList().run()}>
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Numbered list" theme={theme} active={s?.orderedList} onClick={() => chain()?.toggleOrderedList().run()}>
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Quote" theme={theme} active={s?.blockquote} onClick={() => chain()?.toggleBlockquote().run()}>
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Add link" theme={theme} active={s?.link} onClick={setLink}>
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Remove link"
            theme={theme}
            disabled={!s?.link}
            onClick={() => chain()?.extendMarkRange('link').unsetLink().run()}
          >
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Clear formatting"
            theme={theme}
            onClick={() => chain()?.unsetAllMarks().clearNodes().run()}
          >
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton title="Undo" theme={theme} disabled={!s?.canUndo} onClick={() => chain()?.undo().run()}>
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Redo" theme={theme} disabled={!s?.canRedo} onClick={() => chain()?.redo().run()}>
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className={theme.content}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 mt-2">
        <div className="min-w-0">
          {error ? (
            <FormError id={errorId} className={errorClassName}>{error}</FormError>
          ) : (
            hint && <p className={twMerge('text-xs font-sans', theme.counter)}>{hint}</p>
          )}
        </div>
        <p className={twMerge('shrink-0 text-xs font-sans', theme.counter, (s?.chars ?? 0) >= maxLength && 'text-red-500 font-medium')}>
          {s?.chars ?? 0}/{maxLength}
        </p>
      </div>
    </div>
  );
}
