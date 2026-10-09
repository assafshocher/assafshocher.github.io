# Deep Deep Learning

Static graduate seminar website. Served at /ddl/ by the parent GitHub Pages repository.

Pages: index.html, schedule.html, seminar.html. Downloadable syllabus: assets/syllabus.pdf.
Each selected topic gets two academic hours. Meeting details, dates, course registration fields, assessment weights and presenter assignments remain TBD. No exam.

The reading programme is a candidate pool larger than the course. All candidates have equal status; only selected topics enter the final 13-week schedule. The weekly table currently has TBD for every topic and presenter, with no dates. The pool currently has 19 candidates, including online continual learning. Hypernetworks are consolidated into a TTT comparison, features and circuits form one mechanistic-interpretability candidate, and representation alignment is optional comparison material. Counts on the website and syllabus are generated from the data.

TTT centers on neural memory with an optional hypernetwork comparison; distribution-shift adaptation is an alternative focus, and IT³ is supplementary reading. Mechanistic interpretability uses feature foundations to develop one Circuit Tracing (2025) case. Its optional Platonic-hypothesis comparison connects the hypothesis to Rosetta's unpaired cross-modal alignment (2026), alongside the Aristotelian critique and cautions about canonical features. Online continual learning centers on OCAR (2025), with CLA (2026) as a self-supervised alternative and loss of plasticity as a conceptual companion. Model merging offers Neural Thickets as an alternate focus. KANs, GNNs and convergence theory are candidates narrowed to one central question. Drifting and IMLE share a one-step-generation candidate with alternative focuses. These do not reserve two weeks each. Flow matching is assumed background from the base course.

Everyone completes one shared required pre-reading per selected meeting. Presenters choose it in consultation with the instructor and announce it one week before class. Budget 30–45 minutes for a tutorial, a short paper or specified sections, accompanied by two guiding questions. All students arrive with one question or point of confusion. The main paper is optional for the audience unless chosen as the shared pre-reading; presenters still read it. Specific pre-readings remain TBD, as do slide deadlines and other coordination arrangements.

course.json is the canonical source. It contains:

- parts: topic-family id and title.
- topics: id, part, topic, question, foundations, main, recent and focus. Optional scope describes what fits one session; optional routes contain an alternative title, foundations, main, recent and focus for the same candidate. Optional comparisons contain title, readings and focus for shorter discussion material. Optional aliases list legacy fragment IDs such as topic-hypernetworks to preserve old links after consolidation.
- weeks: week number, selected topic and presenter; topic and presenter remain TBD until assigned.
- duration: the session-duration label, currently Two academic hours.

Edit course.json to update topics, questions, background, main papers, recent developments and presentation scope. Then run:

    python3 scripts/build.py

The generator requires reportlab and updates all three HTML pages, schedule.json and the downloadable PDF together. Commit both the data and generated outputs. HTML is pre-rendered so all readings remain available without JavaScript, including alternative focuses and optional comparisons through native disclosure controls. Search filters the candidate pool and opens matching disclosure controls. Existing week-fragment and consolidated-topic links still reach the relevant candidate card, without assigning that topic to a week. The generator retains the existing SVG artwork.

style.css is adapted from the user's Modern Computer Vision course stylesheet. ddl.css adds seminar-specific components. The SVG artwork is an original vector interpretation of the network-within-a-network concept; the original generated image was unavailable in the conversation export.
