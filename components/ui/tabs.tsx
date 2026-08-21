'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
const Tabs = TabsPrimitive.Root;
const TabsList = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) => <TabsPrimitive.List className={cn('inline-flex h-9 items-center rounded-lg bg-[#f1eee8] p-1', className)} {...props} />;
const TabsTrigger = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) => <TabsPrimitive.Trigger className={cn('inline-flex h-7 items-center justify-center rounded-md px-3 text-xs font-bold text-[#766e66] transition data-[state=active]:bg-white data-[state=active]:text-[#322f2b] data-[state=active]:shadow-sm', className)} {...props} />;
const TabsContent = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) => <TabsPrimitive.Content className={cn('mt-4 outline-none', className)} {...props} />;
export { Tabs, TabsList, TabsTrigger, TabsContent };
