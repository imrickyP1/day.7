import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

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
    const { name, description } = await request.json();
    const normalizedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedName) {
      return NextResponse.json({ error: 'Type name is required' }, { status: 400 });
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM car_types WHERE LOWER(name) = LOWER(?) AND id <> ?',
      [normalizedName, id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Car type already exists' }, { status: 409 });
    }

    await pool.query<ResultSetHeader>(
      'UPDATE car_types SET name = ?, description = ? WHERE id = ?',
      [normalizedName, description?.trim() || null, id]
    );

    return NextResponse.json({ message: 'Car type updated' });
  } catch (error) {
    console.error('Error updating car type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    await pool.query<ResultSetHeader>('DELETE FROM car_types WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Car type deleted' });
  } catch (error) {
    console.error('Error deleting car type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
