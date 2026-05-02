import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [types] = await pool.query<RowDataPacket[]>(`
      SELECT ct.*, COUNT(c.id) AS car_count
      FROM car_types ct
      LEFT JOIN cars c ON c.car_type_id = ct.id
      GROUP BY ct.id
      ORDER BY ct.name
    `);
    return NextResponse.json({ types });
  } catch (error) {
    console.error('Error fetching car types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, description } = await request.json();
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedName) {
      return NextResponse.json({ error: 'Type name is required' }, { status: 400 });
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM car_types WHERE LOWER(name) = LOWER(?)',
      [normalizedName]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Car type already exists' }, { status: 409 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO car_types (name, description) VALUES (?, ?)',
      [normalizedName, description?.trim() || null]
    );

    return NextResponse.json({ message: 'Car type created', id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating car type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
