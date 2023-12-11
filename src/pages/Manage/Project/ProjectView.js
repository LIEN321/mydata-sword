import React, { PureComponent } from 'react';
import router from 'umi/router';
import { Form, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { PROJECT_DETAIL } from '../../../actions/project';

const FormItem = Form.Item;

@connect(({ project }) => ({
  project,
}))
@Form.create()
class ProjectView extends PureComponent {
  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(PROJECT_DETAIL(id));
  }

  handleEdit = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    router.push(`/manage/project/edit/${id}`);
  };

  render() {
    const {
      project: { detail },
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
      <Panel title="查看" back="/manage/project" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="项目名称">
              <span>{detail.projectName}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="项目编号">
              <span>{detail.projectCode}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="项目描述">
              <span>{detail.projectDesc}</span>
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}
export default ProjectView;
