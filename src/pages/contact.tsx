import React from 'react';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import ContactInfo from 'components/ContactInfo';

const ContactPage: React.FC<{ location: WindowLocation }> = ({ location }) => {
  return (
    <Layout>
      <SEO title="Contact" url={location.href} />
      <ContactInfo />
    </Layout>
  );
};

export default ContactPage;
