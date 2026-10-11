import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import { cn } from 'cn';

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" className={cn('inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 [&>span]:truncate', className)} {...props}>
    {children}<SelectPrimitive.Icon asChild><ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /></SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>;
}

function SelectContent({ className, children, position = 'popper', ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content data-slot="select-content" position={position} className={cn('relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-y-auto rounded-[var(--radius-control)] border border-border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-paper)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0', className)} {...props}>
    <SelectPrimitive.Viewport className="p-0.5">{children}</SelectPrimitive.Viewport>
  </SelectPrimitive.Content></SelectPrimitive.Portal>;
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn('relative flex min-h-10 w-full cursor-pointer select-none items-center rounded-md py-2 pr-9 pl-3 text-sm outline-none focus:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50', className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><span className="absolute right-3 flex size-4 items-center justify-center"><SelectPrimitive.ItemIndicator><Check aria-hidden="true" className="size-4" /></SelectPrimitive.ItemIndicator></span>
  </SelectPrimitive.Item>;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue };
