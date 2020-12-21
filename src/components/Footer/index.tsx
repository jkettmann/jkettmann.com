import React from 'react';
import LinkedInIcon from '../Icons/linkedin.svg';
import TwitterIcon from '../Icons/twitter.svg';
import GithubIcon from '../Icons/github.svg';
import EmailIcon from '../Icons/email.svg';
import * as S from './styles';

const Footer: React.FC = () => (
  <S.Footer>
    <S.Container>
      <S.Placeholder>
        Legal
      </S.Placeholder>
      <S.IconWrapper>
        <S.IconLink
          href="https://github.com/jkettmann"
          target="_blank"
          rel="noopener noreferrer"
        >
          <S.Icon src={GithubIcon} />
        </S.IconLink>
        <S.IconLink
          href="https://twitter.com/j_kettmann"
          target="_blank"
          rel="noopener noreferrer"
        >
          <S.Icon src={TwitterIcon} />
        </S.IconLink>
        <S.IconLink
          href="https://www.linkedin.com/in/johannes-kettmann-40a049145/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <S.Icon src={LinkedInIcon} />
        </S.IconLink>
        <S.IconLink
          href="mailto:hi@jkettmann.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <S.Icon src={EmailIcon} />
        </S.IconLink>
      </S.IconWrapper>

      <S.LegalLink to="/legal">
        Legal
      </S.LegalLink>
    </S.Container>
  </S.Footer>
);

export default Footer;
