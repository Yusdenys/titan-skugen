import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Obtener una tijera por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await query(
      'SELECT * FROM scissors WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Scissor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching scissor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una tijera
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      sku,
      segment,
      edge,
      series,
      size,
      numberOfTeeth,
      color,
      colorName
    } = body;

    const updateQuery = `
      UPDATE scissors 
      SET 
        sku = $1,
        segment = $2,
        edge = $3,
        series = $4,
        size = $5,
        number_of_teeth = $6,
        color = $7,
        color_name = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      sku,
      segment,
      edge,
      series,
      size,
      numberOfTeeth || null,
      color,
      colorName || null,
      id
    ];

    const result = await query(updateQuery, values);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Scissor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scissor updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating scissor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una tijera
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await query(
      'DELETE FROM scissors WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Scissor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scissor deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting scissor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

