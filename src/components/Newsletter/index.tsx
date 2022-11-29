import React, { useEffect, useRef } from 'react';
import useMutationObserver from '@rooks/use-mutation-observer';
import * as S from './styles';

type MailerliteBoxProps = {
  formId: string;
};

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
    if (window.ml) {
      return;
    }

    window.ml = function () {
      if (!window.ml.q) {
        window.ml.q = [];
      }
      window.ml.q.push(arguments);
    };

    const mlScriptUrl = 'https://assets.mailerlite.com/js/universal.js';
    const script = document.createElement('script');
    script.async = true;
    script.src = mlScriptUrl;
    document.head.appendChild(script);

    window.ml('account', '127980');
  }, []);

  return (
    <S.Wrapper>
      <div ref={formRef} id="post-subscribe" className="ml-embedded" data-form={formId} />
    </S.Wrapper>
  );
});

export default MailerliteBox;
