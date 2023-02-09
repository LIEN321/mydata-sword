import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, message, Modal, Divider, Tag } from 'antd';
import Panel from '../../../components/Panel';
import { APP_LIST } from '../../../actions/app';
import Grid from '../../../components/Sword/Grid';

const FormItem = Form.Item;

@connect(({ app, loading }) => ({
  app,
  loading: loading.models.app,
}))
@Form.create()
class App extends PureComponent {
  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    dispatch(APP_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="编号">
            {getFieldDecorator('appCode')(<Input placeholder="编号" />)}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label="名称">
            {getFieldDecorator('appName')(<Input placeholder="名称" />)}
          </FormItem>
        </Col>
        <Col>
          <div style={{ float: 'right' }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={onReset}>
              重置
            </Button>
          </div>
        </Col>
      </Row>
    );
  };

  render() {
    const code = 'app';

    const {
      form,
      loading,
      app: { data },
    } = this.props;

    const columns = [
      {
        title: '应用编号',
        dataIndex: 'appCode',
      },
      {
        title: '应用名称',
        dataIndex: 'appName',
      },
    ];

    return (
      <Panel>
        <Grid
          code={code}
          form={form}
          onSearch={this.handleSearch}
          renderSearchForm={this.renderSearchForm}
          loading={loading}
          data={data}
          columns={columns}
        />
      </Panel>
    );
  }
}
export default App;
