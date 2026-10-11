import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from 'cn';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn('text-sm font-semibold leading-5 text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60', className)} {...props} />;
}

export { Label };
