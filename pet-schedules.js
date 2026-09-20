/* ===== pet-schedules.js =====
   SINGLE SOURCE OF TRUTH for every pet's vaccination & deworming schedule.

   Both home.html (for the small bell on each pet's box) and every pet's
   own petbox.html page (for the big bell + table there) read from this
   ONE file. That means:
     - You only ever edit a due date / add a vaccine in ONE place.
     - The home.html bell and the petbox.html bell can never fall out of
       sync with each other again.
     - Adding a brand-new pet's reminders is just adding one new object
       below — no hidden <span> lists to hand-copy into home.html anymore.

   ───────────────────────────────────────────────────────────────────
   HOW TO ADD A NEW PET'S SCHEDULE:
   1. Copy one of the blocks below (e.g. the "bruno" block).
   2. Rename the key to the new pet's id — it MUST exactly match:
        - the id used in that pet's <script>window.PET_ID = 'id';</script>
        - the "id=" part of that pet's box link in home.html
   3. Fill in each vaccine / deworming row:
        id     -> unique string, never reused for another row on this pet
        name   -> shown in the table & reminder popup
        due    -> "YYYY-MM-DD"  (the fixed date shown in the table — the
                  owner cannot change it)
   There is no status any more: the owner just ticks the box on the pet's
   own page once it is done, and that tick is remembered in their browser.
   The bell on home.html AND on that pet's own page counts every row that
   is not ticked yet, and pulses once its date has arrived.
   That's it — no other file needs to change.
   ───────────────────────────────────────────────────────────────────
*/

window.PET_SCHEDULES = {

  bruno: {
    vaccination: [
      { id: 'vax-dhppi',   name: 'DHPPi (Core Vaccine)', due: '2026-07-21' },
      { id: 'vax-rabies',  name: 'Rabies',                due: '2026-07-21' },
      { id: 'vax-lepto',   name: 'Leptospirosis',         due: '2026-07-21' },
      { id: 'vax-booster', name: 'Booster Dose',          due: '2026-07-21' }
    ],
    deworming: [
      { id: 'dew-1st',       name: '1st Deworming',        due: '2026-07-21' },
      { id: 'dew-2nd',       name: '2nd Deworming',        due: '2026-07-21' },
      { id: 'dew-quarterly', name: 'Quarterly Deworming',  due: '2026-07-21' }
    ]
  }

  /* Add the next pet right here, e.g.:
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