import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface SynapseDictionaryEntry {
  definition: string;
  source: string;
}

export function useSynapse() {
  const [synapseDictionary, setSynapseDictionary] = useState<Record<string, SynapseDictionaryEntry>>({});
  const [activeSynapse, setActiveSynapse] = useState<{
    term: string;
    definition: string;
    sourceChapter: string;
    rect: DOMRect;
  } | null>(null);

  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const response = await fetch('/volume0/Key_Terms_Words.md');
        if (response.ok) {
          const text = await response.text();
          const lines = text.split('\n');
          const dict: Record<string, SynapseDictionaryEntry> = {};

          let currentTerm = '';
          let currentDef = '';

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('### ')) {
              if (currentTerm) {
                dict[currentTerm.toLowerCase()] = { definition: currentDef.trim(), source: 'Volume 0 Glossary' };
              }
              currentTerm = line.replace('### ', '').trim();
              currentDef = '';
            } else if (currentTerm && line.trim() !== '') {
              currentDef += line + ' ';
            }
          }
          if (currentTerm) {
            dict[currentTerm.toLowerCase()] = { definition: currentDef.trim(), source: 'Volume 0 Glossary' };
          }
          setSynapseDictionary(dict);
        }
      } catch (e) {
        console.error("Failed to load Synapse Dictionary", e);
      }
    };
    fetchDictionary();
  }, []);

  const processContentWithSynapses = (rawMarkdown: string) => {
    if (!rawMarkdown) return '';
    const rawHtml = marked.parse(rawMarkdown, { async: false }) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    if (Object.keys(synapseDictionary).length === 0) return cleanHtml;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;

    const terms = Object.keys(synapseDictionary).sort((a, b) => b.length - a.length);
    if (terms.length === 0) return cleanHtml;

    const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

    const walkNode = (node: Node) => {
      if (node.nodeType === 1) {
        const el = node as Element;
        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'CODE', 'PRE'].includes(el.tagName)) {
          return;
        }
      }

      if (node.nodeType === 3) {
        const text = node.nodeValue || '';
        if (pattern.test(text)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(pattern, (match) => {
            return `<span class="synapse-term" data-term="${match.toLowerCase()}">${match}</span>`;
          });
          node.parentNode?.replaceChild(span, node);
        }
      } else {
        const children = Array.from(node.childNodes);
        children.forEach(walkNode);
      }
    };

    walkNode(tempDiv);
    return tempDiv.innerHTML;
  };

  const handleContentClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('synapse-term')) {
      const termKey = target.getAttribute('data-term');
      if (termKey && synapseDictionary[termKey]) {
        const rect = target.getBoundingClientRect();
        setActiveSynapse({
          term: termKey.toUpperCase(),
          definition: synapseDictionary[termKey].definition,
          sourceChapter: synapseDictionary[termKey].source,
          rect
        });
      }
    } else {
      setActiveSynapse(null);
    }
  };

  return {
    activeSynapse,
    setActiveSynapse,
    processContentWithSynapses,
    handleContentClick,
    synapseDictionary
  };
}
