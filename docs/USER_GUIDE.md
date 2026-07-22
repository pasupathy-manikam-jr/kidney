# Kidney-Love — User Guide

Kidney-Love helps you track kidney-related lab results, medications, diet & fluid,
and symptoms over time — see the trends, understand where your numbers sit on the
standard KDIGO risk map, and walk into each appointment with a clear picture
instead of a pile of paper.

> **Important:** Kidney-Love is a personal tracking tool. It is **not** medical
> advice and does **not** diagnose anything. Reference ranges and suggested
> limits shown are general adult values and vary by lab, age and sex. Always
> confirm every result and target with your lab report and your care team.

---

## 1. Getting started

1. Open the app and click **Get started** to create an account (name, email,
   password).
2. Already registered? Click **Log in**.
3. After signing in you land on the **Dashboard**.

Want to look around first? Sign in with the demo account:

- **Email:** `demo@example.com`
- **Password:** `password`

The demo account is pre-filled with fictional data so every screen is populated.

---

## 2. The dashboard

Your at-a-glance overview:

- **Metric tiles** — the latest value for each lab metric, colour-coded
  (🟢 in range · 🟡 below · 🔴 above), each with a mini **trend line** and the
  change since your last reading.
- **GFR category card** — your latest eGFR mapped to a KDIGO category (G1–G5),
  from *normal* to *kidney failure*.
- **KDIGO risk map** — appears once you have both an **eGFR** and an
  **albuminuria (UACR)** reading, placing you on the standard risk grid
  (Low → Very high).
- **Summary cards** — active medications, today's fluid, and your latest
  symptom, each linking to its section.

If you're brand new, the dashboard shows a short **getting-started card** until
you add your first reading.

---

## 3. Lab results

Go to **Lab Results** in the sidebar (or **Add reading** on the dashboard).

**Add a reading**

1. Pick a **metric** (eGFR, creatinine, BUN, potassium, phosphorus, albuminuria,
   blood pressure, weight).
2. Enter the **value** — the unit is shown for you.
3. Set the **date** the sample was taken, and an optional **note**.
4. Click **Save reading**.

**Edit or delete** — every row in the history table has **Edit** and **Delete**
(with a confirmation prompt so nothing is removed by accident).

**eGFR calculator** — no eGFR on your report? Click **eGFR calculator**, enter
creatinine, age and sex (CKD-EPI 2021, race-free), and use the result as a
reading.

**Trend chart** — pick any metric to see its history as a line chart with a
shaded reference band. Use the **3M / 6M / 1Y / All** buttons to change the time
range.

**Import / Export CSV** — **Export CSV** downloads all your readings; **Import
CSV** bulk-loads them back (same columns). Invalid rows are skipped.

---

## 4. Medications

The **Medications** page keeps your current list.

- Add a medication with **name, dosage, time, frequency** and an optional
  **reminder time** and note.
- **Mark inactive / active** to keep past medications without deleting them.
- **Reminders** — click **Enable reminders** and allow notifications. While the
  app is open in your browser, you'll get a notification at each active
  medication's reminder time. *(Background reminders when the app is closed
  aren't supported yet.)*

---

## 5. Diet & fluid

The **Diet & Fluid** page tracks fluid, sodium, potassium and phosphorus.

- **Today's totals** show each category against its daily target with a progress
  bar (turns red when over).
- **Log intake** — pick a category, enter the amount, add an optional label
  (e.g. "Coffee", "Banana") and date.
- **History chart** — pick any category to see its daily totals as a bar chart,
  with your target drawn as a reference line.
- **Set targets** — set your own daily limits. Leave a field blank to fall back
  to the general suggested value.

---

## 6. Symptoms

The **Symptoms** page is a simple journal.

- Log a **symptom** (quick-pick chips for common ones), a **severity** (1–5) and
  an optional note and date.
- The **severity trend** chart shows how things change over time.

---

## 7. Dialysis (peritoneal dialysis)

For anyone on peritoneal dialysis with a **Tenckhoff catheter**, the **Dialysis**
page tracks the catheter and your exchanges.

- **Catheter details** — record the brand, type, insertion date, and when the
  **transfer set** was last changed. The transfer set (the tubing on the
  catheter) is usually replaced about every 6 months to lower infection risk.
- **Reminder** — the page (and dashboard) shows when the next transfer-set
  change is due, and warns when it's close or overdue.
- **Exchange log** — record each exchange: fill and drain volumes (the app works
  out **ultrafiltration** = drain − fill), the **colour of the drained fluid**,
  and a note.
- **Safety** — clear or pale-straw fluid is normal. **Cloudy** fluid can signal
  infection (peritonitis) and **pink/bloody** fluid can signal bleeding — the app
  flags these in red. Contact your care team promptly for those, or for fever,
  redness, swelling or pain at the exit site.

---

## 8. Reference tables

The **Reference** page lists, in one place:

- Every tracked metric and its general reference range.
- KDIGO **GFR** categories (G1–G5) and **albuminuria** categories (A1–A3).
- The full **risk map** (GFR × albuminuria).

---

## 9. Printable report

The **Report** page pulls everything together for an appointment:

- Latest values, GFR & albuminuria categories, and KDIGO risk.
- Current medications, today's diet & fluid vs targets, and recent symptoms.
- Dialysis catheter and recent exchanges (if you use the Dialysis page).
- Full lab history.

Click **Print / Save PDF** to hand it to your care team or save a copy.

---

## 10. Appearance

Kidney-Love defaults to a calm dark theme. Switch between light, dark or system in
**Settings → Appearance** at any time.

---

## 11. Tips for appointments

- Log results the same day you get them, straight from the lab report.
- Bring the **Report** (or **Dashboard** + **Reference**) to your visit.
- Use notes and the symptom journal to capture context your doctor may ask about.

---

## 12. Sources & further reading

General guidance in the app (reference ranges, KDIGO categories, dialysis colour
cues and the ~6-month transfer-set interval) draws on the sources below. They are
educational references, not personal medical advice — your care team sets your
own targets and schedule.

- [Home Dialysis Central — The Rainbow of PD Effluent Possibilities](https://homedialysis.org/news-and-research/blog/581-the-rainbow-of-peritoneal-dialysis-effluent-possibilities)
- [Dossin et al. — When the colour of PD effluent can be used as a diagnostic tool (Seminars in Dialysis, 2019)](https://pubmed.ncbi.nlm.nih.gov/30032485/)
- [Geeky Medics — Peritoneal Dialysis / Tenckhoff catheter](https://geekymedics.com/peritoneal-dialysis/)
- [Memorial Sloan Kettering — About Your Tenckhoff Catheter](https://www.mskcc.org/cancer-care/patient-education/caring-your-tenckhoff-catheter)
- [KDIGO — Clinical Practice Guidelines](https://kdigo.org/guidelines/)

---

*Kidney-Love is built to support people managing kidney health — it complements,
but never replaces, professional medical care.*
