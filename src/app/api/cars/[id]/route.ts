import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET single car
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, ct.name as type_name 
       FROM cars c 
       LEFT JOIN car_types ct ON c.car_type_id = ct.id 
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ car: rows[0] });
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update car (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, brand, model, year, price, description, car_type_id, is_sports_car, image_url, stock, status } = body;

    await pool.query<ResultSetHeader>(
      `UPDATE cars SET name=?, brand=?, model=?, year=?, price=?, description=?, car_type_id=?, is_sports_car=?, image_url=?, stock=?, status=? WHERE id=?`,
      [name, brand, model, year, price, description, car_type_id || null, is_sports_car ? 1 : 0, image_url, stock, status || 'available', id]
    );

    return NextResponse.json({ message: 'Car updated' });
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete car (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await pool.query<ResultSetHeader>('DELETE FROM cars WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Car deleted' });
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
