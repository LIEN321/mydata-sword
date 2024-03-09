import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, message, Modal, Divider, Tag, Drawer } from 'antd';
import Panel from '../../../components/Panel';
import { ENV_LIST } from '../../../actions/env';
import Grid from '../../../components/Sword/Grid';
import { syncTask } from '../../../services/env';
import EnvVar from '../EnvVar/EnvVar';

const FormItem = Form.Item;

@connect(({ env, loading }) => ({
  env,
  loading: loading.models.env,
}))
@Form.create()
class Env extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      drawerTitle: '',
      drawerVisible: false,
      currentEnv: {},
    };
  }

  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    dispatch(ENV_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="查询名称">
            {getFieldDecorator('envName')(<Input placeholder="查询名称" />)}
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
        const response = await syncTask({ id: id });
        if (response.success) {
          message.success(response.msg);
          dispatch(ENV_LIST());
        } else {
          message.error(response.msg || '更新任务失败！');
        }
      },
      onCancel() { },
    });
  };

  handleBtnCallBack = payload => {
    const { btn, keys, rows } = payload;
    if (btn.code === 'env_var') {
      // alert('env_var click');
      // alert(rows[0].id);
      this.setState({
        drawerTitle: rows[0].envName,
        drawerVisible: true,
        currentEnv: rows[0],
      });
    }
  };

  onCloseDrawer = () => {
    this.setState({ drawerVisible: false });
  };

  render() {
    const code = 'env';

    const {
      form,
      loading,
      env: { data },
    } = this.props;

    const { drawerTitle, drawerVisible, currentEnv } = this.state;

    const columns = [
      {
        title: '所属项目',
        dataIndex: 'projectName',
      },
      {
        title: '顺序',
        dataIndex: 'sort',
        width: '50px',
      },
      {
        title: '环境名称',
        dataIndex: 'envName',
      },
      {
        title: '前置路径',
        dataIndex: 'envPrefix',
      },
      {
        title: '编辑时间',
        dataIndex: 'updateTime',
        width: '150px',
      },
      {
        title: '同步任务时间',
        dataIndex: 'syncTaskTime',
        width: '250px',
        render: (text, record, index) => {
          const { id, syncTaskTime, updateTime } = record;
          let color = 'green';
          if (syncTaskTime == "") {
            color = 'gray'
          }
          else
            if (syncTaskTime < updateTime) {
              color = 'red';
            }
          return <>
            <Tag color={color}>{syncTaskTime}</Tag>
            <Divider type="vertical" />
            <a onClick={() => {
              this.syncTask(id);
            }}>更新</a>
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
          btnCallBack={this.handleBtnCallBack}
          actionColumnWidth={250}
        />
        <Drawer
          title={`[${drawerTitle}] 变量管理`}
          visible={drawerVisible}
          width={1000}
          //closable={false}
          onClose={this.onCloseDrawer}
        >
          {drawerVisible && <EnvVar env={currentEnv} />}
        </Drawer>
      </Panel>
    );
  }
}
export default Env;
