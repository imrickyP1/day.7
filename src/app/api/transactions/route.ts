import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email, 
             c.name as car_name, c.brand as car_brand, c.model as car_model, c.image_url as car_image
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      JOIN cars c ON t.car_id = c.id
    `;
    const params: (string | number)[] = [];

    // If user, only show their transactions
    if (session.role === 'user') {
      query += ' WHERE t.user_id = ?';
      params.push(session.id);
      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }
    } else if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC';

    const [transactions] = await pool.query<RowDataPacket[]>(query, params);

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new transaction (purchase/reserve)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { car_id, payment_method, notes } = await request.json();

    if (!car_id) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    // Check car availability
    const [cars] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM cars WHERE id = ? AND status = "available" AND stock > 0',
      [car_id]
    );

    if (cars.length === 0) {
      return NextResponse.json({ error: 'Car is not available' }, { status: 400 });
    }

    const car = cars[0];

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO transactions (user_id, car_id, amount, status, payment_method, notes) VALUES (?, ?, ?, 'pending', ?, ?)`,
      [session.id, car_id, car.price, payment_method || 'cash', notes || null]
    );

    return NextResponse.json({ message: 'Transaction created', id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
