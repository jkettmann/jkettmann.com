import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Header from 'components/Header';
import Footer from 'components/Footer';
import Newsletter from 'components/Newsletter';

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
      <S.Layout>
        <Header siteTitle={data.site.siteMetadata.title} />
        {children}
        <Newsletter />
        <Footer />
      </S.Layout>
    </>
  );
};

export default Layout;
