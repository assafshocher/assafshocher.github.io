from pathlib import Path
from html import escape as e, unescape
import argparse, hashlib, json, re

parser=argparse.ArgumentParser(description='Build the static homepage from the publication and member data.')
parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
root=parser.parse_args().root.resolve()
site_url='https://assafshocher.github.io/'
style_version=hashlib.sha256((root/'style.css').read_bytes()).hexdigest()[:10]
script_version=hashlib.sha256((root/'site.js').read_bytes()).hexdigest()[:10]
icon_version=hashlib.sha256((root/'assets'/'as-mark.svg').read_bytes()).hexdigest()[:10]
pubs=json.loads((root/'publications.json').read_text())
author_links=json.loads((root/'author-links.json').read_text())
mail='mailto:assafshocher@gmail.com'
scholar='https://scholar.google.co.il/citations?user=ndRmNK8AAAAJ'
github='https://github.com/assafshocher'
linkedin='https://www.linkedin.com/in/assaf-shocher-271424b7/'
paths={
 'mail':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
 'scholar':'<path d="m22 10-10-5L2 10l10 5 10-5ZM6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
 'github':'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
 'twitter':'<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
 'linkedin':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m4 0v-7m0 3a3 3 0 0 1 6 0v4"/><circle cx="7" cy="7" r=".6" fill="currentColor" stroke="none"/>',
 'copy':'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 'close':'<path d="m6 6 12 12M6 18 18 6"/>',
 'page':'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/>',
 'pdf':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
 'code':'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>',
 'demo':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m10 8 6 4-6 4Z"/>',
 'video':'<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-4v12l-6-4"/>',
 'supp':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 4 4 4-6 5 7"/><circle cx="8" cy="7" r="1"/>',
 'abstract':'<path d="M13 4v16m5-16v16M18 4H9a4 4 0 0 0 0 8h4"/>',
 'bibtex':'<path d="M3 6h7v7H5c0 3 2 4 4 5M14 6h7v7h-5c0 3 2 4 4 5"/>',
 'person':'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2c0-4 3-6 8-6s8 2 8 6v2"/>'
}
def icon(name):
 return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths[name]}</svg>'
def socials():
 return '<div class="social-links">'+''.join(f'<a class="social-link" href="{href}">{icon(key)}{label}</a>' for key,label,href in [('mail','Email',mail),('scholar','Scholar',scholar),('github','GitHub',github),('linkedin','LinkedIn',linkedin),('twitter','Twitter','https://twitter.com/AssafShocher')])+'</div>'

def shell(page,title,body,math=False):
 prefix='./' if page=='home' else '../'
 nav_items=[('home','Home','index.html'),('group','Group','group/index.html'),('teaching','Teaching','teaching/index.html'),('about','About','about/index.html'),('other','Other','other/index.html')]
 nav=''.join(f'<a href="{prefix}{url}"'+(' aria-current="page"' if page==key else '')+f'>{name}</a>' for key,name,url in nav_items)
 page_path='' if page=='home' else page+'/'
 canonical=site_url+page_path
 descriptions={
  'home':'Assaf Shocher, Assistant Professor at the Technion. Research in computer vision and deep learning, and selected publications.',
  'group':'Members of Assaf Shocher’s research group at the Technion.',
  'teaching':'Courses taught by Assaf Shocher at the Technion, including Modern Computer Vision.',
  'about':'Biography, selected honors and grants, and contact information for Assaf Shocher.',
  'other':'Two games for kids: Beam & Balance and Number Tower.'
 }
 metadata=f'<meta name="description" content="{e(descriptions[page])}"><link rel="canonical" href="{canonical}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(descriptions[page])}"><meta property="og:url" content="{canonical}"><meta property="og:type" content="website"><meta property="og:image" content="{site_url}assets/assaf.png">'
 if page=='home':
  person={'@context':'https://schema.org','@type':'Person','name':'Assaf Shocher','url':site_url,'image':site_url+'assets/assaf.png','jobTitle':'Assistant Professor','worksFor':{'@type':'CollegeOrUniversity','name':'Technion – Israel Institute of Technology'},'sameAs':[scholar,github,linkedin,'https://dds.technion.ac.il/people/academic-staff/shocher-assaf/']}
  metadata+='<script type="application/ld+json">'+json.dumps(person,ensure_ascii=False)+'</script>'
 analytics='''<script async src="https://www.googletagmanager.com/gtag/js?id=G-RJZCBKSFRX"></script><script>if(location.hostname==='assafshocher.github.io'){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-RJZCBKSFRX');}</script>'''
 math_assets=f'<link rel="stylesheet" href="{prefix}assets/katex/katex.min.css"><script defer src="{prefix}assets/katex/katex.min.js"></script><script defer src="{prefix}assets/katex/auto-render.min.js"></script>' if math else ''
 html=f'''<!doctype html><html lang="en" data-page="{page}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">{metadata}{analytics}<meta name="theme-color" content="#ffffff"><title>{e(title)}</title><link rel="icon" href="{prefix}favicon.ico?v={icon_version}" sizes="16x16 32x32 48x48 64x64 256x256" type="image/x-icon"><link rel="icon" href="{prefix}favicon.svg?v={icon_version}" sizes="any" type="image/svg+xml"><link rel="apple-touch-icon" href="{prefix}apple-touch-icon.png?v={icon_version}" sizes="180x180"><link rel="stylesheet" href="{prefix}style.css?v={style_version}">{math_assets}<script defer src="{prefix}site.js?v={script_version}"></script></head><body><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="wrap header-inner"><a class="brand" href="{prefix}index.html"><img class="brand-mark" src="{prefix}assets/as-mark.svg?v={icon_version}" alt="" aria-hidden="true" width="40" height="40">Assaf Shocher</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" type="button">Menu</button><nav class="nav" id="main-nav" aria-label="Main navigation">{nav}</nav></div></header><main id="main" class="wrap">{body}</main><footer class="site-footer"><div class="wrap footer-inner"><span>Assaf Shocher · Technion</span></div></footer></body></html>'''
 dest=root/'index.html' if page=='home' else root/page/'index.html'
 dest.parent.mkdir(exist_ok=True)
 dest.write_text(html)

def author_link(author, prefix):
 display=unescape(re.sub(r'<[^>]*>', '', author))
 name=display.rstrip('*')
 label=e(display)
 if name=='Assaf Shocher':
  url=prefix+'about/index.html'
  label=f'<strong>{label}</strong>'
 else:
  url=author_links[name]
 return f'<a href="{e(url)}">{label}</a>'

def pub_rows(prefix):
 result=[]
 for p in pubs:
  id=p['id']; title=e(p['title']); authors=', '.join(author_link(author,prefix) for author in p['authors'])
  match=re.search(r'20\d\d',p['venue']); year=str(p.get('year',match.group() if match else 'undated'))
  venue=e(p['venue'] if match or year=='undated' else p['venue']+' · '+year)
  url=e(p['links'].get('page',p['links'].get('pdf','')))
  links=''.join(f'<a class="paper-button" href="{e(url)}">{icon(name)}{name}</a>' for name,url in p['links'].items())
  poster_ratio=p['image_width']/p['image_height']
  preview_ratio=p['preview_width']/p['preview_height']
  media_layout='wide' if preview_ratio>=1.8 else 'standard'
  media_style=f'--poster-ratio:{poster_ratio:.6f};--preview-ratio:{preview_ratio:.6f}'
  poster=f'<img class="preview-poster" src="{prefix}{p["image"]}" alt="Visual result from {title}" width="{p["image_width"]}" height="{p["image_height"]}" loading="lazy">'
  if p.get('video_hover'):
   animation=f'<video class="preview-animation" data-src="{prefix}{p["video_hover"]}" muted loop playsinline preload="none" aria-label="Animated result from {title}" hidden></video>'
  else:
   animation=f'<img class="preview-animation" data-src="{prefix}{p["image_hover"]}" alt="Alternate visual result from {title}" hidden>'
  abstract=''.join(f'<p>{e(paragraph)}</p>' for paragraph in p['abstract'].split('\n\n'))
  result.append(f'''<article class="publication" id="{id}" data-year="{year}" data-media-layout="{media_layout}" style="{media_style}"><button class="pub-media" type="button" data-toggle-publication aria-label="Expand {title}" aria-expanded="false" aria-controls="abstract-{id}" data-title="{title}">{poster}{animation}</button><div class="pub-content"><h3 class="pub-title"><a href="{url}">{title}</a></h3><p class="pub-authors">{authors}</p><p class="pub-venue">{venue}</p><div class="pub-links">{links}<button class="paper-button" type="button" data-toggle-publication data-abstract-button aria-label="Expand {title}" aria-expanded="false" aria-controls="abstract-{id}" data-title="{title}">{icon('abstract')}<span>abstract</span></button><button class="paper-button" type="button" data-bibtex="{e(p['bibtex'])}" aria-label="Copy BibTeX citation for {title}">{icon('bibtex')}<span>bibtex</span></button></div><pre class="citation-fallback" hidden></pre></div><div class="pub-abstract" id="abstract-{id}" hidden><div class="abstract-text">{abstract}</div></div></article>''')
 return ''.join(result)

def publication_list(prefix='./',heading='Selected publications'):
 years=sorted({str(p.get('year',m.group() if (m:=re.search(r'20\d\d',p['venue'])) else 'undated')) for p in pubs},reverse=True)
 options=''.join(f'<option value="{y}">{y}</option>' for y in years)
 return f'''<section class="publications-section" id="publications" aria-label="Publications"><div class="pub-heading"><h2>{heading}</h2><div class="pub-options"><label class="hover-setting"><input type="checkbox" id="hover-previews" checked>Expand on hover</label><label class="visually-hidden" for="publication-year">Filter publications by year</label><select id="publication-year" class="filter-select"><option value="">All years</option>{options}</select></div></div><p class="visually-hidden" id="result-count" aria-live="polite">{len(pubs)} publications</p><div id="copy-status" class="visually-hidden" role="status"></div><div class="publications-list">{pub_rows(prefix)}</div></section>'''

about_bio='''I am an Assistant Professor at the <a href="https://www.technion.ac.il/en/">Technion</a> in the <a href="https://dds.technion.ac.il/">Faculty of Data and Decision Sciences</a>. Previously, I was a Postdoctoral Research Scientist at NVIDIA, a postdoctoral researcher at UC Berkeley with <a href="https://people.eecs.berkeley.edu/~efros/">Alyosha Efros</a>, and a Visiting Scholar at Google DeepMind. I received my PhD from the Weizmann Institute of Science, advised by <a href="https://www.weizmann.ac.il/math/irani/home">Michal Irani</a>, and hold bachelor’s degrees in Physics and Electrical Engineering from <a href="https://www.bgu.ac.il/en/">Ben-Gurion University</a>.'''
intro=about_bio+' More details in <a href="./about/index.html">About</a>.'
research_intro='''<p class="intro-paragraph research-principles">My research focuses on computer vision and deep learning. I aim to bridge theory and practical application in machine learning. While admiring engineering advances, I am drawn to the scientific investigation of foundational principles. Fascinated by elegant ideas and mathematical observations, I start each project from first principles to develop methods that offer fundamentally new perspectives on problems. In particular, I study algebraic properties of neural networks, including analogues of inverses and projections, to make them easier to analyze, compose, and control, with applications to inverse problems and adaptive learning.</p>'''
home=f'''<section class="home-intro" aria-labelledby="home-title"><div class="intro-copy"><h1 id="home-title"><span>Assaf Shocher</span></h1><div class="intro-text"><p class="intro-paragraph">{intro}</p></div></div><div class="portrait-shell"><button class="photo-button" type="button" aria-label="Toggle alternate portrait of Assaf Shocher" aria-pressed="false"><img src="./assets/assaf.png" alt="Assaf Shocher" width="220" height="260"><img class="photo-surprise" src="./assets/assaf-hover.png" alt="" width="220" height="260"></button></div><div class="home-research">{research_intro}</div>{socials()}</section>'''+publication_list()
shell('home','Assaf Shocher',home,math=True)
(root/'publications').mkdir(exist_ok=True)
(root/'publications'/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="canonical" href="https://assafshocher.github.io/#publications"><meta http-equiv="refresh" content="0;url=../index.html#publications"><title>Publications</title></head><body><a href="../index.html#publications">Publications are on the homepage.</a></body></html>')

members=json.loads((root/'members.json').read_text())
def member_card(member):
 name=e(member['name'])
 initials=''.join(word[0] for word in member['name'].split()[:2])
 photo_style=''
 if member.get('photo_crop'):
  x,y,size=member['photo_crop']
  photo_style=f' style="--portrait-width:{member["photo_width"]/size*100:.4f}%;--portrait-height:{member["photo_height"]/size*100:.4f}%;--portrait-left:{-x/size*100:.4f}%;--portrait-top:{-y/size*100:.4f}%"'
 photo=f'<img src="../{e(member["photo"])}" alt="{name}" width="{member.get("photo_width",160)}" height="{member.get("photo_height",160)}" loading="lazy"{photo_style}>' if member.get('photo') else f'<span class="person-initials" aria-hidden="true">{e(initials)}</span>'
 if member.get('photo_backdrop'):
  photo=f'<img class="portrait-backdrop" src="../{e(member["photo"])}" alt="" aria-hidden="true" loading="lazy">'+photo
 heading=f'<a href="{e(member["url"])}">{name}</a>' if member.get('url') else name
 photo_class='person-photo' if member.get('photo') else 'person-photo awaiting-photo'
 if member.get('photo_shape')=='circle': photo_class+=' round-portrait'
 role=member.get('role') or member['degree']+' student'
 return f'<article class="content-card person"><div class="{photo_class}">{photo}</div><div class="card-content"><h2 class="card-title">{heading}</h2><p class="card-details">{e(role)}</p></div></article>'
group=f'''<div class="simple-page"><header class="page-heading"><h1>Group</h1><p>Random order on each reload.</p></header><div class="people-grid">{''.join(member_card(member) for member in members)}</div></div>'''
shell('group','Group — Assaf Shocher',group)
teaching='''<div class="simple-page"><header class="page-heading"><h1>Teaching</h1></header><article class="content-card course-card"><a class="course-teaser" href="https://assafshocher.github.io/mcv/" aria-label="Modern Computer Vision course website"><img src="../assets/mcv-teaser.png" alt="From light to understanding: the computer vision pipeline" width="3910" height="1088" loading="lazy"></a><div class="card-content"><h2 class="card-title"><a href="https://assafshocher.github.io/mcv/">Modern Computer Vision (MCV)</a></h2><p class="card-details">00970202 · Technion · Faculty of Data and Decision Sciences</p></div></article></div>'''
shell('teaching','Teaching — Assaf Shocher',teaching)
other='''<div class="simple-page"><header class="page-heading"><h1>Other</h1><p>Two games for kids.</p></header><ul class="simple-list games-list"><li><h2><a class="game-link" href="https://assafshocher.github.io/beam_and_balance/"><img class="game-icon" src="../assets/beam-and-balance-icon.svg" alt="" width="52" height="52"><span>Beam &amp; Balance</span></a></h2></li><li><h2><a class="game-link" href="https://assafshocher.github.io/number_tower/"><span class="game-icon number-tower-mark" aria-hidden="true"><span>1</span><span>2</span><span>3</span></span><span>Number Tower</span></a></h2></li></ul></div>'''
shell('other','Other — Assaf Shocher',other)
personal_about='''<section class="personal-about" aria-labelledby="personal-heading"><div class="personal-copy"><h2 id="personal-heading">Personal</h2><p>I’m happily married to Shira, an amazing physician, and a father to Noam, Itamar, and Noga. We live in Rehovot and love travelling and eating.</p></div><figure class="family-photo"><img src="../assets/family.png" alt="Our family by the Golden Gate Bridge" width="1438" height="1916" loading="lazy"><figcaption>Disclaimer: Noga wasn’t born yet when we took this photo, so I added her with AI.</figcaption></figure></section>'''
bio='''Assaf Shocher is an Assistant Professor in the Faculty of Data and Decision Sciences at the Technion. His research focuses on deep learning and computer vision. Previously, he was a Postdoctoral Research Scientist at NVIDIA, a postdoctoral researcher at UC Berkeley with Alexei A. Efros, and a Visiting Scholar at Google DeepMind. He received his PhD from the Weizmann Institute of Science, advised by Michal Irani, and holds bachelor’s degrees in Physics and Electrical Engineering from Ben-Gurion University.'''
about=f'''<div class="simple-page"><header class="page-heading"><h1>About</h1></header><div class="prose about-prose"><p class="about-bio">{about_bio}</p><div class="bio-shortcut"><a class="paper-button" href="#bio-for-talks">Bio for talks <span aria-hidden="true">↓</span></a></div><h2>Selected honors and grants</h2><ul><li>Alon Fellowship (Exact Sciences and Engineering), 2026</li><li>Israel Science Foundation (ISF) — Personal Research Grant, 2026</li><li>Chaya Career Advancement Chair</li><li>Rothschild Postdoctoral Fellowship</li><li>Fulbright Postdoctoral Fellowship</li><li>John F. Kennedy Award for Outstanding PhD, Weizmann Institute</li><li>Blavatnik Award for CS PhD Graduates</li></ul>{personal_about}<h2>Contact</h2><p><a href="{mail}">assafshocher@gmail.com</a><br>Faculty of Data and Decision Sciences, Technion</p>{socials()}<section class="bio-section" id="bio-for-talks" aria-labelledby="bio-heading"><div class="bio-heading"><h2 id="bio-heading">Bio for talks</h2><button class="paper-button bio-copy" type="button" data-copy-bio aria-label="Copy short bio">{icon("copy")}<span>Copy bio</span></button></div><p id="speaker-bio">{bio}</p><p class="bio-copy-status" role="status" id="bio-copy-status"></p></section></div></div>'''
shell('about','About — Assaf Shocher',about)
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+site_url+path+'</loc></url>' for path in ['', 'group/', 'teaching/', 'about/', 'other/'])+'</urlset>\n')
print('Built five content pages, a publications redirect, and the sitemap.')
