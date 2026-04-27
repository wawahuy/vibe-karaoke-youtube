import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('video_cache')
@Unique(['videoId', 'itag'])
export class VideoCacheEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  videoId: string;

  @Column()
  filePath: string;

  @Column({ default: 'video/mp4' })
  mimeType: string;

  @Column({ type: 'integer', default: 0 })
  contentLength: number;

  @Column({ type: 'integer', default: 0 })
  cachedBytes: number;

  @Column({ default: false })
  isComplete: boolean;

  @Column({ type: 'integer', default: 0 })
  itag: number;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  lastAccessedAt: Date;
}
