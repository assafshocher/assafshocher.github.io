"""Build the static DDL topic catalogue and print syllabus from course.json."""
import html
import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
course = json.loads((ROOT / "course.json").read_text())
weeks = course["weeks"]
topics = course["topics"]
parts = course["parts"]
duration = course.get("duration", "Two academic hours")
part_titles = {part["id"]: part["title"] for part in parts}


def md(text):
    text = html.escape(text)
    text = re.sub(r'\[\*([^*]+)\*\]\((https?://[^)]+)\)', r'<a href="\2"><em>\1</em></a>', text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2">\1</a>', text)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)


def page(name, title, content):
    nav = ""
    for url, label in [("index.html", "Home"), ("schedule.html", "Topics & readings"), ("seminar.html", "Seminar guide")]:
        current = 'class="active" aria-current="page"' if name == url else ""
        nav += f'<li><a href="{url}" {current}>{label}</a></li>'
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title} — Deep Deep Learning</title>
  <meta name="description" content="A graduate, student-led seminar on major ideas in deep learning: foundations, a central paper, and recent developments. Choose topics from the candidate reading pool.">
  <meta name="theme-color" content="#0d1117">
  <link rel="canonical" href="https://assafshocher.github.io/ddl/{'' if name == 'index.html' else name}">
  <link rel="icon" href="assets/mark.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="ddl.css">
  <script src="site.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <nav aria-label="Main navigation"><div class="nav-inner">
    <a href="index.html" class="nav-brand"><img src="assets/mark.svg" alt="" width="32" height="32"><span>Deep Deep Learning</span></a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
    <ul class="nav-links" id="nav-links">{nav}</ul>
  </div></nav>
  <main id="main">{content}</main>
  <footer>
    <div>Deep Deep Learning · Graduate research seminar</div>
    <p>Course number, semester, meeting details &amp; assessment weights: TBD</p>
    <p><a href="assets/syllabus.pdf" download>Download syllabus</a> · <a href="https://assafshocher.github.io/mcv/">Modern Computer Vision</a> · <a href="https://assafshocher.github.io/">Assaf Shocher</a></p>
  </footer>
</body>
</html>
"""


def cards(items):
    return '<div class="cards cards-compact">' + "".join(
        f'<div class="card card-sm"><h3>{title}</h3><p>{text}</p></div>'
        for title, text in items
    ) + "</div>"


def reading_bundle(item):
    return f"""<div class="reading-grid">
        <div><h4>Background &amp; foundations</h4><p>{md(item['foundations'])}</p></div>
        <div class="main-reading"><h4>Main paper</h4><p>{md(item['main'])}</p></div>
        <div><h4>Recent development &amp; discussion</h4><p>{md(item['recent'])}</p></div>
      </div>
      <div class="presentation-focus"><h4>Presentation focus</h4><p>{md(item['focus'])}</p></div>"""


# Existing links reach the relevant candidate without assigning it to a week.
legacy_weeks = {
    "ntk": [1], "mup": [2], "mamba": [3], "icl": [4], "ttt": [5, 6],
    "hypernetworks": [7], "jepa": [8], "merging": [9], "features": [10],
    "circuits": [11], "one-step-generative": [12, 13],
}


def reading_card(item):
    identifier = "topic-" + item["id"]
    legacy = "".join(f'<span class="legacy-anchor" id="week-{week}" aria-hidden="true"></span>' for week in legacy_weeks.get(item["id"], []))
    scope = f'<div class="session-scope"><h4>Scope for one session</h4><p>{md(item["scope"])}</p></div>' if item.get("scope") else ""
    routes = "".join(
        f'<details class="reading-route"><summary>Alternative focus: {html.escape(route["title"])}</summary>'
        f'<div class="route-content">{reading_bundle(route)}</div></details>'
        for route in item.get("routes", [])
    )
    return f"""
    <article class="reading-card topic-card" id="{identifier}">
      {legacy}<div class="topic-top"><span class="topic-label">Candidate topic</span><span class="duration">{html.escape(duration)}</span></div>
      <h3>{html.escape(item['topic'])}</h3>
      <p class="question">{html.escape(item['question'])}</p>
      {scope}{reading_bundle(item)}{routes}
      <div class="topic-bottom"><span>Selected sections / slides / notes: TBD</span><a href="#{identifier}" aria-label="Permanent link to {html.escape(item['topic'])}">Link ↗</a></div>
    </article>"""


overview = """<p>Major ideas. Fundamental questions. The mathematics underneath.</p>
<p>Deep Deep Learning is a graduate, student-led seminar for studying ideas you have heard about and want to understand properly. The candidate pool connects neural tangent kernels, feature learning, Mamba, in-context learning, test-time training, hypernetworks, world models, model merging, mechanistic interpretability, new generative frameworks, graph neural networks, KANs, and the theory of why training works.</p>
<p>Each selected topic gets two academic hours. A session builds from the minimum background to one central research paper and selected recent developments. We work through a derivation, examine an experiment, and ask what remains unresolved. Students lead the presentations and discussion.</p>
<p>The reading pool is larger than the course. Students and the instructor choose which topics enter the final schedule; unchosen topics are not assigned. Topic selections and presenter assignments are TBD.</p>"""
logistics = [
    ("Format", f'{len(weeks)} planned weekly student-led seminars. {html.escape(duration)} per selected topic. No exam.'),
    ("Topic selection", f'{len(topics)} candidate topics with background, a main paper and recent reading. Final selection and order: <span class="tbd">TBD</span>.'),
    ("When", 'Semester, day and meeting time: <span class="tbd">TBD</span>. The schedule uses week numbers.'),
    ("Where", 'Room and delivery mode: <span class="tbd">TBD</span>.'),
    ("Registration", 'Course number, credits and enrollment: <span class="tbd">TBD</span>.'),
    ("Preparation", 'Working knowledge of deep learning, linear algebra, probability, calculus and optimization. Formal prerequisites: <span class="tbd">TBD</span>.'),
    ("Assessment", 'Grading components and weights: <span class="tbd">TBD</span>. No exam.'),
]
families = ""
for part in parts:
    count = sum(item["part"] == part["id"] for item in topics)
    if count:
        noun = "candidate" if count == 1 else "candidates"
        families += f'<a href="schedule.html#part-{part["id"]}"><span class="eyebrow">Topic family {part["id"]:02}</span><h3>{html.escape(part["title"])}</h3><span>{count} {noun} →</span></a>'
home = """
<section class="hero">
  <div class="hero-content"><div class="hero-badge">Graduate seminar · Student led · Semester TBD</div><h1>Deep <span class="accent">Deep</span> Learning</h1><p class="subtitle">Understanding the ideas inside the network.</p></div>
  <div class="hero-image"><img src="assets/hero.svg" width="1200" height="460" alt="A neural network opens to reveal a smaller cyan network, surrounded by mathematical curves, geometry and oscillatory dynamics."></div>
  <div class="hero-buttons"><a class="btn btn-primary" href="schedule.html">Explore the topic pool →</a><a class="btn btn-secondary" href="assets/syllabus.pdf" download>Download syllabus (PDF)</a></div>
</section>
<section class="section overview-section"><div class="overview-text">""" + overview + """</div></section>
<section class="section"><h2 class="section-title">Logistics</h2><p class="section-subtitle">Choose the topics first; the weekly assignments will follow.</p>""" + cards(logistics) + """</section>
<section class="section"><h2 class="section-title">One question. Three things to bring.</h2><p class="section-subtitle">Every presentation should make a mathematical idea concrete.</p>""" + cards([
    ("01 · One derivation", "Explain one central derivation carefully, including its assumptions and the older ideas it builds on."),
    ("02 · One decisive experiment", "Show an experiment or ablation that tests the explanation, and what the evidence can distinguish."),
    ("03 · One unresolved question", "Identify a limitation, an alternative explanation, or a next experiment worth discussing."),
]) + """<p class="section-end"><a href="seminar.html">Read the seminar preparation guide →</a></p></section>
<section class="section"><h2 class="section-title">Explore the topic families</h2><p class="section-subtitle">A menu for selecting seminars. Inclusion here does not reserve a week.</p><div class="arc">""" + families + """</div></section>
<section class="section"><h2 class="section-title">Course staff &amp; communication</h2>""" + cards([
    ("Instructor", 'Assaf Shocher · <a href="https://assafshocher.github.io/">Homepage</a>'),
    ("Contact & office hours", 'Course contact, forum, office hours and supporting staff: <span class="tbd">TBD</span>.'),
]) + "</section>"
(ROOT / "index.html").write_text(page("index.html", "Home", home))

index_rows = "".join(
    f'<tr class="topic-index-row" data-topic="topic-{item["id"]}"><th scope="row"><a href="#topic-{item["id"]}">{html.escape(item["topic"])}</a></th><td>{html.escape(part_titles[item["part"]])}</td></tr>'
    for item in topics
)
week_rows = "".join(
    f'<tr><th scope="row">{item["week"]:02}</th><td class="tbd">{html.escape(item.get("topic", "TBD"))}</td><td class="tbd">{html.escape(item.get("presenter", "TBD"))}</td></tr>'
    for item in weeks
)
part_links = "".join(f'<a href="#part-{part["id"]}">{html.escape(part["title"])}</a>' for part in parts) + '<a href="#weekly-schedule">Weekly assignments</a>'
schedule = f"""
<section class="section page-heading"><div class="hero-badge">Candidate pool · Two academic hours per selected topic</div><h1>Topics &amp; readings</h1><p class="section-subtitle">Learn the foundations, understand a central paper, examine what came next.</p>
<p>These {len(topics)} topics are candidates for the seminar. Only the topics students and the instructor choose will enter the final {len(weeks)}-week schedule. Selection, order and presenter assignments are TBD.</p>
<p>Each selected topic gets two academic hours and one focused question. The main paper is the center; background and recent comparisons are selective reading, not several full-paper presentations. Alternative focuses within a topic are choices for the same session.</p>
<p>TTT can focus on learning as neural memory or on distribution-shift adaptation with the original Sun et al. paper. IT³ is supplementary reading. Drifting and IMLE can share a comparative session on one-step generation, with one main mechanism developed in depth. Neither topic reserves two weeks. Flow matching is assumed background from the base course.</p>
<p class="section-end"><a class="btn btn-secondary" href="assets/syllabus.pdf" download>Download syllabus (PDF)</a></p></section>
<section class="section schedule-tools"><label for="reading-search">Find a topic, author or paper</label><input id="reading-search" type="search" placeholder="Try Mamba, KAN, Neural Thickets or convergence…" autocomplete="off"><p id="result-count" class="muted" aria-live="polite">{len(topics)} candidate topics · Final selection TBD</p><div class="part-links">{part_links}</div></section>
<section class="section overview-section" id="topic-index"><h2 class="section-title">The topic pool at a glance</h2><div class="schedule-overview topic-overview"><table><thead><tr><th scope="col">Candidate topic</th><th scope="col">Topic family</th></tr></thead><tbody>{index_rows}</tbody></table></div></section>"""
for part in parts:
    group = [item for item in topics if item["part"] == part["id"]]
    if group:
        schedule += f'<section class="section schedule-part" id="part-{part["id"]}"><div class="eyebrow">Topic family {part["id"]:02}</div><h2 class="section-title">{html.escape(part["title"])}</h2><div class="topic-list">'
        schedule += "".join(reading_card(item) for item in group)
        schedule += "</div></section>"
schedule += f"""<section class="section" id="weekly-schedule"><div class="eyebrow">Assignments to follow</div><h2 class="section-title">Weekly schedule</h2><p class="section-subtitle">{len(weeks)} planned meetings. Topic selections and student presenters are TBD; dates have not been assigned.</p><div class="schedule-overview"><table><thead><tr><th scope="col">Week</th><th scope="col">Selected topic</th><th scope="col">Presenter</th></tr></thead><tbody>{week_rows}</tbody></table></div></section>"""
(ROOT / "schedule.html").write_text(page("schedule.html", "Topics & readings", schedule))

guide = """
<section class="section page-heading"><div class="hero-badge">Prepare · Explain · Discuss</div><h1>Student-led seminars</h1><p class="section-subtitle">One focused question, developed over two academic hours.</p><p>Each meeting develops one fundamental question through a central paper and selected background or comparison material. Start with the older idea, uncover the main mechanism, and use evidence to assess the explanation.</p></section>
<section class="section"><h2 class="section-title">Before your seminar</h2><ol class="guide-list">
<li>Choose a candidate from the topic pool and coordinate one focused question with the instructor. Where a topic offers alternative focuses, choose one. Only selected topics enter the schedule; the selection process and presenter assignments are TBD.</li>
<li>Read the main paper and the relevant foundation material. Identify the minimum background needed for the mechanism. Use selected recent work to extend or question the explanation.</li>
<li>Prepare one careful derivation, one decisive experiment and one unresolved question. State the assumptions behind each claim. A companion paper can supply a comparison without becoming a second full presentation.</li>
<li>Bring slides or notes with complete citations. Instructor meetings, preparation deadlines and material-sharing arrangements are TBD.</li></ol></section>
<section class="section"><h2 class="section-title">A suggested structure for two academic hours</h2><p class="section-subtitle">The allocation below assumes two 45-minute academic hours, totaling 90 minutes. Adjust the split to the local academic-hour convention.</p>""" + cards([
    ("15 min · Foundations", "Introduce the older idea and the minimum mathematical background."),
    ("35 min · Mechanism", "Explain the main paper’s mechanism, with one derivation worked through carefully."),
    ("15 min · Evidence", "Present one experiment or ablation that tests the explanation."),
    ("25 min · Discussion", "Discuss limitations, selected recent work, competing explanations and open questions."),
]) + """
<p class="section-end">For RL reasoning, allow 25–30 minutes for the policy-gradient foundations and narrow the paper discussion accordingly. No prior RL course is assumed; the selected tutorial is preparation material.</p></section>
<section class="section"><h2 class="section-title">Choosing a manageable scope</h2><div class="prose">
<p>TTT does not automatically require two weeks. A seminar on neural memory centers on the TTT recurrent update. An adaptation seminar instead centers on the original Sun et al. framework, with IT³ as an optional comparison. Choose one focus and use the other as context.</p>
<p>Drifting and IMLE can be compared in one session through the question of how to train a one-step generator from generated samples. Develop one training mechanism carefully and use the other as a comparison. A detailed derivation of both methods and their theory would need a narrower comparison or a second selected topic.</p>
<p>For any broad family, choose the paper and question first. The pool supplies options; it does not require every linked direction to be covered in one meeting.</p></div></section>
<section class="section"><h2 class="section-title">What makes a strong presentation?</h2><div class="prose">
<p>Separate exact mathematical connections from connections that depend on assumptions, and distinguish both from empirical interpretations. Explain what a method can implement, what the trained system appears to implement, and how far the evidence supports a broader explanation.</p>
<p>Use a small example before the full model. Define notation, explain each assumption, and make the experiment readable enough for the audience to critique it.</p>
<p>Keep conclusions tied to the setting studied. Recent papers are opportunities for careful discussion; their inclusion does not mean their claims or long-term impact are settled.</p></div></section>
<section class="section"><h2 class="section-title">Participation &amp; assessment</h2>""" + cards([
    ("For all participants", "Read the selected sections before the meeting, bring questions, and contribute to the discussion."),
    ("Assessment", "No exam. Grading components, weights, attendance requirements and any written submissions: TBD."),
    ("Research practice", "Cite papers, figures, code and other sources. Explain which claims are the authors’ and which are your own analysis. Formal academic-integrity and AI-use policies: TBD."),
    ("Access & communication", "Course forum, accessibility arrangements, contact information and office hours: TBD."),
]) + "</section>"
(ROOT / "seminar.html").write_text(page("seminar.html", "Seminar guide", guide))
(ROOT / "schedule.json").write_text(json.dumps(weeks, ensure_ascii=False, indent=2) + "\n")

# Keep a print-friendly syllabus synchronized with the exact web reading data.
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TitleDDL", fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=colors.HexColor("#163c56"), spaceAfter=16))
styles.add(ParagraphStyle(name="SmallDDL", fontSize=8.5, leading=12, spaceAfter=7))
styles["BodyText"].fontSize = 10
styles["BodyText"].leading = 15
styles["Heading2"].textColor = colors.HexColor("#163c56")
styles["Heading1"].textColor = colors.HexColor("#163c56")


def pdf_text(text):
    text = md(text).replace("<strong>", "<b>").replace("</strong>", "</b>").replace("<em>", "<i>").replace("</em>", "</i>")
    text = re.sub(r'<a href="([^"]+)">', r'<a href="\1" color="#16607c">', text)
    for before, after in [("—", "-"), ("–", "-"), ("’", "'"), ("“", '"'), ("”", '"'), ("μ", "mu"), ("³", "3"), ("→", "to"), ("č", "c"), ("ć", "c")]:
        text = text.replace(before, after)
    return text


def P(text, style="BodyText"):
    return Paragraph(pdf_text(text), styles[style])


story = [
    P("Technion - Israel Institute of Technology", "SmallDDL"),
    P("Faculty of Data and Decision Sciences", "SmallDDL"),
    P("Deep Deep Learning", "TitleDDL"),
    P("Graduate student-led research seminar | Semester: TBD | Course number: TBD"),
    Spacer(1, 14),
    P("Instructor: Assaf Shocher. Course contact and office hours: TBD."),
    P("Course description", "Heading2"),
    P("Major ideas in deep learning, studied through foundational material, a central paper and recent developments. The candidate pool includes NTK, Mamba, in-context learning, test-time training, hypernetworks, world models, model merging, interpretability, new generative frameworks, graph neural networks, KANs, and the theory of why training works."),
    P("Topic selection", "Heading2"),
    P(f"The {len(topics)} topics in this syllabus are candidates, not weekly assignments. Students and the instructor choose which topics enter the final {len(weeks)}-week schedule. Unchosen topics are not assigned. Selection, order and presenter assignments: TBD. Each selected topic gets two academic hours."),
    P("Learning objectives", "Heading2"),
    P("Explain a mathematical mechanism; identify its assumptions; assess an experiment that tests an explanation; connect recent research to older ideas; formulate a precise unresolved question."),
    P("Prerequisites & logistics", "Heading2"),
    P("Working knowledge of deep learning, linear algebra, probability, calculus and optimization. Formal prerequisites, credits, enrollment, meeting time, room and delivery mode: TBD. Dates are not yet assigned. Flow matching is assumed background from the base course."),
    P("Seminar format & assessment", "Heading2"),
    P("Students lead presentations and discussion. Each session centers on one main paper, with selected foundation and companion material. Prepare one derivation, one decisive experiment and one unresolved question. No exam. Grading components and weights, attendance requirements, written submissions, reading sections and deadlines: TBD."),
    P("Research practice & communication", "Heading2"),
    P("Cite papers, figures, code and other sources; distinguish the authors' claims from your own analysis. Formal academic-integrity and AI-use policies, course forum and accessibility arrangements: TBD."),
    PageBreak(),
    P("Weekly schedule", "TitleDDL"),
    P("Week numbers only. Topic selections and student presenters are TBD. The candidate pool below is larger than the final course."),
    Spacer(1, 12),
]
table_rows = [[P("Week", "SmallDDL"), P("Selected topic", "SmallDDL"), P("Presenter", "SmallDDL")]]
table_rows += [[P(str(item["week"]), "SmallDDL"), P(item.get("topic", "TBD"), "SmallDDL"), P(item.get("presenter", "TBD"), "SmallDDL")] for item in weeks]
table = Table(table_rows, colWidths=[38, 350, 110], repeatRows=1)
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f2f5")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("LINEBELOW", (0, 0), (-1, -1), .4, colors.HexColor("#d3dee5")),
]))
story += [table, Spacer(1, 14), P("Suggested meeting structure", "Heading2"),
          P("Two academic hours per selected topic. Assuming two 45-minute academic hours: 15 minutes foundations, 35 minutes mechanism and derivation, 15 minutes evidence, 25 minutes discussion. Adjust the split to the local academic-hour convention."),
          P("Choosing one focus", "Heading2"),
          P("TTT can focus on learning as neural memory or distribution-shift adaptation with the original Sun et al. paper. IT3 is supplementary reading. These are alternative focuses, not two required weeks. Drifting and IMLE can share a comparison session on one-step generation, with one method developed in depth. Selective comparisons keep either topic within one meeting."),
          PageBreak(), P("Candidate topic pool", "TitleDDL"),
          P("Choose one focused question and one main paper for each selected session. Background and recent readings supply selective preparation and comparisons. An alternative focus is a choice within the same candidate topic.")]


def pdf_bundle(item, title, question=None, scope=None):
    block = [P(title, "Heading2")]
    if question:
        block.append(P(question))
    if scope:
        block.append(P("Scope for one session: " + scope, "SmallDDL"))
    for label, field in [("Background", "foundations"), ("Main paper", "main"), ("Recent development & discussion", "recent"), ("Presentation focus", "focus")]:
        block.append(P(label + ": " + item[field], "SmallDDL"))
    block.append(Spacer(1, 10))
    return block


for part in parts:
    group = [item for item in topics if item["part"] == part["id"]]
    if group:
        for index, item in enumerate(group):
            block = pdf_bundle(item, item["topic"], item["question"], item.get("scope"))
            if index == 0:
                block.insert(0, P(part["title"], "Heading1"))
            story.append(KeepTogether(block))
            for route in item.get("routes", []):
                story.append(KeepTogether(pdf_bundle(route, "Alternative focus: " + route["title"])))
story.append(P("Course website: [Deep Deep Learning](https://assafshocher.github.io/ddl/)", "SmallDDL"))


def footer(canvas, document):
    canvas.setStrokeColor(colors.HexColor("#d3dee5"))
    canvas.line(42, 38, 553, 38)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#526878"))
    canvas.drawString(42, 25, "Deep Deep Learning | Candidate reading pool - final selection TBD")
    canvas.drawRightString(553, 25, str(document.page))


SimpleDocTemplate(
    str(ROOT / "assets/syllabus.pdf"), pagesize=(595.28, 841.89),
    rightMargin=48, leftMargin=48, topMargin=42, bottomMargin=52,
    title="Deep Deep Learning - Syllabus", author="Deep Deep Learning",
).build(story, onFirstPage=footer, onLaterPages=footer)
