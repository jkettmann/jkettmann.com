const React = require('react')

exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents().concat(
    <link key="gfonts-dns-prefetch" rel="dns-prefetch" href="//fonts.googleapis.com" />,
    <link key="gfonts-preconnect" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />,
  )
  replaceHeadComponents(headComponents)
}