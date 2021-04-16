import React from 'react';
import Helmet from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

type Meta =
  | {
      name: string;
      content: any;
    }
  | {
      property: string;
      content: any;
    };

interface Props {
  description?: string;
  lang?: string;
  meta?: Meta[];
  title?: string;
  image?: string;
  largeSocialCard?: boolean;
  pathname: string;
}

const SEO: React.FC<Props> = ({ description, lang = 'en-US', meta: metaParam = [], title: titleParam, image, largeSocialCard, pathname }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            twitter
            siteUrl
          }
        }
      }
    `
  );

  const canonicalUrl = `${site.siteMetadata.siteUrl}${pathname}`.replace(/\/$/, '')
  const metaDescription = description || site.siteMetadata.description;
  const title = titleParam || site.siteMetadata.title;

  const meta = [
    {
      name: `description`,
      content: metaDescription
    },
    {
      property: `og:title`,
      content: title
    },
    {
      property: `og:description`,
      content: metaDescription
    },
    {
      property: `og:type`,
      content: `website`
    },
    {
      property: `og:url`,
      content: canonicalUrl
    },
    {
      name: `twitter:card`,
      content: largeSocialCard ? `summary_large_image` : `summary`
    },
    {
      name: `twitter:creator`,
      content: site.siteMetadata.twitter
    },
    {
      name: `twitter:site`,
      content: site.siteMetadata.twitter
    },
    {
      name: `twitter:title`,
      content: title
    },
    {
      name: `twitter:description`,
      content: metaDescription
    },

  ]

  if (image) {
    meta.push(
      {
        property: `og:image`,
        content: image
      },
      {
        name: `twitter:image`,
        content: image
      }
    );
  }

  return (
    <Helmet
      htmlAttributes={{
        lang
      }}
      title={title}
      titleTemplate={title ? `%s` : `%s | ${site.siteMetadata.title}`}
      meta={meta.concat(metaParam)}
      link={[{ rel: 'canonical', href: canonicalUrl }]}
    />
  );
};

SEO.defaultProps = {
  lang: `en`,
  meta: [] as Meta[],
  description: ``
};

export default SEO;
