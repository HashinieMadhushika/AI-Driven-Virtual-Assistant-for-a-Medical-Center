import sendEmail from "../utils/sendEmail.js";

// Handle contact form submission
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Prepare email content
    const subject = `Contact Form Submission from ${name}`;
    const emailContent = `
You have received a new message from the MediCare AI contact form:

Name: ${name}
Email: ${email}

Message:
${message}

---
This message was sent from the MediCare AI Contact Form
Reply directly to this email to respond to ${name} at ${email}
    `.trim();

    // Send email to medical center
    await sendEmail(
      process.env.EMAIL_USER, // Send to medical center email
      subject,
      emailContent
    );

    // Send confirmation email to user
    const confirmationSubject = 'Thank you for contacting MediCare AI';
    const confirmationContent = `
Dear ${name},

Thank you for reaching out to MediCare AI. We have received your message and will respond within one business day.

Your message:
${message}

Best regards,
MediCare AI Team
    `.trim();

    await sendEmail(
      email, // Send confirmation to user
      confirmationSubject,
      confirmationContent
    );

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you within one business day.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later.'
    });
  }
};
