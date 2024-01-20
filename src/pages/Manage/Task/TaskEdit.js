import React, { PureComponent } from 'react';
import { Form, Input, Card, Button, Select, Radio, notification } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { TASK_DETAIL, TASK_SUBMIT, TASK_INIT, TASK_SUBSCRIBED, TASK_TYPE_PRODUCER } from '../../../actions/task';
import TaskFieldMappingTable from './TaskFieldMappingTable';
import { dataFields } from '../../../services/data';
import TaskDataFilterTable from './TaskDataFilterTable';
import TaskVarMappingTable from './TaskVarMappingTable';

const FormItem = Form.Item;

@connect(({ task, loading }) => ({
  task,
  submitting: loading.effects['task/submit'],
}))
@Form.create()
class TaskEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initStatus: false,

      apiUrl: '',
      opType: null,

      envList: [],
      currentEnv: null,

      apiList: [],
      currentApi: null,

      dataFieldList: [],
      fieldMappings: {},
      filters: [],
      varMappings: [],

      isShowSubscribed: false,
      isShowTaskPeriod: true,
    };
  }

  renderWarning = task => {
    if (task.taskStatus == 1) {
      notification['warning']({
        message: '请注意',
        description:
          '任务运行中，请在提交修改后手动重启！',
        duration: 10,
      });
    }
  }

  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(TASK_INIT());
    dispatch(TASK_DETAIL(id));
  }

  componentWillReceiveProps(nextProps) {
    const {
      task: { detail },
      task: {
        init: { envList, apiList },
      },
    } = nextProps;

    this.setState({
      envList: envList,
      apiList: apiList,
    });

    const { initStatus, apiUrl, opType } = this.state;

    if (!initStatus && detail.id) {
      this.loadDataFieldList(detail.dataId);
      this.setState({
        fieldMappings: detail.fieldMapping,
        isShowSubscribed: detail.opType != TASK_TYPE_PRODUCER,
        isShowTaskPeriod: detail.isSubscribed != TASK_SUBSCRIBED,
        initStatus: true,
        filters: detail.dataFilter,
        varMappings: detail.fieldVarMapping,
      });

      this.renderWarning(detail);
    }

    if (!apiUrl) {
      this.setState({ apiUrl: detail.apiUrl });
      this.findEnv(detail.envId);
    }
    if (!opType) {
      this.setState({ opType: detail.opType == 1 ? "提供数据" : "消费数据" });
      this.findApi(detail.apiId);
    }

  }

  findEnv(envId) {
    const newEnvList = [...this.state.envList];
    const index = newEnvList.findIndex(env => env.id === envId);
    const env = newEnvList[index];
    this.state.currentEnv = env;
    return env;
  }

  findApi(apiId) {
    const newApiList = [...this.state.apiList];
    const index = newApiList.findIndex(api => api.id === apiId);
    const api = newApiList[index];
    this.state.currentApi = api;
    return api;
  }

  handleChangeEnv = envId => {
    const env = this.findEnv(envId);
    this.updateApiUrl();
  }

  handleChangeApi = apiId => {
    const api = this.findApi(apiId);
    if (api) {
      this.state.opType = api.opType == 1 ? "提供数据" : "消费数据";
    } else {
      this.state.opType = "";
    }
    this.updateApiUrl();

    const opType = api.opType;
    if (opType == TASK_TYPE_PRODUCER) {
      // 提供数据
      this.setState({ isShowSubscribed: false, isShowTaskPeriod: true });
    } else {
      // 消费数据
      this.setState({ isShowSubscribed: true, isShowTaskPeriod: false });
    }
  }

  updateApiUrl() {
    const { form } = this.props;
    let { currentEnv, currentApi } = this.state;
    if (currentEnv == null) {
      const envId = form.getFieldValue("envId");
      currentEnv = this.findEnv(envId);
    }
    if (currentApi == null) {
      const appApiId = form.getFieldValue("apiId");
      currentApi = this.findApi(appApiId);
    }

    let apiUrl = '';

    if (currentEnv != null && currentApi != null) {
      apiUrl = currentEnv.envPrefix + currentApi.apiUri;
    }

    this.setState({ apiUrl });
  }

  async loadDataFieldList(dataId) {
    const dataFieldResponse = await dataFields({ dataId: dataId });
    if (dataFieldResponse.success) {
      this.setState({ dataFieldList: dataFieldResponse.data });
    }
  }

  handleChangeData = dataId => {
    if (!dataId) {
      this.setState({ dataFieldList: [] });
      return;
    }
    this.loadDataFieldList(dataId);
  };

  handleSaveMapping = mapping => {
    const { fieldMappings } = this.state;
    const key = mapping.dataFieldCode;
    if (key) {
      fieldMappings[key] = mapping.apiFieldCode;
    }
  };

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
        params.fieldMapping = this.state.fieldMappings;
        params.dataFilter = this.state.filters;
        params.fieldVarMapping = this.state.varMappings;
        dispatch(TASK_SUBMIT(params));
      }
    });
  };

  handleChangeSubscribed = e => {
    const targetValue = e.target.value;
    if (targetValue == TASK_SUBSCRIBED) {
      // 订阅
      this.setState({ isShowTaskPeriod: false });
    } else {
      // 不订阅
      this.setState({ isShowTaskPeriod: true });
    }
  };

  handleSaveFilter = filter => {
    const newData = [...this.state.filters];
    const index = newData.findIndex(item => filter.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...filter,
      });
      this.setState({ filters: newData });
    } else {
      newData.push(filter);
      this.setState({ filters: newData });
    }
  };

  handleDeleteFilter = key => {
    const filters = [...this.state.filters];
    this.setState({ filters: filters.filter(item => item.key !== key) });
  };

  handleSaveVarMapping = filter => {
    const newData = [...this.state.varMappings];
    const index = newData.findIndex(item => filter.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...filter,
      });
      this.setState({ varMappings: newData });
    } else {
      newData.push(filter);
      this.setState({ varMappings: newData });
    }
  };

  handleDeleteVarMapping = key => {
    const varMappings = [...this.state.varMappings];
    this.setState({ varMappings: varMappings.filter(item => item.key !== key) });
  };

  render() {
    const {
      form: { getFieldDecorator },
      task: { detail },
      submitting,
      task: {
        init: { envList, apiList, dataList },
      },
    } = this.props;

    const { apiUrl, opType } = this.state;

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
      <Panel title="修改" back="/manage/task" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="任务名称">
              {getFieldDecorator('taskName', {
                rules: [
                  {
                    required: true,
                    message: '请输入任务名称',
                  },
                ],
                initialValue: detail.taskName,
              })(<Input placeholder="请输入任务名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="所属环境">
              {getFieldDecorator('envId', {
                rules: [
                  {
                    required: true,
                    message: '请选择所属环境',
                  },
                ],
                initialValue: detail.envId,
              })(
                <Select allowClear placeholder="请选择所属环境" onChange={this.handleChangeEnv}>
                  {envList.map(e => (
                    <Select.Option key={e.id} value={e.id}>
                      {e.envName} ({e.envPrefix})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="选择API">
              {getFieldDecorator('apiId', {
                rules: [
                  {
                    required: true,
                    message: '请选择API',
                  },
                ],
                initialValue: detail.apiId,
              })(
                <Select allowClear placeholder="请选择API" onChange={this.handleChangeApi}>
                  {apiList.map(a => (
                    <Select.Option key={a.id} value={a.id}>
                      {a.apiName} ({a.apiUri})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="API完整地址">
              {apiUrl}
            </FormItem>
            <FormItem {...formItemLayout} label="任务类型">
              {opType}
            </FormItem>
            <FormItem {...formItemLayout} label="数据项">
              {getFieldDecorator('dataId', {
                rules: [
                  {
                    required: false,
                    message: '请选择数据项',
                  },
                ],
                initialValue: detail.dataId,
              })(
                <Select allowClear placeholder="请选择数据项" onChange={this.handleChangeData}>
                  {dataList.map(d => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.dataCode} - {d.dataName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>

            {this.state.isShowSubscribed && (<FormItem {...formItemLayout} label="订阅数据" extra="订阅模式：区别于定时模式，只当有提供新数据后才推送数据；">
              {getFieldDecorator('isSubscribed', {
                rules: [
                  {
                    required: true,
                    message: '请选择是否为订阅任务',
                  },
                ],
                initialValue: detail.isSubscribed,
              })(
                // <Input placeholder="请输入是否为订阅任务：0-不订阅，1-订阅" />
                <Radio.Group buttonStyle="solid" onChange={this.handleChangeSubscribed}>
                  <Radio.Button value={1}>订阅</Radio.Button>
                  <Radio.Button value={0}>不订阅</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>)}

            {this.state.isShowTaskPeriod && (<FormItem {...formItemLayout} label="任务周期">
              {getFieldDecorator('taskPeriod', {
                rules: [
                  {
                    required: true,
                    message: '请输入任务周期',
                  },
                ],
                initialValue: detail.taskPeriod,
              })(
                // <Input placeholder="请输入任务周期" />
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="0 0/1 * * * ?">1m</Radio.Button>
                  <Radio.Button value="0 0/10 * * * ?">10m</Radio.Button>
                  <Radio.Button value="0 0/30 * * * ?">30m</Radio.Button>
                  <Radio.Button value="0 0 * * * ?">1h</Radio.Button>
                  <Radio.Button value="0 0 0/2 * * ?">2h</Radio.Button>
                  <Radio.Button value="0 0 0/6 * * ?">6h</Radio.Button>
                  <Radio.Button value="0 0 0/12 * * ?">12h</Radio.Button>
                  <Radio.Button value="0 0 0 * * ?">1d</Radio.Button>
                  <Radio.Button value="0 0 0 1/2 * ?">2d</Radio.Button>
                  <Radio.Button value="0 0 0 1/7 * ?">7d</Radio.Button>
                </Radio.Group>
              )}
            </FormItem>)}
            {/* <FormItem {...formItemLayout} label="JSON字段层级前缀">
              {getFieldDecorator('apiFieldPrefix', {
                rules: [
                  {
                    required: false,
                    message: '请输入JSON字段层级前缀',
                  },
                ],
                initialValue: detail.apiFieldPrefix,
              })(<Input placeholder="请输入JSON字段层级前缀" />)}
            </FormItem> */}
            <FormItem {...formItemLayout} label="字段映射">
              <TaskFieldMappingTable
                dataFieldList={this.state.dataFieldList}
                handleSave={this.handleSaveMapping}
                initFieldMappings={detail.fieldMapping}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="数据过滤条件">
              <TaskDataFilterTable
                filters={this.state.filters}
                handleSave={this.handleSaveFilter}
                handleDelete={this.handleDeleteFilter}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="数据存入变量">
              <TaskVarMappingTable
                varMappings={this.state.varMappings}
                handleSave={this.handleSaveVarMapping}
                handleDelete={this.handleDeleteVarMapping}
              />
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default TaskEdit;
