import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/shadcn/lib/utils";

const buttonVariants = cva(
  "disabled:bg-muted disabled:text-muted-foreground aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:border-muted inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm whitespace-nowrap transition-all outline-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary desktop:hover:bg-primary-light desktop:hover:border-primary-light desktop:hover:text-primary active:bg-primary-light active:border-primary-light active:text-primary border-[2px] text-white",
        outline:
          "border-primary text-primary desktop:hover:border-accent desktop:hover:text-primary-dark active:border-accent active:text-primary-dark disabled:border-muted border border-[2px]",
        text: "text-primary desktop:hover:text-primary-light active:text-primary-light bg-transparent p-0 disabled:bg-transparent",
        ghost: "disabled:bg-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "text-tight h-[56px] rounded-md px-[150px] py-[26px] font-medium has-[>svg]:px-4",
        md: "text-tight h-[56px] rounded-md px-[24px] py-[18px] font-medium",
        sm: "desktop:h-[32px] subtext-tight desktop:text-tight desktop:rounded-sm desktop:px-[16px] desktop:py-[6px] desktop:border-none h-[44px] gap-1 rounded-md px-[28px] py-[10px] font-normal has-[>svg]:px-2.5",
        smSubtext:
          "desktop:h-[32px] subtext desktop:rounded-sm desktop:px-[16px] desktop:py-[6px] desktop:border-none h-[44px] gap-1 rounded-md px-[28px] py-[10px] font-normal has-[>svg]:px-2.5",
        inline: "h-auto p-0 leading-none",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-auto": "h-auto w-auto p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
