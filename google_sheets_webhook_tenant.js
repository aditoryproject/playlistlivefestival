/**
 * GOOGLE APPS SCRIPT WEBHOOK - TENANT F&B PLAYLIST REWIND 2026
 * =============================================================
 * VERSI LENGKAP & SEMPURNA (14 KOLOM RESMI - ANTI GAGAL EXTRACT)
 * 
 * 14 Kolom Resmi Sesuai Formulir Tenant di Website:
 * 1. Waktu Pendaftaran
 * 2. Nama Brand / Usaha F&B
 * 3. Kategori Tenant
 * 4. Jumlah Tenant yang Ingin Disewa
 * 5. Kategori Menu F&B
 * 6. Deskripsi Menu & Produk Unggulan
 * 7. Akun Instagram / Link Foto Menu (ID sosmed murni / link asli tanpa embel-embel domain web)
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
 * 3. Hapus SEMUA kode yang ada di editor (Ctrl+A -> Delete).
 * 4. Paste (tempel) SELURUH kode di bawah ini.
 * 5. Klik ikon Simpan (Disket).
 * 6. SINKRONKAN ULANG DATA:
 *    - Di dropdown fungsi (sebelah tombol 'Debug'), pilih: singkronkanDanRapikanSemuaData
 *    - Klik tombol "Jalankan" (Run).
 *    - Kolom 'Kategori Tenant' dan 'Jumlah Tenant yang Ingin Disewa' akan langsung terisi lengkap!
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

// Helper membersihkan input akun instagram agar tidak tercampur URL web festival
function cleanSocialOrText(rawVal) {
  if (!rawVal) return "-";
  var val = String(rawVal).trim();
  // Bersihkan jika ada awalan domain website playlist/letsplaymaker yang tertempel
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

  // 3. Bersihkan kolom dan baris berlebih
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastCol > OFFICIAL_HEADERS.length) {
    sheet.deleteColumns(OFFICIAL_HEADERS.length + 1, lastCol - OFFICIAL_HEADERS.length);
  }

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, OFFICIAL_HEADERS.length).clearContent();
  }

  // 4. Susun seluruh baris data pendaftar
  var rowsToWrite = [];

  for (var i = 0; i < tenantList.length; i++) {
    var item = tenantList[i];

    // Ambil array responses dari item.responses atau customData.responses
    var responses = [];
    if (item.responses && Array.isArray(item.responses)) {
      responses = item.responses;
    } else if (item.customData) {
      var cd = item.customData;
      if (typeof cd === "string") {
        try { cd = JSON.parse(cd); } catch(e) {}
      }
      if (cd && Array.isArray(cd.responses)) {
        responses = cd.responses;
      }
    }

    // Variabel 14 kolom resmi
    var brandName = item.brandName || "-";
    var kategoriTenant = "-";
    var jumlahTenant = "-";
    var kategoriMenu = item.category || "-";
    var deskripsiMenu = item.menuDescription || "-";
    var instagram = cleanSocialOrText(item.instagramCatalog);
    var picName = item.picName || "-";
    var whatsapp = formatWhatsApp(item.whatsapp);
    var email = item.email || "-";
    var city = item.city || "-";
    var powerReq = item.powerRequirement || "-";
    var equipList = item.equipmentList || "-";
    var eventExp = item.eventExperience || "-";

    // Ekstraksi mendalam dari array responses (Mencakup custom dropdown & pertanyaan tambahan)
    for (var r = 0; r < responses.length; r++) {
      var resp = responses[r];
      if (!resp) continue;
      var lbl = String(resp.label || "").toLowerCase();
      var id = String(resp.id || "").toLowerCase();
      var val = resp.value !== undefined && resp.value !== null ? String(resp.value).trim() : "";

      if (!val) continue;

      if (lbl.indexOf("nama brand") !== -1 || id === "brandname") {
        brandName = val;
      } else if (lbl.indexOf("kategori tenant") !== -1 || id.indexOf("1788683904368") !== -1) {
        kategoriTenant = val;
      } else if (lbl.indexOf("jumlah tenant") !== -1 || id.indexOf("1788684447732") !== -1) {
        jumlahTenant = val;
      } else if (lbl.indexOf("kategori menu") !== -1 || id === "category") {
        kategoriMenu = val;
      } else if (lbl.indexOf("deskripsi menu") !== -1 || id === "menudescription") {
        deskripsiMenu = val;
      } else if (lbl.indexOf("instagram") !== -1 || id === "instagramcatalog") {
        instagram = cleanSocialOrText(val);
      } else if (lbl.indexOf("pic") !== -1 || lbl.indexOf("owner") !== -1 || id === "picname") {
        picName = val;
      } else if (lbl.indexOf("whatsapp") !== -1 || id === "whatsapp") {
        whatsapp = formatWhatsApp(val);
      } else if (lbl.indexOf("email") !== -1 || id === "email") {
        email = val;
      } else if (lbl.indexOf("domisili") !== -1 || lbl.indexOf("kota") !== -1 || id === "city") {
        city = val;
      } else if (lbl.indexOf("listrik") !== -1 || id === "powerrequirement") {
        powerReq = val;
      } else if (lbl.indexOf("peralatan") !== -1 || id === "equipmentlist") {
        equipList = val;
      } else if (lbl.indexOf("pengalaman") !== -1 || id === "eventexperience") {
        eventExp = val;
      }
    }

    var timeStr = item.createdAt 
      ? new Date(item.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      : "-";

    var row = [
      timeStr,
      brandName,
      kategoriTenant,
      jumlahTenant,
      kategoriMenu,
      deskripsiMenu,
      instagram,
      picName,
      whatsapp,
      email,
      city,
      powerReq,
      equipList,
      eventExp
    ];

    rowsToWrite.push(row);
  }

  // 5. Masukkan seluruh data ke Google Sheet
  if (rowsToWrite.length > 0) {
    sheet.getRange(2, 1, rowsToWrite.length, OFFICIAL_HEADERS.length).setValues(rowsToWrite);
    sheet.getRange(2, 1, rowsToWrite.length, OFFICIAL_HEADERS.length).setWrap(true);
    sheet.getRange(2, 9, rowsToWrite.length, 1).setNumberFormat("@");
  }

  // 6. Auto-fit lebar kolom
  for (var c = 1; c <= OFFICIAL_HEADERS.length; c++) {
    sheet.autoResizeColumn(c);
  }

  try {
    SpreadsheetApp.getUi().alert("Sukses! Kategori Tenant, Jumlah Tenant, dan seluruh data lengkap telah berhasil masuk ke tabel.");
  } catch (e) {
    Logger.log("Sukses sinkronisasi data!");
  }
}

/**
 * Webhook Handler POST untuk pendaftar baru dari website
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

    // 1. Bersihkan kolom berlebih
    var currentLastCol = sheet.getLastColumn();
    if (currentLastCol > OFFICIAL_HEADERS.length) {
      sheet.deleteColumns(OFFICIAL_HEADERS.length + 1, currentLastCol - OFFICIAL_HEADERS.length);
    }

    // 2. Pastikan Header Baris 1 Terkunci
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

    // 3. Ambil Responses
    var responsesList = [];
    if (data.responses && Array.isArray(data.responses)) {
      responsesList = data.responses;
    } else if (data.responsesJson) {
      try {
        responsesList = JSON.parse(data.responsesJson);
      } catch (ex) {}
    }

    var brandName = data.brandName || "-";
    var kategoriTenant = "-";
    var jumlahTenant = "-";
    var kategoriMenu = data.category || "-";
    var deskripsiMenu = data.menuDescription || "-";
    var instagram = cleanSocialOrText(data.instagramCatalog);
    var picName = data.picName || "-";
    var whatsapp = formatWhatsApp(data.whatsapp);
    var email = data.email || "-";
    var city = data.city || "-";
    var powerReq = data.powerRequirement || "-";
    var equipList = data.equipmentList || "-";
    var eventExp = data.eventExperience || "-";

    for (var r = 0; r < responsesList.length; r++) {
      var resp = responsesList[r];
      if (!resp) continue;
      var lbl = String(resp.label || "").toLowerCase();
      var id = String(resp.id || "").toLowerCase();
      var val = resp.value !== undefined && resp.value !== null ? String(resp.value).trim() : "";

      if (!val) continue;

      if (lbl.indexOf("nama brand") !== -1 || id === "brandname") {
        brandName = val;
      } else if (lbl.indexOf("kategori tenant") !== -1 || id.indexOf("1788683904368") !== -1) {
        kategoriTenant = val;
      } else if (lbl.indexOf("jumlah tenant") !== -1 || id.indexOf("1788684447732") !== -1) {
        jumlahTenant = val;
      } else if (lbl.indexOf("kategori menu") !== -1 || id === "category") {
        kategoriMenu = val;
      } else if (lbl.indexOf("deskripsi menu") !== -1 || id === "menudescription") {
        deskripsiMenu = val;
      } else if (lbl.indexOf("instagram") !== -1 || id === "instagramcatalog") {
        instagram = cleanSocialOrText(val);
      } else if (lbl.indexOf("pic") !== -1 || lbl.indexOf("owner") !== -1 || id === "picname") {
        picName = val;
      } else if (lbl.indexOf("whatsapp") !== -1 || id === "whatsapp") {
        whatsapp = formatWhatsApp(val);
      } else if (lbl.indexOf("email") !== -1 || id === "email") {
        email = val;
      } else if (lbl.indexOf("domisili") !== -1 || lbl.indexOf("kota") !== -1 || id === "city") {
        city = val;
      } else if (lbl.indexOf("listrik") !== -1 || id === "powerrequirement") {
        powerReq = val;
      } else if (lbl.indexOf("peralatan") !== -1 || id === "equipmentlist") {
        equipList = val;
      } else if (lbl.indexOf("pengalaman") !== -1 || id === "eventexperience") {
        eventExp = val;
      }
    }

    var timeString = data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    var rowValues = [
      timeString,
      brandName,
      kategoriTenant,
      jumlahTenant,
      kategoriMenu,
      deskripsiMenu,
      instagram,
      picName,
      whatsapp,
      email,
      city,
      powerReq,
      equipList,
      eventExp
    ];

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
