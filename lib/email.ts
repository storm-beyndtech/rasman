import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
	secure: true, // Use SSL
	connectionTimeout: 30000, // 30 seconds
	socketTimeout: 30000, // 30 seconds
});

export class EmailService {
  // Send purchase confirmation email with download links
  static async sendPurchaseConfirmation(
    userEmail: string,
    userName: string,
    purchaseDetails: {
      itemType: 'song' | 'album';
      itemTitle: string;
      artist: string;
      amount: number;
      currency: string;
      paymentReference: string;
      downloadLinks: Array<{
        title: string;
        downloadUrl: string;
        streamUrl: string;
      }>;
    }
  ): Promise<boolean> {
    try {
      const { itemType, itemTitle, artist, amount, currency, paymentReference, downloadLinks } = purchaseDetails;
      
      // Generate HTML email content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Confirmation - Rasman Music</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #228B22 0%, #FFD700 50%, #DC143C 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .purchase-details { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .download-section { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .download-link { display: inline-block; padding: 10px 20px; background: #228B22; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
            .stream-link { display: inline-block; padding: 10px 20px; background: #FFD700; color: #333; text-decoration: none; border-radius: 5px; margin: 5px; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
            .artist-name { font-weight: bold; color: #228B22; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎵 Rasman Music</h1>
            <h2>Purchase Confirmation</h2>
          </div>
          
          <div class="content">
            <h3>Hi ${userName}!</h3>
            <p>Thank you for your purchase! Your payment has been confirmed and your music is ready for download and streaming.</p>
            
            <div class="purchase-details">
              <h4>Purchase Details:</h4>
              <p><strong>Item:</strong> ${itemTitle}</p>
              <p><strong>Artist:</strong> <span class="artist-name">${artist}</span></p>
              <p><strong>Type:</strong> ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}</p>
              <p><strong>Amount:</strong> ${currency} ${(amount / 100).toLocaleString()}</p>
              <p><strong>Reference:</strong> ${paymentReference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="download-section">
              <h4>Your Music:</h4>
              <p>Click the links below to stream or download your music. These links are valid for 24 hours.</p>
              
              ${downloadLinks.map(link => `
                <div style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                  <h5>${link.title}</h5>
                  <a href="${link.streamUrl}" class="stream-link">🎵 Stream Now</a>
                  <a href="${link.downloadUrl}" class="download-link">⬇️ Download</a>
                </div>
              `).join('')}
            </div>

            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Download links expire in 24 hours for security</li>
              <li>You can access your music anytime from your account dashboard</li>
              <li>Files are in high-quality format</li>
              <li>Keep this email for your records</li>
            </ul>

            <p>Enjoy your music and big up yourself! 🇯🇲</p>
            <p>One Love,<br>The Rasman Music Team</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 Rasman Music. All rights reserved.</p>
            <p>For support, reply to this email or visit our website.</p>
          </div>
        </body>
        </html>
      `;

      // Plain text version
      const textContent = `
Purchase Confirmation - Rasman Music

Hi ${userName}!

Thank you for your purchase! Your payment has been confirmed.

Purchase Details:
- Item: ${itemTitle}
- Artist: ${artist}
- Type: ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}
- Amount: ${currency} ${(amount / 100).toLocaleString()}
- Reference: ${paymentReference}
- Date: ${new Date().toLocaleDateString()}

Your Music Links:
${downloadLinks.map(link => `
${link.title}
Stream: ${link.streamUrl}
Download: ${link.downloadUrl}
`).join('\n')}

Important: Download links expire in 24 hours. You can access your music anytime from your account dashboard.

Enjoy your music!
One Love,
The Rasman Music Team
      `;

      // Send email
      const info = await transporter.sendMail({
        from: `"Rasman Music" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `🎵 Your ${itemType} "${itemTitle}" is ready! - Rasman Music`,
        text: textContent,
        html: htmlContent,
      });

      console.log('Purchase confirmation email sent:', info.messageId);
      return true;

    } catch (error) {
      console.error('Error sending purchase confirmation email:', error);
      return false;
    }
  }

  // Send welcome email to new users
  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Rasman Music</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #228B22 0%, #FFD700 50%, #DC143C 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .cta-button { display: inline-block; padding: 15px 30px; background: #228B22; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎵 Welcome to Rasman Music!</h1>
          </div>
          
          <div class="content">
            <h3>Hello ${userName}!</h3>
            <p>Welcome to the official music platform of <strong>Rasman Peter Dudu</strong>! We're excited to have you join our reggae family.</p>
            
            <p>Here's what you can do:</p>
            <ul>
              <li>🎵 Browse and preview our latest songs and albums</li>
              <li>💰 Purchase and download high-quality music</li>
              <li>📱 Stream your purchased music anytime</li>
              <li>📚 Read about Rasman's musical journey</li>
            </ul>

            <p>Ready to explore some conscious reggae music?</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/songs" class="cta-button">Browse Music</a>

            <p>Stay tuned for new releases and exclusive content!</p>
            <p>One Love,<br>The Rasman Music Team</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 Rasman Music. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Rasman Music" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: '🎵 Welcome to Rasman Music - Let the music play!',
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Send admin notification for new purchases
  static async sendAdminPurchaseNotification(
    purchaseDetails: {
      userEmail: string;
      userName: string;
      itemTitle: string;
      itemType: 'song' | 'album';
      amount: number;
      currency: string;
      paymentReference: string;
    }
  ): Promise<boolean> {
    try {
      const { userEmail, userName, itemTitle, itemType, amount, currency, paymentReference } = purchaseDetails;
      
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      
      const htmlContent = `
        <h2>New Purchase Notification</h2>
        <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
        <p><strong>Item:</strong> ${itemTitle}</p>
        <p><strong>Type:</strong> ${itemType}</p>
        <p><strong>Amount:</strong> ${currency} ${(amount / 100).toLocaleString()}</p>
        <p><strong>Reference:</strong> ${paymentReference}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `;

      await transporter.sendMail({
        from: `"Rasman Music System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `💰 New Purchase: ${itemTitle} by ${userName}`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }
  }

  // Test email configuration
  static async testEmailConfig(): Promise<boolean> {
    try {
      await transporter.verify();
      console.log('✅ Email server is ready');
      return true;
    } catch (error) {
      console.error('❌ Email server configuration error:', error);
      return false;
    }
  }
}