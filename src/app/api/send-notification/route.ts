import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, link, targetMajlis, docId } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Send FCM Push Notification via Firebase Admin SDK
    const message = {
      topic: 'all_users',
      notification: {
        title: title,
        body: description,
      },
      data: {
        title: String(title),
        description: String(description),
        link: String(link || ''),
        docId: String(docId || ''),
        targetMajlis: String(targetMajlis || 'সকল'),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await adminMessaging.send(message);
    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('FCM Send Notification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send FCM push notification' },
      { status: 500 }
    );
  }
}
