# Ikigai Dashboard

A comprehensive Next.js dashboard for managing beauty services platform that connects barbers, hairdressers, makeup artists, and other beauty professionals with customers.

## Features

### 🎯 Core Functionality
- **Authentication System**: Secure admin login with role-based access control
- **Service Provider Management**: CRUD operations for barbers, hairdressers, makeup artists, nail technicians, and estheticians
- **Shop Management**: Create and manage beauty shops and salons
- **Services Management**: Define and manage services offered by each provider
- **Booking Management**: Track customer appointments and bookings
- **Analytics Dashboard**: View business insights and performance metrics
- **Settings**: Configure system preferences and notifications

### 🎨 Design System
- **Brand Colors**: Custom Ikigai color scheme (#002D39 primary)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with intuitive navigation
- **Component Library**: Reusable UI components built with Radix UI

### 📊 Dashboard Features
- **Statistics Cards**: Key metrics at a glance
- **Recent Activity**: Real-time updates and notifications
- **Quick Actions**: Fast access to common tasks
- **Data Tables**: Sortable and filterable data views
- **Modal Forms**: Clean forms for adding/editing data

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts (ready for implementation)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ikigai-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🔐 Authentication

The dashboard includes a secure authentication system with role-based access control:

**Demo Credentials:**
- Email: `admin@ikigai.com`
- Password: `admin123`

**User Roles:**
- **Admin**: Full access to all features
- **Manager**: Access to most features except user management
- **Staff**: Limited access to bookings and basic operations

**Features:**
- Secure login/logout
- Session persistence
- Role-based permissions
- Protected routes
- Unauthorized access handling

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── analytics/         # Analytics dashboard
│   ├── bookings/          # Booking management
│   ├── providers/         # Service provider management
│   ├── services/          # Services management
│   ├── shops/             # Shop management
│   ├── settings/          # System settings
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── dashboard-stats.tsx # Statistics cards
│   └── recent-activity.tsx # Activity feed
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities
└── types/                # TypeScript type definitions
    └── index.ts          # Data models
```

## Key Pages

### Dashboard (`/`)
- Overview of key metrics
- Recent activity feed
- Quick action buttons
- Revenue and booking trends

### Service Providers (`/providers`)
- List all beauty professionals
- Filter by type (barber, hairdresser, etc.)
- Search functionality
- Add/edit/delete providers

### Shops (`/shops`)
- Manage beauty shops and salons
- Shop details and contact information
- Provider assignments
- Location management

### Services (`/services`)
- Define services offered
- Pricing and duration management
- Category organization
- Provider-service relationships

### Bookings (`/bookings`)
- Customer appointment management
- Status tracking (pending, confirmed, completed)
- Calendar integration ready
- Customer communication

### Analytics (`/analytics`)
- Business performance metrics
- Revenue tracking
- Top services and providers
- Export capabilities

### Settings (`/settings`)
- Notification preferences
- Privacy and security settings
- Appearance customization
- System configuration

## Data Models

### ServiceProvider
- Personal information (name, email, phone)
- Professional details (type, experience, rating)
- Shop assignment
- Status management

### Shop
- Business information (name, address, contact)
- Owner details
- Service offerings
- Location data

### Service
- Service details (name, description, price)
- Duration and category
- Provider and shop relationships
- Availability status

### Booking
- Customer information
- Service and provider details
- Date and time scheduling
- Status tracking

## Customization

### Brand Colors
The dashboard uses a custom color scheme defined in `tailwind.config.ts`:
- Primary: #002D39 (Ikigai brand color)
- Secondary: #004A5A
- Accent: #006B7A
- Light: #E8F4F8

### Adding New Features
1. Create new page in `src/app/`
2. Add navigation item in `src/components/sidebar.tsx`
3. Define types in `src/types/index.ts`
4. Create components in `src/components/`

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced charting with Recharts
- [ ] Calendar integration
- [ ] Payment processing
- [ ] Customer reviews and ratings
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile app integration
- [ ] API integration
- [ ] User authentication
- [ ] Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
