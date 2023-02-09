import React, { PureComponent } from 'react';
import { Form, Input, Card, Button, Radio, Select } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { API_DETAIL, API_SUBMIT, API_INIT } from '../../../actions/api';
import ApiEditableTable from './ApiEditableTable';

const FormItem = Form.Item;

@connect(({ api, loading }) => ({
  api,
  submitting: loading.effects['api/submit'],
}))
@Form.create()
class ApiEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      reqHeaders: [],
      reqParams: [],
    };
  }

  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(API_INIT());
    dispatch(API_DETAIL(id));
  }

  componentWillReceiveProps(nextProps) {
    const {
      api: { detail },
    } = nextProps;

    const { reqHeaders, reqParams } = detail;

    // if(!(this.state.reqHeaders && this.state.reqHeaders.length > 0)){
    if (reqHeaders && reqHeaders.length > 0) {
      reqHeaders.filter((item, index, self) => { item.key = index });
      this.setState({
        reqHeaders: reqHeaders,
      });
    }
    // }

    // if(!(this.state.reqParams && this.state.reqParams.length > 0)){
    if (reqParams && reqParams.length > 0) {
      reqParams.filter((item, index, self) => { item.key = index });
      this.setState({
        reqParams: reqParams,
      });
    }
    // }
  }

  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      match: {
        params: { id },
      },
      form,
    } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          id,
          ...values,
        };
        params.reqHeaders = this.state.reqHeaders;
        params.reqParams = this.state.reqParams;
        dispatch(API_SUBMIT(params));
      }
    });
  };

  handleSaveHeader = header => {
    const newData = [...this.state.reqHeaders];
    const index = newData.findIndex(item => header.key === item.key);
    if (index > -1) {
      // const item = newData[index];
      // newData.splice(index, 1, {
      //   ...item,
      //   ...header,
      // });
      newData[index] = header;
      this.setState({ reqHeaders: newData });
    } else {
      newData.push(header);
      this.setState({ reqHeaders: newData });
    }
  };

  handleDeleteHeader = key => {
    const reqHeaders = [...this.state.reqHeaders];
    this.setState({ reqHeaders: reqHeaders.filter(item => item.key !== key) });
  };

  handleSaveParam = param => {
    const newData = [...this.state.reqParams];
    const index = newData.findIndex(item => param.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...param,
      });
      this.setState({ reqParams: newData });
    } else {
      newData.push(param);
      this.setState({ reqParams: newData });
    }
  };

  handleDeleteParam = key => {
    const reqParams = [...this.state.reqParams];
    this.setState({ reqParams: reqParams.filter(item => item.key !== key) });
  };

  render() {
    const {
      form: { getFieldDecorator },
      api: { detail },
      submitting,
      api: {
        init: { appList }
      }
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
      <Panel title="修改" back="/manage/api" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="所属应用">
              {getFieldDecorator('appId', {
                rules: [
                  {
                    required: true,
                    message: '请选择所属应用',
                  },
                ],
                initialValue: detail.appId,
              })(
                <Select allowClear placeholder="请选择所属应用">
                  {appList.map(e => (
                    <Select.Option key={e.id} value={e.id}>
                      {e.appName} ({e.appCode})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="名称">
              {getFieldDecorator('apiName', {
                rules: [
                  {
                    required: true,
                    message: '请输入API名称',
                  },
                ],
                initialValue: detail.apiName,
              })(<Input placeholder="请输入API名称" maxLength={64} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="API类型">
              {getFieldDecorator('opType', {
                rules: [
                  {
                    required: true,
                    message: '请选择API类型',
                  },
                ],
                initialValue: detail.opType,
              })(
                <Radio.Group>
                  <Radio.Button value={1}>提供数据</Radio.Button>
                  <Radio.Button value={2}>消费数据</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="请求方法">
              {getFieldDecorator('apiMethod', {
                rules: [
                  {
                    required: true,
                    message: '请选择请求方法',
                  },
                ],
                initialValue: detail.apiMethod,
              })(
                <Radio.Group>
                  <Radio.Button value="GET">GET</Radio.Button>
                  <Radio.Button value="POST">POST</Radio.Button>
                  <Radio.Button value="PUT">PUT</Radio.Button>
                  <Radio.Button value="DELETE">DELETE</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="相对路径" help="长度128以内，例如：/hr/users；">
              {getFieldDecorator('apiUri', {
                rules: [
                  {
                    required: true,
                    message: '请输入相对路径',
                  },
                ],
                initialValue: detail.apiUri,
              })(<Input placeholder="API相对路径，以斜杠(/)开头" maxLength={128} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="数据类型" help="目前仅支持JSON；">
              {getFieldDecorator('dataType', {
                rules: [
                  {
                    required: true,
                    message: '请选择数据类型',
                  },
                ],
                initialValue: detail.dataType,
              })(
                <Radio.Group>
                  <Radio.Button value="JSON" disabled>JSON</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="Headers">
              {getFieldDecorator('reqHeaders', {
                rules: [
                  {
                    required: false,
                    message: '请输入接口请求Header',
                  },
                ],
                initialValue: detail.reqHeaders,
              })(
                // <Input placeholder="请输入接口请求Header" />
                <ApiEditableTable
                  tableValues={this.state.reqHeaders}
                  handleSave={this.handleSaveHeader}
                  handleDelete={this.handleDeleteHeader}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="Params">
              {getFieldDecorator('reqParams', {
                rules: [
                  {
                    required: false,
                    message: '请输入接口请求参数',
                  },
                ],
                initialValue: detail.reqParams,
              })(
                // <Input placeholder="请输入接口请求参数" />
                <ApiEditableTable
                  tableValues={this.state.reqParams}
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

export default ApiEdit;
