/**
 * GOOGLE APPS SCRIPT WEBHOOK - TENANT F&B PLAYLIST REWIND 2026
 * =============================================================
 * VERSI SEMPURNA & BERSIH (TEPAT 14 KOLOM RESMI - ANTI KOLOM GANDA)
 * 
 * 14 Kolom Resmi Sesuai Urutan Formulir Tenant di Website:
 * 1. Waktu Pendaftaran
 * 2. Nama Brand / Usaha F&B
 * 3. Kategori Tenant
 * 4. Jumlah Tenant yang Ingin Disewa
 * 5. Kategori Menu F&B
 * 6. Deskripsi Menu & Produk Unggulan
 * 7. Akun Instagram / Link Foto Menu
 * 8. Nama Lengkap PIC / Owner
 * 9. Nomor WhatsApp PIC (Angka 0 depan dijamin tidak hilang)
 * 10. Alamat Email PIC / Bisnis
 * 11. Kota Domisili Brand / Usaha
 * 12. Kebutuhan Daya Listrik Booth
 * 13. Daftar Peralatan Listrik yang Dibawa
 * 14. Pengalaman Mengikuti Event / Festival Sebelumnya
 * 
 * CARA MEMASANG / MEMPERBAIKI DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet Anda:
 *    https://docs.google.com/spreadsheets/d/1O-HuGiXnVaQKf7YeMHHo0bsNLqZjNAJTF3_5Hp8nOK0/edit
 * 2. Di menu atas, klik: Ekstensi (Extensions) -> Apps Script.
 * 3. Hapus SEMUA kode yang ada di Apps Script tersebut (Ctrl+A -> Hapus).
 * 4. Paste (tempel) SELURUH isi kode di bawah ini.
 * 5. Klik ikon Save (Disket).
 * 6. (PENTING) RAP الأه KAN SPREADSHEET YANG SUDAH BERANTAKAN:
 *    - Di menu dropdown fungsi (sebelah tombol 'Debug'), pilih: bersihkanDanRapikanSheet
 *    - Klik tombol "Jalankan" (Run).
 *    - Berikan izin (Review Permissions -> Pilih Akun -> Advanced -> Go to ... (unsafe) -> Allow).
 *    - Spreadsheet Anda akan SEKETIKA BERSIH, rapi, dan tepat 14 kolom tanpa kolom ganda!
 * 7. PERBARUI PENERAPAN (DEPLOYMENT):
 *    - Klik tombol biru "Terapkan" (Deploy) di kanan atas -> Pilih "Kelola penerapan" (Manage deployments).
 *    - Klik ikon Pensil (Edit) pada penerapan yang aktif.
 *    - Pada bagian "Versi" (Version), pilih "Versi baru" (New version).
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

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000); // Kunci 15 detik agar tidak terjadi konflik data saat concurrent submit

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

    // 1. Cek dan Bersihkan jika ada kolom berlebih (lebih dari 14 kolom)
    var currentLastCol = sheet.getLastColumn();
    if (currentLastCol > OFFICIAL_HEADERS.length) {
      sheet.deleteColumns(OFFICIAL_HEADERS.length + 1, currentLastCol - OFFICIAL_HEADERS.length);
    }

    // 2. Pastikan Header Baris 1 Terkunci ke 14 Kolom Resmi
    var needHeaderUpdate = false;
    if (sheet.getLastRow() === 0) {
      needHeaderUpdate = true;
    } else {
      var currentHeaders = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).getValues()[0];
      if (currentHeaders[0] !== OFFICIAL_HEADERS[0] || currentHeaders[1] !== OFFICIAL_HEADERS[1]) {
        needHeaderUpdate = true;
      }
    }

    if (needHeaderUpdate) {
      sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
      var headerRange = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length);
      headerRange.setBackground("#F59E0B"); // Warna Oranye/Amber Khas Playlist
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);
    }

    // 3. Kumpulkan Nilai Jawaban dari Payload Form
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

    // Helper untuk mencari nilai berdasarkan prioritas label / id
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
      return defaultVal !== undefined ? defaultVal : "";
    }

    // Waktu Pendaftaran
    var timeString = data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    // Format Nomor WhatsApp agar angka 0 di depan tidak hilang
    var waRaw = findVal(["Nomor WhatsApp PIC", "Nomor WhatsApp", "whatsapp", "phone"]);
    var waClean = String(waRaw || "").trim();
    if (waClean) {
      if (waClean.startsWith("62")) {
        waClean = "0" + waClean.substring(2);
      } else if (waClean.startsWith("+62")) {
        waClean = "0" + waClean.substring(3);
      } else if (!waClean.startsWith("0") && !waClean.startsWith("'0") && /^\d+$/.test(waClean)) {
        waClean = "0" + waClean;
      }
      if (!waClean.startsWith("'")) {
        waClean = "'" + waClean;
      }
    }

    // Susun Tepat 14 Kolom Resmi
    var rowValues = [
      timeString,
      findVal(["Nama Brand / Usaha F&B", "Nama Brand / Usaha", "brandName"]),
      findVal(["Kategori Tenant", "custom_1788683904368", "tenantCategory"]),
      findVal(["Jumlah Tenant yang Ingin Disewa", "Jumlah Tenant", "custom_1788684447732", "tenantCount"]),
      findVal(["Kategori Menu F&B", "Kategori Menu", "category"]),
      findVal(["Deskripsi Menu & Produk Unggulan", "Deskripsi Menu", "menuDescription"]),
      findVal(["Akun Instagram / Link Foto Menu", "Instagram / Portofolio", "instagramCatalog", "instagram"]),
      findVal(["Nama Lengkap PIC / Owner", "Nama PIC / Owner", "picName"]),
      waClean,
      findVal(["Alamat Email PIC / Bisnis", "Email", "email"]),
      findVal(["Kota Domisili Brand / Usaha", "Kota Domisili", "city"]),
      findVal(["Kebutuhan Daya Listrik Booth", "Kebutuhan Daya Listrik", "powerRequirement"]),
      findVal(["Daftar Peralatan Listrik yang Dibawa", "Daftar Peralatan", "equipmentList"]),
      findVal(["Pengalaman Mengikuti Event / Festival Sebelumnya", "Pengalaman Event", "eventExperience"])
    ];

    // Konversi array checkbox menjadi teks terpisah koma
    rowValues = rowValues.map(function(val) {
      if (Array.isArray(val)) return val.join(", ");
      return val !== undefined && val !== null ? val : "";
    });

    // 4. Masukkan Tepat ke Kolom 1 sampai 14 (Anti Geser & Anti Kolom Baru)
    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, OFFICIAL_HEADERS.length).setValues([rowValues]);
    sheet.getRange(nextRow, 1, 1, OFFICIAL_HEADERS.length).setWrap(true);
    sheet.getRange(nextRow, 9).setNumberFormat("@"); // Format kolom WhatsApp sebagai Text

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

/**
 * FUNGSI 1-KLIK UNTUK MEMBERSIHKAN DAN MERAPIKAN SPREADSHEET ANDA
 * -------------------------------------------------------------
 * Pilih fungsi ini di dropdown Google Apps Script, lalu klik 'Jalankan' (Run).
 * Fungsi ini otomatis:
 * 1. Memulihkan data pendaftar yang berada di kolom kanan (kolom 14-26) ke kolom utama (kolom 2-14).
 * 2. Mengunci baris 1 menjadi 14 kolom resmi berwarna Amber oranye yang rapi.
 * 3. Menghapus seluruh kolom duplikat O sampai Z yang berulang.
 * 4. Memperbaiki nomor WhatsApp agar berformat teks dengan awalan '0.
 * 5. Menata lebar kolom secara otomatis (Auto-fit).
 */
function bersihkanDanRapikanSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastCol = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();

  // 1. Jika ada data lengkap di kolom 14-26 (duplikat lama), pulihkan ke kolom 2-14
  if (lastCol >= 26 && lastRow >= 2) {
    for (var r = 2; r <= lastRow; r++) {
      var col14Val = sheet.getRange(r, 14).getValue(); // Kolom N (Nama Brand pendaftar baru)
      if (col14Val) {
        var completeData = sheet.getRange(r, 14, 1, 13).getValues()[0];
        sheet.getRange(r, 2, 1, 13).setValues([completeData]);
      }
    }
  }

  // 2. Set 14 Header Resmi di Baris 1
  sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
  var headerRange = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length);
  headerRange.setBackground("#F59E0B"); // Amber 500 Playlist
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // 3. Hapus seluruh kolom duplikat dari kolom 15 ke kanan
  if (lastCol > OFFICIAL_HEADERS.length) {
    var colsToDelete = lastCol - OFFICIAL_HEADERS.length;
    sheet.deleteColumns(OFFICIAL_HEADERS.length + 1, colsToDelete);
  }

  // 4. Rapikan format nomor WhatsApp di Kolom 9 (Kolom I)
  if (lastRow >= 2) {
    var waRange = sheet.getRange(2, 9, lastRow - 1, 1);
    var waVals = waRange.getValues();
    for (var i = 0; i < waVals.length; i++) {
      var w = String(waVals[i][0] || "").trim();
      if (w) {
        if (w.startsWith("62")) w = "0" + w.substring(2);
        else if (w.startsWith("+62")) w = "0" + w.substring(3);
        else if (!w.startsWith("0") && !w.startsWith("'0") && /^\d+$/.test(w)) w = "0" + w;
        if (!w.startsWith("'")) w = "'" + w;
        waVals[i][0] = w;
      }
    }
    waRange.setValues(waVals);
    waRange.setNumberFormat("@");
  }

  // 5. Auto resize kolom agar tulisan terbaca jelas dan rapi
  for (var c = 1; c <= OFFICIAL_HEADERS.length; c++) {
    sheet.autoResizeColumn(c);
  }

  try {
    SpreadsheetApp.getUi().alert("Sukses! Tabel Google Sheet Anda sekarang sudah 100% rapi dan tepat 14 kolom resmi tanpa ada kolom ganda.");
  } catch (e) {
    Logger.log("Sukses membersihkan spreadsheet: Tepat 14 kolom resmi.");
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Webhook Google Sheet Tenant Playlist Rewind aktif dengan 14 kolom resmi!",
    columns: OFFICIAL_HEADERS
  })).setMimeType(ContentService.MimeType.JSON);
}
