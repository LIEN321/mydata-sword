import React, { PureComponent } from 'react';
import { Form, Input, Card, Button } from 'antd';
import { connect } from 'dva';
import Panel from '../../../components/Panel';
import styles from '../../../layouts/Sword.less';
import { DATA_DETAIL, DATA_SUBMIT } from '../../../actions/data';
import EditableTable from './EditableTable';

const FormItem = Form.Item;

@connect(({ data, loading }) => ({
  data,
  submitting: loading.effects['data/submit'],
}))
@Form.create()
class DataEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { dataFields: [] };
  }

  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch(DATA_DETAIL(id));
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.dataFields && this.state.dataFields.length > 0) {
      return;
    }

    const {
      data: { detail },
    } = nextProps;

    this.setState({
      dataFields: detail.dataFields ? detail.dataFields : [],
    });
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
        params.dataFields = this.state.dataFields;
        dispatch(DATA_SUBMIT(params));
      }
    });
  };

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

  handleDeleteField = key => {
    const dataFields = [...this.state.dataFields];
    this.setState({ dataFields: dataFields.filter(item => item.key !== key) });
  };

  render() {
    const {
      form: { getFieldDecorator },
      data: { detail },
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
      <Panel title="修改" back="/manage/data" action={action}>
        <Form hideRequiredMark style={{ marginTop: 8 }}>
          <Card className={styles.card} bordered={false}>
            <FormItem {...formItemLayout} label="数据编号">
              {/* {getFieldDecorator('dataCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入数据编号',
                  },
                ],
                initialValue: detail.dataCode,
              })(<Input placeholder="请输入数据编号" />)} */}
              {detail.dataCode}
            </FormItem>
            <FormItem {...formItemLayout} label="数据名称">
              {getFieldDecorator('dataName', {
                rules: [
                  {
                    required: true,
                    message: '请输入数据名称',
                  },
                ],
                initialValue: detail.dataName,
              })(<Input placeholder="请输入数据名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="字段管理">
              <EditableTable
                dataFields={this.state.dataFields}
                handleSave={this.handleSaveField}
                handleDelete={this.handleDeleteField}
              />
            </FormItem>
          </Card>
        </Form>
      </Panel>
    );
  }
}

export default DataEdit;
