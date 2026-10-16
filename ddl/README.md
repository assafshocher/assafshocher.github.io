# Deep Deep Learning

Static graduate seminar website. Served at /ddl/ by the parent GitHub Pages repository.

Pages: index.html, schedule.html, seminar.html. Downloadable syllabus: assets/syllabus.pdf.
Each selected topic gets two academic hours. Meeting details, dates, course registration fields, assessment weights and presenter assignments remain TBD. No exam.

The reading programme is a candidate pool larger than the course. All candidates remain available; only selected topics enter the final 13-week schedule. Weeks 10 and 11 are assigned to the units-of-analysis debate and circuit tracing respectively; all other topics, all presenters and all dates remain TBD. Every candidate has a consecutive number for discussion, independent of the week it might eventually be assigned. The website and PDF list candidates in topic-number order, without priority rankings or recommendations. The current pool is numbered 1–18; renumber consecutively when the pool changes. Counts on the website and syllabus are generated from the data.

Each candidate supplies one coherent reading bundle: foundations, a central paper, recent developments and presentation scope. Related work is combined where it supports one question; directions that need their own seminar have separate candidate entries. Individual supplementary papers can remain in the bundle without becoming a second full presentation. Flow matching is assumed background from the base course.

The current pool has 18 candidates, numbered consecutively. Topic #1 covers NTK, feature learning and μP; #2 covers convergence with a brief stability comparison; #17 combines GNN expressivity and geometry. Relevant symmetry background is integrated into weight-space learning (#10). Muon, KANs and RL reasoning are removed. Legacy topic fragment links remain supported, but numeric search always uses the current enumeration. Main readings and scopes fit one two-academic-hour seminar. TTT retains the original Sun et al. background, recurrent TTT and long-context work; IT³ remains supplementary. Topic #18 adds Stop-Gradient, Games, and Learning Dynamics, with selected core readings from Differentiable Game Mechanics, Smooth Markets and StopGrads, and optional SimSiam, Dual Perspectives and Drifting Fields extensions. Smooth Markets Section 5.2 supplies the Lyapunov-like argument; quasipotentials are distinguished but not assigned. Weeks 10–11 use topics #12–13: the Goodfire debate followed by circuit tracing. Goodfire is explicitly a fresh, provisional hypothesis, not established consensus. Topic #12 pairs Toy Models of Superposition and Scaling Monosemanticity with the essay and optional Leask et al. critique; #13 retains Circuit Tracing and makes the choice of units explicit.

Everyone completes one shared required pre-reading per selected meeting. Presenters choose it in consultation with the instructor and announce it one week before class. Budget 30–45 minutes for a tutorial, a short paper or specified sections, accompanied by two guiding questions. All students arrive with one question or point of confusion. The main paper is optional for the audience unless chosen as the shared pre-reading; presenters still read it. Specific pre-readings remain TBD, as do slide deadlines and other coordination arrangements.

course.json is the canonical source. It contains:

- parts: topic-family id and title.
- topics: id, number, part, topic, question, foundations, main, recent and focus. number is an explicit positive integer, unique across the pool; use consecutive numbers from 1 through the candidate count. Optional scope describes what fits one session. Optional aliases list legacy fragment IDs to preserve old links after topic revisions. Optional reading_labels overrides the three reading headings; pre_reading suggests an audience assignment with guiding questions, and reading_note states guarantee boundaries. These fields render in both HTML and PDF.
- weeks: week number, selected topic, optional topic_id linking to a reading bundle, and presenter. Weeks 10–11 are assigned; other topics, dates and all presenters remain TBD.
- duration: the session-duration label, currently Two academic hours.
- numbering_note: explains candidate references, student choice and the partially assigned schedule.

Edit course.json to update topics, questions, background, main papers, recent developments and presentation scope. Then run:

    python3 scripts/build.py

The generator requires reportlab and updates all three HTML pages, schedule.json and the downloadable PDF together. It validates that candidate numbers run consecutively from 1 through the candidate count. Commit both the data and generated outputs. HTML is pre-rendered in topic-number order, so every reading bundle remains visible without JavaScript. Search filters the pool by text or an exact candidate number, such as #7, topic 7 or 7. Family links filter the index and cards while preserving topic-number order, and search combines with that filter. All topics resets both filters. Existing topic, week-fragment and legacy-topic links reveal their destination even after filtering, without assigning that topic to a week. The course homepage uses assets/neural-math.webp, a generated mathematical cutaway illustration shared with the teaching-page teaser. The small SVG mark remains the navigation icon.

style.css is adapted from the user's Modern Computer Vision course stylesheet. ddl.css adds seminar-specific components. The course hero is a generated illustration of a neural network opening into geometric transformations and a loss landscape. The original SVG hero is retained as an unused prior asset.
