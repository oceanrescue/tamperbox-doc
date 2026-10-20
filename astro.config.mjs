import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://docs.tamperbox.dev',
  output: 'static',
  integrations: [
    starlight({
      title: 'tamper[box] docs',
      description: 'Documentation for Tamperbox tools, APIs, workflows, and MCP integrations.',
      disable404Route: true,
      favicon: '/favicon.svg',
      logo: {
        src: './src/assets/tamperbox-mark.svg',
        alt: 'Tamperbox',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/oceanrescue/tamperbox-doc' },
      ],
      editLink: {
        baseUrl: 'https://github.com/oceanrescue/tamperbox-doc/edit/main/',
      },
      customCss: ['./src/styles/tamperbox.css'],
      components: {
        Head: './src/components/docs/DocsHead.astro',
        PageTitle: './src/components/docs/DocsPageTitle.astro',
        PageSidebar: './src/components/docs/DocsPageSidebar.astro',
        Footer: './src/components/docs/DocsFooter.astro',
      },
      sidebar: [
        { label: 'Overview', items: [
          { label: 'Documentation home', link: '/' },
          { label: 'Getting started', link: '/getting-started/' },
        ] },
        { label: 'Tools', items: [
          { label: 'Tool pages', link: '/tools/' },
          { label: 'SSL Certificate Checker', link: '/tools/ssl-checker/' },
          { label: 'DKIM Record Checker', link: '/tools/dkim-checker/' },
          { label: 'SPF Checker', link: '/tools/spf-checker/' },
          { label: 'DMARC Checker & Generator', link: '/tools/dmarc-checker/' },
          { label: 'MTA-STS & TLS-RPT Checker', link: '/tools/mta-sts-checker/' },
          { label: 'BIMI Record Checker', link: '/tools/bimi-checker/' },
          { label: 'Email Header Analyzer', link: '/tools/email-header-analyzer/' },
          { label: 'DNSSEC Checker', link: '/tools/dnssec-checker/' },
          { label: 'DANE & TLSA Checker', link: '/tools/dane-checker/' },
          { label: 'Reverse DNS Lookup', link: '/tools/reverse-dns/' },
        ] },
        { label: 'MCP server', items: [
          { label: 'Overview', link: '/mcp/' },
          { label: 'Connect a client', link: '/mcp/connect/' },
          { label: 'Code mode', link: '/mcp/code-mode/' },
        ] },
        { label: 'Workflows', items: [
          { label: 'Workflow patterns', link: '/workflows/' },
        ] },
        { label: 'Reference', items: [
          { label: 'Operation catalog', link: '/reference/operations/' },
          { label: 'Limits', link: '/reference/limits/' },
          { label: 'Security and privacy', link: '/reference/security/' },
        ] },
        { label: 'Project', items: [
          { label: 'Contributing', link: '/contributing/' },
        ] },
      ],
    }),
    sitemap(),
  ],
  markdown: { syntaxHighlight: 'shiki' },
  vite: { build: { sourcemap: false } },
});
