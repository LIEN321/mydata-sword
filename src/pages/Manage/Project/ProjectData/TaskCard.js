import { Button, Card, Col, Form, Icon, message, Modal, Popover, Row, Select, Table, Tag } from "antd";
import { PureComponent } from "react";
import mdStyle from '../../../../layouts/Mydata.less';
import styles from './style.less';
import { executeTask, startTask, stopTask, remove, copyTask } from '../../../../services/task';
import { TASK_LOG_LIST, TASK_STATUS_RUNNING, TASK_TYPE_PRODUCER, TASK_TYPE_CONSUMER } from '../../../../actions/task';
import { connect } from "dva";
import FormItem from "antd/lib/form/FormItem";
import form from "@/locales/en-US/form";

@connect(({ task, loading }) => ({
    task,
    loading: loading.models.task,
}))
@Form.create()
class TaskCard extends PureComponent {
    // task, env, handleLoadTasks, handleEditTask, closeTaskForm

    constructor(props) {
        super(props);

        this.state = {
            logModalVisible: false,
            copyModalVisible: false,

            taskId: null,
            envId: null,
        };
    }

    handleStart = taskId => {
        const { dispatch } = this.props;

        Modal.confirm({
            title: '启动确认',
            content: '是否启动所选任务?',
            okText: '确定',
            // okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                const response = await startTask(taskId);
                if (response.success) {
                    message.success(response.msg);
                    this.handleLoadTasks();
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
            onOk: async () => {
                const response = await stopTask(taskId);
                if (response.success) {
                    message.success(response.msg);
                    this.handleLoadTasks();
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
                } else {
                    message.error(response.msg || '任务执行失败！');
                }
            },
            onCancel() { },
        });
    };

    // 显示日志
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
    // 关闭日志
    closeLogList = () => {
        this.setState({ logModalVisible: false, currentTask: {} });
    };

    // 删除任务
    handleDelete = (id) => {
        Modal.confirm({
            title: '删除确认',
            content: '确定删除选中记录?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                const response = await remove({ ids: id });
                if (response.success) {
                    message.success(response.msg);
                    this.handleLoadTasks();
                } else {
                    message.error(response.msg || '删除失败');
                }
            },
            onCancel() { },
        });
    }

    handleLoadTasks = () => {
        const { handleLoadTasks } = this.props;
        handleLoadTasks();
    }

    handleEditTask = () => {
        const { handleEditTask, currentTask } = this.props;
        handleEditTask(currentTask);
    }

    closeTaskForm = () => {
        const { closeTaskForm } = this.props;
        closeTaskForm();
    }

    openCopyModal = (id) => {
        this.setState({ copyModalVisible: true, taskId: id });
    }

    closeCopyModal = () => {
        this.setState({ copyModalVisible: false, taskId: null, envId: null })
    }

    handleSelectEnv = (envId) => {
        this.setState({ envId });
    }

    handleCopyTask = e => {
        e.preventDefault();
        const { form } = this.props;
        const { taskId, envId } = this.state;

        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                copyTask({ taskId: taskId, envId: envId }).then(resp => {
                    if (resp.success) {
                        message.success("复制成功！");
                        form.resetFields();
                        this.closeCopyModal();
                    } else {
                        message.error(resp.msg || '复制失败');
                    }
                });
            }
        });
    }

    render() {
        const code = 'task';

        const {
            form: { getFieldDecorator },
            task: { logs, dataTasks },
            env,
            currentTask,
            envList,
        } = this.props;

        const { copyModalVisible } = this.state;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
                md: { span: 20 },
            },
        };

        const taskStatusStyle = [{}, mdStyle.runningCard, mdStyle.failedCard, mdStyle.stoppedCard];
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

        return <>
            <Card
                key={currentTask.id}
                title={currentTask.taskName}
                // hoverable
                className={[styles.card, taskStatusStyle[currentTask.taskStatus]]}
                actions={[
                    currentTask.taskStatus == TASK_STATUS_RUNNING ?
                        <Popover content="停止"><Icon type="pause" onClick={() => { this.handleStop(currentTask.id) }} /></Popover>
                        : <Popover content="启动"><Icon type="play-circle" onClick={() => { this.handleStart(currentTask.id) }} /></Popover>,
                    <Popover content="执行一次"><Icon type="redo" onClick={() => { this.handleExecute(currentTask.id); }} /></Popover>,
                    <Popover content="运行日志"><Icon type="history" onClick={() => { this.showLogList(currentTask); }} /></Popover>,
                    <Popover content="编辑"><Icon type="edit" onClick={() => { this.handleEditTask(currentTask) }} /></Popover>,
                    <Popover content="删除"><Icon type="delete" onClick={() => { this.handleDelete(currentTask.id) }} /></Popover>,
                    <Popover content="复制"><Icon type="copy" onClick={() => { this.openCopyModal(currentTask.id) }} /></Popover>,
                ]}
                extra={currentTask.refEnvId ? (currentTask.opType == TASK_TYPE_PRODUCER ? <Popover content="其他环境提供数据"><Icon type="login" /></Popover> : <Popover content="其他环境消费数据"><Icon type="logout" /></Popover>) : <></>}
            >
                {currentTask.refEnvId ? <p>其他环境：{currentTask.refEnvName}</p> : <></>}
                <p>{currentTask.apiUrl.replace(env.envPrefix, '')}</p>
                <p>运行周期：{currentTask.taskPeriod}</p>
                <p>最后执行：{currentTask.lastRunTime}</p>
                <p>最后成功：{currentTask.lastSuccessTime}</p>
            </Card>

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

            {copyModalVisible && <Modal
                title="复制任务"
                visible={copyModalVisible}
                footer={[<Button key="submit" type="primary" onClick={this.handleCopyTask}>复制</Button>]}
                onCancel={this.closeCopyModal}
            >
                <Form style={{ marginTop: 8 }}>
                    <FormItem {...formItemLayout} label="复制到：">
                        {getFieldDecorator('envId', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择环境',
                                },
                            ],
                        })
                            (<Select allowClear placeholder="请选择环境" onChange={this.handleSelectEnv}>
                                {envList.map(e =>
                                    // e.id != env.id ?
                                    <Select.Option key={e.id} value={e.id}>
                                        {e.envName} ({e.envPrefix})
                                    </Select.Option>
                                    //  : <></>
                                )}
                            </Select>)
                        }
                    </FormItem>
                </Form>
            </Modal>}
        </>
    }
}

export default TaskCard;