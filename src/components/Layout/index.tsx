import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { MDXProvider } from '@mdx-js/react';

import 'prismjs/themes/prism-okaidia.css';

import Header from 'components/Header';
import Footer from 'components/Footer';
import MDXComponents from 'components/Mdx';

import 'assets/styles/global.css';
import GlobalStyles from 'assets/styles/globalStyles';
import * as S from './styles';

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <>
      <GlobalStyles />
      <MDXProvider
        components={MDXComponents}
      >
        <S.Layout>
          <Header siteTitle={data.site.siteMetadata.title} />
          {children}
          <Footer />
        </S.Layout>
      </MDXProvider>
    </>
  );
};

export default Layout;
