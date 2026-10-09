"""Build the static DDL pages and print syllabus from course.json."""
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
alternatives = course["alternatives"]
parts = course["parts"]


def md(text):
    text = html.escape(text)
    text = re.sub(r'\[\*([^*]+)\*\]\((https?://[^)]+)\)', r'<a href="\2"><em>\1</em></a>', text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2">\1</a>', text)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)


def page(name, title, content):
    nav = ""
    for url, label in [("index.html", "Home"), ("schedule.html", "Schedule & readings"), ("seminar.html", "Seminar guide")]:
        current = 'class="active" aria-current="page"' if name == url else ""
        nav += f'<li><a href="{url}" {current}>{label}</a></li>'
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title} — Deep Deep Learning</title>
  <meta name="description" content="A graduate, student-led seminar on major ideas in deep learning: foundations, a central paper, and recent developments.">
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


def reading_card(item, alternative=False):
    if alternative:
        identifier = "topic-" + item["id"]
        label = "Optional topic"
        assigned = ""
        css_class = "alternative-card"
    else:
        identifier = "week-" + str(item["week"])
        label = f'Week {item["week"]:02}'
        assigned = '<span class="presenter">Presenter: <span class="tbd">TBD</span></span>'
        css_class = "week-card"
    return f"""
    <article class="reading-card {css_class}" id="{identifier}">
      <div class="week-top"><span class="week-label">{label}</span>{assigned}</div>
      <h3>{html.escape(item["topic"])}</h3>
      <p class="question">{html.escape(item["question"])}</p>
      <div class="reading-grid">
        <div><h4>Background &amp; foundations</h4><p>{md(item["foundations"])}</p></div>
        <div class="main-reading"><h4>Main paper</h4><p>{md(item["main"])}</p></div>
        <div><h4>Recent development &amp; discussion</h4><p>{md(item["recent"])}</p></div>
      </div>
      <div class="presentation-focus"><h4>Presentation focus</h4><p>{html.escape(item["focus"])}</p></div>
      <div class="week-bottom"><span>Selected sections / slides / notes: TBD</span><a href="#{identifier}" aria-label="Permanent link to {html.escape(item["topic"])}">Link ↗</a></div>
    </article>"""


overview = """<p>Major ideas. Fundamental questions. The mathematics underneath.</p>
<p>Deep Deep Learning is a graduate, student-led seminar for studying ideas you have heard about and want to understand properly. The program connects neural tangent kernels, feature learning, Mamba, in-context learning, test-time training, hypernetworks, predictive world models, model merging, mechanistic interpretability, and new generative frameworks.</p>
<p>Each session builds from background material to a central research paper and a recent extension or challenge. We work through a derivation, examine an experiment, and ask what remains unresolved. Students lead the presentations and discussion.</p>"""
logistics = [
    ("Format", "13 weekly student-led research seminars. No exam."),
    ("When", 'Semester, day and meeting time: <span class="tbd">TBD</span>. The schedule uses week numbers.'),
    ("Where", 'Room and delivery mode: <span class="tbd">TBD</span>.'),
    ("Registration", 'Course number, credits and enrollment: <span class="tbd">TBD</span>.'),
    ("Preparation", 'Working knowledge of deep learning, linear algebra, probability, calculus and optimization. Formal prerequisites: <span class="tbd">TBD</span>.'),
    ("Assessment", 'Grading components and weights: <span class="tbd">TBD</span>. No exam.'),
]
arc = ""
for part in parts:
    group = [item["week"] for item in weeks if item["part"] == part["id"]]
    arc += f'<a href="schedule.html#part-{part["id"]}"><span class="eyebrow">Part {part["id"]:02}</span><h3>{html.escape(part["title"])}</h3><span>Weeks {min(group)}–{max(group)} →</span></a>'
home = """
<section class="hero">
  <div class="hero-content"><div class="hero-badge">Graduate seminar · Student led · Semester TBD</div><h1>Deep <span class="accent">Deep</span> Learning</h1><p class="subtitle">Understanding the ideas inside the network.</p></div>
  <div class="hero-image"><img src="assets/hero.svg" width="1200" height="460" alt="A neural network opens to reveal a smaller cyan network, surrounded by mathematical curves, geometry and oscillatory dynamics."></div>
  <div class="hero-buttons"><a class="btn btn-primary" href="schedule.html">Explore the 13 weeks →</a><a class="btn btn-secondary" href="assets/syllabus.pdf" download>Download syllabus (PDF)</a></div>
</section>
<section class="section overview-section"><div class="overview-text">""" + overview + """</div></section>
<section class="section"><h2 class="section-title">Logistics</h2><p class="section-subtitle">A working reading program; administrative details will follow.</p>""" + cards(logistics) + """</section>
<section class="section"><h2 class="section-title">One question. Three things to bring.</h2><p class="section-subtitle">Every presentation should make a mathematical idea concrete.</p>""" + cards([
    ("01 · One derivation", "Explain one central derivation carefully, including its assumptions and the older ideas it builds on."),
    ("02 · One decisive experiment", "Show an experiment or ablation that tests the explanation, and what the evidence can distinguish."),
    ("03 · One unresolved question", "Identify a limitation, an alternative explanation, or a next experiment worth discussing."),
]) + """<p class="section-end"><a href="seminar.html">Read the seminar preparation guide →</a></p></section>
<section class="section"><h2 class="section-title">The arc of the course</h2><div class="arc">""" + arc + """</div></section>
<section class="section"><h2 class="section-title">Course staff &amp; communication</h2>""" + cards([
    ("Instructor", 'Assaf Shocher · <a href="https://assafshocher.github.io/">Homepage</a>'),
    ("Contact & office hours", 'Course contact, forum, office hours and supporting staff: <span class="tbd">TBD</span>.'),
]) + "</section>"
(ROOT / "index.html").write_text(page("index.html", "Home", home))

index_rows = "".join(f'<tr><th scope="row">{item["week"]:02}</th><td><a href="#week-{item["week"]}">{html.escape(item["topic"])}</a></td><td class="tbd">TBD</td></tr>' for item in weeks)
part_links = "".join(f'<a href="#part-{part["id"]}">{html.escape(part["title"])}</a>' for part in parts) + '<a href="#alternatives">Optional topics</a>'
schedule = """
<section class="section page-heading"><div class="hero-badge">13 weeks · Presenter assignments TBD</div><h1>Schedule &amp; readings</h1><p class="section-subtitle">Learn the foundations, understand a central paper, examine what came next.</p>
<p>This is the working 13-week program. Each reading bundle includes background, a main paper, and recent developments or discussion resources. When the main paper is itself recent, its companion can be a theoretical analysis or practical resource. Selected sections will be assigned; students are not expected to read every linked paper in full.</p>
<p>TTT has two sessions: adaptation under distribution shift, including the original Sun et al. paper and IT³; and learning as sequence memory. Drifting models and IMLE each have a dedicated generative-modeling session. Diffusion language models, Muon and RL reasoning remain available as optional substitutions. Flow matching is assumed background from the base course.</p>
<p class="section-end"><a class="btn btn-secondary" href="assets/syllabus.pdf" download>Download syllabus (PDF)</a></p></section>
<section class="section overview-section"><h2 class="section-title">At a glance</h2><div class="schedule-overview"><table><thead><tr><th scope="col">Week</th><th scope="col">Topic</th><th scope="col">Presenter</th></tr></thead><tbody>""" + index_rows + """</tbody></table></div></section>
<section class="section schedule-tools"><label for="reading-search">Find a topic, author or paper</label><input id="reading-search" type="search" placeholder="Try Mamba, IT³, drifting or IMLE…" autocomplete="off"><p id="result-count" class="muted" aria-live="polite">13 scheduled seminars · 3 optional topics</p><div class="part-links">""" + part_links + "</div></section>"
for part in parts:
    schedule += f'<section class="section schedule-part" id="part-{part["id"]}"><div class="eyebrow">Part {part["id"]:02}</div><h2 class="section-title">{html.escape(part["title"])}</h2><div class="week-list">'
    schedule += "".join(reading_card(item) for item in weeks if item["part"] == part["id"])
    schedule += "</div></section>"
schedule += '<section class="section schedule-part" id="alternatives"><div class="eyebrow">Optional substitutions</div><h2 class="section-title">Additional topics</h2><p class="section-subtitle">Complete reading bundles that can replace a scheduled session after coordinating with the instructor.</p><div class="week-list">'
schedule += "".join(reading_card(item, alternative=True) for item in alternatives) + "</div></section>"
(ROOT / "schedule.html").write_text(page("schedule.html", "Schedule & readings", schedule))

guide = """
<section class="section page-heading"><div class="hero-badge">Prepare · Explain · Discuss</div><h1>Student-led seminars</h1><p class="section-subtitle">Build an explanation that the room can examine together.</p><p>Each meeting develops one fundamental question through a small family of papers. Start with the older idea, uncover the central paper’s mechanism, and use evidence to assess the explanation.</p></section>
<section class="section"><h2 class="section-title">Before your seminar</h2><ol class="guide-list">
<li>Choose a topic from the working schedule or optional menu and coordinate the selection and scope with the instructor. Presenter assignments and the selection process are TBD.</li>
<li>Read the main paper and the relevant foundation material. Identify the minimum background needed for the mechanism. Use the recent companion to extend or question the explanation.</li>
<li>Prepare one careful derivation, one decisive experiment and one unresolved question. State the assumptions behind each claim.</li>
<li>Bring slides or notes with complete citations. Instructor meetings, preparation deadlines and material-sharing arrangements are TBD.</li></ol></section>
<section class="section"><h2 class="section-title">A suggested 90-minute structure</h2><p class="section-subtitle">A preparation template. The actual meeting duration is TBD.</p>""" + cards([
    ("15 min · Foundations", "Introduce the older idea and the minimum mathematical background."),
    ("35 min · Mechanism", "Explain the main paper’s mechanism, with one derivation worked through carefully."),
    ("15 min · Evidence", "Present one experiment or ablation that tests the explanation."),
    ("25 min · Discussion", "Discuss limitations, recent follow-up work, competing explanations and open questions."),
]) + """
<p class="section-end">For RL reasoning, allow 25–30 minutes for the policy-gradient foundations and narrow the paper discussion accordingly. No prior RL course is assumed; the selected tutorial is preparation material.</p></section>
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


def pdf_text(text):
    text = md(text).replace("<strong>", "<b>").replace("</strong>", "</b>").replace("<em>", "<i>").replace("</em>", "</i>")
    text = re.sub(r'<a href="([^"]+)">', r'<a href="\1" color="#16607c">', text)
    for before, after in [("—", "-"), ("–", "-"), ("’", "'"), ("“", '"'), ("”", '"'), ("μ", "mu"), ("³", "3"), ("→", "to")]:
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
    P("Major ideas in deep learning, studied through foundational material, a central paper and recent developments. Topics include NTK and feature learning, Mamba, in-context learning, test-time training, hypernetworks, predictive world models, model merging, interpretability, drifting models and IMLE."),
    P("Learning objectives", "Heading2"),
    P("Explain a mathematical mechanism; identify its assumptions; assess an experiment that tests an explanation; connect recent research to older ideas; formulate a precise unresolved question."),
    P("Prerequisites & logistics", "Heading2"),
    P("Working knowledge of deep learning, linear algebra, probability, calculus and optimization. Formal prerequisites, credits, enrollment, meeting time, room and delivery mode: TBD. There are 13 weekly sessions; dates are not yet assigned. Flow matching is assumed background from the base course."),
    P("Seminar format", "Heading2"),
    P("Students lead presentations and discussion. Each presentation includes one careful derivation, one decisive experiment and one unresolved question. Read selected sections of the background and companion material, with the main paper as the center. Reading sections, assignments and deadlines: TBD."),
    P("Grading policy", "Heading2"),
    P("No exam. Grading components and weights, attendance requirements and any written submissions: TBD."),
    P("Research practice & communication", "Heading2"),
    P("Cite papers, figures, code and other sources; distinguish the authors’ claims from your own analysis. Formal academic-integrity and AI-use policies, course forum and accessibility arrangements: TBD."),
    PageBreak(),
    P("Weekly schedule", "TitleDDL"),
    P("Week numbers only. All student presenters: TBD. TTT is split into adaptation (original Sun et al. and IT3) and neural memory. Drifting models and IMLE have separate sessions."),
    Spacer(1, 12),
]
table_rows = [[P("Week", "SmallDDL"), P("Topic", "SmallDDL"), P("Presenter", "SmallDDL")]]
table_rows += [[P(str(item["week"]), "SmallDDL"), P(item["topic"], "SmallDDL"), P("TBD", "SmallDDL")] for item in weeks]
table = Table(table_rows, colWidths=[38, 380, 60], repeatRows=1)
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f2f5")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("LINEBELOW", (0, 0), (-1, -1), .4, colors.HexColor("#d3dee5")),
]))
story += [table, Spacer(1, 14), P("Suggested meeting structure", "Heading2"),
          P("For a 90-minute seminar: 15 minutes foundations, 35 minutes mechanism and derivation, 15 minutes experiment, 25 minutes recent developments and discussion. Actual duration: TBD."),
          PageBreak(), P("Reading program", "TitleDDL")]
for item in weeks:
    block = [P(f'Week {item["week"]} - {item["topic"]}', "Heading2"), P(item["question"])]
    for label, field in [("Background", "foundations"), ("Main paper", "main"), ("Recent development", "recent"), ("Presentation focus", "focus")]:
        block.append(P(label + ": " + item[field], "SmallDDL"))
    block.append(Spacer(1, 10))
    story.append(KeepTogether(block))
story += [PageBreak(), P("Optional substitutions", "TitleDDL"),
          P("These complete reading bundles can replace a scheduled session after coordinating with the instructor. Flow matching itself was covered in the base course.")]
for item in alternatives:
    story.append(KeepTogether([P(item["topic"], "Heading2"), P(item["question"])]))
    for label, field in [("Background", "foundations"), ("Main paper", "main"), ("Recent development", "recent"), ("Presentation focus", "focus")]:
        story.append(P(label + ": " + item[field], "SmallDDL"))
    story.append(Spacer(1, 10))
story.append(P("Course website: [Deep Deep Learning](https://assafshocher.github.io/ddl/)", "SmallDDL"))


def footer(canvas, document):
    canvas.setStrokeColor(colors.HexColor("#d3dee5"))
    canvas.line(42, 38, 553, 38)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#526878"))
    canvas.drawString(42, 25, "Deep Deep Learning | Working syllabus - administrative details TBD")
    canvas.drawRightString(553, 25, str(document.page))


SimpleDocTemplate(
    str(ROOT / "assets/syllabus.pdf"), pagesize=(595.28, 841.89),
    rightMargin=48, leftMargin=48, topMargin=42, bottomMargin=52,
    title="Deep Deep Learning - Syllabus", author="Deep Deep Learning",
).build(story, onFirstPage=footer, onLaterPages=footer)
