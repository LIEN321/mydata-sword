import React, { PureComponent, Fragment, forwardRef } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, Tag, message, Modal, Divider, Table, Card, List, Icon, notification, Drawer } from 'antd';
import Panel from '../../../../components/Panel';
import { TASK_LIST, TASK_LOG_LIST, DATA_TASKS, TASK_STATUS_RUNNING, ENV_TASKS } from '../../../../actions/task';
import Grid from '../../../../components/Sword/Grid';
import { executeTask, startTask, stopTask, remove } from '../../../../services/task';
import styles from './style.less';
import mdStyle from '../../../../layouts/Mydata.less'
import { TASK_TYPE_PRODUCER, TASK_TYPE_CONSUMER } from '../../../../actions/task';
import EnvVarTaskForm from './EnvVarTaskForm';
import TaskCard from './TaskCard';

const FormItem = Form.Item;

@connect(({ task, loading }) => ({
  task,
  loading: loading.models.task,
}))
@Form.create()
class EnvVarTask extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentTask: {},
      taskFormVisible: false,
      logModalVisible: false,
    };
  }

  componentDidMount() {
    this.handleLoadTasks();
  }

  // 查询数据项的任务列表
  handleLoadTasks = () => {
    const { dispatch, envVar } = this.props;
    const params = { envVarId: envVar.id };
    dispatch(ENV_TASKS(params));
  }

  handleRefresh = () => {
    this.handleLoadTasks();
    // message.info("刷新成功");
    notification.info({
      message: '刷新成功'
    });
  }
  // ------------------------------------------------------------

  // 显示新增任务表单
  handleAddTask = (opType) => {
    this.setState({ opType: opType, taskFormVisible: true, currentTask: {} });
  };
  // 显示编辑任务表单
  handleEditTask = (task) => {
    this.setState({ opType: task.opType, taskFormVisible: true, currentTask: task });
  };
  // 关闭任务表单
  closeTaskForm = () => {
    this.setState({ opType: null, taskFormVisible: false, currentTask: {} });
    this.handleLoadTasks();
  }
  // ------------------------------------------------------------

  renderTaskCard = (task) => {
    const { env } = this.props;

    return <TaskCard
      currentTask={task}
      env={env}
      handleLoadTasks={this.handleLoadTasks}
      handleEditTask={this.handleEditTask}
      closeTaskForm={this.closeTaskForm}
    />
  };

  render() {
    const code = 'task';

    const {
      form,
      loading,
      task: { envTasks },
      env,
      envVar,
    } = this.props;

    const logColumns = [
      {
        title: '开始时间',
        dataIndex: 'taskStartTime',
        width: 160,
      },
      {
        title: '结束时间',
        dataIndex: 'taskEndTime',
        width: 160,
      },
      {
        title: '执行结果',
        dataIndex: 'taskResult',
        width: 100,
        render: taskResult => {
          let color = taskResult == 1 ? 'green' : 'red';
          let status = taskResult == 1 ? '成功' : '失败';
          return (
            <Tag color={color}>
              {status}
            </Tag>
          );
        },
      },
    ];

    return (
      <>
        {this.props.visible && <Drawer
          title={
            <>
              环境：<span style={{ color: 'red' }}>{env.envName}</span>
              <Divider type='vertical' />
              前置路径：{env.envPrefix}
              <Divider type='vertical' />
              <Button onClick={this.handleRefresh}>
                <Icon type="reload" />刷新
              </Button>
            </>
          }
          visible={this.props.visible}
          onClose={this.props.handleCloseTask}
          width={"60%"}
        >
          <div style={{ textAlign: 'left' }}>
            <Row gutter={[16, 16]}>
              {envTasks.producerTasks.map(t => (
                <Col span={6}>
                  {this.renderTaskCard(t)}
                </Col>
              ))}
            </Row>
            <Divider />
            <Button type='dashed' style={{ width: '100%', height: '50px' }} onClick={() => this.handleAddTask(TASK_TYPE_PRODUCER)}>
              <Icon type="plus" /> 新增任务
            </Button>
          </div>
        </Drawer>}

        {this.state.taskFormVisible && <EnvVarTaskForm
          env={env}
          envVar={envVar}
          projectId={env.projectId}
          opType={this.state.opType}
          taskFormVisible={this.state.taskFormVisible}
          closeTaskForm={this.closeTaskForm}
          currentTask={this.state.currentTask}
        />}
      </>
    );
  }
}
export default EnvVarTask;
