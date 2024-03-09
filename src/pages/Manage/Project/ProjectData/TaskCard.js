import { Button, Card, Icon, message, Modal, Table, Tag } from "antd";
import { PureComponent } from "react";
import mdStyle from '../../../../layouts/Mydata.less';
import styles from './style.less';
import { executeTask, startTask, stopTask, remove } from '../../../../services/task';
import { TASK_LOG_LIST, TASK_STATUS_RUNNING } from '../../../../actions/task';
import { connect } from "dva";

@connect(({ task, loading }) => ({
    task,
    loading: loading.models.task,
}))
class TaskCard extends PureComponent {
    // task, env, handleLoadTasks, handleEditTask, closeTaskForm

    constructor(props) {
        super(props);

        this.state = {
            logModalVisible: false,
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

    render() {
        const code = 'task';

        const {
            task: { logs, dataTasks },
            env,
            currentTask,
        } = this.props;

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
                    currentTask.taskStatus == TASK_STATUS_RUNNING ? <Icon type="pause" onClick={() => { this.handleStop(currentTask.id) }} /> : <Icon type="play-circle" onClick={() => { this.handleStart(currentTask.id) }} />,
                    <Icon type="redo" onClick={() => { this.handleExecute(currentTask.id); }} />,
                    <Icon type="history" onClick={() => { this.showLogList(currentTask); }} />,
                    <Icon type="edit" onClick={() => { this.handleEditTask(currentTask) }} />,
                    <Icon type="delete" onClick={() => { this.handleDelete(currentTask.id) }} />,
                ]}
            >
                {/* <Card.Meta title={<a>{task.taskName}</a>} /> */}
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
        </>
    }
}

export default TaskCard;