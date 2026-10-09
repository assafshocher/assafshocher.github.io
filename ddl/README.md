# Deep Deep Learning

Static graduate seminar website. Served at /ddl/ by the parent GitHub Pages repository.

Pages: index.html, schedule.html, seminar.html. Downloadable syllabus: assets/syllabus.pdf.
All meeting details, dates, course registration fields, assessment weights and presenter assignments remain TBD. No exam.

The 13-week program has separate sessions for original TTT and IT³, TTT as neural memory, Drifting Models, and IMLE / ROMS-IMLE. Diffusion language models, Muon and RL reasoning are complete optional reading bundles. Flow matching is assumed background from the base course.

Edit course.json to update topics, questions, background, main papers, recent developments and presentation scope. Then run:

    python3 scripts/build.py

The generator requires reportlab and updates all three HTML pages, schedule.json and the downloadable PDF together. Commit both the data and generated outputs. HTML is pre-rendered so all readings remain available without JavaScript. The generator retains the existing SVG artwork.

style.css is adapted from the user's Modern Computer Vision course stylesheet. ddl.css adds seminar-specific components. The SVG artwork is an original vector interpretation of the network-within-a-network concept; the original generated image was unavailable in the conversation export.
