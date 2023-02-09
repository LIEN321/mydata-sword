import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Form, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { APP_DETAIL } from '../../../actions/app';

const FormItem = Form.Item;

@connect(({ app }) => ({
  app,
}))
@Form.create()
class AppView extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(APP_DETAIL(id));
  }

  handleEdit = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    router.push(`/manage/app/edit/${id}`);
  };

  render() {
    const {
      app: { detail },
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
      <Panel title="查看" back="/manage/app" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="应用编号">
              <span>{detail.appCode}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="应用名称">
              <span>{detail.appName}</span>
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}
export default AppView;
