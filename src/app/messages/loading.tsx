import { ConversationItemSkeleton } from "@/components/ui/Skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Conversations list skeleton */}
      <div className="w-80 border-r border-gray-200 bg-white shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <ConversationItemSkeleton key={i} />
          ))}
        </div>
      </div>
      {/* Message area skeleton */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse mx-auto mb-3" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
