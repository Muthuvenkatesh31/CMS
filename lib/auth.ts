import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database, Employee } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface LoginCredentials {
  employeeCode: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<Employee, 'password'>;
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const employee = await database.getEmployeeByCode(credentials.employeeCode);
    
    if (!employee) {
      return {
        success: false,
        message: 'Invalid employee code or password'
      };
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, employee.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid employee code or password'
      };
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        employeeCode: employee.employeeCode, 
        email: employee.email,
        id: employee.id,
        role: employee.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from user object
    const { password, ...userWithoutPassword } = employee;

    return {
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during authentication'
    };
  }
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function authenticateRequest(request: Request): Promise<{ user: any; error?: string }> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { user: null, error: 'No authentication token found' };
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['auth-token'];
    if (!token) {
      return { user: null, error: 'No authentication token found' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user: decoded };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}
