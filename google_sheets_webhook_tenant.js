/**
 * GOOGLE APPS SCRIPT WEBHOOK - TENANT F&B PLAYLIST REWIND 2026 (VERSI DINAMIS LENGKAP)
 * 
 * Keunggulan Versi Ini:
 * 1. 100% Selaras dengan Form Website: Semua 13 pertanyaan + pertanyaan baru akan otomatis dibuatkan kolomnya.
 * 2. Instagram & Link Bersih: Tidak akan menambahkan link website playlist, hanya menampilkan username / link asli yang diisi.
 * 3. Nomor WhatsApp Aman: Angka 0 di depan nomor tidak akan hilang.
 * 4. Urutan Kolom Sesuai Form: Mengikuti urutan pertanyaan formulir website.
 * 
 * Cara Update di Google Spreadsheet:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik Extensions (Ekstensi) -> Apps Script.
 * 3. Hapus seluruh kode lama, ganti dengan SELURUH kode di bawah ini.
 * 4. Klik ikon Save (Disket).
 * 5. Klik tombol "Deploy" (Terapkan) di kanan atas -> Pilih "Manage deployments" (Kelola penerapan).
 * 6. Klik ikon Pensil (Edit) pada penerapan aktif -> Pada Version pilih "New version" (Versi baru).
 * 7. Klik "Deploy". Selesai!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Cegah konflik pengiriman ganda bersamaan

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

    // Ambil data responses (bisa dari array responses atau parsing responsesJson)
    var responsesList = [];
    if (data.responses && Array.isArray(data.responses)) {
      responsesList = data.responses;
    } else if (data.responsesJson) {
      try {
        responsesList = JSON.parse(data.responsesJson);
      } catch (ex) {}
    }

    // Buat kamus (dictionary) jawaban berdasarkan label pertanyaan
    var answersByLabel = {};
    var orderedLabels = ["Waktu Pendaftaran"];

    responsesList.forEach(function(item) {
      if (item && item.label) {
        var cleanLabel = String(item.label).trim();
        answersByLabel[cleanLabel] = item.value;
        if (orderedLabels.indexOf(cleanLabel) === -1) {
          orderedLabels.push(cleanLabel);
        }
      }
    });

    // Fallback data standar jika responses tidak memuatnya
    if (!answersByLabel["Nama Brand / Usaha F&B"] && data.brandName) {
      answersByLabel["Nama Brand / Usaha F&B"] = data.brandName;
    }
    if (!answersByLabel["Kategori Menu F&B"] && data.category) {
      answersByLabel["Kategori Menu F&B"] = data.category;
    }
    if (!answersByLabel["Nama Lengkap PIC / Owner"] && data.picName) {
      answersByLabel["Nama Lengkap PIC / Owner"] = data.picName;
    }
    if (!answersByLabel["Nomor WhatsApp PIC"] && data.whatsapp) {
      answersByLabel["Nomor WhatsApp PIC"] = data.whatsapp;
    }
    if (!answersByLabel["Alamat Email PIC / Bisnis"] && data.email) {
      answersByLabel["Alamat Email PIC / Bisnis"] = data.email;
    }
    if (!answersByLabel["Kota Domisili Brand / Usaha"] && data.city) {
      answersByLabel["Kota Domisili Brand / Usaha"] = data.city;
    }
    if (!answersByLabel["Akun Instagram / Link Foto Menu"] && data.instagramCatalog) {
      answersByLabel["Akun Instagram / Link Foto Menu"] = data.instagramCatalog;
    }

    // Cek apakah sheet masih kosong (baris 1 belum ada header)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(orderedLabels);
      
      // Styling Header Oranye / Amber Khas Playlist
      var headerRange = sheet.getRange(1, 1, 1, orderedLabels.length);
      headerRange.setBackground("#F59E0B"); // Amber 500
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Ambil daftar header yang ada di baris 1 saat ini
    var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];

    // Cek jika ada pertanyaan dari form yang belum ada di header baris 1, tambahkan ke kanan
    orderedLabels.forEach(function(label) {
      if (currentHeaders.indexOf(label) === -1) {
        var newColIdx = currentHeaders.length + 1;
        var newCell = sheet.getRange(1, newColIdx);
        newCell.setValue(label);
        newCell.setBackground("#F59E0B");
        newCell.setFontColor("#FFFFFF");
        newCell.setFontWeight("bold");
        newCell.setHorizontalAlignment("center");
        currentHeaders.push(label);
      }
    });

    // Susun nilai baris baru sesuai urutan kolom header baris 1
    var timeString = data.timestamp || new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    var newRowValues = currentHeaders.map(function(header) {
      var h = String(header).trim();
      if (h === "Waktu Pendaftaran" || h === "Waktu Daftar" || h === "Timestamp") {
        return timeString;
      }

      var val = answersByLabel[h];
      if (val === undefined || val === null) {
        val = data[h] || "";
      }

      // Jika bentuknya array (misal checkbox), gabungkan dengan koma
      if (Array.isArray(val)) {
        val = val.join(", ");
      }

      // Format nomor WhatsApp agar angka 0 tidak terpotong oleh Excel/Google Sheet
      if (typeof val === "string" && (/^08\d+/.test(val.trim()) || /^\+62\d+/.test(val.trim()))) {
        return "'" + val.trim();
      }

      return val;
    });

    // Masukkan baris data ke Google Sheet
    sheet.appendRow(newRowValues);

    // Format text wrap pada baris yang baru ditambahkan
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

// Handler GET
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Webhook Google Sheet Tenant Playlist Rewind aktif dan siap menerima 13+ kolom data!"
  })).setMimeType(ContentService.MimeType.JSON);
}
