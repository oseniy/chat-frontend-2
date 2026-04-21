import { cn } from "@/shared/shadcn/lib/utils";

interface TopLoaderProps {
  className?: string;
}

export const TopLoader: React.FC<TopLoaderProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
      <span className="text-sm text-gray-500">Загрузка истории...</span>
    </div>
  );
};

export default TopLoader;
