import * as React from 'react';
import { cn } from '@/lib/utils';
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('rounded-xl border border-[#e3dfd7] bg-white text-[#302d29] shadow-[0_1px_0_rgba(41,39,36,.03)]', className)} {...props} />); Card.displayName = 'Card';
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-row items-center justify-between gap-4 px-5 pt-5', className)} {...props} />); CardHeader.displayName = 'CardHeader';
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h3 ref={ref} className={cn('text-sm font-extrabold tracking-[-0.03em]', className)} {...props} />); CardTitle.displayName = 'CardTitle';
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('px-5 pb-5 pt-4', className)} {...props} />); CardContent.displayName = 'CardContent';
export { Card, CardHeader, CardTitle, CardContent };
