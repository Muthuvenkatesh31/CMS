import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';

// GET - Get all customers (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = authResult;
    
    // If user is admin, show all customers. If user is not admin, show only their customers
    const customers = await database.getAllCustomers(user.role === 'admin' ? undefined : user.id);
    
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstname, lastname, mobile, dateOfBirth, email } = body;

    // Validation
    if (!firstname || !lastname || !mobile || !dateOfBirth || !email) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const customer = await database.createCustomer({
      firstname,
      lastname,
      mobile,
      dateOfBirth,
      email
    }, authResult.user.id);

    return NextResponse.json({ 
      message: 'Customer created successfully',
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        firstname: customer.firstname,
        lastname: customer.lastname,
        mobile: customer.mobile,
        dateOfBirth: customer.dateOfBirth,
        email: customer.email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, firstname, lastname, mobile, dateOfBirth, email } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Check if user can update this customer
    if (authResult.user.role !== 'admin') {
      const customer = await database.getCustomerById(parseInt(id));
      if (!customer || customer.createdBy !== authResult.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const updates: any = {};
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname !== undefined) updates.lastname = lastname;
    if (mobile !== undefined) updates.mobile = mobile;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (email !== undefined) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updatedCustomer = await database.updateCustomer(parseInt(id), updates);

    if (!updatedCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Customer updated successfully',
      customer: {
        id: updatedCustomer.id,
        customerCode: updatedCustomer.customerCode,
        firstname: updatedCustomer.firstname,
        lastname: updatedCustomer.lastname,
        mobile: updatedCustomer.mobile,
        dateOfBirth: updatedCustomer.dateOfBirth,
        email: updatedCustomer.email
      }
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Check if user can delete this customer
    if (authResult.user.role !== 'admin') {
      const customer = await database.getCustomerById(parseInt(id));
      if (!customer || customer.createdBy !== authResult.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const success = await database.deleteCustomer(parseInt(id));

    if (!success) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
