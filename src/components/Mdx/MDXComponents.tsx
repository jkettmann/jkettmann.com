import React from 'react';

import Link from './Link';
import Code, { CodeProps } from './Code';
import * as S from './styles';

type PreProps = {
  children: {
    props: {
      children: string,
      className: string,
      mdxType: string
    }
  },
}

function preToCodeBlock(preProps: PreProps): CodeProps | null {
  if (
    preProps.children &&
    preProps.children.props &&
    preProps.children.props.mdxType === "code"
  ) {
    // we have a <pre><code> situation
    const {
      children: codeString,
      className = "",
      ...props
    } = preProps.children.props;

    const match = className.match(/language-([\0-\uFFFF]*)/);

    return {
      codeString: codeString.trim(),
      className,
      language: match && match[1],
      ...props
    };
  }
  return null;
}

const MDXLayoutComponents = {
  p: (props: any) => <S.Paragraph {...props} />,
  ul: (props: any) => <S.UnorderedList {...props} />,
  ol: (props: any) => <S.OrderedList {...props} />,
  a: (props: any) => <Link {...props} />,
  pre: (preProps: any) => {
    const props = preToCodeBlock(preProps)
    // if there's a codeString and some props, we passed the test
    if (props) {
      return <Code {...props} />
    } else {
      console.log('normal pre')
      // it's possible to have a pre without a code in it
      return <pre {...preProps} />
    }
  },
};

export default MDXLayoutComponents;
