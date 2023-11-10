import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Form, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { TASK_DETAIL, TASK_SUBSCRIBED, TASK_TYPE_PRODUCER } from '../../../actions/task';
import TaskFieldMappingTable from './TaskFieldMappingTable';
import { dataFields } from '../../../services/data';
import TaskDataFilterTable from './TaskDataFilterTable';
import TaskVarMappingTable from './TaskVarMappingTable';

const FormItem = Form.Item;

@connect(({ task }) => ({
  task,
}))
@Form.create()
class TaskView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initStatus: false,

      apiUrl: '',
      opType: null,

      dataFieldList: [],
      fieldMappings: {},
    };
  }

  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(TASK_DETAIL(id));
  }

  componentWillReceiveProps(nextProps) {
    const {
      task: { detail },
    } = nextProps;

    const { initStatus, apiUrl, opType } = this.state;

    if (!initStatus && detail.id) {
      this.loadDataFieldList(detail.dataId);
      this.setState({
        fieldMappings: detail.fieldMapping,
      });
    }

    if (!apiUrl) {
      this.setState({ apiUrl: detail.apiUrl });
    }
    if (!opType) {
      this.setState({ opType: detail.opType == 1 ? "提供数据" : "消费数据" });
    }

  }

  async loadDataFieldList(dataId) {
    const dataFieldResponse = await dataFields({ dataId: dataId });
    if (dataFieldResponse.success) {
      this.setState({ dataFieldList: dataFieldResponse.data });
    }
  }

  handleEdit = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    router.push(`/manage/task/edit/${id}`);
  };

  render() {
    const {
      task: { detail },
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
      <Button type="primary" onClick={this.handleEdit}>
        修改
      </Button>
    );

    return (
      <Panel title="查看" back="/manage/task" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="任务名称">
              <span>{detail.taskName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="所属环境">
              <span>{detail.envName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="所选API">
              <span>{detail.apiName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="API完整地址">
              [{detail.apiMethod}] {apiUrl}
            </FormItem>
            <FormItem {...formItemLayout} label="任务类型">
              {opType}
            </FormItem>
            <FormItem {...formItemLayout} label="所属数据">
              <span>{detail.dataName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="订阅数据变更">
              <span>{detail.isSubscribed == TASK_SUBSCRIBED ? "订阅" : "不订阅"}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="任务周期">
              <span>{detail.isSubscribed == TASK_SUBSCRIBED ? "订阅数据变化" : detail.taskPeriod}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="字段层级前缀">
              <span>{detail.apiFieldPrefix}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="字段映射">
              <TaskFieldMappingTable
                readonly={true}
                dataFieldList={this.state.dataFieldList}
                initFieldMappings={detail.fieldMapping}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="数据过滤条件">
              <TaskDataFilterTable
                filters={detail.dataFilter}
                readonly={true}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="数据存入变量">
              <TaskVarMappingTable
                varMappings={detail.fieldVarMapping}
                readonly={true}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="最后执行时间">
              <span>{detail.lastRunTime}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="最后成功时间">
              <span>{detail.lastSuccessTime}</span>
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}
export default TaskView;
