import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('video_info')
export class VideoInfoEntity {
  @PrimaryColumn()
  videoId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ nullable: true })
  channelAvatar: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ type: 'integer', nullable: true })
  viewCount: number;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'integer', default: 0 })
  localViews: number;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  cachedAt: Date;
}
