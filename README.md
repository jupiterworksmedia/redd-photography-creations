# REDD Photography Creations

A modernist, minimalist, editorial website and restricted backend CMS for **REDD Photography Creations**, dedicated to showcasing high-end photography across **Fashion, Boudoir, Portraits, Events, and Commercial**.

---

## 🌟 Visual Style & Architectural Design
- **Aesthetic**: Modernism and high-fashion minimalism. Deep obsidian backgrounds (`#08080a`), crisp typography, and signature crimson accents (`#e50914`).
- **Typography**: Cormorant Garamond editorial serif paired with Plus Jakarta Sans.
- **Five Specialized Disciplines**:
  - **Haute Couture & Fashion**: Editorial campaigns, lookbooks, and sculptural garment movement.
  - **Fine-Art Boudoir**: Intimate, tasteful, and empowering fine-art photography executed in a discreet and safe setting.
  - **Cinematic Portraits**: Chiaroscuro character studies, executive branding, and studio lighting.
  - **High-Society Events**: Gala photojournalism, runway backstage, and VIP gatherings.
  - **Commercial Campaigns**: Macro horology, luxury perfumery, and architectural minimalism.
- **Interactive Lightbox**: Full-screen modal with keyboard navigation (Left/Right arrows, Escape), high-res presentation, camera EXIF technical metadata (Camera Body, Lens, Aperture, Shutter Speed, ISO), and direct booking triggers.
- **Interactive Booking Flow**: Custom inquiries form capturing client vision, preferred dates, location, and budget range.

---

## 🔐 Restricted Backend CMS

The administrative portal is protected at the server and middleware level and strictly restricted to the authorized administrator. Generic visitors cannot access the admin portal without authentication.

- **Admin Login Portal**: `http://localhost:3005/admin/login` (or `/admin/login`)
- **Authorized User ID / Email**: `reddphotographycreations@gmail.com`
- **Initial Password**: `ReddAdmin2024!#` *(Can be updated anytime in the CMS Settings panel)*

### CMS Capabilities
1. **Dashboard Overview (`/admin`)**:
   - Portfolio metrics and category distribution.
   - Pending inquiry notifications and recent activity summary.
2. **Portfolio Manager (`/admin/gallery`)**:
   - Add new photographs with live image preview or direct file upload.
   - Edit titles, categories, clients, shoot narratives, and EXIF camera specs.
   - Toggle homepage featured status with one click.
   - Delete works with confirmation.
3. **Inquiries & Booking Leads Inbox (`/admin/inquiries`)**:
   - Review incoming client booking requests from the public site.
   - Filter by status (`New`, `Contacted`, `Booked`, `Archived`).
   - One-click client reply via pre-filled email mailto link.
   - Internal studio notes per client.
4. **Studio Settings (`/admin/settings`)**:
   - Update brand name, director bio, statement, phone, address, and social media handles.
   - Manage production gear kit (cameras, prime lenses, lighting rigs).
   - Change master administrator password securely.

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ (tested on Node.js v24.16.0)
- npm

### Development Server
```bash
npm run dev
# Accessible at http://localhost:3000
```

### Production Build & Server
```bash
npm run build
npm run start -- -p 3005
# Accessible at http://localhost:3005
```

---

## 📁 Project Structure

```
redd-photography-creations/
├── data/
│   └── db.json              # Local persistent JSON database (auto-seeded)
├── public/
│   └── uploads/             # Direct image uploads from the CMS
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with fonts & metadata
│   │   ├── page.tsx         # Home portfolio showcase & booking
│   │   ├── about/page.tsx   # Detailed artist biography & gear arsenal
│   │   ├── services/page.tsx# Complete breakdown of all 5 disciplines
│   │   ├── contact/page.tsx # Direct booking inquiry flow & FAQs
│   │   ├── admin/
│   │   │   ├── layout.tsx   # Admin dashboard shell & sidebar
│   │   │   ├── login/page.tsx   # Restricted Admin Login
│   │   │   ├── page.tsx     # Overview metrics & stats
│   │   │   ├── gallery/page.tsx # Photo & Project Manager
│   │   │   ├── inquiries/page.tsx # Client Inquiries Inbox
│   │   │   └── settings/page.tsx # Studio Settings & Password Manager
│   │   └── api/
│   │       ├── auth/        # Login, logout, session verification
│   │       ├── gallery/     # Portfolio CRUD & filtering
│   │       ├── inquiries/   # Visitor inquiry submission & admin status
│   │       ├── settings/    # Studio settings & password update
│   │       └── upload/      # File upload handling
│   ├── components/
│   │   ├── Navbar.tsx       # Minimalist navigation
│   │   ├── Footer.tsx       # Editorial footer
│   │   ├── HeroSection.tsx  # Bold modernist hero with category shortcuts
│   │   ├── PortfolioGrid.tsx# Responsive masonry grid with hover cards
│   │   ├── LightboxModal.tsx# Full-screen photo viewer with EXIF metadata
│   │   ├── BookingForm.tsx  # Client booking & inquiry form
│   │   └── HomeClient.tsx   # Interactive client-side orchestration
│   ├── lib/
│   │   ├── types.ts         # TypeScript models
│   │   ├── seedData.ts      # Curated starter photography across 5 genres
│   │   ├── db.ts            # Persistent database operations
│   │   └── auth.ts          # Session tokens & credential checks
│   └── middleware.ts        # Route guard protecting /admin/*
```
