import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Col, Divider, Form, Input, message, Modal, Row } from 'antd';
import Panel from '../../../components/Panel';
import { ENVVAR_LIST } from '../../../actions/envvar';
import Grid from '../../../components/Sword/Grid';
import styles from '../../../layouts/Sword.less';
import { submit as submitEnvVar, detail as envVarDetail, remove as removeEnvVar } from '../../../services/envvar';
import func from '../../../utils/Func';

const FormItem = Form.Item;

@connect(({ envVar, loading }) => ({
  envVar,
  loading: loading.models.envVar,
}))
@Form.create()
class EnvVar extends PureComponent {
  state = {
    stateVisible: false,
    viewMode: false,
    params: {},
    detail: {},
  };

  componentDidMount() {
    const {
      dispatch,
    } = this.props;
  }

  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    const { env } = this.props;
    this.setState({ params });
    const search = { envId: env.id, varName: params.varName };
    dispatch(ENVVAR_LIST(search));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={8} sm={24}>
          <FormItem label="查询名称">
            {getFieldDecorator('varName')(<Input placeholder="查询名称" />)}
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

  handleClick = (code, record) => {
    if (code === 'env_var_add') {
      this.setState({
        stateVisible: true,
      });
    } else if (code === 'env_var_edit') {
      const { id } = record;
      envVarDetail({ id }).then(resp => {
        if (resp.success) {
          this.setState({ stateVisible: true, viewMode: false, detail: resp.data });
        }
      });
    } else if (code === 'env_var_view') {
      const { id } = record;
      envVarDetail({ id }).then(resp => {
        if (resp.success) {
          this.setState({ stateVisible: true, viewMode: true, detail: resp.data });
        }
      });
    } else if (code === 'env_var_delete') {
      const { id, envId, varName } = record;
      const { params } = this.state;
      const refresh = this.handleSearch;
      Modal.confirm({
        title: '删除确认',
        content: '确定删除该条记录?',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          removeEnvVar({ ids: id, envId: envId, varName: varName }).then(resp => {
            if (resp.success) {
              message.success(resp.msg);
              refresh(params);
            } else {
              message.error(resp.msg || '删除失败');
            }
          });
        },
        onCancel() { },
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const { viewMode } = this.state;
    if (viewMode === true) {
      this.handleStateCancel();
      return;
    }
    const { form, env } = this.props;

    const {
      params,
      detail: { id },
    } = this.state;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let formData = Object.assign(values, { envId : env.id })
        if (!func.isEmpty(id)) {
          formData = Object.assign(values, { id });
        }
        submitEnvVar(formData).then(resp => {
          if (resp.success) {
            message.success(resp.msg);
          } else {
            message.error(resp.msg || '提交失败');
          }
          this.handleSearch(params);
          this.handleStateCancel();
          form.resetFields();
        });
      }
    });
  };

  handleStateCancel = () => {
    this.setState({
      stateVisible: false,
      viewMode: false,
      detail: { id: '' }
    });
  };
  // ------------------------------------------------------------

  renderLeftButton = () => (
    <Button icon="plus" type="primary" onClick={() => this.handleClick('env_var_add')}>
      新增
    </Button>
  );

  render() {
    const code = 'envVar';

    const {
      form,
      loading,
      envVar: { data },
      env,
    } = this.props;

    const { stateVisible, detail, viewMode } = this.state;
    const { getFieldDecorator } = form;

    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };

    const columns = [
      {
        title: '变量名',
        dataIndex: 'varName',
        width: '150px',
      },
      {
        title: '变量值',
        dataIndex: 'varValue',
        width: '400px',
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: '160px',
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '120px',
        render: (text, record) => {
          return (
            <Fragment>
              <div style={{ textAlign: 'center' }}>
                <Fragment key="edit">
                  <a title="修改" onClick={() => this.handleClick('env_var_edit', record)}>
                    修改
                  </a>
                </Fragment>
                <Divider type="vertical" />
                <Fragment key="delete">
                  <a title="删除" onClick={() => this.handleClick('env_var_delete', record)}>
                    删除
                  </a>
                </Fragment>
              </div>
            </Fragment>
          )
        },
      },
    ];

    return (
      <div>
        <Grid
          // code={code}
          enableRowSelection={false}
          form={form}
          onSearch={this.handleSearch}
          renderSearchForm={this.renderSearchForm}
          renderLeftButton={this.renderLeftButton}
          loading={loading}
          data={data}
          columns={columns}
        />
        <Modal
          title="环境变量"
          width={600}
          visible={stateVisible}
          onOk={this.handleSubmit}
          onCancel={this.handleStateCancel}
        >
          <Form style={{ marginTop: 8 }}>
            <Card className={styles.card} bordered={false}>
              <Row gutter={24}>
                <Col span={20}>
                  <FormItem {...formItemLayout} label="变量名">
                    {getFieldDecorator('varName', {
                      initialValue: detail.varName,
                    })(<Input disabled={viewMode} placeholder="请输入变量名" />)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={20}>
                  <FormItem {...formItemLayout} label="变量值">
                    {getFieldDecorator('varValue', {
                      initialValue: detail.varValue,
                    })(<Input disabled={viewMode} placeholder="请输入变量值" />)}
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </Form>
        </Modal>
      </div>
    );
  }
}
export default EnvVar;
