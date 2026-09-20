import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSettings, updateSettings, getAdminUser, updateAdminPassword } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { settingsUpdates, passwordChange } = body;

    // Handle password change if requested
    if (passwordChange) {
      const { currentPassword, newPassword } = passwordChange;
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Both current password and new password are required' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters' },
          { status: 400 }
        );
      }

      const admin = getAdminUser();
      const matches = bcrypt.compareSync(currentPassword, admin.passwordHash);
      if (!matches) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      updateAdminPassword(newHash);
    }

    // Handle settings updates if provided
    let updatedSettings = getSettings();
    if (settingsUpdates) {
      updatedSettings = updateSettings(settingsUpdates);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
