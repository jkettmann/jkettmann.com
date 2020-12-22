import React from 'react';
import { graphql } from 'gatsby';
import MDXRenderer from 'gatsby-plugin-mdx/mdx-renderer';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Container from 'components/ui/Container';
import TitleSection from 'components/ui/TitleSection';
import SocialShareSideBar from 'components/SocialShareSideBar';

interface Course {
  body: React.ReactNode;
  slug: string;
  frontmatter: {
    title: string;
  };
}

interface Course {
  location: WindowLocation;
  data: {
    mdx: Course;
  };
  pageContext: {
    slug: string;
  };
}

const Course: React.FC<Course> = ({ data, location }) => {
  const course = data.mdx;

  return (
    <Layout>
      <SEO title={course.frontmatter.title} url={location.href} />
      <Container section notFlex>
        <TitleSection title={course.frontmatter.title} />
        <MDXRenderer>{course.body}</MDXRenderer>

        <SocialShareSideBar
          url={location.href}
          title={course.frontmatter.title}
        />
      </Container>
    </Layout>
  );
};

export default Course;

export const query = graphql`
  query CourseBySlug($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      body
      frontmatter {
        title
      }
    }
  }
`;
