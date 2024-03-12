import React, { PureComponent } from 'react';
import { Form, Input, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { APP_DETAIL, APP_SUBMIT } from '../../../actions/app';

const FormItem = Form.Item;

@connect(({ app, loading }) => ({
  app,
  submitting: loading.effects['app/submit'],
}))
@Form.create()
class AppEdit extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(APP_DETAIL(id));
  }

  handleSubmit = e => {
    e.preventDefault();
    const {
      dispatch,
      match: {
        params: { id },
      },
      form,
    } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          id,
          ...values,
        };
        dispatch(APP_SUBMIT(params));
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      app: { detail },
      submitting,
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
      <Button type="primary" onClick={this.handleSubmit} loading={submitting}>
        提交
      </Button>
    );

    return (
      <Panel title="修改" back="/manage/app" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="应用编号">
              {getFieldDecorator('appCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入应用编号',
                  },
                ],
                initialValue: detail.appCode,
              })(<Input placeholder="请输入应用编号" maxLength={64} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="应用名称">
              {getFieldDecorator('appName', {
                rules: [
                  {
                    required: true,
                    message: '请输入应用名称',
                  },
                ],
                initialValue: detail.appName,
              })(<Input placeholder="请输入应用名称" maxLength={64} />)}
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default AppEdit;
