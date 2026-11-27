/**
 * Google Sheets lead log for the HTH Limousine booking form.
 *
 * Every request sent from the website lands as one row, which gives HTH a
 * permanent record even when no email account is configured.
 *
 * Setup (about five minutes):
 *   1. Create a Google Sheet, then Extensions → Apps Script. Replace the editor
 *      contents with this file and save.
 *   2. Deploy → New deployment → type "Web app".
 *      Execute as: Me. Who has access: Anyone.
 *   3. Copy the web app URL (ends in /exec) into LEAD_WEBHOOK_URL in Vercel,
 *      then redeploy the site.
 *
 * Keep the URL private: anyone who has it can add rows.
 */

var COLUMNS = [
  'receivedAt', 'locale', 'service', 'pickup', 'dropoff', 'date', 'time',
  'passengers', 'trip', 'vehicle', 'estimate', 'name', 'phone', 'note', 'page', 'summary',
];

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
  sheet.appendRow(COLUMNS.map(function (key) { return data[key] || ''; }));
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
