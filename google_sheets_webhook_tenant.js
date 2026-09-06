/**
 * GOOGLE APPS SCRIPT WEBHOOK - TENANT F&B PLAYLIST REWIND 2026
 * =============================================================
 * VERSI LENGKAP & SEMPURNA (14 KOLOM RESMI - BEBAS LINK WEBSITE)
 * 
 * 14 Kolom Resmi Sesuai Formulir Tenant di Website:
 * 1. Waktu Pendaftaran
 * 2. Nama Brand / Usaha F&B
 * 3. Kategori Tenant
 * 4. Jumlah Tenant yang Ingin Disewa
 * 5. Kategori Menu F&B
 * 6. Deskripsi Menu & Produk Unggulan
 * 7. Akun Instagram / Link Foto Menu (ID sosmed murni / link asli tanpa embel-embel domain web!)
 * 8. Nama Lengkap PIC / Owner
 * 9. Nomor WhatsApp PIC (Angka 0 depan dijamin tidak hilang)
 * 10. Alamat Email PIC / Bisnis
 * 11. Kota Domisili Brand / Usaha
 * 12. Kebutuhan Daya Listrik Booth
 * 13. Daftar Peralatan Listrik yang Dibawa
 * 14. Pengalaman Mengikuti Event / Festival Sebelumnya
 * 
 * CARA MENGGUNAKAN:
 * 1. Buka Google Spreadsheet Anda:
 *    https://docs.google.com/spreadsheets/d/1O-HuGiXnVaQKf7YeMHHo0bsNLqZjNAJTF3_5Hp8nOK0/edit
 * 2. Klik menu: Ekstensi (Extensions) -> Apps Script.
 * 3. Hapus SEMUA kode yang ada di layar editor (Ctrl+A -> Hapus).
 * 4. Paste (tempel) SELURUH kode di bawah ini.
 * 5. Klik ikon Save (Disket).
 * 6. (PENTING) SINKRONKAN SELURUH DATA LENGKAP YANG SUDAH TERDAFTAR:
 *    - Di dropdown fungsi (sebelah tombol 'Debug'), pilih: singkronkanDanRapikanSemuaData
 *    - Klik tombol "Jalankan" (Run).
 *    - Berikan izin akun (Review Permissions -> Pilih Akun -> Advanced -> Buka ... -> Izinkan).
 *    - SEKETIKA SEMUA DATA LENGKAP (Kategori Tenant, Jumlah Tenant, Akun Instagram bersih tanpa link website)
 *      akan terisi otomatis dan rapi di 14 kolom resmi!
 * 7. PERBARUI DEPLOYMENT:
 *    - Klik tombol biru "Terapkan" (Deploy) di kanan atas -> Pilih "Kelola penerapan" (Manage deployments).
 *    - Klik ikon Pensil (Edit) pada penerapan aktif.
 *    - Pada bagian Versi (Version), pilih "Versi baru" (New version).
 *    - Klik tombol "Terapkan" (Deploy). Selesai!
 */

var OFFICIAL_HEADERS = [
  "Waktu Pendaftaran",
  "Nama Brand / Usaha F&B",
  "Kategori Tenant",
  "Jumlah Tenant yang Ingin Disewa",
  "Kategori Menu F&B",
  "Deskripsi Menu & Produk Unggulan",
  "Akun Instagram / Link Foto Menu",
  "Nama Lengkap PIC / Owner",
  "Nomor WhatsApp PIC",
  "Alamat Email PIC / Bisnis",
  "Kota Domisili Brand / Usaha",
  "Kebutuhan Daya Listrik Booth",
  "Daftar Peralatan Listrik yang Dibawa",
  "Pengalaman Mengikuti Event / Festival Sebelumnya"
];

// Helper membersihkan input akun instagram/link agar tidak tercampur URL web festival
function cleanSocialOrText(rawVal) {
  if (!rawVal) return "-";
  var val = String(rawVal).trim();
  // Bersihkan jika ada awalan domain website playlist/letsplaymaker yang tidak sengaja tertempel sebelumnya
  val = val.replace(/^https?:\/\/[^\/]*playlist[^\/]*\//i, "");
  val = val.replace(/^https?:\/\/[^\/]*letsplaymaker[^\/]*\//i, "");
  val = val.trim();
  return val || "-";
}

// Helper merapikan nomor WhatsApp agar angka 0 di depan tidak hilang
function formatWhatsApp(rawWa) {
  var wa = String(rawWa || "").trim();
  if (!wa) return "-";
  if (wa.startsWith("62")) {
    wa = "0" + wa.substring(2);
  } else if (wa.startsWith("+62")) {
    wa = "0" + wa.substring(3);
  } else if (!wa.startsWith("0") && !wa.startsWith("'0") && /^\d+$/.test(wa)) {
    wa = "0" + wa;
  }
  if (!wa.startsWith("'")) {
    wa = "'" + wa;
  }
  return wa;
}

/**
 * FUNGSI 1-KLIK UNTUK MENGISI ULANG & MENYINKRONKAN SELURUH DATA LENGKAP DARI WEBSITE
 * -----------------------------------------------------------------------------------
 * Fungsi ini mengambil data asli yang tersimpan di server database website Playlist,
 * memulihkan kolom Kategori Tenant, Jumlah Tenant yang Ingin Disewa, serta
 * membersihkan link Instagram sehingga menjadi nama akun/link murni.
 */
function singkronkanDanRapikanSemuaData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 1. Ambil data asli pendaftar dari API website
  var apiUrl = "https://playlistlivefestival.letsplaymaker.com/api/tenant";
  var response = UrlFetchApp.fetch(apiUrl, { muteHttpExceptions: true });
  var result = JSON.parse(response.getContentText());

  if (!result || !result.success || !Array.isArray(result.data)) {
    SpreadsheetApp.getUi().alert("Gagal mengambil data dari server website.");
    return;
  }

  var tenantList = result.data;

  // 2. Set 14 Header Resmi di Baris 1
  sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
  var headerRange = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length);
  headerRange.setBackground("#F59E0B"); // Oranye Amber Khas Playlist
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // 3. Bersihkan baris data lama dan kolom berlebih ke kanan
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastCol > OFFICIAL_HEADERS.length) {
    sheet.deleteColumns(OFFICIAL_HEADERS.length + 1, lastCol - OFFICIAL_HEADERS.length);
  }

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, OFFICIAL_HEADERS.length).clearContent();
  }

  // 4. Susun seluruh baris data pendaftar secara akurat
  var rowsToWrite = [];

  for (var i = 0; i < tenantList.length; i++) {
    var item = tenantList[i];
    var custom = item.customData || {};
    var responses = Array.isArray(custom.responses) ? custom.responses : [];

    var answers = {};
    responses.forEach(function(r) {
      if (r && r.label) answers[String(r.label).trim()] = r.value;
      if (r && r.id) answers[String(r.id).trim()] = r.value;
    });

    // Helper cari nilai dari responses atau properti item
    function getVal(keys, defaultVal) {
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (answers[key] !== undefined && answers[key] !== null && answers[key] !== "") {
          return answers[key];
        }
        if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
          return item[key];
        }
      }
      return defaultVal !== undefined ? defaultVal : "-";
    }

    var timeStr = item.createdAt 
      ? new Date(item.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      : "-";

    var row = [
      timeStr,
      item.brandName || getVal(["Nama Brand / Usaha F&B", "brandName"]),
      getVal(["Kategori Tenant", "custom_1788683904368", "tenantCategory"]),
      getVal(["Jumlah Tenant yang Ingin Disewa", "Jumlah Tenant", "custom_1788684447732", "tenantCount"]),
      item.category || getVal(["Kategori Menu F&B", "category"]),
      item.menuDescription || getVal(["Deskripsi Menu & Produk Unggulan", "menuDescription"]),
      cleanSocialOrText(item.instagramCatalog || getVal(["Akun Instagram / Link Foto Menu", "instagramCatalog"])),
      item.picName || getVal(["Nama Lengkap PIC / Owner", "picName"]),
      formatWhatsApp(item.whatsapp || getVal(["Nomor WhatsApp PIC", "whatsapp"])),
      item.email || getVal(["Alamat Email PIC / Bisnis", "email"]),
      item.city || getVal(["Kota Domisili Brand / Usaha", "city"]),
      item.powerRequirement || getVal(["Kebutuhan Daya Listrik Booth", "powerRequirement"]),
      item.equipmentList || getVal(["Daftar Peralatan Listrik yang Dibawa", "equipmentList"]),
      item.eventExperience || getVal(["Pengalaman Mengikuti Event / Festival Sebelumnya", "eventExperience"])
    ];

    rowsToWrite.push(row);
  }

  // 5. Masukkan seluruh data ke Google Sheet
  if (rowsToWrite.length > 0) {
    sheet.getRange(2, 1, rowsToWrite.length, OFFICIAL_HEADERS.length).setValues(rowsToWrite);
    sheet.getRange(2, 1, rowsToWrite.length, OFFICIAL_HEADERS.length).setWrap(true);
    sheet.getRange(2, 9, rowsToWrite.length, 1).setNumberFormat("@"); // Format kolom WA sebagai teks
  }

  // 6. Auto-fit lebar kolom
  for (var c = 1; c <= OFFICIAL_HEADERS.length; c++) {
    sheet.autoResizeColumn(c);
  }

  try {
    SpreadsheetApp.getUi().alert("Sukses! Seluruh data tenant (termasuk Kategori Tenant, Jumlah Tenant, dan Akun Instagram yang bersih) telah disinkronkan ke 14 kolom resmi.");
  } catch (e) {
    Logger.log("Sukses sinkronisasi data!");
  }
}

/**
 * Webhook Handler POST untuk pendaftar baru yang submit dari website
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Tidak ada data POST yang diterima"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(rawData);

    // 1. Jika ada kolom berlebih, otomatis hapus kolom 15 ke kanan
    var currentLastCol = sheet.getLastColumn();
    if (currentLastCol > OFFICIAL_HEADERS.length) {
      sheet.deleteColumns(OFFICIAL_HEADERS.length + 1, currentLastCol - OFFICIAL_HEADERS.length);
    }

    // 2. Pastikan Baris 1 Header Terkunci
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
      var headerRange = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length);
      headerRange.setBackground("#F59E0B");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);
    }

    // 3. Kumpulkan Nilai Jawaban
    var answers = {};
    var responsesList = [];
    if (data.responses && Array.isArray(data.responses)) {
      responsesList = data.responses;
    } else if (data.responsesJson) {
      try {
        responsesList = JSON.parse(data.responsesJson);
      } catch (ex) {}
    }

    responsesList.forEach(function(item) {
      if (item && item.label) {
        answers[String(item.label).trim()] = item.value;
      }
      if (item && item.id) {
        answers[String(item.id).trim()] = item.value;
      }
    });

    function findVal(aliases, defaultVal) {
      for (var i = 0; i < aliases.length; i++) {
        var key = aliases[i];
        if (answers[key] !== undefined && answers[key] !== null && answers[key] !== "") {
          return answers[key];
        }
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
          return data[key];
        }
      }
      return defaultVal !== undefined ? defaultVal : "-";
    }

    var timeString = data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    // Susun Tepat 14 Kolom Resmi
    var rowValues = [
      timeString,
      findVal(["Nama Brand / Usaha F&B", "Nama Brand / Usaha", "brandName"]),
      findVal(["Kategori Tenant", "custom_1788683904368", "tenantCategory"]),
      findVal(["Jumlah Tenant yang Ingin Disewa", "Jumlah Tenant", "custom_1788684447732", "tenantCount"]),
      findVal(["Kategori Menu F&B", "Kategori Menu", "category"]),
      findVal(["Deskripsi Menu & Produk Unggulan", "Deskripsi Menu", "menuDescription"]),
      cleanSocialOrText(findVal(["Akun Instagram / Link Foto Menu", "Instagram / Portofolio", "instagramCatalog", "instagram"])),
      findVal(["Nama Lengkap PIC / Owner", "Nama PIC / Owner", "picName"]),
      formatWhatsApp(findVal(["Nomor WhatsApp PIC", "Nomor WhatsApp", "whatsapp", "phone"])),
      findVal(["Alamat Email PIC / Bisnis", "Email", "email"]),
      findVal(["Kota Domisili Brand / Usaha", "Kota Domisili", "city"]),
      findVal(["Kebutuhan Daya Listrik Booth", "Kebutuhan Daya Listrik", "powerRequirement"]),
      findVal(["Daftar Peralatan Listrik yang Dibawa", "Daftar Peralatan", "equipmentList"]),
      findVal(["Pengalaman Mengikuti Event / Festival Sebelumnya", "Pengalaman Event", "eventExperience"])
    ];

    rowValues = rowValues.map(function(val) {
      if (Array.isArray(val)) return val.join(", ");
      return val !== undefined && val !== null ? val : "-";
    });

    // 4. Masukkan Tepat ke Kolom 1 sampai 14
    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, OFFICIAL_HEADERS.length).setValues([rowValues]);
    sheet.getRange(nextRow, 1, 1, OFFICIAL_HEADERS.length).setWrap(true);
    sheet.getRange(nextRow, 9).setNumberFormat("@");

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      row: nextRow,
      brandName: rowValues[1]
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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Webhook Google Sheet Tenant Playlist Rewind aktif dengan 14 kolom resmi!",
    columns: OFFICIAL_HEADERS
  })).setMimeType(ContentService.MimeType.JSON);
}
