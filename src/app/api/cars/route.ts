import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET all cars (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const type = searchParams.get('type');
    const sports = searchParams.get('sports');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    let query = `
      SELECT c.*, ct.name as type_name 
      FROM cars c 
      LEFT JOIN car_types ct ON c.car_type_id = ct.id 
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (type) {
      query += ' AND c.car_type_id = ?';
      params.push(Number(type));
    }
    if (sports === '1') {
      query += ' AND c.is_sports_car = 1';
    }
    if (brand) {
      query += ' AND c.brand = ?';
      params.push(brand);
    }
    if (search) {
      query += ' AND (c.name LIKE ? OR c.brand LIKE ? OR c.model LIKE ? OR c.description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ?';
    params.push(Number(limit));

    const [cars] = await pool.query<RowDataPacket[]>(query, params);

    // Get car types for filters
    const [types] = await pool.query<RowDataPacket[]>('SELECT * FROM car_types ORDER BY name');

    // Get unique brands
    const [brands] = await pool.query<RowDataPacket[]>('SELECT DISTINCT brand FROM cars ORDER BY brand');

    return NextResponse.json({
      cars,
      types,
      brands: brands.map((b: RowDataPacket) => b.brand),
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new car (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, brand, model, year, price, description, car_type_id, is_sports_car, image_url, stock } = body;

    if (!name || !brand || !model || !price) {
      return NextResponse.json({ error: 'Name, brand, model, and price are required' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO cars (name, brand, model, year, price, description, car_type_id, is_sports_car, image_url, stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, model, year || null, price, description || null, car_type_id || null, is_sports_car ? 1 : 0, image_url || null, stock || 1]
    );

    return NextResponse.json({ message: 'Car created', id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
