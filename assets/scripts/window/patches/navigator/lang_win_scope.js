    // Languages stable final setting (moved here to guarantee availability before nav_total_set.js)
    // FrozenArray semantics (минимально приближенно): массив заморожен
    if (Array.isArray(window.__normalizedLanguages)) {{
        Object.freeze(window.__normalizedLanguages);
    }}

    // fail-fast: типы и консистентность
    if (typeof window.__primaryLanguage !== 'string' || !window.__primaryLanguage) {{
        throw new Error('THW: __primaryLanguage invalid');
    }}
    if (!Array.isArray(window.__normalizedLanguages) || window.__normalizedLanguages.length === 0) {{
        throw new Error('THW: __normalizedLanguages invalid');
    }}
    if (window.__normalizedLanguages[0] !== window.__primaryLanguage) {{
        throw new Error('THW: language != languages[0]');
    }}