// src/lib/enhanced-content-types.ts

export interface KeywordAnalysis {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  semanticKeywords: string[];
  keywordDensity: KeywordDensity[];
  topicClusters: TopicCluster[];
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number; // percentage
  prominence: number; // weighted score based on position
}

export interface TopicCluster {
  mainTopic: string;
  relatedTerms: string[];
  relevanceScore: number;
}

export interface ContentStructure {
  wordCount: number;
  readabilityScore: number;
  contentDepth: ContentDepth;
  topicalRelevance: number;
  structuralIntegrity: StructuralIntegrity;
}

export interface ContentDepth {
  level: 'surface' | 'moderate' | 'comprehensive' | 'expert';
  score: number;
  indicators: string[];
}

export interface StructuralIntegrity {
  hasProperHeadingHierarchy: boolean;
  headingGaps: number[];
  contentDistribution: ContentDistribution;
  logicalFlow: number; // 0-100 score
}

export interface ContentDistribution {
  introduction: number; // percentage of content
  body: number;
  conclusion: number;
  averageParagraphLength: number;
}

export interface SeoElements {
  metaDescription: string;
  metaKeywords: string[];
  title: string;
  canonicalUrl?: string;
  openGraphData: OpenGraphData;
  headings: HeadingStructure[];
  imageAlts: ImageAnalysis[];
  internalLinks: LinkAnalysis[];
  externalLinks: LinkAnalysis[];
  schemaExisting: ExistingSchema[];
  seoScore: SeoScore;
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export interface HeadingStructure {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  wordCount: number;
  keywords: string[];
  position: number; // character position in content
  children: HeadingStructure[];
}

export interface ImageAnalysis {
  src: string;
  alt: string;
  title?: string;
  isOptimized: boolean;
  seoScore: number;
  suggestedAlt?: string;
}

export interface LinkAnalysis {
  href: string;
  anchorText: string;
  isInternal: boolean;
  isNoFollow: boolean;
  targetPage?: string;
  contextRelevance: number;
  seoValue: number;
}

export interface ExistingSchema {
  type: string;
  content: string;
  isValid: boolean;
  suggestions: string[];
}

export interface SeoScore {
  overall: number; // 0-100
  breakdown: {
    metaTags: number;
    headingStructure: number;
    imageOptimization: number;
    linkStructure: number;
    contentQuality: number;
    schemaMarkup: number;
  };
  improvements: SeoImprovement[];
}

export interface SeoImprovement {
  category: 'critical' | 'important' | 'minor';
  issue: string;
  suggestion: string;
  impact: number; // estimated SEO impact 0-10
}

export interface EnhancedContentAnalysisResult {
  keywords: KeywordAnalysis;
  structure: ContentStructure;
  seoElements: SeoElements;
  recommendations: ContentRecommendation[];
  analysisTimestamp: string;
}

export interface ContentRecommendation {
  type: 'keyword' | 'structure' | 'seo' | 'readability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
}