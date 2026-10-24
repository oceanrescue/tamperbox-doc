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
          { label: 'All tool pages', link: '/tools/' },
          { label: 'Network', collapsed: false, items: [
            { label: 'ASN Lookup', link: '/tools/asn-lookup/' },
            { label: 'BGP Route Lookup', link: '/tools/bgp-lookup/' },
            { label: 'TCP Ping', link: '/tools/tcp-ping/' },
            { label: 'Minecraft Server Status Checker', link: '/tools/minecraft-server-status/' },
            { label: 'Open Port Checker', link: '/tools/open-port-checker/' },
            { label: 'What Is My IP Address?', link: '/tools/what-is-my-ip/' },
            { label: 'My Connection Info', link: '/tools/connection-info/' },
          ] },
          { label: 'DNS records', collapsed: false, items: [
            { label: 'DNSSEC Checker', link: '/tools/dnssec-checker/' },
            { label: 'Reverse DNS Lookup', link: '/tools/reverse-dns/' },
            { label: 'DNS Lookup', link: '/tools/dns-lookup/' },
            { label: 'DNS Propagation Checker', link: '/tools/dns-propagation/' },
            { label: 'TXT Record Lookup', link: '/tools/txt-lookup/' },
            { label: 'CNAME Lookup', link: '/tools/cname-lookup/' },
            { label: 'NS Lookup', link: '/tools/ns-lookup/' },
            { label: 'SOA Lookup', link: '/tools/soa-lookup/' },
            { label: 'AAAA Lookup', link: '/tools/aaaa-lookup/' },
            { label: 'SRV Lookup', link: '/tools/srv-lookup/' },
            { label: 'CAA Lookup', link: '/tools/caa-lookup/' },
          ] },
          { label: 'Email authentication', collapsed: false, items: [
            { label: 'MX Lookup & Email Domain', link: '/tools/email-domain/' },
            { label: 'Email Provider Lookup', link: '/tools/email-provider/' },
            { label: 'SPF Checker', link: '/tools/spf-checker/' },
            { label: 'DKIM Record Checker', link: '/tools/dkim-checker/' },
            { label: 'DMARC Checker & Generator', link: '/tools/dmarc-checker/' },
            { label: 'MTA-STS & TLS-RPT Checker', link: '/tools/mta-sts-checker/' },
            { label: 'BIMI Record Checker', link: '/tools/bimi-checker/' },
            { label: 'Email Header Analyzer', link: '/tools/email-header-analyzer/' },
          ] },
          { label: 'APIs & HTTP', collapsed: false, items: [
            { label: 'JWT Decoder & Verifier', link: '/tools/jwt/' },
            { label: 'Postman Collection Converter', link: '/tools/postman-converter/' },
            { label: 'JSON to YAML Converter', link: '/tools/json-to-yaml/' },
            { label: 'YAML to JSON Converter', link: '/tools/yaml-to-json/' },
            { label: 'Unix Timestamp Converter', link: '/tools/unix-timestamp/' },
            { label: 'Redirect Checker', link: '/tools/redirect-checker/' },
            { label: 'HTTP/3 & Compression Checker', link: '/tools/http3-checker/' },
            { label: 'CORS Tester', link: '/tools/cors-tester/' },
          ] },
          { label: 'Domains & hosting', collapsed: false, items: [
            { label: 'Domain Availability Checker', link: '/tools/domain-availability/' },
            { label: 'WHOIS & RDAP Lookup', link: '/tools/whois-lookup/' },
            { label: 'Domain Health Check', link: '/tools/domain-health/' },
            { label: 'Website Hosting Checker', link: '/tools/website-hosting/' },
            { label: 'CDN Detector', link: '/tools/cdn-detector/' },
            { label: 'DNS Provider Lookup', link: '/tools/dns-provider/' },
            { label: 'Website Technology Detector', link: '/tools/website-technology/' },
            { label: 'SaaS Stack Detector', link: '/tools/saas-stack/' },
            { label: 'Subdomain Finder', link: '/tools/subdomain-finder/' },
          ] },
          { label: 'Web security & TLS', collapsed: false, items: [
            { label: 'SSL Certificate Checker', link: '/tools/ssl-checker/' },
            { label: 'DANE & TLSA Checker', link: '/tools/dane-checker/' },
            { label: 'Post-Quantum TLS Checker', link: '/tools/post-quantum-checker/' },
            { label: 'Security Headers Checker', link: '/tools/security-headers/' },
            { label: 'security.txt Checker', link: '/tools/security-txt-checker/' },
            { label: 'Mixed Content & Cookie Checker', link: '/tools/mixed-content-checker/' },
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
