import resend from "../config/mailer.js";
import { daysUntil } from "../utils/dateCalc.js";
import { format } from "date-fns";

/** Resend display name. Keeps an address that already includes a name. */
const formatFromAddress = (rawFrom) => {
  const address = rawFrom || "onboarding@resend.dev";
  return address.includes("<") ? address : `DocAlert <${address}>`;
};

/**
 * Dispatches an automated warranty/document expiration reminder email via Resend
 * @param {Object} item - Item document (productName, expiryDate, category, vendor, serialNumber)
 * @param {Object} user - User document (name, email)
 * @returns {Promise<Object>} Resend response containing email id
 */
export const sendReminderEmail = async (item, user) => {
  if (!user?.email) {
    throw new Error(
      `Failed to send reminder for item ${item?._id}: User has no email address`,
    );
  }

  const daysLeft = daysUntil(item.expiryDate);
  const expiryFormatted = item.expiryDate
    ? format(new Date(item.expiryDate), "MMMM d, yyyy")
    : "N/A";

  const subject =
    daysLeft > 0
      ? `⏳ DocAlert: ${item.productName} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
      : `⚠️ DocAlert: ${item.productName} has expired`;

  const urgencyPill =
    daysLeft > 0
      ? `<span style="display:inline-block; background:rgba(245,158,11,0.18); color:#f59e0b; font-weight:800; font-size:12px; padding:6px 14px; border-radius:20px; border:1px solid #f59e0b; letter-spacing:0.5px;">⏳ EXPIRES IN ${daysLeft} DAY${daysLeft === 1 ? "" : "S"}</span>`
      : `<span style="display:inline-block; background:rgba(239,68,68,0.18); color:#ef4444; font-weight:800; font-size:12px; padding:6px 14px; border-radius:20px; border:1px solid #ef4444; letter-spacing:0.5px;">⚠️ COVERAGE EXPIRED</span>`;

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const itemUrl = `${clientUrl}/items/${item._id || ""}`;
  const userName = user.name || user.email.split("@")[0] || "Valued Member";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0; padding:36px 12px; background-color:#0c0704; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
      <div style="max-width:560px; margin:0 auto; background:#180f08; border-radius:24px; border:1px solid rgba(245,158,11,0.28); overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.8);">
        
        <!-- Header Banner -->
        <div style="background:linear-gradient(135deg, #221309 0%, #381d09 100%); padding:34px 28px; text-align:center; border-bottom:1px solid rgba(245,158,11,0.2);">
          <div style="display:inline-block; background:rgba(245,158,11,0.14); border:1px solid #f59e0b; border-radius:12px; padding:6px 16px; color:#fbbf24; font-weight:800; font-size:12px; letter-spacing:1.5px; margin-bottom:12px; text-transform:uppercase;">
            🛡️ DocAlert
          </div>
          <h1 style="color:#ffffff; font-size:22px; margin:4px 0 0 0; font-weight:800; letter-spacing:-0.4px;">
            Warranty Expiration Notice
          </h1>
        </div>

        <!-- Content Area -->
        <div style="padding:32px 28px;">
          <div style="margin-bottom:20px;">
            ${urgencyPill}
          </div>

          <h2 style="color:#fef3c7; font-size:17px; margin:0 0 12px 0; font-weight:700;">
            Hello ${userName},
          </h2>
          
          <p style="color:#d6d3d1; font-size:14px; line-height:1.6; margin:0 0 24px 0;">
            This is an automated alert from DocAlert. Your protection coverage for <strong style="color:#ffffff;">${item.productName}</strong> is scheduled to conclude on <strong style="color:#fbbf24;">${expiryFormatted}</strong>.
          </p>

          <!-- Item Details Card -->
          <div style="background:#22140a; border-radius:16px; border:1px solid rgba(245,158,11,0.22); padding:20px 22px; margin-bottom:28px;">
            <div style="font-size:16px; font-weight:800; color:#ffffff; margin-bottom:12px; border-bottom:1px solid rgba(245,158,11,0.15); padding-bottom:10px;">
              ${item.productName}
            </div>
            
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <tr>
                <td style="padding:6px 0; color:#a8a29e; width:130px;">Category:</td>
                <td style="padding:6px 0; color:#f5f5f4; font-weight:600; text-transform:capitalize;">${item.category || "General"}</td>
              </tr>
              ${
                item.vendor
                  ? `
              <tr>
                <td style="padding:6px 0; color:#a8a29e;">Vendor / Retailer:</td>
                <td style="padding:6px 0; color:#f5f5f4; font-weight:600;">${item.vendor}</td>
              </tr>`
                  : ""
              }
              ${
                item.serialNumber
                  ? `
              <tr>
                <td style="padding:6px 0; color:#a8a29e;">Serial / Model No:</td>
                <td style="padding:6px 0; color:#fbbf24; font-family:monospace; font-weight:700;">${item.serialNumber}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:6px 0; color:#a8a29e;">Expiration Date:</td>
                <td style="padding:6px 0; color:#f59e0b; font-weight:700;">${expiryFormatted}</td>
              </tr>
            </table>
          </div>

          <p style="color:#a8a29e; font-size:13px; line-height:1.5; margin:0 0 26px 0;">
            We recommend reviewing your warranty documents, initiating any outstanding claims, or purchasing extended protection before expiration.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center; margin:30px 0 10px 0;">
            <a href="${itemUrl}" style="display:inline-block; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#160b03; font-weight:800; text-decoration:none; padding:14px 34px; border-radius:14px; font-size:14px; letter-spacing:0.3px; box-shadow:0 8px 24px rgba(245,158,11,0.35);">
              View Document in Vault →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#110a04; padding:20px 24px; text-align:center; font-size:11px; color:#78716c; border-top:1px solid rgba(245,158,11,0.15); line-height:1.6;">
          Sent by DocAlert • End-to-End Vault Security<br>
          Manage alert schedules anytime in your account settings.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const fromAddress = formatFromAddress(process.env.RESEND_FROM_EMAIL);
    const response = await resend.emails.send({
      from: fromAddress,
      to: "dellprabha71@gmail.com",
      subject,
      html,
    });

    if (response.error) {
      throw new Error(response.error.message || JSON.stringify(response.error));
    }

    return response.data || response;
  } catch (err) {
    throw new Error(
      `Failed to send reminder for item ${item?._id}: ${err.message}`,
    );
  }
};

/**
 * Dispatches a Welcome & Login Notification email via Resend
 * @param {Object} user - User document (name, email)
 * @returns {Promise<Object>} Resend response containing email id
 */
export const sendWelcomeEmail = async (user) => {
  if (!user?.email) {
    console.warn(
      "[NotificationService] Skipping welcome email: User has no email address",
    );
    return null;
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const userName = user.name || user.email.split("@")[0] || "Valued Member";
  const loginTimestamp = format(new Date(), "MMMM d, yyyy • h:mm a");

  const subject = `✨ Welcome to DocAlert, ${userName}! Your Vault is Active`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to DocAlert</title>
    </head>
    <body style="margin:0; padding:36px 12px; background-color:#0c0704; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
      <div style="max-width:560px; margin:0 auto; background:#180f08; border-radius:24px; border:1px solid rgba(245,158,11,0.28); overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.8);">
        
        <!-- Header Banner -->
        <div style="background:linear-gradient(135deg, #221309 0%, #381d09 100%); padding:36px 28px; text-align:center; border-bottom:1px solid rgba(245,158,11,0.2);">
          <div style="display:inline-block; background:rgba(245,158,11,0.14); border:1px solid #f59e0b; border-radius:12px; padding:6px 16px; color:#fbbf24; font-weight:800; font-size:12px; letter-spacing:1.5px; margin-bottom:12px; text-transform:uppercase;">
            🛡️ DOCALERT
          </div>
          <h1 style="color:#ffffff; font-size:24px; margin:4px 0 0 0; font-weight:800; letter-spacing:-0.5px;">
            Welcome to DocAlert
          </h1>
          <p style="color:#fbbf24; font-size:13px; margin:8px 0 0 0; font-weight:500;">
            Session Authenticated • ${loginTimestamp}
          </p>
        </div>

        <!-- Content Area -->
        <div style="padding:32px 28px;">
          <h2 style="color:#fef3c7; font-size:18px; margin:0 0 12px 0; font-weight:700;">
            Hello ${userName}, 👋
          </h2>
          
          <p style="color:#d6d3d1; font-size:14px; line-height:1.6; margin:0 0 26px 0;">
            Your DocAlert vault is now initialized and ready. We help you stay on top of appliance warranties, electronics receipts, vehicle insurances, and annual renewal deadlines with automated AI intelligence.
          </p>

          <!-- Feature Highlights Box -->
          <div style="background:#22140a; border-radius:18px; border:1px solid rgba(245,158,11,0.22); padding:22px; margin-bottom:28px;">
            <div style="font-weight:800; color:#fbbf24; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
              🚀 How DocAlert Protects You:
            </div>
            
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0; vertical-align:top; width:34px; font-size:18px;">📄</td>
                <td style="padding:10px 0; font-size:13px; color:#e7e5e4; line-height:1.5;">
                  <strong style="color:#ffffff;">AI Document Extraction:</strong> Drag and drop receipt images or PDFs. Gemini AI auto-detects purchase dates, vendors, and warranty terms.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0; vertical-align:top; width:34px; font-size:18px;">⏱️</td>
                <td style="padding:10px 0; font-size:13px; color:#e7e5e4; line-height:1.5;">
                  <strong style="color:#ffffff;">Live Warranty Timelines:</strong> Dynamic visual gauges compute elapsed months and days remaining in real time.
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0; vertical-align:top; width:34px; font-size:18px;">🔔</td>
                <td style="padding:10px 0; font-size:13px; color:#e7e5e4; line-height:1.5;">
                  <strong style="color:#ffffff;">Proactive Email Dispatches:</strong> Automated reminder alerts sent 30, 15, 7, and 1 days prior to expiration.
                </td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align:center; margin:32px 0 22px 0;">
            <a href="${clientUrl}" style="display:inline-block; background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color:#160b03; font-weight:800; text-decoration:none; padding:15px 36px; border-radius:14px; font-size:14px; letter-spacing:0.3px; box-shadow:0 8px 24px rgba(245,158,11,0.35);">
              Open Your Vault Dashboard →
            </a>
          </div>

          <!-- Security note -->
          <p style="color:#a8a29e; font-size:12px; line-height:1.5; margin:24px 0 0 0; text-align:center;">
            If you did not initiate this login session, please check your Google account security settings immediately.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#110a04; padding:20px 24px; text-align:center; font-size:11px; color:#78716c; border-top:1px solid rgba(245,158,11,0.15); line-height:1.6;">
          DocAlert • Encrypted document preservation platform.<br>
          Need assistance? Reply directly to this email or visit our Help Center.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const fromAddress = formatFromAddress(process.env.RESEND_FROM_EMAIL);
    const response = await resend.emails.send({
      from: fromAddress,
      to: user.email,
      subject,
      html,
    });

    if (response.error) {
      console.warn(
        `[NotificationService] Resend warning for welcome email to ${user.email}:`,
        response.error,
      );
      return { success: false, error: response.error };
    }

    console.log(
      `[NotificationService] Welcome email successfully dispatched to ${user.email} (ID: ${response.data?.id || "sent"})`,
    );
    return response.data || response;
  } catch (err) {
    console.warn(
      `[NotificationService] Failed to send welcome email to ${user.email}:`,
      err.message,
    );
    return { success: false, error: err.message };
  }
};

// Backward-compatible alias
export const sendExpiryReminderEmail = sendReminderEmail;

export default {
  sendReminderEmail,
  sendExpiryReminderEmail,
  sendWelcomeEmail,
};
