import React, { PureComponent } from 'react';
import { Form, Input, Card, Button, Select } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { ENV_INIT, ENV_SUBMIT } from '../../../actions/env';
import EnvEditableTable from './EnvEditableTable';

const FormItem = Form.Item;

@connect(({env, loading }) => ({
  env,
  submitting: loading.effects['env/submit'],
}))
@Form.create()
class EnvAdd extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      globalHeaders: [],
      globalParams: [],
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(ENV_INIT());
  }

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          // id,
          ...values,
        };
        params.globalHeaders = this.state.globalHeaders;
        params.globalParams = this.state.globalParams;
        dispatch(ENV_SUBMIT(params));
      }
    });
  };

  handleSaveHeader = header => {
    const newData = [...this.state.globalHeaders];
    const index = newData.findIndex(item => header.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...header,
      });
      this.setState({ globalHeaders: newData });
    } else {
      newData.push(header);
      this.setState({ globalHeaders: newData });
    }
  };

  handleDeleteHeader = key => {
    const globalHeaders = [...this.state.globalHeaders];
    this.setState({ globalHeaders: globalHeaders.filter(item => item.key !== key) });
  };

  handleSaveParam = param => {
    const newData = [...this.state.globalParams];
    const index = newData.findIndex(item => param.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...param,
      });
      this.setState({ globalParams: newData });
    } else {
      newData.push(param);
      this.setState({ globalParams: newData });
    }
  };

  handleDeleteParam = key => {
    const globalParams = [...this.state.globalParams];
    this.setState({ globalParams: globalParams.filter(item => item.key !== key) });
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      env: {
        init: { projectList },
      },
      location: { query }
    } = this.props;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const action = (
      <Button type="primary" onClick={this.handleSubmit} loading={submitting}>
        提交
      </Button>
    );

    return (
      <Panel title="新增" back="/manage/env" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="选择项目">
              {getFieldDecorator('projectId', {
                rules: [
                  {
                    required: true,
                    message: '请选择项目',
                  },
                ],
                initialValue: query.projectId,
              })(
                <Select allowClear placeholder="请选择项目">
                  {projectList.map(p => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.projectName} ({p.projectCode})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="环境名称">
              {getFieldDecorator('envName', {
                rules: [
                  {
                    required: true,
                    message: '请输入环境名称',
                  },
                ],
              })(<Input placeholder="请输入环境名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="前置路径">
              {getFieldDecorator('envPrefix', {
                rules: [
                  {
                    required: false,
                    message: '请输入前置路径',
                  },
                ],
              })(<Input placeholder="请输入前置路径" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="全局Headers">
              {getFieldDecorator('globalHeaders', {
                rules: [
                  {
                    required: false,
                    message: '请输入全局header参数',
                  },
                ],
              })(
                // <Input placeholder="请输入全局header参数" />
                <EnvEditableTable
                  tableValues={this.state.globalHeaders}
                  handleSave={this.handleSaveHeader}
                  handleDelete={this.handleDeleteHeader}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="全局Params">
              {getFieldDecorator('globalParams', {
                rules: [
                  {
                    required: false,
                    message: '请输入全局变量',
                  },
                ],
              })(
                // <Input placeholder="请输入全局变量" />
                <EnvEditableTable
                  tableValues={this.state.globalParams}
                  handleSave={this.handleSaveParam}
                  handleDelete={this.handleDeleteParam}
                />
              )}
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default EnvAdd;
