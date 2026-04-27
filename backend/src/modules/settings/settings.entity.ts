import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('app_settings')
export class SettingsEntity {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;
}
