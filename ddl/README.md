# Deep Deep Learning

Static graduate seminar website. Served at /ddl/ by the parent GitHub Pages repository.

Pages: index.html, schedule.html, seminar.html. Downloadable syllabus: assets/syllabus.pdf.
Each selected topic gets two academic hours. Meeting details, dates, course registration fields, assessment weights and presenter assignments remain TBD. No exam.

The reading programme is a candidate pool larger than the course. All candidates have equal status; only selected topics enter the final 13-week schedule. The weekly table currently has TBD for every topic and presenter, with no dates. TTT offers neural-memory and distribution-shift adaptation focuses within one candidate; IT³ is supplementary reading. Model merging offers Neural Thickets as an alternate focus. KANs, GNNs and convergence theory are additional candidates, each narrowed to one central question. Drifting and IMLE share a one-step-generation candidate with alternative focuses. These do not reserve two weeks each. Flow matching is assumed background from the base course.

course.json is the canonical source. It contains:

- parts: topic-family id and title.
- topics: id, part, topic, question, foundations, main, recent and focus. Optional scope describes what fits one session; optional routes contain an alternative title, foundations, main, recent and focus for the same candidate.
- weeks: week number, selected topic and presenter; topic and presenter remain TBD until assigned.
- duration: the session-duration label, currently Two academic hours.

Edit course.json to update topics, questions, background, main papers, recent developments and presentation scope. Then run:

    python3 scripts/build.py

The generator requires reportlab and updates all three HTML pages, schedule.json and the downloadable PDF together. Commit both the data and generated outputs. HTML is pre-rendered so all readings remain available without JavaScript, including alternative focuses through native disclosure controls. Search filters the candidate pool and opens matching alternative readings. Existing week-fragment links still reach their former topic's candidate card, without assigning that topic to the week. The generator retains the existing SVG artwork.

style.css is adapted from the user's Modern Computer Vision course stylesheet. ddl.css adds seminar-specific components. The SVG artwork is an original vector interpretation of the network-within-a-network concept; the original generated image was unavailable in the conversation export.
