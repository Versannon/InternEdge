import { NextResponse } from 'next/server';
import { query, getMockDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('sender_id');
    const senderRole = searchParams.get('sender_role');
    const receiverId = searchParams.get('receiver_id');
    const receiverRole = searchParams.get('receiver_role');

    if (!senderId || !senderRole || !receiverId || !receiverRole) {
      return NextResponse.json({ success: false, message: 'Missing chat partner details' }, { status: 400 });
    }

    const mockDb = getMockDb();

    // 1. Try MySQL Query
    const sql = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND sender_role = ? AND receiver_id = ? AND receiver_role = ?)
         OR (sender_id = ? AND sender_role = ? AND receiver_id = ? AND receiver_role = ?)
      ORDER BY id ASC
    `;
    const params = [
      Number(senderId), senderRole, Number(receiverId), receiverRole,
      Number(receiverId), receiverRole, Number(senderId), senderRole
    ];

    const dbRes = await query(sql, params);
    let messages = [];

    if (!dbRes.isMock && dbRes.rows) {
      messages = dbRes.rows;
    } else {
      // Mock Fallback filtering
      messages = mockDb.messages.filter(m => 
        (m.sender_id === Number(senderId) && m.sender_role === senderRole && m.receiver_id === Number(receiverId) && m.receiver_role === receiverRole) ||
        (m.sender_id === Number(receiverId) && m.sender_role === receiverRole && m.receiver_id === Number(senderId) && m.receiver_role === senderRole)
      ).sort((a, b) => a.id - b.id);
    }

    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { sender_id, sender_role, receiver_id, receiver_role, message_text } = body;

    if (!sender_id || !sender_role || !receiver_id || !receiver_role || !message_text) {
      return NextResponse.json({ success: false, message: 'Message details are incomplete' }, { status: 400 });
    }

    const mockDb = getMockDb();

    // 1. Insert in MySQL
    try {
      const sql = `
        INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, message_text)
        VALUES (?, ?, ?, ?, ?)
      `;
      const params = [Number(sender_id), sender_role, Number(receiver_id), receiver_role, message_text];
      await query(sql, params);
    } catch (dbErr) {
      console.error("MySQL message insert error:", dbErr.message);
    }

    // 2. Insert in Mock fallback store
    const newMessage = {
      id: mockDb.messages.length + 1,
      sender_id: Number(sender_id),
      sender_role,
      receiver_id: Number(receiver_id),
      receiver_role,
      message_text,
      created_at: new Date().toISOString()
    };
    mockDb.messages.push(newMessage);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
      chatMessage: newMessage
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
