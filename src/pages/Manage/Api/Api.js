import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, message, Modal, Divider, Tag } from 'antd';
import Panel from '../../../components/Panel';
import { API_LIST } from '../../../actions/api';
import Grid from '../../../components/Sword/Grid';
import { syncTask } from '../../../services/md_api';

const FormItem = Form.Item;

@connect(({ api, loading }) => ({
  api,
  loading: loading.models.api,
}))
@Form.create()
class Api extends PureComponent {
  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    dispatch(API_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="查询名称">
            {getFieldDecorator('apiName')(<Input placeholder="查询名称" />)}
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

  syncTask = id => {
    const { dispatch } = this.props;

    Modal.confirm({
      title: '更新任务确认',
      content: '是否更新关联任务地址?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const response = await syncTask({ id });
        if (response.success) {
          message.success(response.msg);
          dispatch(API_LIST());
        } else {
          message.error(response.msg || '更新任务失败！');
        }
      },
      onCancel() { },
    });
  };

  render() {
    const code = 'api';

    const {
      form,
      loading,
      api: { data },
    } = this.props;

    const columns = [
      {
        title: '应用',
        dataIndex: 'appId',
        render: (text, record) => {
          const { appCode, appName } = record;
          return `${appName} (${appCode})`;
        },
      },
      {
        title: 'API名称',
        dataIndex: 'apiName',
      },
      {
        title: 'API类型',
        dataIndex: 'opType',
        render: opType => {
          return opType === 1 ? "提供数据" : "消费数据";
        },
      },
      {
        title: '请求方法',
        dataIndex: 'apiMethod',
      },
      {
        title: '相对路径',
        dataIndex: 'apiUri',
      },
      {
        title: '数据类型',
        dataIndex: 'dataType',
      },
      {
        title: '编辑时间',
        dataIndex: 'updateTime',
      },
      {
        title: '同步任务时间',
        dataIndex: 'syncTaskTime',
        render: (text, record) => {
          const { id, syncTaskTime, updateTime } = record;
          let color = 'green';
          if (syncTaskTime === "") {
            color = 'gray'
          }
          else if (syncTaskTime < updateTime) {
            color = 'red';
          }
          return <>
            <Tag color={color}>{syncTaskTime}</Tag>
            <Divider type="vertical" />
            <a onClick={() => {
              this.syncTask(id);
            }}
            >更新
            </a>
          </>
        },
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
export default Api;
