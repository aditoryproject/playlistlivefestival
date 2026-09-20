/**
 * Email Template & Generator for Playlist Live Festival
 * Clean White Edition matching the modern, premium aesthetic of the website.
 * Fully compatible with all email clients (Gmail, Apple Mail, Outlook).
 */

export const DEFAULT_EMAIL_SUBJECT = 'Siap buat balik lagi ke masa-masa paling seru? 📼✨';

export const DEFAULT_EMAIL_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playlist Live Festival</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 32px 12px;">
    <tr>
      <td align="center">
        
        <!-- MAIN WHITE CONTAINER -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- TOP SIGNATURE ACCENT BAR -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #DB5494 0%, #8B5CF6 50%, #3B82F6 100%);"></td>
          </tr>

          <!-- HEADER SECTION -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center;">
              
              <!-- Festival Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 6px 16px; border-radius: 9999px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #7e22ce;">
                      📼 NOSTALGIA REWIND FESTIVAL 🎧
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Logo Title - Clean Solid Colors (100% email client compatible) -->
              <h1 style="margin: 0; font-size: 34px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.15;">
                <span style="color: #DB5494;">PLAYLIST</span>
                <span style="color: #18181b;"> LIVE FESTIVAL</span>
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #71717a; font-weight: 500;">
                The Greatest 90s &amp; 2000s Sing-Along Experience
              </p>
            </td>
          </tr>

          <!-- HERO BANNER CARD (Light Gray Card) -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #9333ea; text-transform: uppercase; letter-spacing: 1px;">
                  Rewind The Golden Era ✨
                </p>
                <h2 style="margin: 0; font-size: 19px; font-weight: 800; color: #0f172a; line-height: 1.35;">
                  Siap buat balik lagi ke masa-masa paling seru?
                </h2>
              </div>
            </td>
          </tr>

          <!-- EMAIL BODY CONTENT -->
          <tr>
            <td style="padding: 28px 32px 10px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #18181b;">
                Halo Kak <strong style="color: #0f172a; background-color: #f1f5f9; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">{name}</strong>,
              </p>
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.7; color: #3f3f46;">
                Playlist nostalgia favorit kamu bakal kembali dinyanyikan langsung di panggung megah <strong>Playlist Live Festival</strong>! 🎧
              </p>
              
              <!-- Highlight Card Spotify vs Festival -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fdf2f8; border-left: 4px solid #DB5494; border-radius: 0 12px 12px 0; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #831843; font-style: italic; font-weight: 500;">
                      &ldquo;Daripada cuma dengerin di Spotify, mending kita teriak bareng, nostalgia bareng, dan bikin kenangan baru bareng musisi-musisi hits era 90-2000an! 🕺💃&rdquo;
                    </p>
                  </td>
                </tr>
              </table>

              <!-- LINEUP SHOWCASE SECTION -->
              <div style="margin: 26px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px 18px;">
                <p style="margin: 0 0 14px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                  🎸 Musisi Hits &amp; Bintang Tamu Yang Siap Mengguncang Panggung:
                </p>
                <div style="text-align: center; line-height: 2.2;">
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Peterpan</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Bernadya</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Charly Setia Band</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">GIGI</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">The Changcuters</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Raisa</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Kangen Band</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Andra and The Backbone</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Letto</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Armand Maulana</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Rony Parulian</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Idgitaf</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">T-Five</span>
                  <span style="display: inline-block; background-color: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; font-size: 13px; padding: 5px 14px; border-radius: 9999px; margin: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">Enau</span>
                </div>
                
                <!-- Instagram Teaser Box -->
                <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbd5e1; text-align: center;">
                  <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                    ✨ <em>Dan masih banyak lagi bintang tamu kejutan lainnya!</em><br>
                    <strong>More to come</strong>, pantengin terus update terbarunya di Instagram resmi kami:
                    <a href="https://www.instagram.com/playlistlivefestival" target="_blank" style="color: #DB5494; font-weight: 700; text-decoration: underline; display: inline-block; margin-top: 4px;">@playlistlivefestival</a> 📲
                  </p>
                </div>
              </div>

              <!-- CTA BUTTON SECTION -->
              <div style="text-align: center; margin: 32px 0 24px 0;">
                <a href="https://playlistlivefestival.letsplaymaker.com/" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #DB5494 0%, #8B5CF6 50%, #3B82F6 100%); color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 38px; border-radius: 9999px; box-shadow: 0 6px 20px rgba(219, 84, 148, 0.3); letter-spacing: 0.3px;">
                  🎟️ AMANKAN TIKET SEKARANG
                </a>
                <p style="margin: 12px 0 0 0; font-size: 13px; color: #71717a;">
                  👉 Kuota presale terbatas, jangan sampai kehabisan ya Kak!
                </p>
              </div>

              <!-- FRIEND FORWARD TIP BOX -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 14px; margin: 24px 0 16px 0;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <span style="font-size: 20px;">👯‍♀️</span>
                    <p style="margin: 6px 0 0 0; font-size: 13px; line-height: 1.5; color: #581c87;">
                      <strong>Tips Seru:</strong> Langsung forward email ini ke grup teman-teman konser kamu biar bisa seru-seruan bareng lagi tahun ini! 🔥
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER SECTION -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid #f4f4f5; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a;">
                Diselenggarakan oleh <strong>PLAYMAKER!</strong> Event Management
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #a1a1aa;">
                Website resmi: <a href="https://playlistlivefestival.letsplaymaker.com/" style="color: #71717a; text-decoration: underline;">playlistlivefestival.letsplaymaker.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
                Kamu menerima email ini karena terdaftar pada update Playlist Live Festival.<br>
                <a href="{{unsubscribe_url}}" style="color: #a1a1aa; text-decoration: underline;">Berhenti Berlangganan (Unsubscribe)</a>
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

Bintang Tamu Spektakuler:
- Peterpan
- Bernadya
- Charly Setia Band
- GIGI
- The Changcuters
- Raisa
- Kangen Band
- Andra and The Backbone
- Letto
- Armand Maulana
- Rony Parulian
- Idgitaf
- T-Five
- Enau

Dan masih banyak lagi bintang tamu lainnya!
More to come, pantengin terus update terbarunya di Instagram resmi kami:
👉 https://www.instagram.com/playlistlivefestival

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
