import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, Divider, Drawer } from 'antd';
import Panel from '../../../components/Panel';
import { PROJECT_LIST } from '../../../actions/project';
import Grid from '../../../components/Sword/Grid';
import ProjectData from './ProjectData/ProjectData';

const FormItem = Form.Item;

@connect(({ project, loading }) => ({
  project,
  loading: loading.models.project,
}))
@Form.create()
class Project extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataManageVisible: false,
    };
  }

  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    dispatch(PROJECT_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="查询名称">
            {getFieldDecorator('projectName')(<Input placeholder="查询名称" />)}
          </FormItem>
        </Col>
        <Col>
          <div style={{ float: 'right' }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={onReset}>
              重置
            </Button>
          </div>
        </Col>
      </Row>
    );
  };

  handleManageData = (project) => {
    // router.push(`/manage/project/data/${project.id}`, { projectName: project.projectName });
    this.setState({ projectId: project.id, projectName: project.projectName });
    this.setState({ dataManageVisible: true });
  }

  closeManageData = () => {
    this.setState({ dataManageVisible: false });
  }

  // 操作列 扩展功能
  renderActionButton = (keys, rows) => (
    <Fragment key="copy">
      <Divider type="vertical" />
      <a onClick={() => { this.handleManageData(rows[0]); }}>集成管理</a>
      {/* <Divider type="vertical" />
      <a onClick={() => { this.showLogList(rows[0]); }}>日志</a> */}
    </Fragment>
  );

  render() {
    const code = 'project';

    const {
      form,
      loading,
      project: { data },
    } = this.props;

    const columns = [
      {
        title: '项目编号',
        dataIndex: 'projectCode',
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
      },
      {
        title: '项目描述',
        dataIndex: 'projectDesc',
      },
      {
        title: '创建人',
        dataIndex: 'createUser',
      },
    ];

    return (
      <Panel>
        <Grid
          code={code}
          form={form}
          onSearch={this.handleSearch}
          renderSearchForm={this.renderSearchForm}
          loading={loading}
          data={data}
          columns={columns}
          renderActionButton={this.renderActionButton}
          actionColumnWidth={250}
        />
        {this.state.dataManageVisible && <Drawer
          title={`集成管理 - ${this.state.projectName}`}
          width="80%"
          visible={this.state.dataManageVisible}
          onClose={this.closeManageData}
        >
          <ProjectData
            projectId={this.state.projectId}
            projectName={this.state.projectName}
          />
        </Drawer>}
      </Panel>
    );
  }
}
export default Project;
