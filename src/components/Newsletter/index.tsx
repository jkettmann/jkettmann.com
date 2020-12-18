import React, { useEffect } from 'react';
import * as S from './styles';

type MailerliteBoxProps = {
  formId: string;
}

const MailerliteBox = React.memo(({ formId }: MailerliteBoxProps) => {
  useEffect(() => {
    const form = document.getElementById('post-subscribe');

    const callback = function(mutationList, observer) {
      const inputs = document.getElementById('post-subscribe').getElementsByTagName('input');
      inputs[0].setAttribute('aria-label', 'Name');
      inputs[1].setAttribute('aria-label', 'Email');
      observer.disconnect();
    };

    const observer = new MutationObserver(callback);
    observer.observe(form, { childList: true });

    window.MailerLiteObject = 'ml';
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.mailerlite.com/js/universal.js?v'+(~~(new Date().getTime()/1000000));
    script.onload = () => {
      window.ml('accounts', '1382888', 'c4v2p8y4b0', 'load');
    }
    document.head.appendChild(script);
  }, []);

  return (
    <S.Wrapper>
      <div
        id="post-subscribe"
        className="ml-form-embed"
        data-account="1382888:c4v2p8y4b0"
        data-form={formId}
      />
    </S.Wrapper>
  )
})

export default MailerliteBox
