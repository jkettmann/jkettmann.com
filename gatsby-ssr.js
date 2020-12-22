const React = require('react')

exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents().concat(
    <link key="gfonts-dns-prefetch" rel="dns-prefetch" href="//fonts.googleapis.com" />,
    <link key="gfonts-preconnect" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />,
    <script async defer data-domain="jkettmann.com" src="https://plausible.io/js/plausible.outbound-links.js" />,
  )
  replaceHeadComponents(headComponents)
}