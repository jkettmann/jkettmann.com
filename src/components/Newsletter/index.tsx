import React, { useEffect } from 'react';
import * as S from './styles';

const MailerliteBox = React.memo(({ formId }) => {
  useEffect(() => {
    window.MailerLiteObject = 'ml';
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.mailerlite.com/js/universal.js?v'+(~~(new Date().getTime()/1000000));
    script.onload = () => window.ml('accounts', '1382888', 'c4v2p8y4b0', 'load');
    document.head.appendChild(script);
  }, []);

  return (
    <S.Wrapper>
      <div
        id="mailerlite-form"
        className="ml-form-embed"
        data-account="1382888:c4v2p8y4b0"
        data-form={formId}
      />
    </S.Wrapper>
  )
})

export default MailerliteBox
