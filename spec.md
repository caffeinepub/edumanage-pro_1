# EduR

## Current State
The app is EduManage Pro, a school management system with Principal, Teacher, and Student portals. It has PWA support and a mobile-friendly layout, but branding is "EduManage Pro" / "Rahmaniyya Public School" with the old logo. The app name in index.html, manifest.json, DashboardLayout, and LoginPage all reference the old names.

## Requested Changes (Diff)

### Add
- New logo `/assets/uploads/logo-rah-2-1.png` replacing the old `/assets/uploads/logo-rah-1-1.png` as the default logo everywhere in the UI
- App name "EduR" in all branding locations

### Modify
- `index.html`: update `<title>`, `apple-mobile-web-app-title`, `application-name`, and `description` to use "EduR"
- `manifest.json`: update `name`, `short_name`, `description` to "EduR" / "Rahmaniyya Public School - EduR"
- `LoginPage.tsx`: replace old logo path with new logo path; update school name display to keep "Rahmaniyya Public School" but app branding as "EduR"
- `DashboardLayout.tsx`: replace old logo path fallback with new logo path; update sidebar app/school name reference
- `App.tsx`: update loading screen to show new logo

### Remove
- References to old logo path `/assets/uploads/logo-rah-1-1.png` as default (new logo becomes the default)

## Implementation Plan
1. Update index.html title and meta tags to "EduR"
2. Update manifest.json branding to "EduR"
3. Update LoginPage.tsx: swap logo fallback path, add "EduR" app name label
4. Update DashboardLayout.tsx: swap logo fallback path
5. Generate PWA icons using the new logo
6. Validate and deploy
