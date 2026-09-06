/**
 * GOOGLE APPS SCRIPT WEBHOOK - TENANT F&B PLAYLIST REWIND 2026
 * 
 * Panduan Pemasangan:
 * 1. Buat Google Spreadsheet baru di Google Drive Anda (Contoh: "Data Pendaftar Tenant Playlist Rewind 2026").
 * 2. Di menu atas, klik Extensions (Ekstensi) -> Apps Script.
 * 3. Hapus semua kode default di Apps Script, lalu paste SELURUH kode di bawah ini.
 * 4. Klik tombol Save (ikon Disket) atau Ctrl+S / Cmd+S.
 * 5. Klik tombol biru "Deploy" (Terapkan) di pojok kanan atas -> Pilih "New deployment" (Penerapan baru).
 * 6. Klik ikon Gear (Gerigi) di samping "Select type" -> Pilih "Web app" (Aplikasi Web).
 * 7. Atur pengaturannya:
 *    - Description: Webhook Tenant Playlist
 *    - Execute as: Me (email google Anda)
 *    - Who has access: Anyone (Siapa saja)  <-- SANGAT PENTING agar web Next.js bisa kirim data!
 * 8. Klik tombol "Deploy".
 * 9. Berikan izin akses Google (Authorize access -> Pilih Akun -> Advanced -> Go to ... (unsafe) -> Allow).
 * 10. Salin "Web App URL" (berakhiran /exec) dan paste ke input CMS:
 *     Dashboard Admin -> Tenant F&B -> Tab Pengaturan & Deadline -> "Webhook Google Sheets (Auto-Sync Data)".
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Kunci selama 10 detik untuk cegah tabrakan data ganda

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No POST body received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(rawData);

    // 1. Kolom Header Standar
    var standardHeaders = [
      "Waktu Daftar",
      "Nama Brand / Usaha",
      "Kategori Menu",
      "Nama PIC / Owner",
      "Nomor WhatsApp",
      "Email",
      "Kota Domisili",
      "Deskripsi Menu",
      "Rentang Harga",
      "Instagram / Portofolio",
      "Kebutuhan Daya Listrik",
      "Daftar Peralatan",
      "Pengalaman Event"
    ];

    // Cek apakah sheet masih kosong (baris 1 belum ada header)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(standardHeaders);
      
      // Styling Header (Warna Amber / Oranye Playlist yang Elegan)
      var headerRange = sheet.getRange(1, 1, 1, standardHeaders.length);
      headerRange.setBackground("#F59E0B"); // Amber 500
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Ambil daftar header yang ada di baris 1 saat ini
    var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];

    // 2. Petakan Jawaban Dinamis dari responses
    var responsesMap = {};
    if (data.responses && Array.isArray(data.responses)) {
      data.responses.forEach(function(item) {
        if (item.label) {
          responsesMap[item.label.trim()] = item.value;
        }
      });
    }

    // Nilai data standar
    var valuesMap = {
      "Waktu Daftar": data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      "Nama Brand / Usaha": data.brandName || "",
      "Kategori Menu": data.category || "",
      "Nama PIC / Owner": data.picName || "",
      "Nomor WhatsApp": data.whatsapp ? "'" + data.whatsapp : "", // Tanda petik agar angka 0 di depan nomor WA tidak hilang di Excel/Sheets
      "Email": data.email || "",
      "Kota Domisili": data.city || "",
      "Deskripsi Menu": data.menuDescription || "",
      "Rentang Harga": data.priceRange || "",
      "Instagram / Portofolio": data.instagramCatalog || "",
      "Kebutuhan Daya Listrik": data.powerRequirement || "",
      "Daftar Peralatan": data.equipmentList || "",
      "Pengalaman Event": data.eventExperience || ""
    };

    // Gabungkan pertanyaan dinamis Google Form style
    for (var key in responsesMap) {
      if (responsesMap.hasOwnProperty(key)) {
        valuesMap[key] = responsesMap[key];
        
        // Jika ada pertanyaan baru yang belum ada di header baris 1, tambahkan otomatis kolomnya ke kanan
        if (currentHeaders.indexOf(key) === -1) {
          var newColIdx = currentHeaders.length + 1;
          var newHeaderCell = sheet.getRange(1, newColIdx);
          newHeaderCell.setValue(key);
          newHeaderCell.setBackground("#F59E0B");
          newHeaderCell.setFontColor("#FFFFFF");
          newHeaderCell.setFontWeight("bold");
          currentHeaders.push(key);
        }
      }
    }

    // 3. Susun urutan data baris baru sesuai urutan kolom header
    var newRow = currentHeaders.map(function(header) {
      return valuesMap[header] !== undefined ? valuesMap[header] : (data[header] || "");
    });

    // 4. Masukkan baris data ke Google Sheet
    sheet.appendRow(newRow);

    // Format text wrap pada baris baru agar rapi
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, currentHeaders.length).setWrap(true);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      row: lastRow,
      brandName: data.brandName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Handler GET agar saat link webhook dibuka di browser keluar konfirmasi aktif
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Webhook Google Sheet Tenant Playlist Rewind aktif dan siap menerima data!"
  })).setMimeType(ContentService.MimeType.JSON);
}
