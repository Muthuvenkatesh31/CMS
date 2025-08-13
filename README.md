# CMS Application

A comprehensive Employee and Customer Management System built with Next.js 14, TypeScript, SQLite, and Tailwind CSS.

## Features

### 🔐 Authentication System
- **Login Functionality**: Secure login using Employee Code and password
- **JWT-based Authentication**: Secure token-based authentication with HTTP-only cookies
- **No Registration Page**: All user accounts are created by administrators
- **Default Admin Account**: Pre-configured admin user (ADMIN001 / admin123)

### 👥 Employee Management
- **Automatic Employee Code Generation**: Unique codes (EMP001, EMP002, etc.)
- **Comprehensive Employee Data**: First name, last name, mobile, date of birth, email, password
- **Secure Password Storage**: Bcrypt hashing for password security
- **Form Validation**: Client-side and server-side validation

### 👤 Customer Management
- **Automatic Customer Code Generation**: Unique codes (CUST001, CUST002, etc.)
- **Customer Data Management**: First name, last name, mobile, date of birth, email
- **Form Validation**: Comprehensive input validation and error handling

### 🗄️ Database
- **SQLite Database**: Lightweight, serverless database
- **Automatic Table Creation**: Tables are created on first run
- **Data Integrity**: Proper constraints and relationships
- **Secure Queries**: Parameterized queries to prevent SQL injection

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface using Tailwind CSS
- **Dashboard Overview**: Statistics and recent entries display
- **Responsive Layout**: Works on desktop and mobile devices
- **Intuitive Navigation**: Easy-to-use navigation between pages

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite3
- **Authentication**: JWT, bcryptjs
- **API**: Next.js API Routes
- **Development**: ESLint, PostCSS

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cms-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup** (Optional)
   Create a `.env.local` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

- **Employee Code**: `ADMIN001`
- **Password**: `admin123`

## Project Structure

```
cms-application/
├── app/                          # Next.js 14 app directory
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── employees/          # Employee management API
│   │   └── customers/          # Customer management API
│   ├── dashboard/              # Dashboard pages
│   │   ├── employees/          # Employee creation page
│   │   └── customers/          # Customer creation page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Login page
├── lib/                         # Utility libraries
│   ├── auth.ts                 # Authentication utilities
│   └── database.ts             # Database connection and operations
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Employees
- `POST /api/employees` - Create new employee
- `GET /api/employees` - Get all employees

### Customers
- `POST /api/customers` - Create new customer
- `GET /api/customers` - Get all customers

## Security Features

### 🔒 Password Security
- **Bcrypt Hashing**: Passwords are hashed using bcrypt with salt rounds
- **Secure Storage**: Hashed passwords are stored in the database
- **Password Validation**: Minimum 6 characters required

### 🛡️ Authentication Security
- **JWT Tokens**: Secure JSON Web Tokens for session management
- **HTTP-Only Cookies**: Tokens stored in secure, HTTP-only cookies
- **Token Expiration**: 24-hour token validity
- **Secure Headers**: Proper security headers and CORS configuration

### 🚫 SQL Injection Prevention
- **Parameterized Queries**: All database queries use parameterized statements
- **Input Validation**: Comprehensive client-side and server-side validation
- **Data Sanitization**: Input data is properly sanitized before processing

## Database Schema

### Employees Table
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employeeCode TEXT UNIQUE NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  mobile TEXT NOT NULL,
  dateOfBirth TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Customers Table
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerCode TEXT UNIQUE NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  mobile TEXT NOT NULL,
  dateOfBirth TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Form Validation

### Employee Creation
- **Required Fields**: All fields are mandatory
- **Email Format**: Valid email address format required
- **Mobile Number**: Minimum 10 digits
- **Password**: Minimum 6 characters
- **Password Confirmation**: Must match password

### Customer Creation
- **Required Fields**: All fields are mandatory
- **Email Format**: Valid email address format required
- **Mobile Number**: Minimum 10 digits

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```env
   JWT_SECRET=your-production-secret-key
   NODE_ENV=production
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for custom CSS classes
- Use Tailwind utility classes for component styling

### Database
- Modify `lib/database.ts` for database schema changes
- Add new tables or modify existing ones
- Implement additional database operations

### Authentication
- Update `lib/auth.ts` for authentication logic changes
- Modify JWT configuration and token handling
- Implement additional security measures

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure SQLite is properly installed
   - Check file permissions for database creation

2. **Authentication Issues**
   - Verify JWT secret is set correctly
   - Check cookie settings and domain configuration

3. **Build Errors**
   - Clear `.next` directory and node_modules
   - Reinstall dependencies

4. **Port Already in Use**
   - Change port in package.json scripts
   - Kill existing processes on port 3000

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This application is designed for internal use and should not be deployed to public-facing servers without proper security review and additional security measures.
