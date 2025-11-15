/**
 * Parse price from string format like "$649.00" to number
 */
export function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  // Remove $ and convert to number
  const cleanPrice = priceStr.replace('$', '').replace(',', '').trim();
  return parseFloat(cleanPrice) || 0;
}

/**
 * Parse ingredients from HTML string
 * Handles ingredient descriptions that contain feature descriptions (starting with "-")
 * followed by the actual ingredient list
 */
export function parseIngredients(ingredientDesc?: string): string[] {
  if (!ingredientDesc) return [];
  
  try {
    // Remove HTML tags and extract text
    let text = ingredientDesc
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n');
    
    const lines = text.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    let workingLines = lines;
    if (lines.length === 1 && text.includes('.')) {
      
      workingLines = text.split(/(?<=\.)\s+(?=[A-Z])/).map(line => line.trim()).filter(line => line.length > 0);
    }
    
    // Find where the actual ingredient list starts
    // Feature descriptions typically start with "-" and contain ":"
    let ingredientListStartIndex = -1;
    
    for (let i = 0; i < workingLines.length; i++) {
      const line = workingLines[i];

      if (line.startsWith('-') && line.includes(':')) {
        continue;
      }
      
      const looksLikeIngredientList = 
        !line.startsWith('-') && 
        (line.includes('/') || 
         /^[A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)*/.test(line) ||
         line.match(/^(Water|Aqua|Glycerin|Squalane)/i));
      
      if (looksLikeIngredientList) {
        ingredientListStartIndex = i;
        break;
      }
    }
    
    let ingredientText = '';
    if (ingredientListStartIndex >= 0) {

      const ingredientLines: string[] = [];
      for (let i = ingredientListStartIndex; i < workingLines.length; i++) {
        const line = workingLines[i];

        if (line.toLowerCase().includes('subject to change') || 
            line.toLowerCase().includes('consult the packaging') ||
            line.toLowerCase().includes('please consult')) {
          break;
        }
        ingredientLines.push(line);
      }
      ingredientText = ingredientLines.join(' ');
    } else {
      let filteredText = text;
      
      filteredText = filteredText.replace(/-\s*[A-Z][^:]+:\s*[^.]*\./g, '');
      
      if (filteredText.trim().length > 0) {
        ingredientText = filteredText.trim();
      } else {

        const ingredientMatch = text.match(/(?:^|\s)(Water|Aqua|Glycerin|Squalane)[^.]*/i);
        if (ingredientMatch) {
          ingredientText = ingredientMatch[0].trim();
        } else {
          ingredientText = text;
        }
      }
    }
    
    ingredientText = ingredientText.replace(
      /The list of ingredients is subject to change[^.]*\./gi, 
      ''
    ).trim();
    
    // Split by comma or semicolon to get individual ingredients
    const ingredients = ingredientText
      .split(/[,;]/)
      .map(ing => ing.trim())
      .filter(ing => {
        if (ing.length === 0) return false;
        if (ing.toLowerCase().includes('subject to change')) return false;
        if (ing.toLowerCase().includes('consult the packaging')) return false;

        if (ing.length > 50) return false; // Too long
        if (/^(resilient|visibly|support|strong|while|and|improving|texture|brightens|reducing|look|lines|wrinkles|dark|spots|hydrate|plump|prevent|water loss|silky|smooth)/i.test(ing)) {
          return false;
        }
        return true;
      });
    
    return ingredients;
  } catch (error) {
    console.error('Error parsing ingredients:', error);
    return [];
  }
}

/**
 * Extract highlighted ingredients from highlights array
 */
export function extractHighlightedIngredients(highlights?: Array<{ name: string; description?: string }>): string[] {
  if (!highlights || highlights.length === 0) return [];
  
  // Extract ingredient names from highlights
  // Some highlights might be "Vegan", "Cruelty-Free", etc., so we filter for ingredient-like names
  return highlights
    .map(h => h.name)
    .filter(name => {
      // Filter out non-ingredient highlights (like "Vegan", "Cruelty-Free")
      const nonIngredientKeywords = ['vegan', 'cruelty-free', 'paraben-free', 'sulfate-free', 'fragrance-free'];
      return !nonIngredientKeywords.some(keyword => name.toLowerCase().includes(keyword));
    });
}

/**
 * Remove HTML tags from text while preserving line breaks
 */
function stripHtml(html: string): string {
  if (!html) return '';
  
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  
  text = text.replace(/<[^>]*>/g, '');
  
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\n\s*\n/g, '\n'); // Remove multiple consecutive newlines
  
  return text.trim();
}

/**
 * Parse description HTML and extract structured data
 * Returns: { cleanDescription, skinTypes, skinConcerns }
 */
function parseDescription(descriptionHtml: string): {
  cleanDescription: string;
  skinTypes: string[];
  skinConcerns: string[];
} {
  if (!descriptionHtml) {
    return { cleanDescription: '', skinTypes: [], skinConcerns: [] };
  }

  let cleanDescription = '';
  const skinTypes: string[] = [];
  const skinConcerns: string[] = [];

  // Extract "What it is" section - match content after the strong tag until next strong tag or end
  const whatItIsRegex = /<strong>What it is:\s*<\/strong>([\s\S]*?)(?=<strong>|<\/p>|$)/i;
  const whatItIsMatch = descriptionHtml.match(whatItIsRegex);
  if (whatItIsMatch && whatItIsMatch[1]) {
    // Extract text from the matched content, handling nested HTML
    let whatItIsText = whatItIsMatch[1];
    // Remove any trailing </p> tags and everything after
    whatItIsText = whatItIsText.replace(/<\/p>.*$/, '');
    // Clean HTML and extract just the text
    cleanDescription = stripHtml(whatItIsText).trim();
  } else {
    // Fallback: if no "What it is" section found, try to get first paragraph
    const firstParagraphMatch = descriptionHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (firstParagraphMatch && firstParagraphMatch[1]) {
      const text = stripHtml(firstParagraphMatch[1]);
      // Only use if it doesn't contain "Skin Type" or "Skincare Concerns"
      if (!text.match(/Skin Type|Skincare Concerns/i)) {
        cleanDescription = text.trim();
      }
    }
  }

  // Extract "Skin Type" section
  const skinTypeRegex = /<strong>Skin Type:\s*<\/strong>([\s\S]*?)(?=<strong>|<\/p>|$)/i;
  const skinTypeMatch = descriptionHtml.match(skinTypeRegex);
  if (skinTypeMatch && skinTypeMatch[1]) {
    let skinTypeText = skinTypeMatch[1];
    // Remove any trailing </p> tags
    skinTypeText = skinTypeText.replace(/<\/p>.*$/, '');
    const cleanedText = stripHtml(skinTypeText);
    // Split by comma, "and", or "&"
    const types = cleanedText
      .split(/,|\s+and\s+|\s*&\s*/i)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    skinTypes.push(...types);
  }

  // Extract "Skincare Concerns" section
  const concernsRegex = /<strong>Skincare Concerns:\s*<\/strong>([\s\S]*?)(?=<strong>|<\/p>|$)/i;
  const concernsMatch = descriptionHtml.match(concernsRegex);
  if (concernsMatch && concernsMatch[1]) {
    let concernsText = concernsMatch[1];
    // Remove any trailing </p> tags
    concernsText = concernsText.replace(/<\/p>.*$/, '');
    const cleanedText = stripHtml(concernsText);
    // Split by comma, "and", or "&"
    const concerns = cleanedText
      .split(/,|\s+and\s+|\s*&\s*/i)
      .map(c => c.trim())
      .filter(c => c.length > 0);
    skinConcerns.push(...concerns);
  }

  return { cleanDescription, skinTypes, skinConcerns };
}

/**
 * Clean suggestedUsage field - remove HTML but preserve line breaks
 */
function cleanSuggestedUsage(usageHtml: string): string {
  if (!usageHtml) return '';
  
  let text = usageHtml.replace(/<br\s*\/?>/gi, '\n');
  
  text = text.replace(/<[^>]*>/g, '');
  
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up formatting - remove "Suggested Usage:" header if present
  text = text.replace(/^Suggested\s+Usage:?\s*/i, '');
  
  const lines = text.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Format each line as a bullet point if it doesn't already start with "-"
  const formattedLines = lines.map(line => {
    // If line already starts with "-", keep it as is (but ensure proper spacing)
    if (line.startsWith('-')) {
      return line.replace(/^-\s*/, '- ').trim();
    }
    // Otherwise, add "- " prefix
    return `- ${line}`;
  });
  
  return formattedLines.join('\n');
}

/**
 * Clean a single product's description, suggestedUsage, and extract skin_type/skin_concerns
 */
export function cleanProductData(product: any): {
  description: string;
  skin_type: string[];
  skin_concerns: string[];
  suggestedUsage: string;
  detailed_description?: string;
} {
  const { cleanDescription, skinTypes, skinConcerns } = parseDescription(product.description || '');
  
  return {
    description: cleanDescription,
    skin_type: skinTypes,
    skin_concerns: skinConcerns,
    suggestedUsage: cleanSuggestedUsage(product.suggestedUsage || ''),
    detailed_description: product.detailed_description ? stripHtml(product.detailed_description) : undefined
  };
}
