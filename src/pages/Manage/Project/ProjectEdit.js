import React, { PureComponent } from 'react';
import { Form, Input, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { PROJECT_DETAIL, PROJECT_SUBMIT } from '../../../actions/project';

const FormItem = Form.Item;
const {TextArea} = Input;

@connect(({ project, loading }) => ({
  project,
  submitting: loading.effects['project/submit'],
}))
@Form.create()
class ProjectEdit extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(PROJECT_DETAIL(id));
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
        dispatch(PROJECT_SUBMIT(params));
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      project: { detail },
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
      <Panel title="修改" back="/manage/project" action={action}>
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
                initialValue: detail.projectCode,
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
                initialValue: detail.projectName,
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
                initialValue: detail.projectDesc,
              })(<TextArea placeholder="请输入项目描述" />)}
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default ProjectEdit;
