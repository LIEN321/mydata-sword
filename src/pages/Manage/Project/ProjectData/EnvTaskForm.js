import React, { PureComponent } from 'react';
import { Form, Input, Card, Button, Select, Radio, Modal, message, notification } from 'antd';
import { connect } from 'dva';
import Panel from '../../../../components/Panel';
import styles from '../../../../layouts/Sword.less';
import { TASK_SUBMIT, TASK_INIT_API, TASK_SUBSCRIBED, TASK_TYPE_PRODUCER, TASK_DETAIL } from '../../../../actions/task';
import { submit as submitTask, detail as taskDetail } from '../../../../services/task';
import TaskVarMappingTable from '../../Task/TaskVarMappingTable';
import form from '@/locales/en-US/form';

const FormItem = Form.Item;

@connect(({ task, loading }) => ({
  task,
  submitting: loading.effects['task/submit'],
}))
@Form.create()
class EnvTaskForm extends PureComponent {
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

      varMappings: [{ key: 0 }],

      isShowSubscribed: false,
      isShowTaskPeriod: true,
    };
  }

  componentWillMount() {
    const { dispatch, opType, currentTask } = this.props;
    dispatch(TASK_INIT_API({ opType }));

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
        // params.fieldVarMapping = this.state.varMappings;
        params.envId = env.id;
        params.projectId = projectId;

        let fieldVarMapping = {};
        const { varMappings } = this.state;
        if (varMappings) {
          varMappings.map(m => {
            console.info(m);
            const obj = {};
            fieldVarMapping[m.k] = m.v;
          });
        }
        params.fieldVarMapping = fieldVarMapping;

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
      projectId,
      opType,
    } = this.props;

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

export default EnvTaskForm;
