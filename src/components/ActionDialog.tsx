'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ActionDialogImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Defaults to true so the artwork can be preloaded and never pops in late. */
  unoptimized?: boolean;
}

export interface ActionDialogAction {
  label: ReactNode;
  onClick?: () => void;
  /** shadcn button variant: default | outline | destructive | success | ghost */
  variant?: ButtonProps['variant'];
  /** Extra classes for this button (colour, size, width ...). */
  className?: string;
  disabled?: boolean;
}

export interface ActionDialogClassNames {
  /** The white dialog box. */
  content?: string;
  /** The dark backdrop. */
  overlay?: string;
  /** The round "x" button. */
  close?: string;
  /** Wrapper around the illustration (controls its size / margins). */
  imageWrapper?: string;
  /** The <img> itself. */
  image?: string;
  /** Wrapper around title + description. */
  header?: string;
  title?: string;
  /** Wrapper around all description lines. */
  description?: string;
  /** Each individual description line. */
  descriptionLine?: string;
  /** Wrapper around the buttons. */
  actions?: string;
}

export interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image?: ActionDialogImage;
  title: ReactNode;
  /** A string / node, or an array to render one paragraph per line. */
  description?: ReactNode | ReactNode[];
  /** Buttons, left to right. */
  actions?: ActionDialogAction[];
  /** Any extra content rendered between the description and the buttons. */
  children?: ReactNode;
  showCloseButton?: boolean;
  classNames?: ActionDialogClassNames;
}

/**
 * Reusable confirm / feedback popup built on the shadcn Dialog.
 * Pass image, title, description, buttons and class overrides as props.
 */
export default function ActionDialog({
  open,
  onOpenChange,
  image,
  title,
  description,
  actions = [],
  children,
  showCloseButton = true,
  classNames = {},
}: ActionDialogProps) {
  const lines = Array.isArray(description) ? description : description ? [description] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        overlayClassName={classNames.overlay}
        closeClassName={classNames.close}
        {...(lines.length ? {} : { 'aria-describedby': undefined })}
        className={cn('flex flex-col items-center rounded-[24px] p-8', classNames.content)}
      >
        {image && (
          // The wrapper has a fixed aspect ratio, so the popup height is the same
          // before and after the image loads (no jump).
          <div
            className={cn(
              'w-28 sm:w-36 md:w-44 lg:w-56 aspect-[3/2] mt-3 mb-4',
              classNames.imageWrapper,
            )}
          >
            <Image
              src={image.src}
              alt={image.alt ?? ''}
              width={image.width ?? 480}
              height={image.height ?? 320}
              unoptimized={image.unoptimized ?? true}
              loading="eager"
              className={cn('w-full h-full object-contain', classNames.image)}
            />
          </div>
        )}

        <DialogHeader className={cn('w-full', classNames.header)}>
          <DialogTitle className={cn('mb-2', classNames.title)}>{title}</DialogTitle>
          <div className={cn(actions.length || children ? 'mb-6' : '', classNames.description)}>
            {lines.map((line, i) =>
              i === 0 ? (
                <DialogDescription key={i} className={classNames.descriptionLine}>
                  {line}
                </DialogDescription>
              ) : (
                // Radix wires aria-describedby to the first line only; extra lines are plain text.
                <p
                  key={i}
                  className={cn(
                    'text-xs sm:text-sm text-gray-500 text-center',
                    classNames.descriptionLine,
                  )}
                >
                  {line}
                </p>
              ),
            )}
          </div>
        </DialogHeader>

        {children}

        {actions.length > 0 && (
          <DialogFooter className={classNames.actions}>
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant ?? 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn('flex-1', action.className)}
              >
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
