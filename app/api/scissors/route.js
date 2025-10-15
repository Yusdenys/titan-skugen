import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Obtener todas las tijeras
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const offset = searchParams.get('offset') || 0;
    const segment = searchParams.get('segment');

    let queryText = 'SELECT * FROM scissors';
    const params = [];

    if (segment) {
      queryText += ' WHERE segment = $1';
      params.push(segment);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching scissors:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva tijera
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sku,
      serialNumber,
      typeOfShears,
      segment,
      size,
      numberOfTeeth,
      color,
      colorName
    } = body;

    // Validar campos requeridos
    if (!sku || !serialNumber || !typeOfShears || !segment || !size || !color) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validar numberOfTeeth para Thinning y Blending
    if ((segment === 'thinning' || segment === 'blending') && !numberOfTeeth) {
      return NextResponse.json(
        { success: false, error: 'Number of teeth is required for Thinning and Blending' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO scissors (
        sku, serial_number, type_of_shears, segment, size, number_of_teeth, color, color_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      sku,
      serialNumber,
      typeOfShears,
      segment,
      size,
      numberOfTeeth || null,
      color,
      colorName || null
    ];

    const result = await query(insertQuery, values);

    return NextResponse.json({
      success: true,
      message: 'Scissor created successfully',
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating scissor:', error);
    
    // Manejar errores de duplicado (SKU único)
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'SKU already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

