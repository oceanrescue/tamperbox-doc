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
        SocialIcons: './src/components/docs/DocsSocialIcons.astro',
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
          { label: 'All tool pages', link: '/tools/' },
          { label: 'APIs & HTTP', collapsed: false, items: [
            { label: 'JWT Decoder & Verifier', link: '/tools/jwt/' },
            { label: 'Postman Collection Converter', link: '/tools/postman-converter/' },
            { label: 'Redirect Checker', link: '/tools/redirect-checker/' },
            { label: 'HTTP/3 & Compression Checker', link: '/tools/http3-checker/' },
            { label: 'CORS Tester', link: '/tools/cors-tester/' },
            { label: 'HAR File Sanitizer', link: '/tools/har-sanitizer/' },
            { label: 'HAR to Mocks', link: '/tools/har-to-mocks/' },
            { label: 'Negative Payload Generator', link: '/tools/negative-payload-generator/' },
            { label: 'Cookie Header Explainer', link: '/tools/cookie-header-explainer/' },
          ] },
          { label: 'Web security & TLS', collapsed: false, items: [
            { label: 'DANE & TLSA Checker', link: '/tools/dane-checker/' },
            { label: 'Security Headers Checker', link: '/tools/security-headers/' },
            { label: 'SSL Certificate Checker', link: '/tools/ssl-checker/' },
            { label: 'Post-Quantum TLS Checker', link: '/tools/post-quantum-checker/' },
            { label: 'security.txt Checker', link: '/tools/security-txt-checker/' },
            { label: 'Mixed Content & Cookie Checker', link: '/tools/mixed-content-checker/' },
          ] },
          { label: 'Email & DNS', collapsed: false, items: [
            { label: 'MX Lookup & Email Domain Checker', link: '/tools/email-domain/' },
            { label: 'Email Provider Lookup', link: '/tools/email-provider/' },
            { label: 'SPF Checker', link: '/tools/spf-checker/' },
            { label: 'DMARC Checker & Generator', link: '/tools/dmarc-checker/' },
            { label: 'DKIM Record Checker', link: '/tools/dkim-checker/' },
            { label: 'MTA-STS & TLS-RPT Checker', link: '/tools/mta-sts-checker/' },
            { label: 'BIMI Record Checker', link: '/tools/bimi-checker/' },
            { label: 'Email Header Analyzer', link: '/tools/email-header-analyzer/' },
          ] },
          { label: 'Domains, registration & hosting', collapsed: false, items: [
            { label: 'SaaS & Email Services from DNS', link: '/tools/saas-stack/' },
            { label: 'Website Hosting Checker', link: '/tools/website-hosting/' },
            { label: 'CDN & Proxy Detector', link: '/tools/cdn-detector/' },
            { label: 'DNS Provider Lookup', link: '/tools/dns-provider/' },
            { label: 'Website Technology Detector', link: '/tools/website-technology/' },
            { label: 'Subdomain Finder', link: '/tools/subdomain-finder/' },
            { label: 'Domain Availability Checker', link: '/tools/domain-availability/' },
            { label: 'WHOIS & RDAP Lookup', link: '/tools/whois-lookup/' },
            { label: 'Domain Health Checker', link: '/tools/domain-health/' },
          ] },
          { label: 'DNS', collapsed: false, items: [
            { label: 'DNS Lookup', link: '/tools/dns-lookup/' },
            { label: 'DNS Propagation Checker', link: '/tools/dns-propagation/' },
            { label: 'TXT Record Lookup', link: '/tools/txt-lookup/' },
            { label: 'CNAME Lookup', link: '/tools/cname-lookup/' },
            { label: 'NS Lookup', link: '/tools/ns-lookup/' },
            { label: 'SOA Lookup', link: '/tools/soa-lookup/' },
            { label: 'AAAA Lookup', link: '/tools/aaaa-lookup/' },
            { label: 'SRV Lookup', link: '/tools/srv-lookup/' },
            { label: 'CAA Lookup', link: '/tools/caa-lookup/' },
            { label: 'DNSSEC Checker', link: '/tools/dnssec-checker/' },
            { label: 'Reverse DNS Lookup', link: '/tools/reverse-dns/' },
          ] },
          { label: 'Network & IP', collapsed: false, items: [
            { label: 'What Is My IP Address?', link: '/tools/what-is-my-ip/' },
            { label: 'My Connection Info', link: '/tools/connection-info/' },
            { label: 'ASN Lookup', link: '/tools/asn-lookup/' },
            { label: 'BGP Route Lookup', link: '/tools/bgp-lookup/' },
            { label: 'Open Port Checker', link: '/tools/open-port-checker/' },
            { label: 'TCP Ping', link: '/tools/tcp-ping/' },
            { label: 'Minecraft Server Status Checker', link: '/tools/minecraft-server-status/' },
          ] },
          { label: 'Data formats', collapsed: false, items: [
            { label: 'JSON to YAML Converter', link: '/tools/json-to-yaml/' },
            { label: 'YAML to JSON Converter', link: '/tools/yaml-to-json/' },
            { label: 'Unix Timestamp Converter', link: '/tools/unix-timestamp/' },
          ] },
          { label: 'Web & URLs', collapsed: false, items: [
            { label: 'Website Down Checker', link: '/tools/website-down-checker/' },
            { label: 'Broken Link Checker', link: '/tools/broken-link-checker/' },
            { label: 'Open Graph Preview', link: '/tools/open-graph-preview/' },
            { label: 'Robots.txt & Sitemap Checker', link: '/tools/robots-txt-checker/' },
            { label: 'Ads.txt & App-Ads.txt Checker', link: '/tools/ads-txt-checker/' },
            { label: 'llms.txt Checker & Generator', link: '/tools/llms-txt/' },
          ] },
          { label: 'Text & test data', collapsed: false, items: [
            { label: 'Hidden Character Checker', link: '/tools/hidden-characters/' },
            { label: 'Naughty Strings List', link: '/tools/naughty-strings/' },
            { label: 'Exact-Length String Generator', link: '/tools/string-length-generator/' },
            { label: 'Mojibake Fixer', link: '/tools/mojibake-fixer/' },
          ] },
          { label: 'Localization', collapsed: false, items: [
            { label: 'Locale File Checker', link: '/tools/locale-file-checker/' },
            { label: 'Pseudo-Localizer', link: '/tools/pseudo-localizer/' },
          ] },
          { label: 'UI testing', collapsed: false, items: [
            { label: 'Locator Fragility Checker', link: '/tools/locator-checker/' },
            { label: 'Mobile UI Dump Viewer', link: '/tools/mobile-ui-dump-viewer/' },
          ] },
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
