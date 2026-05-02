import { GlobalModal } from "@/entities/modals/ui/globalModal";
import { CallBar, CallManager } from "@/features/call";
import { MediaViewerContainer } from "@/features/mediaViewer/ui/mediaViewerContainer";
import { ResponsiveLayout } from "@/shared/layouts/responsiveLayout";
import { NavBar } from "@/shared/navBar/ui/navBar";
import QueryCustomProvider from "@/shared/providers/queryProvider";
import { ToastProvider } from "@/shared/toast/ui/toastProvider";
import { ContextMenuProvider } from "@/shared/ui/contextMenu/contextMenuProvider";

type ChatLayoutProps = {
  children: React.ReactNode; // Центральная область (Main)
  sidebar: React.ReactNode; // Левая область
  extra: React.ReactNode; // Правая область (опционально)
};

export default function ChatLayout({ children, sidebar, extra }: ChatLayoutProps) {
  return (
    <QueryCustomProvider>
      <GlobalModal />
      <MediaViewerContainer />
      <ContextMenuProvider>
        <ToastProvider>
          <div className="desktop:py-1 desktop:px-3 desktop:gap-2 mx-auto flex h-dvh max-h-dvh min-h-dvh max-w-300 flex-col overflow-hidden">
            <CallBar />
            <div className="desktop:flex-row desktop:gap-4 relative mx-auto flex min-h-0 w-full flex-1 flex-col-reverse">
              <NavBar />
              <ResponsiveLayout sidebar={sidebar} extra={extra}>
                {children}
              </ResponsiveLayout>
              <CallManager />
            </div>
          </div>
        </ToastProvider>
      </ContextMenuProvider>
    </QueryCustomProvider>
  );
}
