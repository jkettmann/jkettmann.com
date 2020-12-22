import React, { useEffect, useState } from 'react';
import LinkedInIcon from '../Icons/linkedin.svg';
import TwitterIcon from '../Icons/twitter.svg';
import FacebookIcon from '../Icons/facebook.svg';
import * as S from './styles';

type Props = {
  url: string;
  title: string;
}

const SocialShareSideBar: React.FC<Props> = ({ url, title }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const scrollPosition = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollPosition > height - 70) {
        setScrolledToBottom(true)
      } else {
        setScrolledToBottom(false);
      }
      if (scrollPosition > height * 0.3) {
        setHasScrolled(true);
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  });

  return (
    <S.SideBar
      hasScrolled={hasScrolled}
      scrolledToBottom={scrolledToBottom}
    >
      <S.IconLink
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title} by Johannes Kettmann`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <S.Icon src={FacebookIcon} />
      </S.IconLink>
      <S.IconLink
        href={`https://twitter.com/share?text=${title} by @j_kettmann&url=${url}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <S.Icon src={TwitterIcon} />
      </S.IconLink>
      <S.IconLink
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <S.Icon src={LinkedInIcon} />
      </S.IconLink>
    </S.SideBar>
  );
}

export default SocialShareSideBar;
