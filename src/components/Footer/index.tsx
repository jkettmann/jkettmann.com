import React from 'react';
import LinkedInIcon from 'components/Icons/linkedin.svg';
import TwitterIcon from 'components/Icons/twitter.svg';
import GithubIcon from 'components/Icons/github.svg';
import EmailIcon from 'components/Icons/email.svg';
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
          aria-label="GitHub profile Johannes Kettmann"
        >
          <S.Icon src={GithubIcon} alt="GitHub icon" />
        </S.IconLink>
        <S.IconLink
          href="https://twitter.com/j_kettmann"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter profile Johannes Kettmann"
        >
          <S.Icon src={TwitterIcon} alt="Twitter icon" />
        </S.IconLink>
        <S.IconLink
          href="https://www.linkedin.com/in/johannes-kettmann-40a049145/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile Johannes Kettmann"
        >
          <S.Icon src={LinkedInIcon} alt="LinkedIn icon" />
        </S.IconLink>
        <S.IconLink
          href="mailto:hi@jkettmann.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Send email to Johannes Kettmann"
        >
          <S.Icon src={EmailIcon} alt="Email icon" />
        </S.IconLink>
      </S.IconWrapper>

      <S.LegalLink to="/legal">
        Legal
      </S.LegalLink>
    </S.Container>
  </S.Footer>
);

export default Footer;
