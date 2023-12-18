import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, Tag, message, Modal, Divider, Table, Card, List, Icon } from 'antd';
import Panel from '../../../../components/Panel';
import { TASK_LIST, TASK_LOG_LIST } from '../../../../actions/task';
import Grid from '../../../../components/Sword/Grid';
import { executeTask, startTask, stopTask } from '../../../../services/task';
import styles from './style.less';
import mdStyle from '../../../../layouts/mydata.less'
import DataTaskAdd from './DataTaskAdd';

const FormItem = Form.Item;

@connect(({ task, loading }) => ({
  task,
  loading: loading.models.task,
}))
@Form.create()
class DataTask extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      taskFormVisible: false,
      logModalVisible: false,
    };
  }

  // ============ 启停任务 ===============
  handleStart = taskId => {
    const { dispatch } = this.props;

    Modal.confirm({
      title: '启动确认',
      content: '是否启动所选任务?',
      okText: '确定',
      // okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const response = await startTask(taskId);
        if (response.success) {
          message.success(response.msg);
          dispatch(TASK_LIST());
        } else {
          message.error(response.msg || '启动失败');
        }
      },
      onCancel() { },
    });
  };

  handleStop = taskId => {
    const { dispatch } = this.props;

    Modal.confirm({
      title: '停止确认',
      content: '是否停止所选任务?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const response = await stopTask(taskId);
        if (response.success) {
          message.success(response.msg);
          dispatch(TASK_LIST());
        } else {
          message.error(response.msg || '任务停止失败！');
        }
      },
      onCancel() { },
    });
  };

  handleExecute = taskId => {
    const { dispatch } = this.props;

    Modal.confirm({
      title: '执行确认',
      content: '是否执行一次所选任务?',
      okText: '确定',
      // okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const response = await executeTask(taskId);
        if (response.success) {
          message.success('任务已触发执行，请在日志中查看结果！');
          // dispatch(TASK_LIST());
        } else {
          message.error(response.msg || '任务执行失败！');
        }
      },
      onCancel() { },
    });
  };

  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    dispatch(TASK_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="查询名称">
            {getFieldDecorator('taskName')(<Input placeholder="查询名称" />)}
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

  renderActionButton = (keys, rows) => (
    <Fragment key="copy">
      <Divider type="vertical" />
      <a onClick={() => { this.handleExecute(rows[0].id); }}>运行一次</a>
      <Divider type="vertical" />
      <a onClick={() => { this.showLogList(rows[0]); }}>日志</a>
    </Fragment>
  );

  showLogList = params => {
    const { dispatch } = this.props;
    const { id } = params;
    dispatch(TASK_LOG_LIST({ taskId: id }));
    this.setState({ logModalVisible: true, currentTask: params });
  };
  handleSearchLog = (pagination, filters, sorter) => {
    const { dispatch } = this.props;
    const { currentTask } = this.state;
    dispatch(TASK_LOG_LIST({ ...pagination, taskId: currentTask.id }));
  };

  closeLogList = () => {
    this.setState({ logModalVisible: false });
  };

  handleAddTask = (opType) => {
    this.setState({ opType: opType, taskFormVisible: true });
  };
  closeTaskForm = () => {
    this.setState({ opType: null, taskFormVisible: false });
  }

  render() {
    const code = 'task';

    const {
      form,
      loading,
      task: { logs },
      env,
      data,
      projectId,
    } = this.props;

    const columns = [
      {
        title: '任务名称',
        dataIndex: 'taskName',
      },
      {
        title: '环境',
        dataIndex: 'envName',
      },
      {
        title: '调用API',
        dataIndex: 'apiName',
      },
      // {
      //   title: '接口完整地址',
      //   dataIndex: 'apiUrl',
      // },
      {
        title: '任务类型',
        dataIndex: 'opType',
        width: 120,
        render: opType => {
          return opType == 1 ? "提供数据" : "消费数据";
        },
      },
      // {
      //   title: '接口请求类型',
      //   dataIndex: 'apiMethod',
      // },
      {
        title: '数据项',
        dataIndex: 'dataName',
      },
      {
        title: '任务周期',
        // dataIndex: 'taskPeriod',
        width: 120,
        render: (text, record, index) => {
          let taskPeriodText = record.isSubscribed == 1 ? '订阅更新' : record.taskPeriod;
          return taskPeriodText;
        },
      },
      {
        title: '最后执行时间',
        dataIndex: 'lastRunTime',
        width: 150,
      },
      {
        title: '最后成功时间',
        dataIndex: 'lastSuccessTime',
        width: 150,
      },
      // {
      //   title: '字段映射',
      //   dataIndex: 'fieldMapping',
      // },
      {
        title: '状态',
        dataIndex: 'taskStatus',
        width: 130,
        render: (text, record, index) => {
          const { id, taskStatus } = record;
          let color, status;
          if (taskStatus == 0) {
            color = 'lightgray';
            status = '已停止';
          } else if (taskStatus == 1) {
            color = 'green';
            status = '运行中';
          } else if (taskStatus == 2) {
            color = 'red';
            status = '异　常';
          } else {
            color = 'black';
            status = '--';
          }
          return <>
            <Tag color={color}>{status}</Tag>
            <Divider type="vertical" />
            {
              taskStatus != 1 ?
                (<a onClick={() => { this.handleStart(id); }}>启动</a>)
                :
                (<a onClick={() => { this.handleStop(id); }}>停止</a>)
            }
          </>
        },
      },
    ];

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
      // {
      //   title: '详情',
      //   dataIndex: 'taskDetail',
      //   render: taskDetail => {
      //   return (
      //     <div dangerouslySetInnerHTML={{__html: `${taskDetail.replaceAll('\n', '</br>')}`,}}></div>
      //   );
      //   },
      // },
    ];

    return (
      <>
        <Row>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Card title="提供数据" className={styles.card} >
              <div style={{ textAlign: 'left' }}>
                <Card
                  hoverable
                  className={[styles.card, mdStyle.runningCard]}
                  actions={[
                    <Icon type="pause" />,
                    <Icon type="redo" />,
                    <Icon type="history" />,
                    <Icon type="delete" />,
                  ]}
                >
                  <Card.Meta title={<a>{'人事系统'}</a>} />
                  <p>{'http://192.168.2.80:8901/mydata-test/test/hr_user'.replace(env.envPrefix, '')}</p>
                  <p>运行周期：0 0/30 * * * ?</p>
                  <p>最后执行：2023-12-16 18:00:00	</p>
                  <p>最后成功：2023-12-16 18:00:00</p>
                </Card>
                <Divider />
                <Card
                  hoverable
                  className={[styles.card, mdStyle.failedCard]}
                  actions={[
                    <Icon type="play-circle" />,
                    <Icon type="redo" />,
                    <Icon type="history" />,
                    <Icon type="delete" />,
                  ]}
                >
                  <Card.Meta title={<a>{'人事系统'}</a>} />
                  <p>{'http://192.168.2.80:8901/mydata-test/test/save_oa_user'.replace(env.envPrefix, '')}</p>
                  <p>运行周期：0 0/30 * * * ?</p>
                  <p>最后执行：2023-12-16 18:00:00	</p>
                  <p>最后成功：2023-12-16 18:00:00</p>
                </Card>
                <Divider />
                <Card
                  hoverable
                  className={[styles.card, mdStyle.stoppedCard]}
                  actions={[
                    <Icon type="play-circle" />,
                    <Icon type="redo" />,
                    <Icon type="history" />,
                    <Icon type="delete" />,
                  ]}
                >
                  <Card.Meta title={<a>{'人事系统'}</a>} />
                  <p>{'http://192.168.2.80:8901/mydata-test/test/save_cms_user'.replace(env.envPrefix, '')}</p>
                  <p>运行周期：0 0/30 * * * ?</p>
                  <p>最后执行：2023-12-16 18:00:00	</p>
                  <p>最后成功：2023-12-16 18:00:00</p>
                </Card>
                <Divider />
                <Button type='dashed' style={{ width: '100%', height: '50px' }} onClick={() => this.handleAddTask(1)}>
                  <Icon type="plus" /> 新增任务
                </Button>
              </div>
            </Card>
          </Col>
          <Col span={1} style={{ textAlign: 'center' }}>
            {/* <Divider type='vertical' /> */}
          </Col>
          <Col span={17} style={{ textAlign: 'center' }}>
            <Card title="消费数据">

              <div style={{ textAlign: 'left' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card
                      hoverable
                      className={[styles.card, mdStyle.runningCard]}
                      actions={[
                        <Icon type="pause" />,
                        <Icon type="redo" />,
                        <Icon type="history" />,
                        <Icon type="delete" />,
                      ]}
                    >
                      <Card.Meta title={<a>{'人事系统'}</a>} />
                      <p>{'http://192.168.2.80:8901/mydata-test/test/save_cms_user'.replace(env.envPrefix, '')}</p>
                      <p>运行周期：0 0/30 * * * ?</p>
                      <p>最后执行：2023-12-16 18:00:00	</p>
                      <p>最后成功：2023-12-16 18:00:00</p>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      hoverable
                      className={[styles.card, mdStyle.failedCard]}
                      actions={[
                        <Icon type="play-circle" />,
                        <Icon type="redo" />,
                        <Icon type="history" />,
                        <Icon type="delete" />,
                      ]}
                    >
                      <Card.Meta title={<a>{'人事系统'}</a>} />
                      <p></p>
                      <p>运行周期：0 0/30 * * * ?</p>
                      <p>最后执行：2023-12-16 18:00:00	</p>
                      <p>最后成功：2023-12-16 18:00:00</p>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      hoverable
                      className={[styles.card, mdStyle.stoppedCard]}
                      actions={[
                        <Icon type="play-circle" />,
                        <Icon type="redo" />,
                        <Icon type="history" />,
                        <Icon type="delete" />,
                      ]}
                    >
                      <Card.Meta title={<a>{'人事系统'}</a>} />
                      <p></p>
                      <p>运行周期：0 0/30 * * * ?</p>
                      <p>最后执行：2023-12-16 18:00:00	</p>
                      <p>最后成功：2023-12-16 18:00:00</p>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                  <Col span={8}>
                    <Card
                      hoverable
                      className={[styles.card, mdStyle.runningCard]}
                      actions={[
                        <Icon type="pause" />,
                        <Icon type="redo" />,
                        <Icon type="history" />,
                        <Icon type="delete" />,
                      ]}
                    >
                      <Card.Meta title={<a>{'人事系统'}</a>} />
                      <p></p>
                      <p>运行周期：0 0/30 * * * ?</p>
                      <p>最后执行：2023-12-16 18:00:00	</p>
                      <p>最后成功：2023-12-16 18:00:00</p>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      hoverable
                      className={[styles.card, mdStyle.failedCard]}
                      actions={[
                        <Icon type="play-circle" />,
                        <Icon type="redo" />,
                        <Icon type="history" />,
                        <Icon type="delete" />,
                      ]}
                    >
                      <Card.Meta title={<a>{'人事系统'}</a>} />
                      <p></p>
                      <p>运行周期：0 0/30 * * * ?</p>
                      <p>最后执行：2023-12-16 18:00:00	</p>
                      <p>最后成功：2023-12-16 18:00:00</p>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card
                      hoverable
                      className={[styles.card, mdStyle.stoppedCard]}
                      actions={[
                        <Icon type="play-circle" />,
                        <Icon type="redo" />,
                        <Icon type="history" />,
                        <Icon type="delete" />,
                      ]}
                    >
                      <Card.Meta title={<a>{'人事系统'}</a>} />
                      <p></p>
                      <p>运行周期：0 0/30 * * * ?</p>
                      <p>最后执行：2023-12-16 18:00:00	</p>
                      <p>最后成功：2023-12-16 18:00:00</p>
                    </Card>
                  </Col>
                </Row>
                <Divider />
                <Button type='dashed' style={{ width: '100%', height: '50px' }} onClick={() => this.handleAddTask(2)}>
                  <Icon type="plus" /> 新增任务
                </Button>
              </div>

            </Card>
          </Col>
        </Row>

        {this.state.taskFormVisible && <DataTaskAdd
          env={env}
          data={data}
          projectId={projectId}
          opType={this.state.opType}
          taskFormVisible={this.state.taskFormVisible}
          closeTaskForm={this.closeTaskForm}
        />}

        <Modal
          title="查看日志"
          width="60%"
          visible={this.state.logModalVisible}
          footer={[
            <Button key="back" onClick={this.closeLogList}>
              关闭
            </Button>,
          ]}
          onCancel={this.closeLogList}
        >
          {this.state.logModalVisible && <Table
            columns={logColumns}
            dataSource={logs.list}
            pagination={logs.pagination}
            onChange={this.handleSearchLog}
            expandedRowRender={record => <div style={{ 'overflow-wrap': 'anywhere' }} dangerouslySetInnerHTML={{ __html: `${record.taskDetail.replaceAll('\n', '</br>')}`, }}></div>}
          />}
        </Modal>
      </>
    );
  }
}
export default DataTask;
