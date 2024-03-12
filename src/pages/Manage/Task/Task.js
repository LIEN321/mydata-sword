import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, Tag, message, Modal, Divider, Table } from 'antd';
import Panel from '../../../components/Panel';
import { TASK_LIST, TASK_LOG_LIST, TASK_STATUS_RUNNING, TASK_STATUS_FAILED, TASK_STATUS_STOPPED } from '../../../actions/task';
import Grid from '../../../components/Sword/Grid';
import { executeTask, startTask, stopTask } from '../../../services/task';

const FormItem = Form.Item;

@connect(({ task, loading }) => ({
  task,
  loading: loading.models.task,
}))
@Form.create()
class Task extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
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

  handleSearchLog = (pagination) => {
    const { dispatch } = this.props;
    const { currentTask } = this.state;
    dispatch(TASK_LOG_LIST({ ...pagination, taskId: currentTask.id }));
  };

  closeLogList = () => {
    this.setState({ logModalVisible: false });
  };

  render() {
    const code = 'task';

    const {
      form,
      loading,
      task: { data, logs },
    } = this.props;

    const columns = [
      {
        title: '所属项目',
        dataIndex: 'projectName',
      },
      {
        title: '环境',
        dataIndex: 'envName',
      },
      {
        title: '数据项',
        dataIndex: 'dataName',
      },
      {
        title: '任务名称',
        dataIndex: 'taskName',
      },
      // {
      //   title: '调用API',
      //   dataIndex: 'apiName',
      // },
      // {
      //   title: '接口完整地址',
      //   dataIndex: 'apiUrl',
      // },
      // {
      //   title: '任务类型',
      //   dataIndex: 'opType',
      //   width: 80,
      //   render: opType => {
      //     return opType == 1 ? "提供数据" : "消费数据";
      //   },
      // },
      // {
      //   title: '接口请求类型',
      //   dataIndex: 'apiMethod',
      // },
      {
        title: '任务周期',
        // dataIndex: 'taskPeriod',
        width: 100,
        render: (text, record) => {
          const taskPeriodText = record.isSubscribed === 1 ? '订阅更新' : record.taskPeriod;
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
        render: (text, record) => {
          const { id, taskStatus } = record;
          let color; let status;
          if (taskStatus === TASK_STATUS_STOPPED) {
            color = 'lightgray';
            status = '已停止';
          } else if (taskStatus === TASK_STATUS_RUNNING) {
            color = 'green';
            status = '运行中';
          } else if (taskStatus === TASK_STATUS_FAILED) {
            color = 'red';
            status = '异　常';
          } else {
            color = '';
            status = '--';
          }
          return <>
            <Tag color={color}>{status}</Tag>
            <Divider type="vertical" />
            {
              taskStatus !== TASK_STATUS_RUNNING ?
                (<a onClick={() => { this.handleStart(id); }}>启动</a>)
                : (<a onClick={() => { this.handleStop(id); }}>停止</a>)
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
          const color = taskResult === 1 ? 'green' : 'red';
          const status = taskResult === 1 ? '成功' : '失败';
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
      //     return (
      //       <div dangerouslySetInnerHTML={{__html: `${taskDetail.replaceAll('\n', '</br>')}`,}}></div>
      //     );
      //   },
      // },
    ];

    return (
      <Panel>
        <Grid
          code={code}
          form={form}
          onSearch={this.handleSearch}
          renderSearchForm={this.renderSearchForm}
          loading={loading}
          data={data}
          columns={columns}
          renderActionButton={this.renderActionButton}
          actionColumnWidth={260}
        />
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
            expandedRowRender={record => <div style={{ 'overflow-wrap': 'anywhere' }} dangerouslySetInnerHTML={{ __html: `${record.taskDetail.replaceAll('\n', '</br>')}`, }} />}
          />}
        </Modal>
      </Panel>
    );
  }
}
export default Task;
