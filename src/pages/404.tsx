import React from 'react';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Container from 'components/ui/Container';
import TitleSection from 'components/ui/TitleSection';

const NotFoundPage: React.FC<{ location: WindowLocation }> = ({ location }) => (
  <Layout>
    <SEO title="404: Not found" url={location.href} />
    <Container section>
      <TitleSection title="404" subtitle="Page not found" center />
      <p className="mt-4 text-center w-full">You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Container>
  </Layout>
);

export default NotFoundPage;
