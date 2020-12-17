import React from 'react';
import { HtmlWrapper } from './styles';

interface Props {
  content: any;
}

const FormatHtml: React.FC<Props> = ({ content }) => (
  <HtmlWrapper
    className="format-html"
    dangerouslySetInnerHTML={{
      __html: content
    }}
  />
);

export default FormatHtml;
