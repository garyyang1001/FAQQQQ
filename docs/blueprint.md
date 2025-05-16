# **App Name**: SchemaFAQ Generator

## Core Features:

- API Key Input: Accept user's OpenAI API key for accessing the models.
- URL Input: Accept a URL as input from the user. Example: https://lovetogether.com.tw/love-values-match/
- Keyword Extraction: Extract keywords from the title and content of the input URL using the gpt4o-mini model. The model will be used as a tool to identify only the best keywords.
- People Also Ask: Use Serper API with the extracted keywords to find 'People Also Ask' data. The model will use this as a tool for incorporating content in the output.
- FAQ Schema Generation: Generate FAQ schema structured data (JSON-LD) that is suitable for AI SEO based on the extracted content, 'People Also Ask' data, and using gpt4o-mini.

## Style Guidelines:

- Primary color: Light gray (#F5F5F5) for a clean and modern look.
- Secondary color: White (#FFFFFF) for content sections to provide contrast.
- Accent color: Teal (#008080) for interactive elements and highlights.
- Clean and readable sans-serif fonts for main content.
- Simple and consistent icons for input fields and actions.
- Clean and structured layout with clear sections for input, processing, and output.