import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { VideoItem } from '@/types';
import { formatViewCount, formatTimeAgo, parseDuration } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleStar } from '@/store/slices/starSlice';
import { cn } from '@/lib/utils';
import { videoApi } from '@/api';

interface VideoCardProps {
  video: VideoItem;
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isStarred = useAppSelector((s) => s.star.ids.includes(video.videoId));

  return (
    <div
      onClick={() => {
        videoApi.incrementView(video.videoId).catch(() => {});
        navigate(`/watch/${video.videoId}`);
      }}
      className="group cursor-pointer fade-in"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {parseDuration(video.duration)}
          </span>
        )}
        {/* Star button overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); dispatch(toggleStar(video.videoId)); }}
          title={isStarred ? 'Bỏ đánh dấu' : 'Đánh dấu'}
          className={cn(
            'absolute left-2 top-2 rounded-full p-1.5 backdrop-blur-sm transition-all duration-150',
            isStarred
              ? 'bg-yellow-400/90 text-yellow-900'
              : 'bg-black/50 text-white/80 opacity-0 group-hover:opacity-100',
          )}
        >
          <Star className={cn('h-3.5 w-3.5', isStarred && 'fill-current')} />
        </button>
      </div>

      <div className="mt-3 flex gap-3">
        {video.channelAvatar ? (
          <img
            src={video.channelAvatar}
            alt={video.channelTitle}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-bold uppercase text-text-secondary">
            {video.channelTitle.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-text-primary">
            {video.title}
          </h3>
          <p className="mt-1 text-xs text-text-secondary hover:text-text-primary">
            {video.channelTitle}
          </p>
          <p className="text-xs text-text-secondary">
            {formatViewCount(video.viewCount)} · {formatTimeAgo(video.publishedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
