    const __langContext = (window && window.CanvasPatchContext && typeof window.CanvasPatchContext === 'object')
        ? window.CanvasPatchContext
        : null;
    const __langStateRoot = (__langContext && __langContext.state && typeof __langContext.state === 'object')
        ? __langContext.state
        : null;
    const __langState = (__langStateRoot && __langStateRoot.__LANG_STATE__ && typeof __langStateRoot.__LANG_STATE__ === 'object')
        ? __langStateRoot.__LANG_STATE__
        : null;
    if (!__langState) {{
        throw new Error('[lang_win_scope] __LANG_STATE__ invalid');
    }}

    const __primaryLanguage = (typeof __langState.primaryLanguage === 'string' && __langState.primaryLanguage)
        ? __langState.primaryLanguage
        : null;
    const __normalizedLanguages = Array.isArray(__langState.normalizedLanguages)
        ? __langState.normalizedLanguages
        : null;

    if (Array.isArray(__normalizedLanguages)) {{
        Object.freeze(__normalizedLanguages);
    }}
    if (typeof __primaryLanguage !== 'string' || !__primaryLanguage) {{
        throw new Error('[lang_win_scope] primaryLanguage invalid');
    }}
    if (!Array.isArray(__normalizedLanguages) || __normalizedLanguages.length === 0) {{
        throw new Error('[lang_win_scope] normalizedLanguages invalid');
    }}
    if (__normalizedLanguages[0] !== __primaryLanguage) {{
        throw new Error('[lang_win_scope] language != languages[0]');
    }}
