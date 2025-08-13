import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';

// GET - Get all employees (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin users can view employees
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const employees = await database.getAllEmployees();
    
    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new employee (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin users can create employees
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const { firstname, lastname, mobile, dateOfBirth, email, password, role } = body;

    // Validation
    if (!firstname || !lastname || !mobile || !dateOfBirth || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const employee = await database.createEmployee({
      firstname,
      lastname,
      mobile,
      dateOfBirth,
      email,
      password,
      role: role || 'user'
    });

    return NextResponse.json({ 
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        firstname: employee.firstname,
        lastname: employee.lastname,
        mobile: employee.mobile,
        dateOfBirth: employee.dateOfBirth,
        email: employee.email,
        role: employee.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update employee (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin users can update employees
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, firstname, lastname, mobile, dateOfBirth, email, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname !== undefined) updates.lastname = lastname;
    if (mobile !== undefined) updates.mobile = mobile;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedEmployee = await database.updateEmployee(parseInt(id), updates);

    if (!updatedEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Employee updated successfully',
      employee: {
        id: updatedEmployee.id,
        employeeCode: updatedEmployee.employeeCode,
        firstname: updatedEmployee.firstname,
        lastname: updatedEmployee.lastname,
        mobile: updatedEmployee.mobile,
        dateOfBirth: updatedEmployee.dateOfBirth,
        email: updatedEmployee.email,
        role: updatedEmployee.role
      }
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete employee (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin users can delete employees
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const success = await database.deleteEmployee(parseInt(id));

    if (!success) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
