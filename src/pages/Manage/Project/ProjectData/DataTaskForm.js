import React, { PureComponent } from 'react';
import { Form, Input, Card, Select, Radio, Modal, message, notification, Tabs, Switch, InputNumber } from 'antd';
import { connect } from 'dva';
import styles from '../../../../layouts/Sword.less';
import { TASK_SUBSCRIBED, TASK_TYPE_PRODUCER, TASK_INIT, TASK_TYPE_CONSUMER } from '../../../../actions/task';
import { submit as submitTask, detail as taskDetail } from '../../../../services/task';
import TaskFieldMappingTable from '../../Task/TaskFieldMappingTable';
import { dataFields } from '../../../../services/data';
import TaskDataFilterTable from '../../Task/TaskDataFilterTable';
import TaskVarMappingTable from '../../Task/TaskVarMappingTable';
import TaskBatchParamTable from '../../Task/TaskBatchMappingTable';

const FormItem = Form.Item;
const { TabPane } = Tabs;

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

      envList: [],
      currentEnv: null,

      apiList: [],
      currentApi: null,

      dataFieldList: [],
      fieldMappings: {},
      filters: [],
      varMappings: [],
      batchParams: [],

      isShowSubscribed: false,
      isShowTaskPeriod: true,

      isBatchEnabled: false,
    };
  }

  componentWillMount() {
    const { dispatch, opType, data, currentTask } = this.props;
    dispatch(TASK_INIT({ opType }));
    this.loadDataFieldList(data.id);

    if (currentTask && currentTask.id) {
      taskDetail({ id: currentTask.id }).then(resp => {
        if (resp.success) {
          const detail = resp.data;
          this.setState({ detail });
          this.setState({ apiUrl: detail.apiUrl });
          this.setState({
            fieldMappings: detail.fieldMapping,
            isShowSubscribed: detail.opType !== TASK_TYPE_PRODUCER,
            isShowTaskPeriod: detail.isSubscribed !== TASK_SUBSCRIBED,
            initStatus: true,
            filters: detail.dataFilter,
            varMappings: detail.fieldVarMapping,
            isBatchEnabled: detail.batchStatus === 1,
            batchParams: detail.batchParams,
          });
          this.renderWarning(detail);
        }
      });
      // dispatch(TASK_DETAIL(currentTask.id));
    }

    if (opType === TASK_TYPE_PRODUCER) {
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
      envList,
      apiList,
    });

    const { initStatus, detail } = this.state;

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

  handleChangeEnv = envId => {
    const currentEnv = this.findEnv(envId);
    this.setState({ currentEnv });
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
    const { currentEnv } = this.state;

    let apiUrl = '';

    if (currentApi == null) {
      const appApiId = form.getFieldValue("apiId");
      currentApi = this.findApi(appApiId);
    }
    if (currentApi) {
      apiUrl = currentApi.apiUri;
    }

    if (currentEnv != null) {
      apiUrl = currentEnv.envPrefix + apiUrl;
    }
    else if (env != null) {
      apiUrl = env.envPrefix + apiUrl;
    }

    this.setState({ apiUrl });
  }

  async loadDataFieldList(dataId) {
    const dataFieldResponse = await dataFields({ dataId });
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
    const { form, env, data, projectId, closeTaskForm, currentTask } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          ...values,
        };
        if (currentTask) {
          params.id = currentTask.id;
          // params.refEnvId = currentTask.refEnvId;
        }
        params.fieldMapping = this.state.fieldMappings;
        params.dataFilter = this.state.filters;
        // params.fieldVarMapping = this.state.varMappings;
        params.envId = env.id;
        params.dataId = data.id;
        params.projectId = projectId;

        const fieldVarMapping = {};
        const { varMappings } = this.state;
        if (varMappings) {
          varMappings.map(m => {
            fieldVarMapping[m.k] = m.v;
          });
        }
        params.fieldVarMapping = fieldVarMapping;
        params.batchStatus = values.batchStatus ? 1 : 0;
        params.batchParams = this.state.batchParams;

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
    if (targetValue === TASK_SUBSCRIBED) {
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

  findApi(apiId) {
    const newApiList = [...this.state.apiList];
    const index = newApiList.findIndex(api => api.id === apiId);
    const api = newApiList[index];
    this.state.currentApi = api;
    return api;
  }

  findEnv(envId) {
    const newEnvList = [...this.state.envList];
    const index = newEnvList.findIndex(env => env.id === envId);
    const env = newEnvList[index];
    this.state.currentEnv = env;
    return env;
  }

  renderWarning = task => {
    if (task.taskStatus === 1) {
      notification.warning({
        message: '请注意',
        description:
          '任务运行中，请在提交修改后手动重启！',
        duration: 10,
      });
    }
  }

  handleChangeBatchStatus = () => {
    const { isBatchEnabled } = this.state;
    this.setState({ isBatchEnabled: !isBatchEnabled });
  }

  handleSaveBatchParam = param => {
    const newData = [...this.state.batchParams];
    const index = newData.findIndex(item => param.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...param,
      });
      this.setState({ batchParams: newData });
    } else {
      newData.push(param);
      this.setState({ batchParams: newData });
    }
  };

  handleDeleteBatchParam = key => {
    const batchParams = [...this.state.batchParams];
    this.setState({ batchParams: batchParams.filter(item => item.key !== key) });
  };

  render() {
    const {
      form: { getFieldDecorator },
      task: {
        init: { envList, apiList },
        //   detail,
      },
      opType,
      isRefEnv,
    } = this.props;

    const { apiUrl, detail, isBatchEnabled } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
        md: { span: 14 },
      },
    };

    return (

      <Modal
        title="定时任务"
        width="60%"
        visible={this.props.taskFormVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
        style={{ top: 20 }}
      >
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Tabs defaultActiveKey='1'>
            <TabPane tab="基本信息" key='1'>
              {/* <Card className={styles.card} bordered={false}> */}
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
              {(isRefEnv || (detail && detail.refEnvId)) ? (<FormItem {...formItemLayout} label="选择其他环境">
                {getFieldDecorator('refEnvId', {
                  rules: [
                    {
                      required: true,
                      message: '请选择其他环境',
                    },
                  ],
                  initialValue: detail ? detail.refEnvId : '',
                })(
                  <Select allowClear placeholder="请选择其他环境" onChange={this.handleChangeEnv}>
                    {envList.map(e => (
                      <Select.Option key={e.id} value={e.id}>
                        {e.envName} ({e.envPrefix})
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>) : <></>}
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
                {opType === TASK_TYPE_PRODUCER ? "提供数据" : "消费数据"}
              </FormItem>
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
              <FormItem {...formItemLayout} label="字段映射">
                <TaskFieldMappingTable
                  dataFieldList={this.state.dataFieldList}
                  handleSave={this.handleSaveMapping}
                  initFieldMappings={detail ? detail.fieldMapping : {}}
                />
              </FormItem>
              {/* </Card> */}
            </TabPane>
            <TabPane tab="数据过滤" key='2' forceRender>
              {/* <Card className={styles.card} bordered={false}> */}
              <FormItem {...formItemLayout} label="数据过滤条件">
                <TaskDataFilterTable
                  filters={this.state.filters}
                  handleSave={this.handleSaveFilter}
                  handleDelete={this.handleDeleteFilter}
                />
              </FormItem>
              {/* </Card> */}
            </TabPane>
            <TabPane tab="变量配置" key='3' forceRender>
              {/* <Card className={styles.card} bordered={false}> */}
              <FormItem {...formItemLayout} label="数据存入变量">
                <TaskVarMappingTable
                  varMappings={this.state.varMappings}
                  handleSave={this.handleSaveVarMapping}
                  handleDelete={this.handleDeleteVarMapping}
                />
              </FormItem>
              {/* </Card> */}
            </TabPane>
            <TabPane tab="分批配置" key='4' forceRender>
              {/* <Card className={styles.card} bordered={false}> */}
              <FormItem {...formItemLayout} label="启用分批">
                {getFieldDecorator('batchStatus', {
                  initialValue: detail ? detail.batchStatus : 0,
                })(<Switch checked={isBatchEnabled} onChange={this.handleChangeBatchStatus} />)}
              </FormItem>
              {isBatchEnabled ?
                <>
                  <FormItem {...formItemLayout} label="分批间隔">
                    {getFieldDecorator('batchInterval', {
                      initialValue: detail && detail.batchInterval ? detail.batchInterval : 2,
                    })(<InputNumber min={1} max={100} placeholder="请输入间隔" />)}<span className="ant-form-text"> 秒</span>
                  </FormItem>
                  {opType === TASK_TYPE_CONSUMER ?
                    <FormItem {...formItemLayout} label="分批数量">
                      {getFieldDecorator('batchSize', {
                        initialValue: detail && detail.batchSize ? detail.batchSize : 1000,
                      })(<InputNumber min={1} max={1000} placeholder="请输入数量" />)}
                    </FormItem>
                    : <></>}
                  <FormItem {...formItemLayout} label="分批参数">
                    <TaskBatchParamTable
                      batchParams={this.state.batchParams}
                      handleSave={this.handleSaveBatchParam}
                      handleDelete={this.handleDeleteBatchParam}
                    />
                  </FormItem>
                </>
                : <></>
              }
              {/* </Card> */}
            </TabPane>
          </Tabs>
        </Form>
      </Modal >
    );
  }
}

export default DataTaskForm;
