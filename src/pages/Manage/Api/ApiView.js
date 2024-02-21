import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Form, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { API_DETAIL } from '../../../actions/api';
import ApiEditableTable from './ApiEditableTable';

const FormItem = Form.Item;

@connect(({ api }) => ({
  api,
}))
@Form.create()
class ApiView extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(API_DETAIL(id));
  }

  handleEdit = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    router.push(`/manage/api/edit/${id}`);
  };

  render() {
    const {
      api: { detail },
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
      <Panel title="查看" back="/manage/api" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="所属应用">
              {detail.appName} ({detail.appCode})
            </FormItem>
            <FormItem {...formItemLayout} label="名称">
              <span>{detail.apiName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="API类型">
              <span>{detail.opType == 1 ? "提供数据" : "消费数据"}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="请求方法">
              <span>{detail.apiMethod}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="路径">
              <span>{detail.apiUri}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="数据类型">
              <span>{detail.dataType}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="JSON字段层级前缀">
              <span>{detail.fieldPrefix}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="Headers">
              <ApiEditableTable
                tableValues={detail.reqHeaders}
                readonly={true}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="Params">
              <ApiEditableTable
                tableValues={detail.reqParams}
                readonly={true}
              />
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}
export default ApiView;
