import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// PUT - Update transaction status (admin only)
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
    const { status } = await request.json();

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const [transactions] = await pool.query<RowDataPacket[]>(
      'SELECT status FROM transactions WHERE id = ?',
      [id]
    );

    if (transactions.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const previousStatus = transactions[0].status as string;

    await pool.query<ResultSetHeader>(
      'UPDATE transactions SET status = ? WHERE id = ?',
      [status, id]
    );

    if (status === 'completed' && previousStatus !== 'completed') {
      await pool.query(
        `UPDATE cars c 
         JOIN transactions t ON t.car_id = c.id 
         SET c.stock = GREATEST(c.stock - 1, 0)
         WHERE t.id = ? AND c.stock > 0`,
        [id]
      );
      await pool.query(
        `UPDATE cars SET status = 'sold' WHERE stock <= 0 AND id IN (SELECT car_id FROM transactions WHERE id = ?)`,
        [id]
      );
    }

    return NextResponse.json({ message: 'Transaction updated' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
