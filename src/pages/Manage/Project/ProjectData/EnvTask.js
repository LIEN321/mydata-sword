import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Row, Divider, Icon, notification, Drawer } from 'antd';
import { ENV_TASKS, TASK_TYPE_PRODUCER } from '../../../../actions/task';

import EnvTaskForm from './EnvTaskForm';
import TaskCard from './TaskCard';

@connect(({ task, loading }) => ({
  task,
  loading: loading.models.task,
}))
@Form.create()
class EnvTask extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentTask: {},
      taskFormVisible: false,
    };
  }

  componentDidMount() {
    this.handleLoadTasks();
  }

  // 查询数据项的任务列表
  handleLoadTasks = () => {
    const { dispatch, env } = this.props;
    const params = { envId: env.id };
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
    this.setState({ opType, taskFormVisible: true, currentTask: {} });
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
    const { env, envList } = this.props;

    return <TaskCard
      currentTask={task}
      env={env}
      handleLoadTasks={this.handleLoadTasks}
      handleEditTask={this.handleEditTask}
      closeTaskForm={this.closeTaskForm}
      envList={envList}
    />
  };

  render() {
    const {
      task: { envTasks },
      env,
    } = this.props;

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
          width="60%"
        >
          <div style={{ textAlign: 'left' }}>
            <Button type='dashed' style={{ width: '100%', height: '50px' }} onClick={() => this.handleAddTask(TASK_TYPE_PRODUCER)}>
              <Icon type="plus" /> 新增任务
            </Button>
            <Divider />
            <Row gutter={[16, 16]}>
              {envTasks.producerTasks.map(t => (
                <Col span={6}>
                  {this.renderTaskCard(t)}
                </Col>
              ))}
            </Row>
          </div>
        </Drawer>}

        {this.state.taskFormVisible && <EnvTaskForm
          env={env}
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
export default EnvTask;
