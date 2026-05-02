import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// GET dashboard stats (admin)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [carCount] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM cars');
    const [typeCount] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM car_types');
    const [userCount] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [transactionCount] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM transactions');
    const [revenue] = await pool.query<RowDataPacket[]>("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'completed'");
    const [pendingCount] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'");
    const [recentTransactions] = await pool.query<RowDataPacket[]>(
      `SELECT t.*, u.name as user_name, c.name as car_name 
       FROM transactions t 
       JOIN users u ON t.user_id = u.id 
       JOIN cars c ON t.car_id = c.id 
       ORDER BY t.created_at DESC LIMIT 6`
    );
    const [carsByType] = await pool.query<RowDataPacket[]>(`
      SELECT COALESCE(ct.name, 'Unassigned') AS type_name, COUNT(c.id) AS total
      FROM cars c
      LEFT JOIN car_types ct ON ct.id = c.car_type_id
      GROUP BY COALESCE(ct.name, 'Unassigned')
      ORDER BY total DESC, type_name ASC
    `);
    const [lowStockCars] = await pool.query<RowDataPacket[]>(`
      SELECT c.id, c.name, c.brand, c.stock, c.status, COALESCE(ct.name, 'Unassigned') AS type_name
      FROM cars c
      LEFT JOIN car_types ct ON ct.id = c.car_type_id
      WHERE c.stock <= 2
      ORDER BY c.stock ASC, c.name ASC
      LIMIT 6
    `);

    return NextResponse.json({
      stats: {
        totalCars: carCount[0].count,
        totalTypes: typeCount[0].count,
        totalUsers: userCount[0].count,
        totalTransactions: transactionCount[0].count,
        totalRevenue: revenue[0].total,
        pendingTransactions: pendingCount[0].count,
      },
      recentTransactions,
      carsByType,
      lowStockCars,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
