import React, { useEffect, useRef } from 'react';
import useMutationObserver from "@rooks/use-mutation-observer"
import * as S from './styles';

type MailerliteBoxProps = {
  formId: string;
}

const MailerliteBox = React.memo(({ formId }: MailerliteBoxProps) => {
  const formRef = useRef<HTMLDivElement>(null);

  const callback = (mutationList: any, observer: MutationObserver) => {
    const inputs = formRef!.current!.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i += 1) {
      const input = inputs[i];
      const label = input.placeholder;
      if (label) {
        input.setAttribute('aria-label', label);
      }
    }
    observer.disconnect();
  };

  useMutationObserver(formRef, callback);

  useEffect(() => {
    const form = document.getElementById('post-subscribe');
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
        ref={formRef}
        id="post-subscribe"
        className="ml-form-embed"
        data-account="1382888:c4v2p8y4b0"
        data-form={formId}
      />
    </S.Wrapper>
  )
})

export default MailerliteBox
