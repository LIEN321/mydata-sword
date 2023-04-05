import React, { PureComponent } from 'react';
import { Form, Card, Button, Select, Modal } from 'antd';
import { connect } from 'dva';
import styles from '../../../layouts/Sword.less';
import { API_DEBUG } from '../../../actions/api';
import api from '@/models/api';

const FormItem = Form.Item;

@connect(({ api, loading }) => ({
  api,
  submitting: loading.effects['api/submit'],
}))
@Form.create()
class ApiDebug extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      apiUrl: '',
      contentType: 'application/json',
    };
  }

  findEnv(envId) {
    const newEnvList = [...this.props.envList];
    const index = newEnvList.findIndex(env => env.id === envId);
    const env = newEnvList[index];
    this.state.currentEnv = env;
    return env;
  }

  handleChangeEnv = envId => {
    const env = this.findEnv(envId);
    this.updateApiUrl(env);
  }

  handleChangeContentType = contentType => {
    this.setState({ contentType : contentType });
  }

  updateApiUrl(env) {
    const apiUri = this.props.apiUri;
    let apiUrl = env.envPrefix + apiUri;

    this.setState({ apiUrl });
  }

  debug = () => {
    const { dispatch } = this.props;

    const httpMethod = this.props.apiMethod;
    const httpUri = this.state.apiUrl;
    const httpHeaders = this.props.reqHeaders;
    const httpParams = this.props.reqParams;
    const contentType = this.state.contentType;

    const params = {
      httpMethod,
      httpUri,
      // httpHeaders,
      // httpParams,
      contentType,
    };

    dispatch(API_DEBUG(params));
  }

  render() {
    const { visible } = this.props;
    const { apiUrl } = this.state;

    const {
      envList,
      api: {
        debugResult
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

    return (
      <Modal
        visible={visible}
        onCancel={this.props.onCancel}
        width="50%"
        footer={<Button type='primary' onClick={this.debug}>运行</Button>}
      >
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="选择环境">
              <Select allowClear placeholder="请选择环境" onChange={this.handleChangeEnv}>
                {envList.map(e => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.envName} ({e.envPrefix})
                  </Select.Option>
                ))}
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="选择Content-Type" onChange={this.handleChangeContentType}>
              <Select allowClear placeholder="请选择Content-Type" defaultValue="application/json">
                <Select.Option value="application/json">application/json</Select.Option>
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="请求地址">
              {apiUrl}
            </FormItem>
            <FormItem {...formItemLayout} label="响应内容">
              <span>状态：{debugResult.status}</span> <br />
              <span>耗时：{debugResult.time} ms</span>
              <Card>
                {debugResult.body}
              </Card>
            </FormItem>
          </Card>
        </Form>
      </Modal>
    );
  }
}

export default ApiDebug;
