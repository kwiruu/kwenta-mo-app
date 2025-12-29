# KwentaMo - Food Business Costing Assistant

A modern web-based costing assistant designed for small food business owners in Cebu City and beyond.

## 🚀 Tech Stack

### Frontend

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **TypeScript** - Type safety
- **React Router v7** - File-based routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **ShadCN UI** - Accessible component library
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Development Tools

- **Vite TSConfig Paths** - Path alias support
- **Radix UI** - Headless UI primitives

## 📁 Project Structure

```
kwenta-mo-app/
├── app/
│   ├── components/       # Reusable React components
│   │   └── ui/          # ShadCN UI components
│   ├── config/          # Application configuration
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── routes/          # React Router routes
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   ├── app.css          # Global styles with Tailwind
│   └── root.tsx         # Root component
├── public/              # Static assets
├── components.json      # ShadCN UI configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Install dependencies:**

   ```bash
   cd kwenta-mo-app
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm start
   ```

## 📦 Key Features

### 1. Business Profile Management

- Track source of raw materials
- Monitor employee count
- Record average monthly sales
- Business location tracking

### 2. Ingredient Management

- CRUD operations for ingredients
- Stock level monitoring
- Unit price tracking
- Bulk upload via Excel/CSV

### 3. Recipe & Costing

- Recipe creation with ingredient mapping
- Automatic cost calculation:
  - Material costs
  - Labor costs
  - Overhead allocation
- Profit margin analysis

### 4. Operating Expenses

- Category-based expense tracking
- Frequency-based recording
- Bulk data import

### 5. Financial Reports

- Cost of Goods Sold (COGS)
- Income Statement
- Expense Report
- Profit Summary

### 6. Dashboard & Visualizations

- Real-time cost breakdowns
- Profit vs. Cost comparisons
- Sales trends with Recharts

## 🎨 UI Components Available

The project comes with pre-configured ShadCN UI components:

- Button
- Card
- Input
- Dialog
- Dropdown Menu
- Label
- Select
- Separator
- Tabs

Add more components using:

```bash
npx shadcn@latest add <component-name>
```

## 📊 State Management

### Stores

- `businessStore.ts` - Business profile state
- `ingredientStore.ts` - Ingredient management state

Stores use Zustand with:

- DevTools integration (development)
- LocalStorage persistence (where needed)

## 🔧 Configuration

### Application Config (`app/config/app.ts`)

```typescript
- API endpoints
- Feature flags
- Business defaults (currency, overhead rate)
- Upload limits
- Pagination settings
```

### Path Aliases

```typescript
"~/*" → "./app/*"
```

## 🎯 Next Steps

### Backend Integration

1. Set up NestJS backend
2. Configure Supabase PostgreSQL
3. Implement Prisma ORM
4. Create REST API endpoints

### Additional Features

1. Authentication (Supabase Auth)
2. File upload handling
3. PDF report generation
4. Real-time notifications
5. Mobile PWA support

## 📝 Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

This is a capstone project for BSBA Financial Management students at University of Cebu.

## 📄 License

Educational project - University of Cebu Main Campus

---

**Team Members:**

- Monte De Ramos, Thomas
- Rosales, Nicole Angela C.
- Salgarino, Deseree
- Tabares, Jehana T.
- Torrefiel, Osha Dyna A.
- Velarde, Khyle Arman L.
- Vergara, Cyrhyl
- Villarba, Cristine Joy
- Villasis, Julimae
- Zuniega, Glyle Glee O.

**December 2025**
