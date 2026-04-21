import { GlobalModal } from "@/entities/modals/ui/globalModal";
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
          <div className="desktop:py-1 desktop:px-3 mx-auto flex h-dvh max-h-dvh min-h-dvh max-w-300 flex-col gap-4 overflow-hidden">
            <div className="desktop:flex-row desktop:gap-4 mx-auto flex h-full min-h-0 w-full flex-col-reverse">
              <NavBar />
              <ResponsiveLayout sidebar={sidebar} extra={extra}>
                {children}
              </ResponsiveLayout>
            </div>
          </div>
        </ToastProvider>
      </ContextMenuProvider>
    </QueryCustomProvider>
  );
}
