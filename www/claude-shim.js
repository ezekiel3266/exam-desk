/* Exam Desk Android shim.
   The original page was written for Claude's sandbox and calls window.claude.use(...).
   On a real phone those services do not exist, so this file provides safe replacements:
   - user / db / sample  -> null (the app already falls back to on-device storage)
   - downloads           -> saves a file with Capacitor Filesystem and opens the Android share sheet */
(function () {
  "use strict";
  var P = (window.Capacitor && window.Capacitor.Plugins) || {};

  function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  var downloads = {
    save: async function (opts) {
      var name = opts.filename || "exam-schedule.csv";
      var data = String(opts.data == null ? "" : opts.data);
      if (P.Filesystem && P.Share) {
        var res = await P.Filesystem.writeFile({
          path: name,
          data: toBase64(data),
          directory: "CACHE"
        });
        await P.Share.share({
          title: name,
          text: "Exam schedule",
          url: res.uri,
          dialogTitle: "Save or share schedule"
        });
        return;
      }
      /* Fallback for a normal browser */
      var blob = new Blob([data], { type: "text/csv" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
  };

  window.claude = {
    use: async function (name) {
      if (name === "downloads") return downloads;
      return null;
    }
  };
})();
