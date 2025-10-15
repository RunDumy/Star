# Star App Assets Directory

## Required Assets

### Cursor
- `starcursor.png` - Custom space-themed cursor (24x24px recommended)

### Zodiac Assets
Place in `/zodiac/` subdirectory:

**Avatars:**
- `aries_avatar.png`
- `taurus_avatar.png`
- `gemini_avatar.png`
- `libra_avatar.png` 
- `scorpio_avatar.png`
- Additional zodiac signs as needed

**Backgrounds:**
- `aries_bg.jpg`
- `taurus_bg.jpg`
- `gemini_bg.jpg`
- `libra_bg.jpg`
- `scorpio_bg.jpg`
- Additional zodiac backgrounds as needed

### Tarot Cards
Place in `/tarot/` subdirectory:
- `death.png`
- `star.png`
- `moon.png`
- `sun.png`
- `fool.png`
- Additional tarot card images as needed

## Notes
- All images should be optimized for web (WebP format recommended)
- Avatars: 256x256px recommended
- Backgrounds: 1920x1080px recommended  
- Tarot cards: 400x700px recommended (standard tarot proportions)
- Use consistent naming convention (lowercase, underscores)

## Upload to Azure Blob Storage
After adding assets locally, they need to be uploaded to:
`starfrontendstorage/$web/assets/`

Command:
```powershell
az storage blob upload-batch --account-name starfrontendstorage --destination '$web/assets' --source star-frontend/public/assets
```