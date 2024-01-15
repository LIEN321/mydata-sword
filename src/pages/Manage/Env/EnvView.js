import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Form, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { ENV_DETAIL } from '../../../actions/env';
import EnvEditableTable from './EnvEditableTable';

const FormItem = Form.Item;

@connect(({ env }) => ({
  env,
}))
@Form.create()
class EnvView extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(ENV_DETAIL(id));
  }

  handleEdit = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    router.push(`/manage/env/edit/${id}`);
  };

  render() {
    const {
      env: { detail },
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
      <Panel title="查看" back="/manage/env" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="所属项目">
              <span>{detail.projectName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="环境名称">
              <span>{detail.envName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="前置路径">
              <span>{detail.envPrefix}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="顺序">
              <span>{detail.sort}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="全局Headers">
              <EnvEditableTable
                tableValues={detail.globalHeaders}
                readonly={true}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="全局Params">
              <EnvEditableTable
                tableValues={detail.globalParams}
                readonly={true}
              />
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}
export default EnvView;
