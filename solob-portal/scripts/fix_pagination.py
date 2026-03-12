import os
import re

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Ensure pagebreak before Axioms & Invariants section
    # Search for Axioms header and check if there's a pagebreak before it
    axiom_pattern = re.compile(r'(\n(?:---|<br.*?>|\s)*?)\n## Axioms & Invariants', re.IGNORECASE)
    if axiom_pattern.search(content) and '<!-- pagebreak -->\n\n## Axioms & Invariants' not in content:
        content = axiom_pattern.sub(r'\n\n<!-- pagebreak -->\n\n## Axioms & Invariants', content)

    # 2. Insert pagebreak after intro section (usually before the first ## heading)
    # But only if it's the second ## heading or if the first one is after a significant intro
    # For simplicity, let's look for the first ## heading after the intro stars/dashes
    intro_pattern = re.compile(r'(\*(?:Now, read\.|Now read\.)\*)\s*\n\s*(?:---\s*)?\n\s*##\s*(.*?)\n', re.IGNORECASE)
    match = intro_pattern.search(content)
    if match:
        first_heading_start = match.start(2) - 3 # include the ## 
        # Find the SECOND ## heading to put a break before it
        second_heading_pattern = re.compile(r'\n##\s+(.*?)\n')
        headings = list(second_heading_pattern.finditer(content, match.end()))
        if headings and '<!-- pagebreak -->' not in content[:headings[0].start() + 10]:
             # Only insert if no pagebreak exists in the intro space
             insertion_point = headings[0].start()
             content = content[:insertion_point] + "\n\n<!-- pagebreak -->\n" + content[insertion_point:]

    # 3. Clean up legacy br tags and hr before pagebreaks
    content = content.replace("<br><br><br><br>", "")
    # Remove HR right before a pagebreak
    content = re.sub(r'---\s*\n\s*<!-- pagebreak -->', '<!-- pagebreak -->', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

chapter_paths = [
    r'c:\Users\Owner\Documents\Book of Solobility 2026\solob-portal\public\volume0\{:03d}_Chapter_{}.md'.format(i, name)
    for i, name in [
        (26, "Twenty_Six"), (27, "Twenty_Seven"), (28, "Twenty_Eight"), (29, "Twenty_Nine"), (30, "Thirty"),
        (31, "Thirty_One"), (32, "Thirty_Two"), (33, "Thirty_Three"), (34, "Thirty_Four"), (35, "Thirty_Five"), (36, "Thirty_Six")
    ]
]

for path in chapter_paths:
    process_file(path)
    print(f"Processed {os.path.basename(path)}")
