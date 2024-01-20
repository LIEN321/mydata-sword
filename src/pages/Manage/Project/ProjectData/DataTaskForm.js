import React, { PureComponent } from 'react';
import { Form, Input, Card, Button, Select, Radio, Modal, message, notification } from 'antd';
import { connect } from 'dva';
import Panel from '../../../../components/Panel';
import styles from '../../../../layouts/Sword.less';
import { TASK_SUBMIT, TASK_INIT_API, TASK_SUBSCRIBED, TASK_TYPE_PRODUCER, TASK_DETAIL } from '../../../../actions/task';
import { submit as submitTask, detail as taskDetail } from '../../../../services/task';
import TaskFieldMappingTable from '../../Task/TaskFieldMappingTable';
import { dataFields } from '../../../../services/data';
import TaskDataFilterTable from '../../Task/TaskDataFilterTable';
import TaskVarMappingTable from '../../Task/TaskVarMappingTable';
import form from '@/locales/en-US/form';

const FormItem = Form.Item;

@connect(({ task, loading }) => ({
  task,
  submitting: loading.effects['task/submit'],
}))
@Form.create()
class DataTaskForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      detail: null,
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

  componentWillMount() {
    const { dispatch, opType, data, currentTask } = this.props;
    dispatch(TASK_INIT_API({ opType }));
    this.loadDataFieldList(data.id);

    if (currentTask && currentTask.id) {
      taskDetail({ id: currentTask.id }).then(resp => {
        if (resp.success) {
          const detail = resp.data;
          this.setState({ detail });
          this.setState({ apiUrl: detail.apiUrl });
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
      });
      // dispatch(TASK_DETAIL(currentTask.id));
    }

    if (opType == TASK_TYPE_PRODUCER) {
      // 提供数据
      this.setState({ isShowSubscribed: false, isShowTaskPeriod: true });
    } else {
      // 消费数据
      this.setState({ isShowSubscribed: true, isShowTaskPeriod: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      task: {
        init: { envList, apiList },
        // detail,
      },
    } = nextProps;

    this.setState({
      envList: envList,
      apiList: apiList,
    });

    const { initStatus, apiUrl, detail } = this.state;

    // if (!apiUrl && detail) {
    //   this.setState({ apiUrl: detail.apiUrl });
    // }

    if (!initStatus && detail && detail.id) {
      // this.setState({
      //   fieldMappings: detail.fieldMapping,
      //   isShowSubscribed: detail.opType != TASK_TYPE_PRODUCER,
      //   isShowTaskPeriod: detail.isSubscribed != TASK_SUBSCRIBED,
      //   initStatus: true,
      //   filters: detail.dataFilter,
      //   varMappings: detail.fieldVarMapping,
      // });

      // this.renderWarning(detail);
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
    this.state.currentApi = api;
    // if (api) {
    //   this.state.opType = api.opType == 1 ? "提供数据" : "消费数据";
    // } else {
    //   this.state.opType = "";
    // }
    this.updateApiUrl();
  }

  updateApiUrl() {
    const { form, env } = this.props;
    let { currentApi } = this.state;

    if (currentApi == null) {
      const appApiId = form.getFieldValue("apiId");
      currentApi = this.findApi(appApiId);
    }

    let apiUrl = '';

    if (env != null && currentApi != null) {
      apiUrl = env.envPrefix + currentApi.apiUri;
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
    const { dispatch, form, env, data, projectId, closeTaskForm, currentTask } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          ...values,
        };
        if (currentTask) {
          params.id = currentTask.id;
        }
        params.fieldMapping = this.state.fieldMappings;
        params.dataFilter = this.state.filters;
        params.fieldVarMapping = this.state.varMappings;
        params.envId = env.id;
        params.dataId = data.id;
        params.projectId = projectId;
        // dispatch(TASK_SUBMIT(params));
        submitTask(params).then(resp => {
          if (resp.success) {
            message.success(resp.msg);
            form.resetFields();
            closeTaskForm();
          } else {
            message.error(resp.msg || '提交失败');
          }
        });
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

  handleClose = () => {
    const { form, closeTaskForm } = this.props;
    form.resetFields();
    closeTaskForm();
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

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      task: {
        init: { apiList },
        //   detail,
      },
      env,
      data,
      projectId,
      opType,
    } = this.props;

    console.info("DataTaskForm detail = ");
    console.info(detail);

    const { apiUrl, detail } = this.state;

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

      <Modal
        title={`定时任务`}
        width="80%"
        visible={this.props.taskFormVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
      >
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
                initialValue: detail ? detail.taskName : '',
              })(<Input placeholder="请输入任务名称" />)}
            </FormItem>
            {/* <FormItem {...formItemLayout} label="所属环境">
              {getFieldDecorator('envId', {
                rules: [
                  {
                    required: true,
                    message: '请选择所属环境',
                  },
                ],
              })(
                <Select allowClear placeholder="请选择所属环境" onChange={this.handleChangeEnv}>
                  {envList.map(e => (
                    <Select.Option key={e.id} value={e.id}>
                      {e.envName} ({e.envPrefix})
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem> */}
            <FormItem {...formItemLayout} label="选择API">
              {getFieldDecorator('apiId', {
                rules: [
                  {
                    required: true,
                    message: '请选择API',
                  },
                ],
                initialValue: detail ? detail.apiId : '',
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
              {opType == TASK_TYPE_PRODUCER ? "提供数据" : "消费数据"}
            </FormItem>
            {/* <FormItem {...formItemLayout} label="数据项">
              {getFieldDecorator('dataId', {
                rules: [
                  {
                    required: false,
                    message: '请选择数据项',
                  },
                ],
              })(
                <Select allowClear placeholder="请选择数据项" onChange={this.handleChangeData}>
                  {dataList.map(d => (
                    <Select.Option key={d.id} value={d.id}>
                      {d.dataCode} - {d.dataName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem> */}

            {this.state.isShowSubscribed && (<FormItem {...formItemLayout} label="订阅数据" extra="订阅模式：区别于定时模式，只当有提供新数据后才推送数据；">
              {getFieldDecorator('isSubscribed', {
                rules: [
                  {
                    required: true,
                    message: '请选择是否为订阅任务',
                  },
                ],
                initialValue: detail ? detail.isSubscribed : 1,
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
                initialValue: detail ? detail.taskPeriod : '',
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
                    message: '请输入字段层级前缀',
                  },
                ],
                initialValue: detail ? detail.apiFieldPrefix : '',
              })(<Input placeholder="请输入JSON字段层级前缀" />)}
            </FormItem> */}
            <FormItem {...formItemLayout} label="字段映射">
              <TaskFieldMappingTable
                dataFieldList={this.state.dataFieldList}
                handleSave={this.handleSaveMapping}
                initFieldMappings={detail ? detail.fieldMapping : {}}
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
      </Modal>
    );
  }
}

export default DataTaskForm;
