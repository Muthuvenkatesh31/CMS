import sqlite3 from 'sqlite3';
import path from 'path';
import { hashPassword } from './auth';

const dbPath = path.join(process.cwd(), 'cms.db');

export interface Employee {
  id?: number;
  employeeCode: string;
  firstname: string;
  lastname: string;
  mobile: string;
  dateOfBirth: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface Customer {
  id?: number;
  customerCode: string;
  firstname: string;
  lastname: string;
  mobile: string;
  dateOfBirth: string;
  email: string;
  createdBy?: number | null;
  createdAt?: string;
}

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  private initTables() {
    // Create employees table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeCode TEXT UNIQUE NOT NULL,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        mobile TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create customers table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerCode TEXT UNIQUE NOT NULL,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        mobile TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        createdBy INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES employees (id)
      )
    `);

    // Insert default admin user if not exists
    this.db.get("SELECT * FROM employees WHERE employeeCode = 'ADMIN001'", (err, row) => {
      if (!row) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        this.db.run(`
          INSERT INTO employees (employeeCode, firstname, lastname, mobile, dateOfBirth, email, password, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['ADMIN001', 'Admin', 'User', '1234567890', '1990-01-01', 'admin@cms.com', hashedPassword, 'admin']);
      }
    });
  }

  // Employee CRUD operations
  async createEmployee(employee: Omit<Employee, 'id' | 'employeeCode'>): Promise<Employee> {
    const employeeCode = await this.generateUniqueEmployeeCode();
    const hashedPassword = await hashPassword(employee.password);
    const db = this.db;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO employees (employeeCode, firstname, lastname, mobile, dateOfBirth, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [employeeCode, employee.firstname, employee.lastname, employee.mobile, employee.dateOfBirth, employee.email, hashedPassword, employee.role || 'user'],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get lastID
            const lastID = (this as any).lastID;
            resolve({
              id: lastID,
              employeeCode,
              firstname: employee.firstname,
              lastname: employee.lastname,
              mobile: employee.mobile,
              dateOfBirth: employee.dateOfBirth,
              email: employee.email,
              password: hashedPassword,
              role: employee.role || 'user'
            });
          }
        }
      );
    });
  }

  async getEmployeeByCode(employeeCode: string): Promise<Employee | null> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM employees WHERE employeeCode = ?',
        [employeeCode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Employee || null);
          }
        }
      );
    });
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM employees WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Employee || null);
          }
        }
      );
    });
  }

  async getAllEmployees(): Promise<Employee[]> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, employeeCode, firstname, lastname, mobile, dateOfBirth, email, role FROM employees ORDER BY id DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Employee[]);
          }
        }
      );
    });
  }

  async getEmployeesByRole(role: 'admin' | 'user'): Promise<Employee[]> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, employeeCode, firstname, lastname, mobile, dateOfBirth, email, role FROM employees WHERE role = ? ORDER BY id DESC',
        [role],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Employee[]);
          }
        }
      );
    });
  }

  async updateEmployee(id: number, updates: Partial<Omit<Employee, 'id' | 'employeeCode' | 'password'>>): Promise<Employee | null> {
    const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
    const values = fields.map(key => updates[key as keyof typeof updates]);
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const db = this.db;
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE employees SET ${setClause} WHERE id = ?`,
        [...values, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get changes
            const changes = (this as any).changes;
            if (changes > 0) {
              // Query again to get the updated record
              db.get('SELECT * FROM employees WHERE id = ?', [id], (err: any, row: any) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(row as Employee);
                }
              });
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async updateEmployeePassword(id: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await hashPassword(newPassword);
    const db = this.db;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE employees SET password = ? WHERE id = ?',
        [hashedPassword, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get changes
            const changes = (this as any).changes;
            resolve(changes > 0);
          }
        }
      );
    });
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM employees WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get changes
            const changes = (this as any).changes;
            resolve(changes > 0);
          }
        }
      );
    });
  }

  // Customer CRUD operations
  async createCustomer(customer: Omit<Customer, 'id' | 'customerCode'>, createdBy?: number): Promise<Customer> {
    const customerCode = await this.generateUniqueCustomerCode();
    const db = this.db;
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO customers (customerCode, firstname, lastname, mobile, dateOfBirth, email, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [customerCode, customer.firstname, customer.lastname, customer.mobile, customer.dateOfBirth, customer.email, createdBy || null],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get lastID
            const lastID = (this as any).lastID;
            resolve({
              id: lastID,
              customerCode,
              firstname: customer.firstname,
              lastname: customer.lastname,
              mobile: customer.mobile,
              dateOfBirth: customer.dateOfBirth,
              email: customer.email,
              createdBy: createdBy || null
            });
          }
        }
      );
    });
  }

  async getCustomerByCode(customerCode: string): Promise<Customer | null> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM customers WHERE customerCode = ?',
        [customerCode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Customer || null);
          }
        }
      );
    });
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM customers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Customer || null);
          }
        }
      );
    });
  }

  async getAllCustomers(employeeId?: number): Promise<Customer[]> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM customers';
      let params: any[] = [];
      
      if (employeeId) {
        query += ' WHERE createdBy = ?';
        params.push(employeeId);
      }
      
      query += ' ORDER BY id DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Customer[]);
        }
      });
    });
  }

  async updateCustomer(id: number, updates: Partial<Omit<Customer, 'id' | 'customerCode'>>): Promise<Customer | null> {
    const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
    const values = fields.map(key => updates[key as keyof typeof updates]);
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const db = this.db;
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE customers SET ${setClause} WHERE id = ?`,
        [...values, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get changes
            const changes = (this as any).changes;
            if (changes > 0) {
              // Query again to get the updated record
              db.get('SELECT * FROM customers WHERE id = ?', [id], (err: any, row: any) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(row as Customer);
                }
              });
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM customers WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Use the function context to get changes
            const changes = (this as any).changes;
            resolve(changes > 0);
          }
        }
      );
    });
  }

  // Utility methods
  async generateUniqueEmployeeCode(): Promise<string> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM employees", (err, row) => {
        if (err) {
          reject(err);
        } else {
          const count = (row as any).count + 1;
          resolve(`EMP${count.toString().padStart(3, '0')}`);
        }
      });
    });
  }

  async generateUniqueCustomerCode(): Promise<string> {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
        if (err) {
          reject(err);
        } else {
          const count = (row as any).count + 1;
          resolve(`CUST${count.toString().padStart(3, '0')}`);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

export const database = new Database();
