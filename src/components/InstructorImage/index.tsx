import React from 'react'
import { graphql, useStaticQuery } from 'gatsby';
import Img from 'gatsby-image';

import LinkedInIcon from '../Icons/linkedin.svg'
import GitHubIcon from '../Icons/github.svg'
import TwitterIcon from '../Icons/twitter.svg'

import * as S from './styles';

function InstructorImage() {
  const { image } = useStaticQuery(graphql`
    query {
      image: file(relativePath: { eq: "johannes-kettmann.jpeg" }) {
        childImageSharp {
          fluid(maxWidth: 200) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `);
  return (
    <S.PortraitWrapper>
      <S.Image>
        <Img fluid={image.childImageSharp.fluid} alt="Johannes Kettmann" />
      </S.Image>
      <S.IconWrapper>
        <S.IconLink href="https://www.linkedin.com/in/johannes-kettmann-40a049145/" target="_blank" rel="noopener noreferrer">
          <S.Icon src={LinkedInIcon} />
        </S.IconLink>
        <S.IconLink href="https://twitter.com/j_kettmann" target="_blank" rel="noopener noreferrer">
          <S.Icon src={TwitterIcon} />
        </S.IconLink>
        <S.IconLink href="https://github.com/jkettmann" target="_blank" rel="noopener noreferrer">
          <S.Icon src={GitHubIcon} />
        </S.IconLink>
      </S.IconWrapper>
    </S.PortraitWrapper>
  )
}

export default InstructorImage