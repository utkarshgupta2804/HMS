import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendAppointmentEmail = async (appointment) => {
  const { patientId, doctorId, timeSlot, type } = appointment;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientId.email,
    subject: 'Your Appointment has been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Dear ${patientId.fullName},</p>
        <p>Your appointment has been approved. Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Doctor:</strong> ${doctorId.name}</p>
          <p><strong>Specialization:</strong> ${doctorId.specialization}</p>
          <p><strong>Date:</strong> ${new Date(timeSlot).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(timeSlot).toLocaleTimeString()}</p>
          <p><strong>Type:</strong> ${type}</p>
        </div>
        
        <p>If you need to reschedule or cancel your appointment, please contact us.</p>
        <p>Best regards,<br>Hospital Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};

export const sendCancellationEmail = async (appointment) => {
  const { patientId, doctorId, timeSlot, type } = appointment;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientId.email,
    subject: 'Your Appointment has been Cancelled',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Cancellation Notice</h2>
        <p>Dear ${patientId.fullName},</p>
        <p>Your appointment has been cancelled. Here are the details of the cancelled appointment:</p>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Doctor:</strong> ${doctorId?.name || 'Not assigned'}</p>
          <p><strong>Specialization:</strong> ${doctorId?.specialization || 'Not specified'}</p>
          <p><strong>Date:</strong> ${new Date(timeSlot).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(timeSlot).toLocaleTimeString()}</p>
          <p><strong>Type:</strong> ${type}</p>
        </div>
        
        <p>If you would like to reschedule, please book a new appointment through our system.</p>
        <p>We apologize for any inconvenience caused.</p>
        <p>Best regards,<br>Hospital Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Appointment cancellation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment cancellation email:', error);
    throw error;
  }
};

export const sendContactEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
    subject: `New Contact Form Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Message</h2>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact form email sent successfully');
  } catch (error) {
    console.error('Error sending contact form email:', error);
    throw error;
  }
};
