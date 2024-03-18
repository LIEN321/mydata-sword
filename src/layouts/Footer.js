import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      copyright={
        <Fragment>
          MyData v0.7.3 Copyright <Icon type="copyright" /> 2024 LIEN{' '}
          <a
            key="github"
            title="git"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/LIEN321/mydata-blade"
          >
            <Icon type="github" />{' '}
          </a>
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
