import React, { PureComponent } from 'react';
import { Form, Input, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { PROJECT_SUBMIT } from '../../../actions/project';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

@connect(({ loading }) => ({
  submitting: loading.effects['project/submit'],
}))
@Form.create()
class ProjectAdd extends PureComponent {
  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch(PROJECT_SUBMIT(values));
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
      <Panel title="新增" back="/manage/project" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="编号">
              {getFieldDecorator('projectCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入项目编号',
                  },
                ],
              })(<Input placeholder="请输入项目编号" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="名称">
              {getFieldDecorator('projectName', {
                rules: [
                  {
                    required: true,
                    message: '请输入项目名称',
                  },
                ],
              })(<Input placeholder="请输入项目名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="描述">
              {getFieldDecorator('projectDesc', {
                rules: [
                  {
                    required: false,
                    message: '请输入项目描述',
                  },
                ],
              })(<TextArea placeholder="请输入项目描述" />)}
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default ProjectAdd;
