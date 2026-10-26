/**
 * hyperDart Component Configuration
 * Component: @hyperdart/tourismexplorer
 */

const config = {
  name: '@hyperdart/tourismexplorer',
  displayName: 'Tourism Explorer',
  version: '1.0.0',
  description: 'Natural language travel exploration component for hyperDart',

  // Supported layouts
  views: ['sidebar', 'mainline'],

  // Triggers - exact keywords from Hackathon Problem Statement
  keywords: [
    'tourist attractions',
    'things to do',
    'places to visit',
    'landmarks',
    'sights',
    'points of interest',
    'museums',
    'attractions',
    'monuments',
    'temples',
    'forts',
    'viewpoints',
    'historic sites'
  ],

  // Triggers - exact regex patterns from Hackathon Problem Statement
  regex: [
    '((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.+',
    '((best|top|famous)\\s+)?(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\\s+sites?)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.+'
  ],

  // Structured triggers (for hyperdart engine compatibility)
  triggers: {
    keywords: [
      'tourist attractions',
      'things to do',
      'places to visit',
      'landmarks',
      'sights',
      'points of interest',
      'museums'
    ]
  },
  query_format: {
    regex: [
      '((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.+',
      '((best|top|famous)\\s+)?(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\\s+sites?)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.+'
    ]
  },

  // Submission requirements: Public GitHub repository & Demo Video link
  github: 'https://github.com/rohansurwase/tourism-explorer',
  demovideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
};

export default config;
