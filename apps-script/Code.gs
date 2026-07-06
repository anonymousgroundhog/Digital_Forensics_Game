// Google Apps Script — leaderboard backend for Digital Forensics Detective.
//
// SETUP (one time):
//   1. Open the target Google Sheet:
//      https://docs.google.com/spreadsheets/d/17d5BsmuuEDnXZ-rWJStChNvF8OCLhYHWpMycClncqbo/edit
//   2. Extensions → Apps Script. Delete any boilerplate, paste this whole file.
//   3. Save. Then Deploy → New deployment → type "Web app".
//        - Execute as: Me
//        - Who has access: Anyone
//      Deploy, authorize, and COPY the "/exec" web app URL.
//   4. Paste that URL into server.js -> APPS_SCRIPT_URL (see server.js).
//
// The script auto-creates a "Leaderboard" tab with a header row on first write.

var SHEET_NAME = 'Leaderboard';
var HEADERS = ['Timestamp', 'Name', 'Case', 'Score', 'Max', 'Grade', 'Integrity', 'PlayerId'];
// Column positions (1-based) — keep in sync with HEADERS.
var COL = { TS: 1, NAME: 2, CASE: 3, SCORE: 4, MAX: 5, GRADE: 6, INTEGRITY: 7, PLAYER: 8 };

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    return sh;
  }
  // Upgrade an older sheet in place: ensure the header row has every column
  // (e.g. add the PlayerId column to sheets created before rename support).
  var lastCol = sh.getLastColumn();
  if (lastCol < HEADERS.length) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// POST — two actions:
//   append a score:  { name, case, score, max, grade, integrity, playerId }
//   rename yourself: { action:'rename', playerId, name }
// Rename rewrites the Name on every row whose PlayerId matches, so your past
// scores follow your new name. playerId is a stable per-browser id.
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');

    if (body.action === 'rename') {
      return renameRows_(body);
    }

    var name = String(body.name || 'Anonymous').slice(0, 40);
    var sh = sheet_();
    sh.appendRow([
      new Date(),
      name,
      String(body.case || '').slice(0, 120),
      Number(body.score) || 0,
      Number(body.max) || 0,
      String(body.grade || '').slice(0, 4),
      Number(body.integrity) || 0,
      String(body.playerId || '').slice(0, 64),
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Rewrite Name for all rows owned by this playerId. Returns count updated.
function renameRows_(body) {
  var playerId = String(body.playerId || '').slice(0, 64);
  var name = String(body.name || '').slice(0, 40);
  if (!playerId || !name) return json_({ ok: false, error: 'playerId and name required' });

  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, updated: 0 });

  var ids = sh.getRange(2, COL.PLAYER, last - 1, 1).getValues();
  var names = sh.getRange(2, COL.NAME, last - 1, 1).getValues();
  var updated = 0;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === playerId) { names[i][0] = name; updated++; }
  }
  if (updated) sh.getRange(2, COL.NAME, names.length, 1).setValues(names);
  return json_({ ok: true, updated: updated });
}

// GET — return top scores. ?limit=N (default 20), sorted by Score desc.
function doGet(e) {
  try {
    var limit = Math.min(200, Math.max(1, Number((e.parameter || {}).limit) || 20));
    var sh = sheet_();
    var last = sh.getLastRow();
    if (last < 2) return json_({ ok: true, scores: [] });
    var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
    var scores = rows.map(function (r) {
      return {
        name: r[COL.NAME - 1], case: r[COL.CASE - 1], score: Number(r[COL.SCORE - 1]) || 0,
        max: Number(r[COL.MAX - 1]) || 0, grade: r[COL.GRADE - 1],
        integrity: Number(r[COL.INTEGRITY - 1]) || 0,
        playerId: r[COL.PLAYER - 1],
        ts: r[COL.TS - 1] instanceof Date ? r[COL.TS - 1].toISOString() : String(r[COL.TS - 1]),
      };
    });
    scores.sort(function (a, b) { return b.score - a.score; });
    return json_({ ok: true, scores: scores.slice(0, limit) });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
