import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import InfoBlock from 'components/ui/InfoBlock';
import Container from 'components/ui/Container';
import TitleSection from 'components/ui/TitleSection';
import { IconProps } from 'components/ui/Icon';

import { SectionTitle } from 'helpers/definitions';

import * as S from './styles';

interface Service {
  node: {
    id: string;
    frontmatter: {
      title: string;
      icon: IconProps;
      description: string;
    };
  };
}

const Services: React.FC = () => {
  const { markdownRemark, allMarkdownRemark } = useStaticQuery(graphql`
    query {
      markdownRemark(frontmatter: { category: { eq: "services section" } }) {
        frontmatter {
          title
          subtitle
        }
      }
      allMarkdownRemark(filter: { frontmatter: { category: { eq: "services" } } }, sort: { fields: fileAbsolutePath }) {
        edges {
          node {
            id
            frontmatter {
              title
              icon
              description
            }
          }
        }
      }
    }
  `);

  const sectionTitle: SectionTitle = markdownRemark.frontmatter;
  const services: Service[] = allMarkdownRemark.edges;

  return (
    <Container section>
      <TitleSection title={sectionTitle.title} subtitle={sectionTitle.subtitle} center />
      <S.Services>
        {services.map((item) => {
          const {
            id,
            frontmatter: { title, icon, description }
          } = item.node;

          return (
            <S.ServiceItem key={id}>
              <InfoBlock icon={icon} title={title} content={description} />
            </S.ServiceItem>
          );
        })}
      </S.Services>
    </Container>
  );
};

export default Services;
