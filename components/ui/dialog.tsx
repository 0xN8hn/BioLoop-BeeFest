'use client';
import type * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
const Dialog = DialogPrimitive.Root; const DialogTrigger = DialogPrimitive.Trigger; const DialogClose = DialogPrimitive.Close;
function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) { return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#1f1e1b]/55 backdrop-blur-[2px]" /><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 w-[min(92vw,530px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#e4dfd6] bg-[#fffdf8] p-6 shadow-2xl focus:outline-none', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1.5 text-[#786f66] hover:bg-[#f2eee8]"><X size={18} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>; }
function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('mb-5 space-y-1', className)} {...props} />; }
function DialogTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className="text-xl font-extrabold tracking-[-0.06em]" {...props} />; }
function DialogDescription(props: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className="text-sm leading-6 text-[#766e66]" {...props} />; }
export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription };
