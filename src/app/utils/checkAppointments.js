export async function checkAndUpdatePastAppointments() {
  try {
    const response = await fetch('/api/cron/check-appointments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check appointments');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking appointments:', error);
    throw error;
  }
}
