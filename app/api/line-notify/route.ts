import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'LINE Notify Token is required' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({ message }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to send notification' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('LINE Notify error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
