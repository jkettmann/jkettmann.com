import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';

import * as S from './styles';

import { ImageSharpFluid } from 'helpers/definitions';

const Logo: React.FC = () => {
  const { site, placeholderImage } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
      placeholderImage: file(relativePath: { eq: "profile.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 80) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `);

  const logoTitle: string = site.siteMetadata.title;
  const logoImage: ImageSharpFluid = placeholderImage.childImageSharp.fluid;

  return (
    <S.Logo to="/">
      <S.Image>
        <Img fluid={logoImage} alt={logoTitle} />
      </S.Image>
      <S.Text>{logoTitle}</S.Text>
    </S.Logo>
  );
};

export default Logo;
