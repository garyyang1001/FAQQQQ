// src/lib/enhanced-content-analyzer.ts - 最終修復版

import * as cheerio from 'cheerio';
import { AI_MODEL_CONFIGS } from './ai-model-configs';
import type {
  EnhancedContentAnalysisResult,
  KeywordAnalysis,
  ContentStructure,
  SeoElements,
  HeadingStructure,
  ImageAnalysis,
  LinkAnalysis,
  ExistingSchema,
  SeoScore,
  ContentRecommendation,
  ContentDepth,
  StructuralIntegrity,
  ContentDistribution,
  OpenGraphData,
  SeoImprovement
} from './enhanced-content-types';

export class EnhancedContentAnalyzer {
  private $: ReturnType<typeof cheerio.load>;
  private content: string;
  private baseUrl: string;

  constructor(html: string, url: string) {
    this.$ = cheerio.load(html);
    this.content = html;
    this.baseUrl = url;
  }

  async analyzeContent(openRouterApiKey: string): Promise<EnhancedContentAnalysisResult> {
    const [keywords, structure, seoElements] = await Promise.all([
      this.extractSemanticKeywords(openRouterApiKey),
      this.analyzeContentStructure(),
      this.extractAllSeoElements()
    ]);

    const recommendations = this.generateRecommendations(keywords, structure, seoElements);

    return {
      keywords,
      structure,
      seoElements,
      recommendations,
      analysisTimestamp: new Date().toISOString()
    };
  }

  async extractSemanticKeywords(openRouterApiKey: string): Promise<KeywordAnalysis> {
    // Extract text content for analysis
    const textContent = this.extractCleanText();
    const title = this.$('title').text();
    const metaDescription = this.$('meta[name="description"]').attr('content') || '';

    // Get AI-powered semantic analysis
    const semanticAnalysis = await this.performSemanticAnalysis(
      textContent, 
      title, 
      metaDescription, 
      openRouterApiKey
    );

    // Calculate keyword density
    const keywordDensity = this.calculateKeywordDensity(textContent);

    return {
      primaryKeywords: semanticAnalysis.primaryKeywords,
      secondaryKeywords: semanticAnalysis.secondaryKeywords,
      longTailKeywords: semanticAnalysis.longTailKeywords,
      semanticKeywords: semanticAnalysis.semanticKeywords,
      keywordDensity,
      topicClusters: semanticAnalysis.topicClusters
    };
  }

  private async performSemanticAnalysis(
    content: string, 
    title: string, 
    metaDescription: string,
    openRouterApiKey: string
  ) {
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: openRouterApiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    const prompt = `
    分析以下內容，提取語意關鍵字和主題群組：

    標題：${title}
    描述：${metaDescription}
    內容：${content.substring(0, 3000)}...

    請回傳JSON格式，包含：
    {
      "primaryKeywords": ["主要關鍵字3-5個"],
      "secondaryKeywords": ["次要關鍵字5-8個"],
      "longTailKeywords": ["長尾關鍵字3-5個"],
      "semanticKeywords": ["語意相關詞10-15個"],
      "topicClusters": [
        {
          "mainTopic": "主題名稱",
          "relatedTerms": ["相關詞彙"],
          "relevanceScore": 0.85
        }
      ]
    }
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL_CONFIGS.CONTENT_ANALYSIS.model,
        temperature: AI_MODEL_CONFIGS.CONTENT_ANALYSIS.temperature,
        top_p: AI_MODEL_CONFIGS.CONTENT_ANALYSIS.top_p,
        frequency_penalty: AI_MODEL_CONFIGS.CONTENT_ANALYSIS.frequency_penalty,
        max_tokens: AI_MODEL_CONFIGS.CONTENT_ANALYSIS.max_tokens,
        messages: [
          {
            role: 'system',
            content: '你是SEO關鍵字分析專家。分析內容並提取相關關鍵字和主題群組。回傳純JSON格式，不要其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const result = completion.choices[0].message.content || '{}';
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    } catch (error) {
      console.error('Semantic analysis failed:', error);
      // Fallback to basic keyword extraction
      return this.basicKeywordExtraction(content, title);
    }
  }

  private basicKeywordExtraction(content: string, title: string) {
    const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    return {
      primaryKeywords: title.split(/\s+/).slice(0, 3),
      secondaryKeywords: sortedWords.slice(0, 8),
      longTailKeywords: [] as string[],
      semanticKeywords: sortedWords.slice(8, 15),
      topicClusters: [] as Array<{
        mainTopic: string;
        relatedTerms: string[];
        relevanceScore: number;
      }>
    };
  }

  private calculateKeywordDensity(content: string) {
    const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const totalWords = words.length;
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: (count / totalWords) * 100,
        prominence: this.calculateKeywordProminence(keyword, content)
      }))
      .sort((a, b) => b.prominence - a.prominence)
      .slice(0, 50);
  }

  private calculateKeywordProminence(keyword: string, content: string): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    // Title presence (highest weight)
    if (this.$('title').text().toLowerCase().includes(lowerKeyword)) {
      score += 10;
    }

    // H1 presence
    if (this.$('h1').text().toLowerCase().includes(lowerKeyword)) {
      score += 8;
    }

    // Other headings
    for (let i = 2; i <= 6; i++) {
      if (this.$(`h${i}`).text().toLowerCase().includes(lowerKeyword)) {
        score += (7 - i);
      }
    }

    // First paragraph
    const firstParagraph = this.$('p').first().text().toLowerCase();
    if (firstParagraph.includes(lowerKeyword)) {
      score += 5;
    }

    // Meta description
    const metaDesc = this.$('meta[name="description"]').attr('content') || '';
    if (metaDesc.toLowerCase().includes(lowerKeyword)) {
      score += 7;
    }

    return score;
  }

  analyzeContentStructure(): ContentStructure {
    const textContent = this.extractCleanText();
    const wordCount = textContent.split(/\s+/).length;
    
    return {
      wordCount,
      readabilityScore: this.calculateReadabilityScore(textContent),
      contentDepth: this.assessContentDepth(textContent, wordCount),
      topicalRelevance: this.calculateTopicalRelevance(),
      structuralIntegrity: this.analyzeStructuralIntegrity()
    };
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch Reading Ease for Chinese/English content
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simplified scoring
    if (avgWordsPerSentence <= 15) return 80;
    if (avgWordsPerSentence <= 20) return 70;
    if (avgWordsPerSentence <= 25) return 60;
    return 50;
  }

  private assessContentDepth(text: string, wordCount: number): ContentDepth {
    const indicators: string[] = [];
    let score = 0;

    if (wordCount > 2000) {
      score += 25;
      indicators.push('Comprehensive word count');
    }

    if (this.$('h2, h3, h4').length >= 3) {
      score += 25;
      indicators.push('Good heading structure');
    }

    if (this.$('ul, ol').length >= 2) {
      score += 15;
      indicators.push('Lists and structured content');
    }

    if (this.$('img').length >= 2) {
      score += 15;
      indicators.push('Visual content support');
    }

    if (this.$('a[href^="http"]').length >= 3) {
      score += 10;
      indicators.push('External references');
    }

    const level: ContentDepth['level'] = score >= 75 ? 'expert' : 
                  score >= 50 ? 'comprehensive' : 
                  score >= 25 ? 'moderate' : 'surface';

    return { level, score, indicators };
  }

  private calculateTopicalRelevance(): number {
    // Calculate based on heading consistency, keyword distribution, etc.
    const headings: string[] = [];
    this.$('h1, h2, h3, h4, h5, h6').each((index: number, element: any) => {
      headings.push(this.$(element).text());
    });
    const title = this.$('title').text();
    
    // Simple relevance calculation
    return headings.length >= 3 ? 85 : 70;
  }

  private analyzeStructuralIntegrity(): StructuralIntegrity {
    const headings: Array<{level: number, text: string}> = [];
    this.$('h1, h2, h3, h4, h5, h6').each((index: number, element: any) => {
      headings.push({
        level: parseInt(element.tagName.substring(1)),
        text: this.$(element).text()
      });
    });

    const hasProperHierarchy = this.checkHeadingHierarchy(headings);
    const headingGaps = this.findHeadingGaps(headings);
    
    return {
      hasProperHeadingHierarchy: hasProperHierarchy,
      headingGaps,
      contentDistribution: this.analyzeContentDistribution(),
      logicalFlow: hasProperHierarchy ? 85 : 60
    };
  }

  private checkHeadingHierarchy(headings: Array<{level: number, text: string}>): boolean {
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i-1].level;
      if (diff > 1) return false; // Skip levels
    }
    return true;
  }

  private findHeadingGaps(headings: Array<{level: number}>): number[] {
    const gaps: number[] = [];
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i-1].level;
      if (diff > 1) gaps.push(diff);
    }
    return gaps;
  }

  private analyzeContentDistribution(): ContentDistribution {
    const paragraphs: string[] = [];
    this.$('p').each((index: number, element: any) => {
      paragraphs.push(this.$(element).text());
    });
    
    const totalLength = paragraphs.join(' ').length;
    const avgParagraphLength = totalLength / paragraphs.length || 0;

    return {
      introduction: 20, // Simplified
      body: 70,
      conclusion: 10,
      averageParagraphLength: avgParagraphLength
    };
  }

  extractAllSeoElements(): SeoElements {
    return {
      metaDescription: this.$('meta[name="description"]').attr('content') || '',
      metaKeywords: (this.$('meta[name="keywords"]').attr('content') || '').split(',').map((k: string) => k.trim()),
      title: this.$('title').text(),
      canonicalUrl: this.$('link[rel="canonical"]').attr('href'),
      openGraphData: this.extractOpenGraphData(),
      headings: this.extractHeadingStructure(),
      imageAlts: this.analyzeImages(),
      internalLinks: this.analyzeLinks(true),
      externalLinks: this.analyzeLinks(false),
      schemaExisting: this.extractExistingSchema(),
      seoScore: this.calculateSeoScore()
    };
  }

  private extractOpenGraphData(): OpenGraphData {
    return {
      title: this.$('meta[property="og:title"]').attr('content'),
      description: this.$('meta[property="og:description"]').attr('content'),
      image: this.$('meta[property="og:image"]').attr('content'),
      url: this.$('meta[property="og:url"]').attr('content'),
      type: this.$('meta[property="og:type"]').attr('content')
    };
  }

  private extractHeadingStructure(): HeadingStructure[] {
    const headings: HeadingStructure[] = [];
    
    this.$('h1, h2, h3, h4, h5, h6').each((index: number, element: any) => {
      const $el = this.$(element);
      const level = parseInt(element.tagName.substring(1)) as 1|2|3|4|5|6;
      const text = $el.text().trim();
      
      headings.push({
        level,
        text,
        wordCount: text.split(/\s+/).length,
        keywords: this.extractKeywordsFromText(text),
        position: 0, // Could calculate actual position
        children: []
      });
    });

    return this.buildHeadingHierarchy(headings);
  }

  private buildHeadingHierarchy(headings: HeadingStructure[]): HeadingStructure[] {
    // Simplified hierarchy building
    return headings; // In real implementation, build proper hierarchy
  }

  private extractKeywordsFromText(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 3).slice(0, 3);
  }

  private analyzeImages(): ImageAnalysis[] {
    const images: ImageAnalysis[] = [];
    
    this.$('img').each((index: number, element: any) => {
      const $img = this.$(element);
      const alt = $img.attr('alt') || '';
      const src = $img.attr('src') || '';
      
      images.push({
        src,
        alt,
        title: $img.attr('title'),
        isOptimized: alt.length > 0 && alt.length < 125,
        seoScore: this.calculateImageSeoScore(alt, src),
        suggestedAlt: alt ? undefined : this.generateSuggestedAlt(src)
      });
    });

    return images;
  }

  private calculateImageSeoScore(alt: string, src: string): number {
    let score = 0;
    if (alt && alt.length > 0) score += 50;
    if (alt && alt.length > 10 && alt.length < 125) score += 30;
    if (src.includes('jpg') || src.includes('png') || src.includes('webp')) score += 20;
    return Math.min(score, 100);
  }

  private generateSuggestedAlt(src: string): string {
    const filename = src.split('/').pop()?.split('.')[0] || 'image';
    return filename.replace(/[-_]/g, ' ');
  }

  private analyzeLinks(internal: boolean): LinkAnalysis[] {
    const links: LinkAnalysis[] = [];
    const selector = internal ? 'a[href^="/"], a[href*="' + this.getBaseDomain() + '"]' : 'a[href^="http"]:not([href*="' + this.getBaseDomain() + '"])';
    
    this.$(selector).each((index: number, element: any) => {
      const $link = this.$(element);
      const href = $link.attr('href') || '';
      const anchorText = $link.text().trim();
      
      links.push({
        href,
        anchorText,
        isInternal: internal,
        isNoFollow: $link.attr('rel')?.includes('nofollow') || false,
        targetPage: href,
        contextRelevance: this.calculateLinkRelevance(anchorText),
        seoValue: this.calculateLinkSeoValue(anchorText, href, internal)
      });
    });

    return links;
  }

  private getBaseDomain(): string {
    try {
      return new URL(this.baseUrl).hostname;
    } catch {
      return '';
    }
  }

  private calculateLinkRelevance(anchorText: string): number {
    // Simplified relevance calculation
    return anchorText.length > 2 && anchorText.length < 60 ? 80 : 50;
  }

  private calculateLinkSeoValue(anchorText: string, href: string, isInternal: boolean): number {
    let score = 0;
    if (anchorText.length > 2) score += 30;
    if (!anchorText.toLowerCase().includes('click here')) score += 20;
    if (isInternal) score += 25;
    if (href.includes('https')) score += 25;
    return score;
  }

  private extractExistingSchema(): ExistingSchema[] {
    const schemas: ExistingSchema[] = [];
    
    this.$('script[type="application/ld+json"]').each((index: number, element: any) => {
      const content = this.$(element).html() || '';
      try {
        const parsed = JSON.parse(content);
        schemas.push({
          type: parsed['@type'] || 'Unknown',
          content,
          isValid: true,
          suggestions: []
        });
      } catch {
        schemas.push({
          type: 'Invalid',
          content,
          isValid: false,
          suggestions: ['Fix JSON syntax errors']
        });
      }
    });

    return schemas;
  }

  private calculateSeoScore(): SeoScore {
    const metaTags = this.scoreMeta();
    const headingStructure = this.scoreHeadings();
    const imageOptimization = this.scoreImages();
    const linkStructure = this.scoreLinks();
    const contentQuality = this.scoreContent();
    const schemaMarkup = this.scoreSchema();

    const overall = Math.round(
      (metaTags + headingStructure + imageOptimization + linkStructure + contentQuality + schemaMarkup) / 6
    );

    return {
      overall,
      breakdown: {
        metaTags,
        headingStructure,
        imageOptimization,
        linkStructure,
        contentQuality,
        schemaMarkup
      },
      improvements: this.generateSeoImprovements()
    };
  }

  private scoreMeta(): number {
    let score = 0;
    if (this.$('title').text().length > 0) score += 25;
    if (this.$('meta[name="description"]').attr('content')) score += 25;
    if (this.$('title').text().length >= 30 && this.$('title').text().length <= 60) score += 25;
    if (this.$('meta[name="description"]').attr('content')?.length && 
        this.$('meta[name="description"]').attr('content')!.length >= 120 && 
        this.$('meta[name="description"]').attr('content')!.length <= 160) score += 25;
    return score;
  }

  private scoreHeadings(): number {
    let score = 0;
    if (this.$('h1').length === 1) score += 30;
    if (this.$('h2').length >= 2) score += 25;
    if (this.$('h3').length >= 1) score += 20;
    if (this.checkHeadingHierarchy(this.extractBasicHeadings())) score += 25;
    return score;
  }

  private extractBasicHeadings(): Array<{level: number, text: string}> {
    const headings: Array<{level: number, text: string}> = [];
    this.$('h1, h2, h3, h4, h5, h6').each((index: number, element: any) => {
      headings.push({
        level: parseInt(element.tagName.substring(1)),
        text: this.$(element).text()
      });
    });
    return headings;
  }

  private scoreImages(): number {
    const images = this.$('img');
    if (images.length === 0) return 100; // No images, no penalty
    
    let imagesWithAlt = 0;
    this.$('img').each((index: number, element: any) => {
      if (this.$(element).attr('alt')) {
        imagesWithAlt++;
      }
    });
    
    return Math.round((imagesWithAlt / images.length) * 100);
  }

  private scoreLinks(): number {
    let score = 0;
    const internalLinks = this.$('a[href^="/"], a[href*="' + this.getBaseDomain() + '"]').length;
    const externalLinks = this.$('a[href^="http"]:not([href*="' + this.getBaseDomain() + '"])').length;
    
    if (internalLinks >= 2) score += 40;
    if (externalLinks >= 1) score += 30;
    
    let linksWithText = 0;
    this.$('a').each((index: number, element: any) => {
      if (this.$(element).text().trim().length > 2) {
        linksWithText++;
      }
    });
    
    if (linksWithText > 0) score += 30;
    return score;
  }

  private scoreContent(): number {
    const textContent = this.extractCleanText();
    const wordCount = textContent.split(/\s+/).length;
    
    let score = 0;
    if (wordCount >= 300) score += 25;
    if (wordCount >= 800) score += 25;
    if (this.$('p').length >= 3) score += 25;
    if (this.$('ul, ol').length >= 1) score += 25;
    return score;
  }

  private scoreSchema(): number {
    const schemas = this.$('script[type="application/ld+json"]').length;
    return schemas > 0 ? 100 : 0;
  }

  private generateSeoImprovements(): SeoImprovement[] {
    const improvements: SeoImprovement[] = [];
    
    if (!this.$('meta[name="description"]').attr('content')) {
      improvements.push({
        category: 'critical',
        issue: '缺少 Meta Description',
        suggestion: '新增 meta description 標籤，長度建議 120-160 字元',
        impact: 8
      });
    }

    if (this.$('h1').length !== 1) {
      improvements.push({
        category: 'important',
        issue: 'H1 標籤數量不正確',
        suggestion: '每頁應該只有一個 H1 標籤',
        impact: 7
      });
    }

    let imagesWithoutAlt = 0;
    this.$('img').each((index: number, element: any) => {
      if (!this.$(element).attr('alt')) {
        imagesWithoutAlt++;
      }
    });

    if (imagesWithoutAlt > 0) {
      improvements.push({
        category: 'important',
        issue: `${imagesWithoutAlt} 個圖片缺少 Alt 文字`,
        suggestion: '為所有圖片新增描述性的 alt 屬性',
        impact: 6
      });
    }

    return improvements;
  }

  private generateRecommendations(
    keywords: KeywordAnalysis, 
    structure: ContentStructure, 
    seoElements: SeoElements
  ): ContentRecommendation[] {
    const recommendations: ContentRecommendation[] = [];

    // Keyword recommendations
    if (keywords.primaryKeywords.length < 3) {
      recommendations.push({
        type: 'keyword',
        priority: 'high',
        title: '增強關鍵字策略',
        description: '建議增加更多相關的主要關鍵字以提升主題相關性',
        actionItems: [
          '在標題中加入更多相關關鍵字',
          '在 H2、H3 標籤中自然地融入關鍵字',
          '在首段落中提及核心關鍵字'
        ],
        expectedImpact: '提升 15-25% 的相關關鍵字排名'
      });
    }

    // Structure recommendations
    if (structure.wordCount < 800) {
      recommendations.push({
        type: 'structure',
        priority: 'medium',
        title: '擴充內容深度',
        description: '內容長度較短，建議增加更多有價值的資訊',
        actionItems: [
          '新增更詳細的說明和範例',
          '加入相關的子主題',
          '提供更深入的分析或見解'
        ],
        expectedImpact: '改善使用者參與度和搜尋排名'
      });
    }

    // SEO recommendations
    if (seoElements.seoScore.overall < 80) {
      recommendations.push({
        type: 'seo',
        priority: 'high',
        title: 'SEO 技術最佳化',
        description: '整體 SEO 分數有改善空間',
        actionItems: seoElements.seoScore.improvements.map(imp => imp.suggestion),
        expectedImpact: '提升整體搜尋引擎可見度'
      });
    }

    return recommendations;
  }

  private extractCleanText(): string {
    // Remove script, style, nav, footer, aside elements
    const $clone = cheerio.load(this.content);
    $clone('script, style, nav, footer, aside, .nav, .footer, .sidebar').remove();
    
    // Get text from main content areas
    const mainContent = $clone('main, article, .content, .post-content, .entry-content').first();
    if (mainContent.length > 0) {
      return mainContent.text().replace(/\s+/g, ' ').trim();
    }
    
    // Fallback to body
    return $clone('body').text().replace(/\s+/g, ' ').trim();
  }
}