// Bolt Inspector for Next.js - Enhanced with Source Detection
// Version: 1.1.0 - Fixed file paths with /home/project prefix
// This version uses Next.js's built-in __source metadata from @babel/plugin-transform-react-jsx-source

if (typeof window !== 'undefined') {
  console.log('[Bolt Inspector Next.js] Initializing');
  console.log('[Bolt Inspector Next.js] Environment:', {
    nodeEnv: 'browser',
    isDev: true,
    framework: 'Next.js'
  });

  /**
   * Extract React Fiber from DOM element
   */
  function getReactFiber(element) {
    if (!element || typeof element !== 'object') return null;
    
    // React attaches fiber to DOM nodes with keys like __reactFiber$xxxxx
    const fiberKey = Object.keys(element).find(key => 
      key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
    );
    
    return fiberKey ? element[fiberKey] : null;
  }

  /**
   * Infer source file from DOM structure and class names
   * Since WebContainer Next.js doesn't provide __source, we use heuristics
   */
  function inferSourceFromDOM(element, fiber) {
    // Try to get component name
    const componentName = getComponentName(fiber);
    
    // Get element attributes that might hint at the file
    const className = element.className || '';
    const id = element.id || '';
    const tagName = element.tagName.toLowerCase();
    
    // Common patterns to identify components
    const patterns = {
      // Navigation/Header
      'nav': '/home/project/components/shared/navbar.tsx',
      'header': '/home/project/components/shared/navbar.tsx',
      'navbar': '/home/project/components/shared/navbar.tsx',
      
      // Hero/Slider
      'hero': '/home/project/components/storefront/hero-slider.tsx',
      'slider': '/home/project/components/storefront/hero-slider.tsx',
      'carousel': '/home/project/components/storefront/hero-slider.tsx',
      
      // Footer
      'footer': '/home/project/components/shared/footer.tsx',
      
      // Product cards
      'product': '/home/project/components/storefront/product-card.tsx',
      'card': '/home/project/components/storefront/product-card.tsx',
      
      // Category
      'category': '/home/project/components/storefront/category-card.tsx',
      'categories': '/home/project/components/storefront/category-card.tsx',
    };
    
    // Check class names for patterns
    const lowerClass = className.toLowerCase();
    const lowerId = id.toLowerCase();
    
    for (const [pattern, file] of Object.entries(patterns)) {
      if (lowerClass.includes(pattern) || lowerId.includes(pattern) || tagName === pattern) {
        return {
          fileName: file,
          lineNumber: 1,
          columnNumber: 1,
          inferred: true
        };
      }
    }
    
    // Check parent elements
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      const parentClass = (parent.className || '').toLowerCase();
      const parentId = (parent.id || '').toLowerCase();
      const parentTag = parent.tagName.toLowerCase();
      
      for (const [pattern, file] of Object.entries(patterns)) {
        if (parentClass.includes(pattern) || parentId.includes(pattern) || parentTag === pattern) {
          return {
            fileName: file,
            lineNumber: 1,
            columnNumber: 1,
            inferred: true
          };
        }
      }
      
      parent = parent.parentElement;
      depth++;
    }
    
    // Default to page component
    return {
      fileName: '/home/project/app/(storefront)/page.tsx',
      lineNumber: 1,
      columnNumber: 1,
      inferred: true
    };
  }
  
  /**
   * Walk up the fiber tree to find __source (Next.js provides this in dev mode)
   */
  function findSource(fiber, element) {
    let current = fiber;
    let depth = 0;
    const maxDepth = 50;
    
    while (current && depth < maxDepth) {
      // Next.js provides __source in memoizedProps
      if (current.memoizedProps && current.memoizedProps.__source) {
        return current.memoizedProps.__source;
      }
      
      // Also check _debugSource (fallback)
      if (current._debugSource) {
        return current._debugSource;
      }
      
      // Check type.__source (for some component types)
      if (current.type && typeof current.type === 'function' && current.type.__source) {
        return current.type.__source;
      }
      
      // Walk up to parent fiber
      current = current.return;
      depth++;
    }
    
    // If no source found, infer from DOM
    return inferSourceFromDOM(element, fiber);
  }

  /**
   * Get component name from React Fiber
   */
  function getComponentName(fiber) {
    if (!fiber) return 'Unknown';
    
    if (fiber.type?.name) return fiber.type.name;
    if (fiber.type?.displayName) return fiber.type.displayName;
    if (fiber.elementType?.name) return fiber.elementType.name;
    if (typeof fiber.type === 'string') return fiber.type;
    
    return 'Anonymous';
  }

  /**
   * Extract comprehensive styles from element
   */
  function extractElementStyles(element, fiber) {
    const computed = window.getComputedStyle(element);
    const props = fiber?.memoizedProps || {};
    
    return {
      // Source
      className: props.className || '',
      inlineStyle: props.style || {},
      
      // Computed values
      spacing: {
        marginTop: computed.marginTop,
        marginRight: computed.marginRight,
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        paddingTop: computed.paddingTop,
        paddingRight: computed.paddingRight,
        paddingBottom: computed.paddingBottom,
        paddingLeft: computed.paddingLeft,
      },
      typography: {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        textAlign: computed.textAlign,
        color: computed.color,
        letterSpacing: computed.letterSpacing,
        textTransform: computed.textTransform,
      },
      layout: {
        display: computed.display,
        width: computed.width,
        height: computed.height,
        flexDirection: computed.flexDirection,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
        gap: computed.gap,
        position: computed.position,
      },
      appearance: {
        backgroundColor: computed.backgroundColor,
        borderWidth: computed.borderWidth,
        borderStyle: computed.borderStyle,
        borderColor: computed.borderColor,
        borderRadius: computed.borderRadius,
        opacity: computed.opacity,
        boxShadow: computed.boxShadow,
      }
    };
  }

  // Initialize inspect mode state
  window.__BOLT_INSPECT_MODE_ENABLED__ = false;
  
  // Initialize design mode state
  window.__BOLT_DESIGN_MODE_ENABLED__ = false;
  window.__BOLT_HOVERED_ELEMENT__ = null;
  window.__BOLT_SELECTED_ELEMENT__ = null;
  window.__BOLT_ORIGINAL_STYLES__ = '';

  /**
   * Handle mouseover for design mode
   */
  function handleMouseOver(event) {
    if (!window.__BOLT_DESIGN_MODE_ENABLED__) return;
    
    const element = event.target;
    window.__BOLT_HOVERED_ELEMENT__ = element;
    
    // Add highlight
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
  }

  /**
   * Handle mouseout for design mode
   */
  function handleMouseOut(event) {
    if (!window.__BOLT_DESIGN_MODE_ENABLED__) return;
    
    const element = event.target;
    
    // Remove highlight
    element.style.outline = '';
    element.style.outlineOffset = '';
    
    if (window.__BOLT_HOVERED_ELEMENT__ === element) {
      window.__BOLT_HOVERED_ELEMENT__ = null;
    }
  }

  /**
   * Handle click for design mode
   */
  function handleClickDesignMode(event) {
    if (!window.__BOLT_DESIGN_MODE_ENABLED__) return;
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const element = event.target;
    const fiber = getReactFiber(element);
    
    if (!fiber) {
      console.log('[Design Mode] No React Fiber found');
      return;
    }
    
    // Store element reference and original styles
    window.__BOLT_SELECTED_ELEMENT__ = element;
    window.__BOLT_ORIGINAL_STYLES__ = element.style.cssText;
    
    // Try to find source info (Next.js __source or infer from DOM)
    const source = findSource(fiber, element);
    const styles = extractElementStyles(element, fiber);
    const componentName = getComponentName(fiber);
    
    console.log('[Design Mode] Element selected:', componentName);
    console.log('[Design Mode] Source info:', source);
    console.log('[Design Mode] Styles:', styles);
    
    // Send to parent with source info
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'BOLT_ELEMENT_SELECTED',
        payload: {
          componentName,
          elementType: element.tagName.toLowerCase(),
          file: source?.fileName,
          line: source?.lineNumber,
          column: source?.columnNumber,
          inferred: source?.inferred || false,
          styles,
        }
      }, '*');
    }
  }

  /**
   * Handle click for inspect mode (click-to-source)
   */
  function handleClickInspect(event) {
    if (!window.__BOLT_INSPECT_MODE_ENABLED__) return;
    if (window.__BOLT_DESIGN_MODE_ENABLED__) return; // Design mode takes priority
    
    try {
      const element = event.target;
      const fiber = getReactFiber(element);
      
      if (!fiber) {
        console.log('[Bolt Inspector] No React Fiber found');
        return;
      }
      
      const componentName = getComponentName(fiber);
      console.log('[Bolt Inspector] Found component:', componentName);
      
      // Find source in fiber tree (or infer from DOM)
      const source = findSource(fiber, element);
      
      if (!source || !source.fileName) {
        console.log('[Bolt Inspector] No source info found.');
        return;
      }
      
      console.log('[Bolt Inspector] Component clicked:', {
        fileName: source.fileName,
        lineNumber: source.lineNumber,
        columnNumber: source.columnNumber,
        inferred: source.inferred || false
      });
      
      // Send message to parent window (editor)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'BOLT_NAVIGATE_TO_SOURCE',
          payload: {
            file: source.fileName,
            line: source.lineNumber,
            column: source.columnNumber
          }
        }, '*');
      }
      
      event.preventDefault();
      event.stopPropagation();
      
    } catch (err) {
      console.debug('[Bolt Inspector] Error:', err);
    }
  }

  // Add design mode listener FIRST (capture phase)
  document.addEventListener('click', handleClickDesignMode, true);
  
  // Add inspect mode listener
  document.addEventListener('click', handleClickInspect, true);
  
  // Add design mode event listeners
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);

  // Listen for messages from parent
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'TOGGLE_INSPECT_MODE') {
      window.__BOLT_INSPECT_MODE_ENABLED__ = event.data.enabled;
      console.log('[Bolt Inspector] Inspect mode:', event.data.enabled ? 'ON' : 'OFF');
      
      if (event.data.enabled) {
        document.body.style.cursor = 'crosshair';
      } else {
        document.body.style.cursor = '';
      }
    }
    
    if (event.data && event.data.type === 'TOGGLE_DESIGN_MODE') {
      window.__BOLT_DESIGN_MODE_ENABLED__ = event.data.enabled;
      console.log('[Design Mode]:', event.data.enabled ? 'ON' : 'OFF');
      
      if (event.data.enabled) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = '';
        
        if (window.__BOLT_HOVERED_ELEMENT__) {
          window.__BOLT_HOVERED_ELEMENT__.style.outline = '';
          window.__BOLT_HOVERED_ELEMENT__.style.outlineOffset = '';
        }
      }
    }
    
    if (event.data && event.data.type === 'UPDATE_ELEMENT_STYLE') {
      const { property, value } = event.data.payload;
      const element = window.__BOLT_SELECTED_ELEMENT__;
      
      if (element) {
        element.style[property] = value;
        console.log('[Design Mode] Style updated:', property, '=', value);
      }
    }
    
    if (event.data && event.data.type === 'REVERT_ELEMENT_STYLES') {
      const element = window.__BOLT_SELECTED_ELEMENT__;
      
      if (element) {
        element.style.cssText = window.__BOLT_ORIGINAL_STYLES__;
        console.log('[Design Mode] Styles reverted');
      }
    }
  });

  console.log('[Bolt Inspector Next.js] Click listeners attached');
  console.log('[Design Mode] Event listeners attached');
  
  // ============================================
  // THUMBNAIL CAPTURE FUNCTIONALITY
  // ============================================
  
  async function captureThumbnail(width, height) {
    try {
      console.log('[Thumbnail] Capturing screenshot...', width, 'x', height);
      
      if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      
      const canvas = await html2canvas(document.body, {
        width: width,
        height: height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        windowWidth: width,
        windowHeight: height
      });
      
      const thumbnailData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('[Thumbnail] Captured successfully, size:', thumbnailData.length);
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'THUMBNAIL_CAPTURED',
          thumbnail: thumbnailData
        }, '*');
      }
      
    } catch (error) {
      console.error('[Thumbnail] Capture failed:', error);
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'THUMBNAIL_CAPTURED',
          thumbnail: null,
          error: error.message
        }, '*');
      }
    }
  }
  
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'CAPTURE_THUMBNAIL') {
      const { width, height } = event.data;
      captureThumbnail(width || 1200, height || 675);
    }
  });
  
  console.log('[Thumbnail] Capture listener attached');
}
