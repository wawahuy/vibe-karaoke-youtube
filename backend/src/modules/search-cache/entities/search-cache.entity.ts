import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('search_cache')
export class SearchCacheEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  queryKey: string; // normalized lowercase query

  @Column({ type: 'text' })
  itemsJson: string; // JSON stringified SearchItem[]

  @Column({ nullable: true })
  nextPageToken: string;

  @Column({ type: 'integer', default: 0 })
  totalResults: number;

  @Column({ type: 'datetime', default: () => "datetime('now')" })
  cachedAt: Date;
}
