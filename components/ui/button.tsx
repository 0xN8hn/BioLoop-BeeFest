import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4623a]/40', {
  variants: { variant: { default: 'bg-[#c4623a] text-[#fffdf8] hover:bg-[#a94d2e] shadow-[0_8px_18px_rgba(144,63,38,.18)]', outline: 'border border-[#ded9d0] bg-white text-[#3a3733] hover:bg-[#f5f2ec]', ghost: 'text-[#615b55] hover:bg-[#f2efe9]', dark: 'bg-[#292724] text-[#fffdf8] hover:bg-[#3c3935]' }, size: { default: 'h-10 px-4', sm: 'h-8 px-3 text-xs', icon: 'h-9 w-9 p-0' } }, defaultVariants: { variant: 'default', size: 'default' },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => { const Comp = asChild ? Slot : 'button'; return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />; });
Button.displayName = 'Button';
export { Button, buttonVariants };
