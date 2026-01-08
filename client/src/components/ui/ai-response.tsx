import { cn } from "@/lib/utils";
import { memo, type ComponentProps } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose prose-sm max-w-full dark:prose-invert",
        className
      )}
      shikiTheme={["github-light", "github-dark-dimmed"]}
      components={{
        pre: ({ children }) => (
          <pre className="relative my-4 overflow-x-auto rounded-xl border border-border/40 bg-muted/30 p-4 font-mono text-sm backdrop-blur-xs transition-colors hover:border-border/60 dark:bg-background/80">
            {children}
          </pre>
        ),
        code: ({ children, className }) => {
          const isInline = !className?.includes("shiki");
          if (isInline) {
            return (
              <code className="rounded bg-muted/40 px-1.5 py-0.5 font-bold text-[0.85em] text-primary transition-colors hover:bg-muted/60 dark:bg-muted/20">
                {children}
              </code>
            );
          }
          return <code className={className}>{children}</code>;
        },
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
