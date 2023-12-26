import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, Modal, Table, Card, message, Divider, Icon, Select, Drawer } from 'antd';
import Panel from '../../../../components/Panel';
import { BIZ_FIELD_LIST, BIZ_DATA_LIST, PROJECT_DATA_LIST, DATA_INIT } from '../../../../actions/data';
import Grid from '../../../../components/Sword/Grid';
import { bizFieldList, detail as dataDetail, submit as submitData, remove as removeData } from '../../../../services/data';
import styles from '../../../../layouts/Sword.less';
import EditableTable from '../../Data/EditableTable';
import func from '@/utils/Func';
import mdStyle from '../../../../layouts/mydata.less'
import DataTask from './DataTask';
import { router } from 'umi';

const FormItem = Form.Item;

@connect(({ data, loading }) => ({
  data,
  loading: loading.models.data,
}))
@Form.create()
class ProjectData extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentData: {},
      bizDataModalVisible: false,

      // 运行环境列表
      // envList: {},
      //当前所选环境id
      // currentEnvId: null,
      currentEnv: null,

      // 数据项表单可见性
      dataFormVisible: false,
      // 数据项记录
      detail: {},
      // 数据项字段
      dataFields: [],
      // 查询参数
      params: {},

      // 数据同步任务可见性
      dataTaskVisible: false,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(DATA_INIT());
  }

  // ============ 查询 ===============
  handleSearch = params => {
    const {
      dispatch,
      projectId,
    } = this.props;
    // 所属项目id
    params.projectId = projectId;
    if (params.envId == null && this.state.currentEnv) {
      params.envId = this.state.currentEnv.id;
    }
    this.setState({ params });
    dispatch(PROJECT_DATA_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const {
      form,
      data: { init: { envList } },
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={12} sm={24}>
          <span style={{ fontWeight: 'bold' }}>选择环境查看集成情况：</span>
          <Select allowClear placeholder="请选择所属环境" onChange={this.handleChangeEnv} style={{ width: 200 }}>
            {envList.map(e => (
              <Select.Option key={e.id} value={e.id}>
                {e.envName}
              </Select.Option>
            ))}
          </Select>
          <Divider type='vertical' />
          <Button icon="plus" type="primary" onClick={() => this.handleAddEnv()}>
            环境
          </Button>
        </Col>
        <Col md={4} sm={24}>
          <FormItem label="编号">
            {getFieldDecorator('dataCode')(<Input placeholder="编号" />)}
          </FormItem>
        </Col>
        <Col md={4} sm={24}>
          <FormItem label="名称">
            {getFieldDecorator('dataName')(<Input placeholder="名称" />)}
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

  showBizData = params => {
    const { dispatch, projectId } = this.props;
    const { id } = params;
    const envId = this.state.currentEnv.id;
    dispatch(BIZ_FIELD_LIST({ dataId: id }));
    dispatch(BIZ_DATA_LIST({ dataId: id, projectId, envId }));
    this.setState({ bizDataModalVisible: true, currentData: params });
  };
  handleSearchBizData = (pagination, filters, sorter) => {
    const { dispatch, projectId } = this.props;
    const { currentData } = this.state;
    const envId = this.state.currentEnv.id;
    dispatch(BIZ_DATA_LIST({ ...pagination, dataId: currentData.id, projectId, envId }));
  };
  closeBizData = () => {
    this.setState({ bizDataModalVisible: false, currentData: {} });
  };

  // 新增、编辑、删除
  handleClick = (code, record) => {
    if (code === 'data_add') {
      this.setState({
        dataFormVisible: true,
      });
    } else if (code === 'data_edit') {
      const { id } = record;
      dataDetail({ id }).then(resp => {
        if (resp.success) {
          this.setState({ dataFormVisible: true, viewMode: false, detail: resp.data, dataFields: resp.data.dataFields });
        }
      });
    } else if (code === 'data_view') {
      const { id } = record;
      envVarDetail({ id }).then(resp => {
        if (resp.success) {
          this.setState({ stateVisible: true, viewMode: true, detail: resp.data });
        }
      });
    } else if (code === 'data_delete') {
      const { id, envId, varName } = record;
      const { params } = this.state;
      const refresh = this.handleSearch;
      Modal.confirm({
        title: '删除确认',
        content: '确定删除该条记录?',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          removeData({ ids: id, envId: envId, varName: varName }).then(resp => {
            if (resp.success) {
              message.success(resp.msg);
              refresh(params);
            } else {
              message.error(resp.msg || '删除失败');
            }
          });
        },
        onCancel() { },
      });
    }
  };

  // 提交数据项
  handleSubmitData = e => {
    e.preventDefault();
    const { dataFields, params, detail: { id } } = this.state;
    const { dispatch, form, projectId } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let formData = Object.assign(values, { projectId }, { dataFields });
        if (!func.isEmpty(id)) {
          formData.id = id;
        }
        submitData(formData).then(resp => {
          if (resp.success) {
            message.success(resp.msg);
          } else {
            message.error(resp.msg || '提交失败');
          }
          this.handleSearch(params);
          this.handleCloseDataForm();
          form.resetFields();
        });
      }
    });
  };

  // 关闭数据项表单
  handleCloseDataForm = () => {
    this.setState({
      dataFormVisible: false,
      detail: { id: '' },
      dataFields: [],
    });
  };
  // ------------------------------------------------------------

  // 更新字段
  handleSaveField = field => {
    const newData = [...this.state.dataFields];
    const index = newData.findIndex(item => field.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...field,
      });
      this.setState({ dataFields: newData });
    } else {
      newData.push(field);
      this.setState({ dataFields: newData });
    }
  };

  // 删除字段
  handleDeleteField = key => {
    const dataFields = [...this.state.dataFields];
    this.setState({ dataFields: dataFields.filter(item => item.key !== key) });
  };
  // ------------------------------------------------------------

  handleAddEnv = () => {
    const { projectId } = this.props;
    router.push({
      pathname: '/manage/env/add',
      query: { projectId }
    });
  }

  // 切换环境
  handleChangeEnv = envId => {
    const env = this.findEnv(envId);
    this.setState({ currentEnv: env });

    const { params } = this.state;
    params.envId = envId;
    this.handleSearch(params);
  }

  findEnv(envId) {
    const {
      data: {
        init: { envList },
      },
    } = this.props;
    const newEnvList = [...envList];
    const index = newEnvList.findIndex(env => env.id === envId);
    const env = newEnvList[index];
    return env;
  }
  // ------------------------------------------------------------

  // 打开任务管理
  handleManageTask = (data) => {
    const { currentEnv } = this.state;
    if (func.isEmpty(currentEnv)) {
      message.warn('请先选择环境！');
      return;
    }
    this.setState({ currentData: data });
    this.setState({ dataTaskVisible: true });
  }

  // 关闭任务管理
  handleCloseTask = () => {
    this.setState({ dataTaskVisible: false });
    const { params } = this.state;
    this.handleSearch(params);
  }

  // ------------------------------------------------------------
  renderLeftButton = () => {
    // const {
    //   data: {
    //     init: { envList },
    //   },
    // } = this.props;
    // return (
    //   <Fragment>
    //     <span style={{ fontWeight: 'bold' }}>选择环境查看集成情况：</span>
    //     <Select allowClear placeholder="请选择所属环境" onChange={this.handleChangeEnv} style={{ width: 200 }}>
    //       {envList.map(e => (
    //         <Select.Option key={e.id} value={e.id}>
    //           {e.envName}
    //         </Select.Option>
    //       ))}
    //     </Select>
    //     <Divider type='vertical' />
    return <Button icon="plus" type="primary" onClick={() => this.handleClick('data_add')}>
      新增数据项
    </Button>
    //   </Fragment>
    // );
  }

  renderRightButton = () => { };

  handleExternalLoadTasks = () => {
    this.handleRefresh();
  }

  render() {
    const code = 'data';

    const {
      form,
      loading,
      data: { data, bizField, bizData,
        init: { envList },
      },
    } = this.props;
    const { getFieldDecorator } = form;

    const { currentData, detail, dataFields, currentEnv, dataTaskVisible } = this.state;
    const { projectId, projectName } = this.props;

    const columns = [
      {
        title: '数据编号',
        dataIndex: 'dataCode',
      },
      {
        title: '数据名称',
        dataIndex: 'dataName',
      },
      {
        title: '数据量',
        dataIndex: 'dataCount',
        width: 100,
        render: (text, record, index) => {
          const { id, dataCount } = record;
          return <>{dataCount ? <a onClick={() => { this.showBizData(record) }}>{text}</a> : '-'}</>
          // 
        },
      },
      {
        title: '来源应用',
        dataIndex: 'provideAppCount',
        width: 100,
        render: (text, record, index) => {
          const { provideAppCount } = record;
          return <>{provideAppCount ? provideAppCount : '-'}</>
        }
      },
      {
        title: '消费应用',
        dataIndex: 'consumeAppCount',
        width: 100,
        render: (text, record, index) => {
          const { consumeAppCount } = record;
          return <>{consumeAppCount ? consumeAppCount : '-'}</>
        }
      },
      {
        title: '同步任务',
        width: 150,
        render: (text, record, index) => {
          const { runningTaskCount, stoppedTaskCount, failedTaskCount } = record;
          return <div style={{ textAlign: 'center' }}>
            <Icon type="play-circle" className={mdStyle.taskRunning} /> {runningTaskCount ? runningTaskCount : '-'}
            <Divider type='vertical' />
            <Icon type="close-circle" className={mdStyle.taskFailed} /> {failedTaskCount ? failedTaskCount : '-'}
            <Divider type='vertical' />
            <Icon type="stop" className={mdStyle.taskStopped} /> {stoppedTaskCount ? stoppedTaskCount : '-'}
          </div>
        },
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '200px',
        render: (text, record) => (
          <Fragment>
            <div style={{ textAlign: 'center' }}>
              <Fragment key="tasks">
                <a title="任务管理" onClick={() => this.handleManageTask(record)}>
                  任务管理
                </a>
              </Fragment>
              <Divider type="vertical" />
              <Fragment key="edit">
                <a title="修改" onClick={() => this.handleClick('data_edit', record)}>
                  修改
                </a>
              </Fragment>
              <Divider type="vertical" />
              <Fragment key="delete">
                <a title="删除" onClick={() => this.handleClick('data_delete', record)}>
                  删除
                </a>
              </Fragment>
            </div>
          </Fragment>
        ),
      }
    ];

    let bizDataColumns = [];
    if (bizField) {
      for (let i = 0; i < bizField.length; i++) {
        let field = bizField[i];
        bizDataColumns.push({
          title: field.fieldName,
          dataIndex: field.fieldCode,
        });
      }
    }
    bizDataColumns.push({
      title: "最后更新时间",
      dataIndex: "_MD_UPDATE_TIME_"
    });

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 20 },
      },
    };

    return (
      <div>
        {/* <Card bordered={false}>
          <span style={{ fontWeight: 'bold' }}>选择环境查看集成情况：</span>
          <Select allowClear placeholder="请选择所属环境" onChange={this.handleChangeEnv} style={{ width: 200 }}>
            {envList.map(e => (
              <Select.Option key={e.id} value={e.id}>
                {e.envName}
              </Select.Option>
            ))}
          </Select> */}
        {/* <Divider type='vertical' />
          <Button icon="plus" type="primary" onClick={() => this.handleClick('data_add')}>
            新增数据项
          </Button> */}
        {/* </Card> */}
        <Grid
          // code={code}
          form={form}
          onSearch={this.handleSearch}
          renderSearchForm={this.renderSearchForm}
          renderLeftButton={this.renderLeftButton}
          renderRightButton={this.renderRightButton}
          loading={loading}
          data={data}
          columns={columns}
        />
        {/* 数据项表单 弹出框 */}
        <Modal
          title="数据项"
          width={1000}
          visible={this.state.dataFormVisible}
          onOk={this.handleSubmitData}
          onCancel={this.handleCloseDataForm}
        >
          <Form hideRequiredMark style={{ marginTop: 8 }}>
            <Card className={styles.card} bordered={false}>
              <FormItem {...formItemLayout} label="数据编号">
                {getFieldDecorator('dataCode', {
                  rules: [
                    {
                      required: true,
                      message: '请输入数据编号',
                    },
                  ],
                  initialValue: detail.dataCode || '',
                })(<Input placeholder="请输入数据编号，长度不超过64位" maxLength={64} readOnly={detail.id != null} />)}
              </FormItem>
              <FormItem {...formItemLayout} label="数据名称">
                {getFieldDecorator('dataName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入数据名称',
                    },
                  ],
                  initialValue: detail.dataName || '',
                })(<Input placeholder="请输入数据名称，长度不超过64位" maxLength={64} />)}
              </FormItem>
              <FormItem {...formItemLayout} label="字段">
                <EditableTable
                  dataFields={dataFields ? dataFields : []}
                  handleSave={this.handleSaveField}
                  handleDelete={this.handleDeleteField}
                />
              </FormItem>
            </Card>
          </Form>
        </Modal>

        {/* 业务数据 弹出框 */}
        <Modal
          title={`业务数据 - ${currentData.dataName}`}
          width="90%"
          visible={this.state.bizDataModalVisible}
          footer={[
            <Button key="back" onClick={this.closeBizData}>
              关闭
            </Button>
          ]}
          onCancel={this.closeBizData}
        >
          <Table
            columns={bizDataColumns}
            dataSource={bizData.list}
            pagination={bizData.pagination}
            onChange={this.handleSearchBizData}
          />
        </Modal>

        {/* 数据项的同步任务 */}
        {currentEnv && dataTaskVisible && <DataTask
          dataTaskVisible={this.state.dataTaskVisible}
          handleCloseTask={this.handleCloseTask}
          env={currentEnv}
          data={currentData}
          projectId={projectId}
          handleRefresh={handleRefresh => (this.handleRefresh = handleRefresh)}
        />
        }
      </div>
    );
  }
}
export default ProjectData;
