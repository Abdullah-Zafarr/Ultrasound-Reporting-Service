
"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Using dynamic runtime imports to bypass build-time type/module resolution issues
// with react-resizable-panels in the production build environment.

const ResizablePanelGroup = ({ className, ...props }: any) => {
  const [Component, setComponent] = React.useState<any>(null);

  React.useEffect(() => {
    import("react-resizable-panels").then((mod: any) => {
      // Library version uses Group/orientation instead of PanelGroup/direction
      setComponent(() => mod.Group || mod.PanelGroup);
    });
  }, []);

  if (!Component) {
    return <div className={cn("flex h-full w-full", className)}>{props.children}</div>;
  }

  // Handle prop mapping between library versions
  const { direction, ...rest } = props;
  const orientation = direction || props.orientation;

  return (
    <Component
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      orientation={orientation}
      direction={direction}
      {...rest}
    />
  );
};

const ResizablePanel = ({ children, ...props }: any) => {
  const [Component, setComponent] = React.useState<any>(null);

  React.useEffect(() => {
    import("react-resizable-panels").then((mod: any) => {
      setComponent(() => mod.Panel);
    });
  }, []);

  if (!Component) {
    return <div className="flex-1 min-w-0">{children}</div>;
  }

  return <Component {...props}>{children}</Component>;
};

const ResizableHandle = ({ withHandle, className, ...props }: any) => {
  const [Component, setComponent] = React.useState<any>(null);

  React.useEffect(() => {
    import("react-resizable-panels").then((mod: any) => {
      setComponent(() => mod.Separator || mod.PanelResizeHandle);
    });
  }, []);

  if (!Component) {
    return <div className={cn("w-px bg-border", className)} />;
  }

  return (
    <Component
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </Component>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
