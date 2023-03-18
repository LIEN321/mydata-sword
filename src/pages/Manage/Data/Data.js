import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, Row, Modal, Table } from 'antd';
import Panel from '../../../components/Panel';
import { DATA_LIST, BIZ_FIELD_LIST, BIZ_DATA_LIST } from '../../../actions/data';
import Grid from '../../../components/Sword/Grid';
import { bizFieldList } from '@/services/data';

const FormItem = Form.Item;

@connect(({ data, loading }) => ({
  data,
  loading: loading.models.data,
}))
@Form.create()
class Data extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentData: {},
      bizDataModalVisible: false,
    };
  }
  // ============ 查询 ===============
  handleSearch = params => {
    const { dispatch } = this.props;
    dispatch(DATA_LIST(params));
  };

  // ============ 查询表单 ===============
  renderSearchForm = onReset => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="编号">
            {getFieldDecorator('dataCode')(<Input placeholder="编号" />)}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
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
    const { dispatch } = this.props;
    const { id } = params;
    dispatch(BIZ_FIELD_LIST({ dataId: id }));
    dispatch(BIZ_DATA_LIST({ dataId: id }));
    this.setState({ bizDataModalVisible: true, currentData: params });
  };
  handleSearchBizData = (pagination, filters, sorter) => {
    const { dispatch } = this.props;
    const { currentData } = this.state;
    dispatch(BIZ_DATA_LIST({ ...pagination, dataId: currentData.id }));
  };
  closeBizData = () => {
    this.setState({ bizDataModalVisible: false, currentData: {} });
  };

  render() {
    const code = 'data';

    const {
      form,
      loading,
      data: { data, bizField, bizData },
    } = this.props;

    const { currentData } = this.state;

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
        render: (text, record, index) => {
          const { id } = record;
          return <a onClick={() => { this.showBizData(record) }}>{text}</a>
        },
      },
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

    return (
      <Panel>
        <Grid
          code={code}
          form={form}
          onSearch={this.handleSearch}
          renderSearchForm={this.renderSearchForm}
          columns={columns}
          data={data}
        />
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
      </Panel>
    );
  }
}
export default Data;
