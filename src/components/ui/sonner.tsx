'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/** App-wide toast host (shadcn/ui "sonner"). Mounted once in the root layout. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      closeButton
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            'font-sans !rounded-xl !border !border-[#e2e2e2] !shadow-lg !bg-white !text-black',
          title: '!text-sm !font-semibold',
          description: '!text-xs !text-gray-500',
          closeButton: '!bg-white !border-[#e2e2e2] !text-gray-500',
        },
      }}
      {...props}
    />
  );
}
