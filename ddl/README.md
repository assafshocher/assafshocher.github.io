# Deep Deep Learning

Static graduate seminar website. Served at /ddl/ by the parent GitHub Pages repository.

Pages: index.html, schedule.html, seminar.html. Downloadable syllabus: assets/syllabus.pdf.
Each selected topic gets two academic hours. Meeting details, dates, course registration fields, assessment weights and presenter assignments remain TBD. No exam.

The reading programme is a candidate pool larger than the course. All candidates have equal status; only selected topics enter the final 13-week schedule. The weekly table currently has TBD for every topic and presenter, with no dates. Every candidate has an explicit stable number for discussion, independent of the week it might eventually be assigned. Counts on the website and syllabus are generated from the data.

Each candidate supplies one coherent reading bundle: foundations, a central paper, recent developments and presentation scope. Related work is combined where it supports one question; directions that need their own seminar have separate candidate entries. Individual supplementary papers can remain in the bundle without becoming a second full presentation. Flow matching is assumed background from the base course.

The current pool has 23 numbered candidates. Central Flows, Platonic/Rosetta alignment and GNN over-squashing have their own questions and entries. Hypernetworks now develops permutation symmetry and learning in weight space through Maron's coauthored DWSNets, expressivity and SHINE papers, with Doc-to-LoRA as supporting application reading. Neural Thickets anchors the pretrained-neighborhood bundle alongside task arithmetic and model merging. Drifting/IMLE and OCAR/CLA each remain connected bundles. TTT retains the original Sun et al. background, recurrent TTT and end-to-end long-context work; IT³ remains supplementary.

Everyone completes one shared required pre-reading per selected meeting. Presenters choose it in consultation with the instructor and announce it one week before class. Budget 30–45 minutes for a tutorial, a short paper or specified sections, accompanied by two guiding questions. All students arrive with one question or point of confusion. The main paper is optional for the audience unless chosen as the shared pre-reading; presenters still read it. Specific pre-readings remain TBD, as do slide deadlines and other coordination arrangements.

course.json is the canonical source. It contains:

- parts: topic-family id and title.
- topics: id, number, part, topic, question, foundations, main, recent and focus. number is an explicit positive integer, unique across the pool; retain it when editing or reordering a candidate. Optional scope describes what fits one session. Optional aliases list legacy fragment IDs to preserve old links after topic revisions.
- weeks: week number, selected topic and presenter; topic and presenter remain TBD until assigned.
- duration: the session-duration label, currently Two academic hours.

Edit course.json to update topics, questions, background, main papers, recent developments and presentation scope. Then run:

    python3 scripts/build.py

The generator requires reportlab and updates all three HTML pages, schedule.json and the downloadable PDF together. It validates that all candidate numbers are positive and unique. Commit both the data and generated outputs. HTML is pre-rendered so every reading bundle remains visible without JavaScript. Search filters the pool by text or an exact candidate number, such as #7, topic 7 or 7. Existing week-fragment and legacy-topic links still reach the relevant candidate card, without assigning that topic to a week. The generator retains the existing SVG artwork.

style.css is adapted from the user's Modern Computer Vision course stylesheet. ddl.css adds seminar-specific components. The SVG artwork is an original vector interpretation of the network-within-a-network concept; the original generated image was unavailable in the conversation export.
