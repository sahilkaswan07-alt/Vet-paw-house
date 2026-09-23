/* ===== pet-schedules.js =====
   SINGLE SOURCE OF TRUTH for every pet's vaccination & deworming schedule.

   Every pet's own petbox.html page (the table + the big bell) and home.html (the small bell on
   each pet's box) read from THIS file. Nothing is typed into petbox.html any more, so:
     - You only ever edit a date / add a vaccine in ONE place.
     - Each pet page shows exactly the schedule written for that pet here — no one else's.
     - The home page bell and the pet page bell can never disagree.

   ───────────────────────────────────────────────────────────────────
   HOW TO ADD A NEW PET (2 minutes):
   1. Copy the whole "casper: { … }" block below, paste it under it, and put a comma
      after the closing brace of the block above it.
   2. Rename the key to the new pet's id (small letters, no spaces, e.g. monty). It MUST be
      exactly the same id as:
        - window.PET_ID = 'monty';   at the top of that pet's petbox.html
        - data-pet-id="monty" and ?id=monty   in that pet's box on home.html
   3. Fill in every row:
        id   -> any short unique text for this pet, never used twice (e.g. 'vax-rabies').
                The owner's tick is remembered under this id, so don't rename it later.
        name -> shown in the table and the reminder popup
        due  -> "YYYY-MM-DD" — the fixed date shown in the table (the owner cannot change it)
   4. Upload pet-schedules.js. That's all — no other file needs to change.

   There is no status: the owner just ticks the box on the pet's page once it is done, and the
   tick is remembered in their browser. The bells count every row that is not ticked yet and
   pulse once its date has arrived.

   Mistyped something? Press F12 in the browser -> Console: this file prints a warning that
   says which pet and which row to fix.
   ───────────────────────────────────────────────────────────────────
*/

window.PET_SCHEDULES = {

  casper: {
    vaccination: [
      { id: 'vax-dhppi',   name: 'DHPPi (initial baseline)', due: '2026-09-25' },
      { id: 'vax-rabies',  name: 'Rabies',                due: '2026-09-25' },
      { id: 'vax-dhppi',   name: 'DHPPi (Core Vaccine)',         due: '2026-10-25' },
      { id: 'vax-booster', name: 'DHPPi (Booster)',          due: '2027-10-25' },
      { id: 'vax-booster',  name: 'Rabies (Booster)',                due: '2027-10-25' },
      { id: 'vax-dhppi',   name: 'DHPPi (booster maintenance)',         due: '2030-10-25' },
      { id: 'vax-rabies',  name: 'Rabies (booster maintenance)',                due: '2028-10-25' },
    ],
    deworming: [
      { id: 'dew-1st',       name: '1st Deworming',        due: '2026-07-21' },
      { id: 'dew-2nd',       name: '2nd Deworming',        due: '2026-07-21' },
      { id: 'dew-quarterly', name: 'Quarterly Deworming',  due: '2026-07-21' }
    ]
  }

  /* Add the next pet right here (remember the comma after the block above), e.g.:
  ,
  monty: {
    vaccination: [
      { id: 'vax-dhppi', name: 'DHPPi (Core Vaccine)', due: '2026-08-10' }
    ],
    deworming: [
      { id: 'dew-1st', name: '1st Deworming', due: '2026-08-10' }
    ]
  }
  */

};


/* ───────── Below this line: no need to edit ───────── */

// Finds a pet's schedule by its id. Capital letters and stray spaces in the id are ignored,
// so 'Casper' / ' casper ' still find the "casper" block. Returns null if there is none.
window.getPetSchedule = function (petId) {
  var wanted = String(petId || '').trim().toLowerCase();
  var keys = Object.keys(window.PET_SCHEDULES);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].trim().toLowerCase() === wanted) return window.PET_SCHEDULES[keys[i]];
  }
  return null;
};

// Friendly self-check — prints warnings in the browser console (F12) if a row is mistyped.
(function () {
  var dateOk = /^\d{4}-\d{2}-\d{2}$/;
  Object.keys(window.PET_SCHEDULES).forEach(function (pet) {
    var seen = {};
    ['vaccination', 'deworming'].forEach(function (kind) {
      (window.PET_SCHEDULES[pet][kind] || []).forEach(function (row, i) {
        var where = '[pet-schedules.js] ' + pet + ' → ' + kind + ' → row ' + (i + 1) + ': ';
        if (!row || !row.id || !row.name || !row.due) {
          console.warn(where + 'every row needs an id, a name and a due date (this row is skipped).');
          return;
        }
        if (!dateOk.test(row.due) || isNaN(new Date(row.due))) {
          console.warn(where + '"' + row.due + '" is not a valid date — write it like 2026-08-10 (this row is skipped).');
        }
        if (seen[row.id]) console.warn(where + 'the id "' + row.id + '" is used twice for this pet — make each id different.');
        seen[row.id] = true;
      });
    });
  });
})();