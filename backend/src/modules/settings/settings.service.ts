import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from './settings.entity';

export const SETTING_DEFAULTS: Record<string, string> = {
  siteTitle: 'YouTube',
  phone: '',
  defaultQuality: '360p',
  titleFontSize: '7',
  phoneFontSize: '2',
  marqueeFontSize: '2.5',
  youtubeApiKey: '',
  serpApiKey: '',
  searchProvider: 'youtube',
  localBaseUrl: '',
  localApiKey: '',
  videoInfoProvider: 'ytdlp',
};

@Injectable()
export class SettingsService implements OnModuleInit {
  private memCache: Record<string, string> = {};

  constructor(
    @InjectRepository(SettingsEntity)
    private readonly repo: Repository<SettingsEntity>,
  ) {}

  async onModuleInit() {
    const all = await this.repo.find();
    for (const e of all) {
      this.memCache[e.key] = e.value;
    }
  }

  async getAll(): Promise<Record<string, string>> {
    return { ...SETTING_DEFAULTS, ...this.memCache };
  }

  async get(key: string): Promise<string> {
    return this.memCache[key] ?? SETTING_DEFAULTS[key] ?? '';
  }

  async setMany(values: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      const existing = await this.repo.findOne({ where: { key } });
      if (existing) {
        existing.value = value;
        await this.repo.save(existing);
      } else {
        await this.repo.save(this.repo.create({ key, value }));
      }
      this.memCache[key] = value;
    }
  }
}
