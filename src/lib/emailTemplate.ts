/**
 * Email Template & Generator for Playlist Live Festival
 * Optimized with retro 90s/2000s festival branding, responsive inline CSS,
 * and anti-spam deliverability standards (RFC compliant).
 */

export const DEFAULT_EMAIL_SUBJECT = 'Siap buat balik lagi ke masa-masa paling seru? 📼✨';

export const DEFAULT_EMAIL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playlist Live Festival</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f1117; padding: 30px 10px;">
    <tr>
      <td align="center">
        
        <!-- MAIN CONTAINER -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <!-- TOP ACCENT BAR (SIGNATURE GRADIENT) -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #DB5494 0%, #8B5CF6 50%, #3B82F6 100%);"></td>
          </tr>

          <!-- HEADER SECTION -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center;">
              
              <!-- Festival Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #27272a; border: 1px solid #3f3f46; padding: 6px 16px; border-radius: 9999px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #e4e4e7;">
                      📼 NOSTALGIA REWIND FESTIVAL 🎧
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Logo Title -->
              <h1 style="margin: 0; font-size: 38px; font-weight: 800; letter-spacing: -1px; line-height: 1.1;">
                <span style="background: linear-gradient(135deg, #DB5494, #8B5CF6, #3B82F6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #DB5494;">PLAYLIST</span>
                <span style="color: #ffffff;"> LIVE FESTIVAL</span>
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #a1a1aa; font-weight: 500;">
                The Greatest 90s &amp; 2000s Sing-Along Experience
              </p>
            </td>
          </tr>

          <!-- HERO BANNER TAPE CARD -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="background: linear-gradient(180deg, #27272a 0%, #202023 100%); border: 1px solid #3f3f46; border-radius: 16px; padding: 24px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #c084fc; text-transform: uppercase; letter-spacing: 1px;">
                  Rewind The Golden Era ✨
                </p>
                <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                  Siap buat balik lagi ke masa-masa paling seru?
                </h2>
              </div>
            </td>
          </tr>

          <!-- EMAIL BODY CONTENT -->
          <tr>
            <td style="padding: 28px 32px 10px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #f4f4f5;">
                Halo Kak <strong style="color: #ffffff; background: #27272a; padding: 2px 8px; border-radius: 6px;">{name}</strong>,
              </p>
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.7; color: #d4d4d8;">
                Playlist nostalgia favorit kamu bakal kembali dinyanyikan langsung di panggung megah <strong>Playlist Live Festival</strong>! 🎧
              </p>
              
              <!-- Highlight Card Spotify vs Festival -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121214; border-left: 4px solid #DB5494; border-radius: 0 12px 12px 0; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #f4f4f5; font-style: italic;">
                      &ldquo;Daripada cuma dengerin di Spotify, mending kita teriak bareng, nostalgia bareng, dan bikin kenangan baru bareng musisi-musisi hits era 90-2000an! 🕺💃&rdquo;
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON SECTION -->
              <div style="text-align: center; margin: 32px 0 24px 0;">
                <a href="https://playlistlivefestival.letsplaymaker.com/" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #DB5494 0%, #8B5CF6 50%, #3B82F6 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 36px; border-radius: 9999px; box-shadow: 0 10px 25px rgba(219, 84, 148, 0.4); letter-spacing: 0.5px;">
                  🎟️ AMANKAN TIKET SEKARANG
                </a>
                <p style="margin: 12px 0 0 0; font-size: 13px; color: #a1a1aa;">
                  👉 Kuota presale terbatas, jangan sampai kehabisan ya Kak!
                </p>
              </div>

              <!-- FRIEND FORWARD TIP BOX -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(139, 92, 246, 0.08); border: 1px dashed #8b5cf6; border-radius: 12px; margin: 24px 0 16px 0;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <span style="font-size: 18px;">👯‍♀️</span>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.5; color: #e4e4e7;">
                      <strong>Tips Seru:</strong> Langsung forward email ini ke grup tongkrongan &amp; teman konser kamu biar bisa heboh dan seru-seruan bareng lagi tahun ini! 🔥
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER SECTION -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #71717a;">
                Diselenggarakan oleh <strong>PLAYMAKER!</strong> Event Management
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #52525b;">
                Website resmi: <a href="https://playlistlivefestival.letsplaymaker.com/" style="color: #a1a1aa; text-decoration: underline;">playlistlivefestival.letsplaymaker.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5;">
                Kamu menerima email ini karena terdaftar pada update Playlist Live Festival.<br>
                <a href="{{unsubscribe_url}}" style="color: #71717a; text-decoration: underline;">Berhenti Berlangganan (Unsubscribe)</a>
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;

export function renderEmailHtml(templateHtml: string, name: string, unsubscribeUrl: string): string {
  const safeName = name && name.trim() ? name.trim() : 'Sobat Playlist';
  return templateHtml
    .replace(/{name}/g, safeName)
    .replace(/{{name}}/g, safeName)
    .replace(/{{unsubscribe_url}}/g, unsubscribeUrl);
}

export function renderEmailPlainText(name: string, unsubscribeUrl: string): string {
  const safeName = name && name.trim() ? name.trim() : 'Sobat Playlist';
  return `Siap buat balik lagi ke masa-masa paling seru? 📼✨

Halo Kak ${safeName},

Playlist nostalgia favorit kamu bakal kembali dinyanyikan langsung di panggung megah Playlist Live Festival! 🎧

Daripada cuma dengerin di Spotify, mending kita teriak bareng, nostalgia bareng, dan bikin kenangan baru bareng musisi-musisi hits era 90-2000an! 🕺💃

🎟️ Tiket udah bisa di-checkout sekarang:
👉 https://playlistlivefestival.letsplaymaker.com/

Tips: Langsung forward pesan ini ke grup teman-teman konser kamu biar bisa seru-seruan bareng lagi tahun ini! 👯‍♀️

Gas amankan tiketnya sekarang ya Kak! 🔥

--
Diselenggarakan oleh PLAYMAKER! Event Management
Website resmi: https://playlistlivefestival.letsplaymaker.com/
Berhenti Berlangganan: ${unsubscribeUrl}
`;
}
