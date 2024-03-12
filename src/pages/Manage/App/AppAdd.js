import React, { PureComponent } from 'react';
import { Form, Input, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { APP_SUBMIT } from '../../../actions/app';

const FormItem = Form.Item;

@connect(({ loading }) => ({
  submitting: loading.effects['app/submit'],
}))
@Form.create()
class AppAdd extends PureComponent {
  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          // id,
          ...values,
        };
        dispatch(APP_SUBMIT(params));
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
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
      <Panel title="新增" back="/manage/app" action={action}>
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
              })(<Input placeholder="请输入应用名称" maxLength={64} />)}
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default AppAdd;
