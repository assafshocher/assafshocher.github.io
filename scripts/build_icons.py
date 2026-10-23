"""Export the Penrose A vector as browser and home-screen icons.

Requires Pillow. Geometry comes directly from assets/a-mark.svg.
"""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
source = ET.parse(root / 'assets/a-mark.svg').getroot()
x, y, width, height = map(float, source.attrib['viewBox'].split())

def render(size):
    scale = 8
    image = Image.new('RGBA', (size * scale, size * scale), '#fcfcfa')
    draw = ImageDraw.Draw(image)
    for shape in source.iter('{http://www.w3.org/2000/svg}path'):
        # The approved mark consists of three closed straight-sided polygons.
        if re.search(r'[^MLZmlz\d.\s,-]', shape.attrib['d']):
            raise ValueError('Icon exporter only supports polygonal paths')
        numbers = list(map(float, re.findall(r'-?\d+(?:\.\d+)?', shape.attrib['d'])))
        points = [((numbers[i] - x) / width * size * scale,
                   (numbers[i + 1] - y) / height * size * scale)
                  for i in range(0, len(numbers), 2)]
        draw.polygon(points, fill=shape.attrib['fill'])
    return image.resize((size, size), Image.Resampling.LANCZOS)

render(256).save(root / 'favicon.ico', sizes=[(s, s) for s in [16, 32, 48, 64, 256]])
render(180).convert('RGB').save(root / 'apple-touch-icon.png')
