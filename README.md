<p align="center">
  <img src="https://img.shields.io/github/v/release/wawahuy/vibe-karaoke-youtube?style=flat-square" alt="Release" />
  <img src="https://img.shields.io/github/actions/workflow/status/wawahuy/vibe-karaoke-youtube/release.yml?style=flat-square" alt="Build" />
  <img src="https://img.shields.io/badge/platform-Linux%20%7C%20Windows-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/electron-v34-47848F?style=flat-square&logo=electron" alt="Electron" />
</p>

<h1 align="center">YouTube Karaoke</h1>

<p align="center">
  Ứng dụng desktop karaoke — tìm kiếm & phát video YouTube trực tiếp, fullscreen với ticker tên phòng hát.
</p>

---

## Tính năng

- **Tìm kiếm YouTube** — hỗ trợ 3 provider: YouTube Data API, SerpAPI, hoặc Local API tự dựng
- **Phát video trực tiếp** — stream qua `yt-dlp`, chọn chất lượng (144p → 1080p)
- **Chế độ Fullscreen Karaoke** — ticker hiển thị tên phòng & số điện thoại ở 20% màn hình
- **Đánh dấu video yêu thích** — ghim video lên đầu danh sách tìm kiếm
- **Cache thông minh** — cache kết quả tìm kiếm & thông tin video bằng SQLite
- **Cấu hình qua UI** — chỉnh font size, API key, tên phòng không cần chạm file config
- **Hoạt động offline** — trang báo mất mạng tự động

---

## Giao diện

| Trang chủ | Tìm kiếm | Phát video (Fullscreen) |
|-----------|----------|------------------------|
| Dark neon theme, floating music particles | Grid kết quả, badge cache, starred videos lên đầu | Ticker tên phòng, chọn chất lượng, F11 fullscreen |

---

## Kiến trúc

```
youtube/
├── frontend/        # React + Vite + Tailwind v4 + Redux Saga
├── backend/         # NestJS + TypeORM + better-sqlite3
│   └── data/        # SQLite DB + video cache
├── electron/        # Electron main process
├── Dockerfile.win   # Cross-compile Windows từ Linux (Wine + NSIS)
└── .github/
    └── workflows/
        └── release.yml  # CI/CD tự động build & release
```

**Backend (NestJS — port 3123)**

| Module | Chức năng |
|--------|-----------|
| `search` | Tìm kiếm qua YouTube / SerpAPI / Local API |
| `video` | Lấy format list & stream URL qua yt-dlp |
| `video-info` | Cache thông tin video (SQLite) |
| `search-cache` | Cache kết quả tìm kiếm |
| `settings` | Lưu cấu hình dạng key-value vào DB |

**Frontend (React + Redux Saga)**
- State management: Redux Toolkit + Redux Saga
- Routing: React Router v6
- PWA: `vite-plugin-pwa` (service worker, offline support)

---

## Chạy dev

### Yêu cầu
- Node.js ≥ 20
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) cài sẵn trong PATH
- (Tuỳ chọn) YouTube Data API key hoặc SerpAPI key

### Backend
```bash
cd backend
npm install
# Tạo file .env (xem mục Cấu hình bên dưới)
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Electron (desktop)
```bash
cd electron
npm install
npm run dev
```

---

## Cấu hình

Tạo file `backend/.env`:

```env
PORT=3123

# Bắt buộc chọn 1 trong 3:
# SEARCH_PROVIDER=youtube   → cần YOUTUBE_API_KEY
# SEARCH_PROVIDER=serp      → cần SERP_API_KEY
# SEARCH_PROVIDER=local     → cần LOCAL_BASE_URL

YOUTUBE_API_KEY=your_key_here
SERP_API_KEY=your_key_here
LOCAL_BASE_URL=http://localhost:8000
LOCAL_API_KEY=
```

Hoặc cấu hình trực tiếp trong app tại `/config`.

---

## Build

### Linux (AppImage + deb)
```bash
./build-all.sh
# Output: electron/release/
```

### Windows (từ Linux, yêu cầu Docker)
```bash
./build-win.sh
# Output: electron/release-win/
```

### Cả hai cùng lúc
```bash
# Build Linux trước, Windows qua Docker
./build-all.sh && ./build-win.sh
```

---

## CI/CD — GitHub Actions

Workflow tự động khi push commit có prefix **`release:`**:

```bash
git commit -m "release: thêm tính năng xyz"
git push
```

Pipeline sẽ:
1. Tự động tăng version (`patch`) trong `electron/package.json`
2. Commit & tạo tag `vX.X.X`
3. Build Linux AppImage + deb trên runner
4. Build Windows installer qua Docker + Wine
5. Tạo [GitHub Release](../../releases) đính kèm tất cả file

> **Lưu ý:** Vào *Settings → Actions → General → Workflow permissions* → chọn **Read and write permissions**.

---

## Yêu cầu hệ thống

| | Linux | Windows |
|-|-------|---------|
| OS | Ubuntu 20.04+ / Debian | Windows 10+ |
| Kiến trúc | x64 | x64 |
| yt-dlp | Cài sẵn trong PATH | Bundled trong app |

---

## License

MIT
