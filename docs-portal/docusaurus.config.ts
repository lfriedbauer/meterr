import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Meterr Documentation',
  tagline: 'Save 40% on AI Costs - Track, Optimize, Scale',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.meterr.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lfriedbauer', // Usually your GitHub org/user name.
  projectName: 'meterr', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // Local search plugin
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: "/docs",
        searchBarPosition: "right",
        searchBarShortcutHint: true,
      },
    ],
    // Google Analytics
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-XXXXXXXXXX', // Replace with actual GA4 tracking ID
        anonymizeIP: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Enable versioning for roadmap phases
          versions: {
            current: {
              label: 'Current (MVP)',
              path: 'current',
              badge: true,
            },
          },
          lastVersion: 'current',
          // Auto-generate sidebars for better organization
          sidebarCollapsible: true,
          sidebarCollapsed: false,
          // Breadcrumbs for better navigation
          breadcrumbs: true,
          // Show last update time and author
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          // Edit URL for GitHub
          editUrl:
            'https://github.com/lfriedbauer/meterr/tree/main/docs-portal/',
          // Include MDX support for advanced documentation
          remarkPlugins: [],
          rehypePlugins: [],
          // Route base path
          routeBasePath: 'docs',
          // Additional metadata for docs
          docItemComponent: '@theme/DocItem',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/lfriedbauer/meterr/tree/main/docs-portal/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          blogTitle: 'Meterr Blog',
          blogDescription: 'Latest updates on AI cost optimization and platform features',
          postsPerPage: 10,
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 5,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card for sharing
    image: 'img/meterr-social-card.jpg',
    // SEO metadata
    metadata: [
      {name: 'keywords', content: 'AI cost tracking, LLM expense management, OpenAI costs, Anthropic billing, AI optimization, token tracking'},
      {name: 'description', content: 'Meterr helps teams save 40% on AI costs. Track usage across OpenAI, Anthropic, Google AI. Real-time monitoring, budget alerts, and optimization insights.'},
      {name: 'og:description', content: 'Save 40% on AI costs with Meterr. Track, optimize, and manage expenses across all major AI providers.'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:creator', content: '@meterr_ai'},
      {name: 'og:type', content: 'website'},
    ],
    // Announcement bar for important updates
    announcementBar: {
      id: 'support_us',
      content:
        '🚀 Meterr is now in MVP! Save 40% on your AI costs. <a target="_blank" rel="noopener noreferrer" href="https://meterr.ai">Get Started</a>',
      backgroundColor: '#4F46E5',
      textColor: '#ffffff',
      isCloseable: true,
    },
    algolia: {
      appId: 'FPTRIXA309',
      apiKey: '9549344cd69fa39375579ccf6999ff12',
      indexName: 'meterr-docs',
      contextualSearch: true,
      searchPagePath: 'search',
    },
    navbar: {
      title: 'Meterr',
      logo: {
        alt: 'Meterr Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'doc',
          docId: 'architecture',
          position: 'left',
          label: 'Architecture',
        },
        {
          type: 'doc',
          docId: 'api/overview',
          position: 'left',
          label: 'API',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          href: 'https://github.com/lfriedbauer/meterr',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture',
            },
            {
              label: 'API Reference',
              to: '/docs/api/overview',
            },
            {
              label: 'Roadmap',
              to: '/docs/roadmap',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/meterr',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/meterr_ai',
            },
            {
              label: 'LinkedIn',
              href: 'https://linkedin.com/company/meterr',
            },
            {
              label: 'Product Hunt',
              href: 'https://producthunt.com/products/meterr',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'Pricing Calculator',
              href: 'https://meterr.ai/calculator',
            },
            {
              label: 'Status Page',
              href: 'https://status.meterr.ai',
            },
            {
              label: 'Support',
              href: 'https://support.meterr.ai',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About',
              href: 'https://meterr.ai/about',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/lfriedbauer/meterr',
            },
            {
              label: 'Privacy Policy',
              href: 'https://meterr.ai/privacy',
            },
            {
              label: 'Terms of Service',
              href: 'https://meterr.ai/terms',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Meterr.ai - Save 40% on AI Costs | Built with Docusaurus`,
      logo: {
        alt: 'Meterr Logo',
        src: 'img/logo.svg',
        href: 'https://meterr.ai',
        width: 160,
        height: 51,
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
