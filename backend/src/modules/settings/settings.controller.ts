import { Controller, Get, Post, Body } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { SettingsService } from './settings.service';

function getConfigBase(): string {
  const dataDir = process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
  return path.dirname(dataDir);
}

function readPathsJson(): { dataDir?: string; cacheDir?: string } {
  const file = path.join(getConfigBase(), 'paths.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return {}; }
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Get('paths')
  getPaths() {
    const dataDir = process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data');
    const cacheDir = process.env.CACHE_DIR ?? path.join(dataDir, 'video-cache');
    const saved = readPathsJson();
    return {
      dataDir,
      cacheDir,
      savedDataDir: saved.dataDir ?? '',
      savedCacheDir: saved.cacheDir ?? '',
    };
  }

  @Post('paths')
  savePaths(@Body() body: { dataDir?: string; cacheDir?: string }) {
    const configBase = getConfigBase();
    fs.mkdirSync(configBase, { recursive: true });
    const current = readPathsJson();
    if (body.dataDir !== undefined) current.dataDir = body.dataDir || undefined;
    if (body.cacheDir !== undefined) current.cacheDir = body.cacheDir || undefined;
    // Remove empty values so defaults are used on next launch
    if (!current.dataDir) delete current.dataDir;
    if (!current.cacheDir) delete current.cacheDir;
    fs.writeFileSync(path.join(configBase, 'paths.json'), JSON.stringify(current, null, 2), 'utf-8');
    return { success: true };
  }

  @Post()
  async saveAll(@Body() body: Record<string, string>) {
    const allowed = [
      'siteTitle', 'phone', 'defaultQuality',
      'titleFontSize', 'phoneFontSize', 'marqueeFontSize',
      'youtubeApiKey', 'serpApiKey', 'searchProvider',
      'localBaseUrl', 'localApiKey', 'videoInfoProvider',
    ];
    const filtered: Record<string, string> = {};
    for (const key of allowed) {
      if (key in body) filtered[key] = String(body[key]);
    }
    await this.settingsService.setMany(filtered);
    return { success: true };
  }
}
