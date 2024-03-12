import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Form, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { DATA_DETAIL } from '../../../actions/data';
import EditableTable from './EditableTable';

const FormItem = Form.Item;

@connect(({ data }) => ({
  data,
}))
@Form.create()
class DataView extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(DATA_DETAIL(id));
  }

  handleEdit = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    router.push(`/manage/data/edit/${id}`);
  };

  render() {
    const {
      data: { detail },
    } = this.props;

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
      <Panel title="查看" back="/manage/data" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="数据编号">
              <span>{detail.dataCode}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="数据名称">
              <span>{detail.dataName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="数据量">
              <span>{detail.dataCount}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="字段列表">
              <EditableTable
                dataFields={detail.dataFields}
                readonly
              />
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}
export default DataView;
