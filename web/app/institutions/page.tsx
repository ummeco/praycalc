import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { PrintPageButton, PrintTableButton } from "@/components/InstitutionsPrint";
import { getMultiYearDates, getCurrentHijriYear, formatDateShort, formatWeekday } from "@/lib/fcna-dates";

export const metadata: Metadata = {
  title: "Islamic Calendar for Institutions | PrayCalc",
  description:
    "FCNA-projected Islamic dates for schools, prisons, hospitals, and workplaces. Ramadan, Eid al-Fitr, Eid al-Adha, and key dates for planning and religious accommodation.",
  openGraph: {
    title: "Islamic Calendar for Institutions | PrayCalc",
    description:
      "FCNA-projected Islamic dates for schools, prisons, hospitals, and workplaces.",
    url: "https://praycalc.com/institutions",
    siteName: "PrayCalc",
    type: "website",
  },
};

// 1446 AH ≈ 2025 Gregorian, 1462 AH ≈ 2040 Gregorian (16 years)
const START_YEAR = 1446;
const END_YEAR = 1462;

export default function InstitutionsPage() {
  const yearData = getMultiYearDates(START_YEAR, END_YEAR - START_YEAR + 1);

  // Auto-detect current Hijri year from today's date using the
  // Umm al-Qura calendar (same calendar the FCNA uses). This means
  // the highlighted "current" row updates automatically each year
  // without any code change — when the Hijri new year arrives
  // (1 Muharram), the highlight shifts to the next row.
  const currentHijriYear = getCurrentHijriYear();

  return (
    <main className="info-page">
      <div className="info-page-inner">
        {/* Header */}
        <div className="info-page-header">
          <Link href="/" className="info-page-back">
            &larr; PrayCalc
          </Link>
          <div className="info-page-title-row">
            <h1 className="info-page-title">Islamic Calendar for Institutions</h1>
            <PrintPageButton />
          </div>
          <div className="info-page-divider" />
          <p className="info-page-intro">
            Around five million Muslims live in the United States, making up
            nearly 2% of the population. Many work, study, receive care, serve
            in the military, or are held in institutional settings where
            schedules, meals, dress codes, and holidays were not specifically
            designed around their needs as a religious minority. This page is
            a practical reference for schools, universities, correctional
            facilities, hospitals, the U.S. military, employers, and
            government agencies that want to understand Islamic religious
            obligations and provide reasonable accommodation, including
            providing dates for Muslims to break their Ramadan fasts with
            pre-dawn and sunset meals. Below you will find a multi-year table
            of key Islamic dates, an explanation of what each date means,
            detailed accommodation guidelines organized by topic, and links
            to authoritative resources from the U.S. government and civil
            rights organizations.
          </p>
        </div>

        {/* Brief context before the table */}
        <section className="info-section">
          <p>
            Muslims observe several religious occasions throughout the year that
            may require schedule adjustments, dietary accommodations, or time
            off. The most significant are <strong>Ramadan</strong> (a month of
            fasting from dawn to sunset) and the two <strong>Eid</strong>{" "}
            holidays. The Islamic calendar is lunar, so these dates shift
            earlier by about 11 days each year. This means Ramadan and Eid do
            not fall on the same Gregorian dates from year to year, and
            institutions need to check the calendar annually.
          </p>
          <p>
            The dates below are projected by the{" "}
            <strong>Fiqh Council of North America (FCNA)</strong> using
            astronomical calculations, and are widely used for advance planning
            across North America. Some Muslim communities follow local moon
            sighting, which may shift dates by one day. The FCNA projections
            provide the best baseline for institutional scheduling.
          </p>
        </section>

        {/* FCNA dates table */}
        <section className="info-section">
          <h2 className="info-h2">
            Key Islamic Dates ({yearData[0].gregorianYear}&ndash;
            {yearData[yearData.length - 1].gregorianYear})
          </h2>
          <div className="info-table-wrap">
            <table className="info-table">
              <thead>
                <tr>
                  <th>Hijri Year</th>
                  <th>Ramadan Begins</th>
                  <th>Last 10 Nights</th>
                  <th>Eid al-Fitr</th>
                  <th>Day of Arafah</th>
                  <th>Eid al-Adha</th>
                  <th>Ashura*</th>
                </tr>
              </thead>
              <tbody>
                {yearData.map((yr) => {
                  const isCurrent = yr.hijriYear === currentHijriYear;
                  const isPast = yr.hijriYear < currentHijriYear;
                  return (
                    <tr
                      key={yr.hijriYear}
                      className={
                        isCurrent
                          ? "info-table-highlight"
                          : isPast
                            ? "info-table-past"
                            : ""
                      }
                    >
                      <td className="info-table-year">
                        {yr.hijriYear}
                        {isCurrent && (
                          <span className="info-table-current">current</span>
                        )}
                      </td>
                      <td>
                        <span className="info-table-day">
                          {formatWeekday(yr.ramadanStart)}
                        </span>
                        {formatDateShort(yr.ramadanStart)}
                      </td>
                      <td>
                        <span className="info-table-day">
                          {formatWeekday(yr.last10Start)}
                        </span>
                        {formatDateShort(yr.last10Start)}
                      </td>
                      <td>
                        <span className="info-table-day">
                          {formatWeekday(yr.eidAlFitr)}
                        </span>
                        {formatDateShort(yr.eidAlFitr)}
                      </td>
                      <td>
                        <span className="info-table-day">
                          {formatWeekday(yr.dayOfArafah)}
                        </span>
                        {formatDateShort(yr.dayOfArafah)}
                      </td>
                      <td>
                        <span className="info-table-day">
                          {formatWeekday(yr.eidAlAdha)}
                        </span>
                        {formatDateShort(yr.eidAlAdha)}
                      </td>
                      <td>
                        <span className="info-table-day">
                          {formatWeekday(yr.ashura)}
                        </span>
                        {formatDateShort(yr.ashura)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="info-table-footer">
            <p className="info-table-source">
              Source:{" "}
              <a
                href="https://fiqhcouncil.org/calendar/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fiqh Council of North America
              </a>
            </p>
            <PrintTableButton />
          </div>
        </section>

        {/* What these dates mean */}
        <section className="info-section">
          <h2 className="info-h2">What Each Date Means</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3 className="info-h3">Ramadan (29-30 days)</h3>
              <p>
                The ninth month of the Islamic calendar. Muslims fast from the
                pre-dawn prayer (Fajr) until sunset (Maghrib) each day. This
                means no food, drink, or smoking during daylight hours. Ramadan
                lasts 29 or 30 days depending on the lunar cycle. Fasting
                Ramadan is one of the five pillars of Islam and is obligatory
                for every adult Muslim who is physically able. Exemptions
                exist for those who are ill, pregnant, nursing, traveling, or
                elderly, but for most Muslims this is a non-negotiable
                religious duty, not an optional practice.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Last 10 Nights</h3>
              <p>
                The final 10 nights of Ramadan hold special significance. They
                include Laylatul Qadr (the Night of Power), considered the
                holiest night of the year. From the Prophetic tradition,
                Muslims increase worship during these nights with extended
                prayers (Taraweeh and Qiyam), and some perform I&apos;tikaf
                (a spiritual retreat in the mosque for the entire last 10
                days). Schedule flexibility during these final days is
                especially appreciated.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Eid al-Fitr</h3>
              <p>
                Marks the end of Ramadan on the 1st of Shawwal. Muslims attend
                a special morning congregational prayer (typically 8-10 AM),
                then celebrate with family and community gatherings. The Eid
                prayer is an obligation for every Muslim. This is one of the
                two most important holidays in Islam. Many families celebrate
                for 2-3 days. Children receive gifts, families visit one
                another, and communities hold large gatherings. It is
                comparable in significance and spirit to major holidays in
                other faith traditions.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Day of Arafah</h3>
              <p>
                The 9th of Dhul Hijjah. Millions of Muslims perform the Hajj
                pilgrimage in Mecca on this day. From the Prophetic tradition,
                Muslims not on Hajj fast this day, as it is considered one
                of the most virtuous fasts of the year. Some employees may be
                traveling for Hajj during the first 10 days of Dhul Hijjah
                (roughly 2-3 weeks including travel). The fast of Arafah is
                not obligatory in the way Ramadan is, but is widely observed.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Eid al-Adha (1 + 3 days)</h3>
              <p>
                The 10th of Dhul Hijjah, the day after Arafah. The second major
                holiday in Islam, commemorating Prophet Ibrahim&apos;s
                (Abraham&apos;s) willingness to sacrifice his son in obedience
                to God. The Eid day itself is followed by 3 Days of Tashreeq
                (11th-13th Dhul Hijjah), during which celebrations and
                additional rituals continue. Fasting is prohibited on Eid day
                and the Days of Tashreeq. The Eid prayer is an obligation.
                Many Muslim families distribute meat to the poor during these
                days as an act of charity.
              </p>
            </div>
            <div className="info-card">
              <h3 className="info-h3">Ashura</h3>
              <p>
                The 10th of Muharram, the first month of the Islamic year.
                From the Prophetic tradition, Muslims fast on this day (and
                the day before or after it), commemorating the day God saved
                the Children of Israel from Pharaoh. The fast of Ashura is
                not obligatory but is widely observed. It is a single day and
                generally does not require institutional accommodation beyond
                awareness.
              </p>
            </div>
          </div>

          <p className="info-section-spacer">
            Of these dates, Ramadan and the two Eid holidays are the ones most
            likely to require institutional accommodation. Ramadan affects daily
            schedules for an entire month, while the Eid holidays carry the
            same religious weight as major holidays in any faith tradition.
            The Eid prayers on both holidays are obligatory and take place in
            the morning. Just as institutions would not schedule a mandatory
            event during a major religious holiday, they should avoid doing
            so on Eid. The Day of Arafah and Ashura involve a single day of
            fasting and are highly recommended rather than obligatory, but
            awareness and flexibility are always appreciated.
          </p>
          <p className="info-footnote">
            * Technically Ashura falls in the next Hijri year but is listed
            here for convenience, as it typically occurs weeks after Eid
            al-Adha.
          </p>
        </section>

        {/* How the calendar works */}
        <section className="info-section">
          <h2 className="info-h2">Understanding the Islamic Calendar</h2>
          <p>
            The Islamic (Hijri) calendar is a purely lunar calendar with 12
            months of 29 or 30 days each. A Hijri year is about 354 days,
            roughly 11 days shorter than the Gregorian (solar) year. This is why
            Ramadan and the Eid holidays shift earlier by about 11 days each
            year, cycling through all four seasons over a period of about 33
            years. Islamic dates cannot be memorized as fixed calendar dates.
            Institutions need to consult the table above (or a resource like
            this page) each year to plan ahead.
          </p>
          <p>
            The dates in the table above are calculated astronomically by the
            Fiqh Council of North America (FCNA), which pre-announces Islamic
            dates years in advance. Traditionally, some communities begin each
            lunar month based on physical sighting of the new crescent moon
            after sunset. This practice can cause the actual observed date to
            shift by one day from the calculated date. For planning purposes,
            the FCNA calendar provides the certainty that institutions need to
            schedule around these dates, and any shift from moon sighting would
            only be by a single day.
          </p>
          <p>
            Because the calendar shifts every year, institutions should
            bookmark this page or print the table above and distribute it
            to scheduling staff, chaplains, dietary coordinators, and human
            resources departments at the start of each academic or fiscal year.
          </p>
        </section>

        {/* Accommodation guidelines */}
        <section className="info-section">
          <h2 className="info-h2">Accommodation Guidelines</h2>
          <p>
            The standard American calendar was not built with Islam in mind.
            The weekly congregational day for Muslims is Friday (not Sunday),
            and the two major holidays (Eid al-Fitr and Eid al-Adha) are not
            recognized as national days off. This does not mean institutions
            need to restructure their entire calendar, but it does mean that
            the same spirit of accommodation already extended to other faith
            traditions should be extended to Muslims as well. In most cases,
            the accommodation is straightforward: an excused absence, a
            schedule swap, a halal meal option, or access to a quiet room for
            a few minutes of prayer. Federal law requires reasonable
            accommodation of sincerely held religious beliefs under Title VII
            of the Civil Rights Act (for employers), RLUIPA (for correctional
            and government institutions), and the First Amendment (for public
            schools and the military).
          </p>

          <div className="info-grid info-grid--single">
            <div className="info-card">
              <h3 className="info-h3">During Ramadan</h3>
              <ul className="info-list">
                <li>
                  Fasting is obligatory during Ramadan for all adult Muslims who
                  are physically able. Those fasting will not eat or drink
                  anything from the pre-dawn prayer (Fajr) until sunset
                  (Maghrib). This is not optional or casual; it is one of the
                  five pillars of Islam.
                </li>
                <li>
                  Avoid scheduling mandatory meals, food-related events, taste
                  tests, or cooking activities during fasting hours. If a
                  team lunch or food event is planned, allow fasting
                  individuals to opt out without explanation or stigma.
                </li>
                <li>
                  Consider flexible scheduling for exams, physical fitness
                  tests, strenuous labor, or other demanding activities. Late
                  afternoon is typically the most challenging period for those
                  fasting, especially during summer months when fasting days
                  can exceed 16 hours.
                </li>
                <li>
                  The pre-dawn meal (<strong>Suhoor</strong>) must be eaten
                  before the Fajr prayer time. Fajr can be as early as 3:30 AM
                  in summer or as late as 6:00 AM in winter. The fast-breaking
                  meal (<strong>Iftar</strong>) happens immediately at sunset
                  (Maghrib time), which shifts daily. These times do not align
                  with standard institutional meal schedules. Use{" "}
                  <Link href="/">PrayCalc</Link> to look up the exact Fajr
                  and Maghrib times for your location on any given date.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> Suhoor and Iftar
                  timing is the single most common accommodation issue in
                  prisons during Ramadan. Suhoor must be provided before the
                  Fajr time printed on that day&apos;s schedule, not at a
                  generic early hour. If Fajr is at 4:12 AM, the meal must be
                  available before 4:12 AM. Similarly, Iftar must be available
                  at the actual Maghrib (sunset) time, not held until the next
                  scheduled meal service. Many facilities use bag meals or
                  pre-packaged trays that can be distributed at the correct
                  times without requiring the full kitchen to operate. The
                  Federal Bureau of Prisons (BOP) policy (P5360.09) requires
                  that institutions accommodate Ramadan fasting, including
                  adjusted meal times. From the Prophetic tradition, Muslims break
                  their fast with three dates and water before the meal.
                  State departments of corrections generally follow similar
                  guidelines, and federal courts have consistently upheld the
                  right to Ramadan accommodation under RLUIPA.
                </li>
                <li>
                  <strong>Hospitals and care facilities:</strong> Patients who
                  choose to fast during Ramadan should not be pressured to eat
                  during daylight hours unless there is a specific medical
                  contraindication that their physician has explained to them.
                  Suhoor trays should be available before Fajr, and Iftar
                  trays at Maghrib. Muslim patients who are too ill to fast
                  are Islamically exempt and should be informed of this if
                  they seem unaware.
                </li>
                <li>
                  <strong>Schools and universities:</strong> Boarding students
                  need early kitchen access or pre-packaged Suhoor before Fajr
                  and Iftar provisions at sunset. Day students will be fasting
                  during school hours and may have lower energy levels,
                  especially in afternoon classes. Cafeterias can help by
                  offering to-go options or a designated Iftar space.
                </li>
                <li>
                  <strong>Employers:</strong> Fasting employees can continue
                  normal work duties. Flexibility on break times (shifting a
                  lunch break to sunset for Iftar, or arriving slightly later
                  to accommodate Taraweeh prayers the night before) is helpful
                  and usually easy to arrange. Do not question whether an
                  employee is &quot;really fasting&quot; or pressure them to
                  eat at team events.
                </li>
                <li>
                  <strong>U.S. Military:</strong> Department of Defense
                  Instruction 1300.17 requires that military commanders
                  accommodate religious practices unless accommodation would
                  adversely affect military readiness, unit cohesion, or
                  good order and discipline. Muslim service members who fast
                  during Ramadan may need adjusted PT schedules, access to
                  Suhoor before Fajr, and Iftar at sunset. During deployments
                  or field exercises, commanders should work with unit
                  chaplains to find workable solutions. The military has
                  accommodated Ramadan fasting for decades, and established
                  procedures exist at most installations.
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">For Eid Holidays</h3>
              <ul className="info-list">
                <li>
                  Both Eid al-Fitr and Eid al-Adha begin with a special
                  congregational prayer in the morning (typically 8-10 AM).
                  This prayer is an obligation, not optional. It is followed
                  by family and community gatherings that last the rest of the
                  day. For observant Muslims, missing Eid prayer is not an
                  option any more than missing work on a day they are
                  scheduled.
                </li>
                <li>
                  Most Muslims consider at least the first day of each Eid a
                  major holiday. Eid al-Adha is followed by 3 additional Days
                  of Tashreeq (11th-13th Dhul Hijjah), and many families
                  observe 2-4 total days of celebration.
                </li>
                <li>
                  Excused absences for Eid should be treated the same way
                  institutions already handle other major religious holidays.
                  If employees or students receive time off for recognized
                  holidays without using personal or vacation days, the same
                  courtesy should be extended for the two Eids.
                </li>
                <li>
                  Avoid scheduling exams, hearings, mandatory meetings,
                  deadlines, disciplinary reviews, or important events on Eid
                  days. If truly unavoidable, provide make-up opportunities
                  without penalty.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> Incarcerated
                  Muslims should be allowed to attend Eid congregational
                  prayer if a Muslim chaplain or volunteer leads it. Where no
                  imam is available, inmates should be permitted to pray
                  together in a designated space. Eid meals should reflect the
                  celebratory nature of the day where possible. Many
                  facilities already provide special meals for Thanksgiving
                  and other holidays; the same practice should extend to Eid.
                  The BOP and most state DOCs recognize both Eids as
                  authorized religious holy days.
                </li>
                <li>
                  <strong>U.S. Military:</strong> DoD Instruction 1300.17
                  provides for religious holiday accommodation. Muslim service
                  members should be granted pass or liberty on Eid days when
                  mission requirements allow. Unit commanders should plan
                  around known Eid dates (listed in the table above) the same
                  way they plan around other recognized holidays.
                </li>
                <li>
                  <strong>Schools:</strong> Eid absences should be treated as
                  excused religious absences. Some school districts have added
                  Eid to their official holiday calendars (New York City,
                  Montgomery County MD, and others). Even where Eid is not an
                  official school holiday, individual student absences for Eid
                  should carry no penalty.
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">Daily Prayers</h3>
              <ul className="info-list">
                <li>
                  Muslims pray five times daily at times determined by the
                  sun&apos;s position: before sunrise (Fajr), midday (Dhuhr),
                  afternoon (Asr), sunset (Maghrib), and evening (Isha). Each
                  prayer takes about 5-10 minutes and requires a clean, quiet
                  space and a small area to stand, bow, and prostrate (roughly
                  the size of a yoga mat). Daily prayer is one of the five
                  pillars of Islam and is obligatory.
                </li>
                <li>
                  A clean room, empty office, library study room, or any
                  designated quiet area is sufficient. Restrooms are not
                  appropriate as a prayer space. No special equipment is
                  needed; many Muslims carry a small prayer rug. The space
                  does not need to be dedicated exclusively to prayer; any
                  clean, quiet room that is available for 10 minutes at a
                  time is enough.
                </li>
                <li>
                  Muslims perform a brief washing ritual (wudu) before prayer,
                  using running water to wash hands, face, arms to the elbows,
                  and feet. Access to a sink or restroom before prayer time
                  is sufficient. This takes about 1-2 minutes.
                </li>
                <li>
                  The Friday midday prayer (Jumu&apos;ah) is a congregational
                  obligation for Muslim men and highly recommended for women.
                  It replaces the regular Dhuhr prayer and typically runs
                  12:30-1:30 PM. Attendees may need 60-90 minutes total,
                  including travel to and from a mosque if no on-site prayer
                  space exists.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> Muslim inmates
                  have a constitutional right to daily prayers and Friday
                  congregational prayer (Jumu&apos;ah). Facilities should
                  provide a clean prayer space and allow group Friday prayer
                  with a chaplain or volunteer imam. Prayer times shift daily
                  with the sun, so movement and count schedules may need to
                  accommodate prayer windows. The BOP designates Friday
                  Jumu&apos;ah as a required religious program. State
                  facilities should provide equivalent access. Courts have
                  consistently held that denying Jumu&apos;ah without a
                  compelling security justification violates RLUIPA.
                </li>
                <li>
                  <strong>Schools:</strong> During the school day, the Dhuhr
                  (midday) prayer will typically fall during school hours. A
                  5-minute accommodation during lunch or a free period is
                  usually sufficient. In winter months, Asr (afternoon prayer)
                  may also fall before dismissal. Public schools are
                  constitutionally required to permit student-initiated prayer
                  that does not disrupt instruction.
                </li>
                <li>
                  <strong>Employers:</strong> Most employers already allow
                  short breaks during the day. A Muslim employee using a few
                  minutes for prayer is comparable to any other short break.
                  Providing a quiet space (even a seldom-used conference room
                  or storage room) makes this simple. For Friday Jumu&apos;ah,
                  a flexible lunch break or a minor schedule adjustment is
                  usually all that is needed.
                </li>
                <li>
                  <strong>U.S. Military:</strong> Military chaplains coordinate
                  prayer spaces and Friday Jumu&apos;ah services on most
                  installations. During field exercises or deployments,
                  commanders should allow Muslim service members a few minutes
                  for prayer when operationally feasible. Prayer does not
                  require any equipment beyond a clean surface and takes only
                  a few minutes.
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">Dietary Needs (Year-Round)</h3>
              <ul className="info-list">
                <li>
                  Muslims follow halal dietary guidelines year-round, not just
                  during Ramadan. Pork and pork-derived products (gelatin,
                  lard, certain enzymes, and any pork byproducts) are always
                  prohibited. Alcohol is always prohibited. Meat must come
                  from an animal slaughtered according to Islamic guidelines
                  (similar to kosher requirements).
                </li>
                <li>
                  Kosher-certified food is generally acceptable as a substitute
                  when halal options are unavailable, because kosher
                  slaughter requirements are similar to halal. Vegetarian and
                  seafood options are always halal-safe alternatives.
                </li>
                <li>
                  Clearly labeling ingredients in cafeterias, dining halls, and
                  commissaries helps Muslim individuals identify suitable
                  options without needing to ask each time. Labels should
                  call out pork, alcohol, and animal-derived gelatin.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> Halal meal options
                  should be available as a standing dietary accommodation, not
                  something inmates have to repeatedly request or file
                  grievances to obtain. The Federal Bureau of Prisons
                  maintains a Religious Diet Program that includes a halal
                  option. Many state DOCs contract with food service providers
                  who offer halal-certified meal plans. At minimum, a
                  no-pork diet with vegetarian or seafood protein sources
                  satisfies basic requirements. Commissary items should also
                  be reviewed to ensure halal options are available for
                  purchase. Cross-contamination (cooking halal meals in the
                  same pans used for pork without washing) should be avoided.
                </li>
                <li>
                  <strong>Hospitals and care facilities:</strong> Halal dietary
                  restrictions should be recorded in the patient&apos;s chart
                  on admission, similar to allergy or kosher dietary notes.
                  Meal services should flag halal trays automatically rather
                  than requiring the patient to reject non-halal food at each
                  meal.
                </li>
                <li>
                  <strong>Schools:</strong> If the cafeteria regularly serves
                  pork products (hot dogs, pepperoni pizza, ham, bacon), a
                  clearly labeled non-pork alternative should be available
                  at every meal. Muslim students should not be put in a
                  position of having no lunch option. For younger children,
                  teachers and cafeteria staff should be aware that the
                  student cannot eat pork, as young children may not always
                  know which foods contain it.
                </li>
                <li>
                  <strong>U.S. Military:</strong> Military dining facilities
                  (DFACs) increasingly offer halal MREs and halal-certified
                  meal options. The DoD Chaplain&apos;s Religious
                  Requirements and Practices manual lists halal dietary
                  requirements. During deployments, commanders should ensure
                  halal rations are available. Base DFACs should label menu
                  items that contain pork.
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">Hajj Travel</h3>
              <ul className="info-list">
                <li>
                  The Hajj pilgrimage to Mecca occurs during the first 10 days
                  of Dhul Hijjah (the month containing Eid al-Adha). It is a
                  once-in-a-lifetime obligation for Muslims who are physically
                  and financially able, and is one of the five pillars of
                  Islam.
                </li>
                <li>
                  Employees or students performing Hajj typically need 2-3
                  weeks off, including international travel. This period can be
                  estimated from the Eid al-Adha date in the table above
                  (roughly 2 weeks before Eid al-Adha through a few days
                  after).
                </li>
                <li>
                  Most Muslims perform Hajj only once in their lifetime, so
                  this is not an annual request. When an employee or student
                  does make this request, it carries enormous religious
                  significance. It is comparable to a once-in-a-lifetime
                  religious pilgrimage in any faith tradition.
                </li>
                <li>
                  <strong>U.S. Military:</strong> DoD policy allows leave for
                  religious pilgrimages. Muslim service members planning Hajj
                  should coordinate with their chain of command and unit
                  chaplain well in advance. The dates are predictable years
                  ahead using the table on this page.
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">Dress and Modesty</h3>
              <ul className="info-list">
                <li>
                  Some Muslim women wear a headscarf (hijab) as a religious
                  obligation. Dress code and uniform policies must accommodate
                  religious head coverings. This is protected under Title VII
                  of the Civil Rights Act, and the Supreme Court affirmed this
                  in EEOC v. Abercrombie &amp; Fitch (2015).
                </li>
                <li>
                  From the Prophetic tradition, many Muslim men keep a beard.
                  Grooming policies should accommodate religiously motivated
                  beards unless there is a genuine, documented safety concern
                  (such as certain respirator-fit requirements). Even in those
                  cases, alternatives (such as tight-fitting respirators
                  designed for bearded users) should be explored before
                  denying the accommodation.
                </li>
                <li>
                  Muslim men and women may prefer not to participate in
                  mixed-gender physical activities, particularly those
                  involving close physical contact or swimwear. Where possible,
                  provide same-gender alternatives for swimming, physical
                  education, or fitness requirements.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> Female Muslim
                  inmates may request to keep their hijab. The BOP and many
                  state DOCs permit religious head coverings that do not pose
                  a security risk. Strip searches and pat-downs should be
                  conducted by same-gender staff, which is already standard
                  practice in most facilities, but is especially important
                  for Muslim inmates who observe modesty as a religious duty.
                  Male Muslim inmates may request to keep a beard; courts have
                  ruled under RLUIPA (Holt v. Hobbs, 2015) that blanket bans
                  on beards in prisons violate religious freedom when less
                  restrictive alternatives exist.
                </li>
                <li>
                  <strong>U.S. Military:</strong> The DoD has increasingly
                  approved religious accommodation requests for hijab, beards,
                  and turbans. Army Directive 2017-03 and subsequent updates
                  established a process for requesting religious
                  accommodation for grooming and appearance standards. Muslim
                  service members may apply for a beard waiver and hijab
                  accommodation through their chain of command.
                </li>
                <li>
                  <strong>Schools:</strong> Students have a constitutional
                  right to wear hijab in public schools. School dress codes
                  that ban head coverings must include a religious exemption.
                  Physical education dress codes should accommodate modesty
                  requirements (long sleeves, leggings, sports hijab).
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">Religious Materials and Property</h3>
              <ul className="info-list">
                <li>
                  Muslims may carry a small copy of the Quran, prayer beads
                  (misbaha/tasbih), and a prayer rug. These items should be
                  permitted wherever personal religious items from other
                  traditions (Bible, rosary, yarmulke) are allowed.
                </li>
                <li>
                  The Quran holds special significance and should be handled
                  respectfully. It should not be placed on the floor, stacked
                  under other books, or handled in a deliberately disrespectful
                  manner. During searches or inspections, staff should handle
                  the Quran the same way they would handle any sacred text.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> The BOP Religious
                  Beliefs and Practices policy (P5360.09) lists authorized
                  religious property for Muslim inmates, including a Quran,
                  prayer rug, kufi (prayer cap), and prayer beads. These items
                  should not be confiscated absent a specific, documented
                  security concern with that individual item. Access to Islamic
                  books and educational materials through the library or
                  chaplain&apos;s office supports rehabilitation and should
                  be facilitated.
                </li>
                <li>
                  <strong>Hospitals:</strong> Muslim patients may wish to have
                  a Quran, prayer rug, or compass (to determine the prayer
                  direction toward Mecca) at their bedside. These should be
                  permitted as personal religious items.
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-h3">End-of-Life and Burial</h3>
              <ul className="info-list">
                <li>
                  From the Prophetic tradition, burial should take place as
                  soon as possible after death, ideally within 24 hours.
                  Hospitals and morgues should be prepared to release the body
                  promptly when the family requests it.
                </li>
                <li>
                  The body is washed (ghusl) according to Islamic rites by
                  same-gender Muslims, then wrapped in plain white cloth
                  (kafan) without embalming. Autopsy should be avoided unless
                  legally required, and the family should be consulted.
                </li>
                <li>
                  <strong>Correctional facilities:</strong> When a Muslim
                  inmate passes away, the facility should contact a local imam
                  or Islamic organization to assist with the ghusl and janazah
                  (funeral prayer). The BOP recognizes Islamic burial
                  requirements. The body should be released to the family or
                  Islamic organization as quickly as possible.
                </li>
                <li>
                  <strong>Hospitals:</strong> If a Muslim patient is
                  terminally ill, the family may wish for a chaplain or imam
                  to visit. After death, the body should ideally remain
                  covered and not be left unattended. Staff should ask the
                  family about their wishes regarding washing, autopsy, and
                  organ donation.
                </li>
              </ul>
            </div>
          </div>

          <p className="info-section-spacer">
            These guidelines are not exhaustive, and individual needs vary.
            The best approach is to ask Muslim community members directly about
            their specific needs. Most will appreciate even basic awareness of
            these practices, and accommodations do not need to be elaborate to
            be meaningful. The core principle is straightforward: the same
            understanding and flexibility already extended to members of other
            faith traditions should be extended to Muslims as well. A quiet
            room for prayer, awareness of Eid dates, sensitivity during
            Ramadan, and a halal meal option go a long way toward creating an
            inclusive environment. These accommodations are also a legal
            obligation under Title VII of the Civil Rights Act, the Religious
            Freedom Restoration Act, RLUIPA, and the First Amendment.
          </p>
        </section>

        {/* Additional resources */}
        <section className="info-section">
          <h2 className="info-h2">Additional Resources</h2>
          <p>
            The following organizations and government agencies provide
            detailed guidance on religious accommodation in institutional
            settings. Many of these resources include specific references to
            Islamic practices, template accommodation request letters, and
            legal standards that institutions are required to meet.
          </p>
          <ul className="info-resource-list">
            <li>
              <a
                href="https://www.eeoc.gov/laws/guidance/section-12-religious-discrimination"
                target="_blank"
                rel="noopener noreferrer"
              >
                U.S. Equal Employment Opportunity Commission (EEOC)
              </a>{" "}
              &mdash; Section 12: Religious Discrimination. Covers employer
              obligations for reasonable accommodation of religious practices,
              including prayer breaks, religious dress, dietary needs, and
              holiday observance. Applies to employers with 15 or more
              employees.
            </li>
            <li>
              <a
                href="https://www2.ed.gov/policy/gen/guid/religionandschools/prayer_guidance.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                U.S. Department of Education
              </a>{" "}
              &mdash; Guidance on constitutionally protected prayer and
              religious expression in public elementary and secondary schools.
              Clarifies that students may pray individually or in groups during
              non-instructional time, wear religious clothing, and be absent
              for religious observances.
            </li>
            <li>
              <a
                href="https://www.cair.com/know-your-rights/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Council on American-Islamic Relations (CAIR)
              </a>{" "}
              &mdash; Know Your Rights guides for Muslim employees, students,
              travelers, and community members. Includes template
              accommodation request letters for employers and schools,
              legal fact sheets, and contact information for reporting
              discrimination.
            </li>
            <li>
              <a
                href="https://www.justice.gov/crt/religious-land-use-and-institutionalized-persons-act"
                target="_blank"
                rel="noopener noreferrer"
              >
                U.S. Department of Justice &mdash; RLUIPA
              </a>{" "}
              &mdash; Religious Land Use and Institutionalized Persons Act.
              Protects the religious exercise of persons confined to
              correctional facilities, psychiatric hospitals, and other
              government institutions. Facilities must demonstrate a
              compelling interest before substantially burdening religious
              practice.
            </li>
            <li>
              <a
                href="https://www.bop.gov/policy/progstat/5360.009_cn-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Federal Bureau of Prisons (BOP) &mdash; P5360.09
              </a>{" "}
              &mdash; Religious Beliefs and Practices policy. Lists authorized
              religious property, dietary accommodation (including halal and
              Ramadan meal adjustments), holy day observance, and religious
              programming requirements for all faith groups in federal
              institutions.
            </li>
            <li>
              <a
                href="https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/130017p.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                DoD Instruction 1300.17
              </a>{" "}
              &mdash; Accommodation of Religious Practices Within the Military
              Services. Establishes the policy and procedures for requesting
              accommodation of religious practices in the U.S. Armed Forces,
              including dietary needs, grooming standards, prayer, holy days,
              and religious dress.
            </li>
            <li>
              <a
                href="https://www.interfaithalliance.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Interfaith Alliance
              </a>{" "}
              &mdash; Resources for understanding religious diversity in
              schools, workplaces, and communities. Offers guides for
              educators and administrators on creating inclusive environments
              for students of all faith backgrounds.
            </li>
          </ul>
        </section>

        {/* Prayer times link */}
        <section className="info-section info-section--cta">
          <h2 className="info-h2">Need Prayer Times for Your Location?</h2>
          <p>
            PrayCalc provides accurate prayer times for any city worldwide,
            including the exact Fajr (pre-dawn) and Maghrib (sunset) times
            needed for Suhoor and Iftar meal scheduling during Ramadan. Share
            a direct link with Muslim students, employees, inmates, patients,
            or community members so they can check daily prayer times for
            their location.
          </p>
          <p>
            Correctional facilities, hospitals, and military installations can
            use PrayCalc to generate a full month of prayer times for their
            coordinates, making it easy for chaplains, dietary coordinators,
            and unit leaders to plan Ramadan meal schedules and daily prayer
            accommodation in advance.
          </p>
          <Link href="/" className="info-cta-btn">
            Find Prayer Times
          </Link>
        </section>
      </div>

      <Footer />
    </main>
  );
}
