import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, botToken, chatId } = body

    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Bot Token is required' },
        { status: 400 }
      )
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json(
        { success: false, error: data.description || 'Failed to send message' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Telegram error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
