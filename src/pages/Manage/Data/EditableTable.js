import { Form, Input, Button, Table, Switch, Popconfirm, InputNumber } from 'antd';
import React from 'react';
import style from './StandardData.less';

const EditableContext = React.createContext();
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  //   state = {
  //     editing: false,
  //   };

  constructor(props) {
    super(props);
    this.state = { editing: props.editable };
  }

  toggleEdit = () => {
    // const editing = !this.state.editing;
    // this.setState({ editing }, () => {
    //   if (editing) {
    //     this.input.focus();
    //   }
    // });
  };

  save = e => {
    const { record } = this.props;
    this.form.validateFields((error) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      record[this.props.dataIndex] = e.target.value;
      // ----------------------------------------------------------
    });
  };

  handleSwitchIsId = () => {
    const { record, handleSwitchIsId } = this.props;
    if (record.isId === 1) {
      record.isId = 0;
    } else {
      record.isId = 1;
    }
    handleSwitchIsId(record.key, record.isId);
  };

  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    } if (this.props.inputType === 'switch') {
      return <Switch ref={node => (this.input = node)} checked={this.props.record.isId === 1} checkedChildren="是" unCheckedChildren="否" onClick={() => this.handleSwitchIsId()} />
    }
    return <Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} placeholder={`请输入${this.props.title}`} />;
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `请输入${title}`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          // <Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />
          this.getInput()
        )}
      </Form.Item>
    ) : (
      <div
        className={style.editableCellValueWrap}
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

class EditableTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataFields: [],
      count: 0,
      readonly: props.readonly ? props.readonly : false
    };

    this.columns = [
      {
        title: '字段编号',
        dataIndex: 'fieldCode',
        width: '33%',
        editable: !this.state.readonly,
      },
      {
        title: '字段名称',
        dataIndex: 'fieldName',
        width: '33%',
        editable: !this.state.readonly,
      },
      {
        title: '是否标识',
        dataIndex: 'isId',
        width: '15%',
        render: (text, record) => {
          return record.isId === 1 ? "是" : "否";
        },
        editable: !this.state.readonly,
      },
    ];

    if (!this.state.readonly) {
      this.columns.push({
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.dataFields.length >= 1 ? (
            <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
              <a>删除</a>
            </Popconfirm>
          ) : null
        ,
      });
    }
  }

  componentWillReceiveProps(nextProps) {

    let { dataFields } = nextProps;
    if (dataFields) {
      dataFields.map(field => {
        field.key = field.id;
      });
    } else {
      dataFields = [];
    }

    this.setState({
      dataFields,
      count: dataFields.length,
      readonly: nextProps.readonly ? nextProps.readonly : false,
    });
  }

  componentWillUnmount() {
    this.setState({ dataFields: [], count: 0 });
  }

  handleAdd = () => {
    const { count, dataFields } = this.state;
    const newDataField = {
      id: '',
      fieldCode: '',
      fieldName: '',
      isId: 0,
      key: count,
    };
    this.setState({
      dataFields: [...dataFields, newDataField],
      count: count + 1,
    });

    this.props.handleSave(newDataField);
  };

  handleSave = (key, dataIndex, value) => {
    const newData = [...this.state.dataFields];
    const index = newData.findIndex(item => key === item.key);
    const item = newData[index];
    item[dataIndex] = value;
    // newData.splice(index, 1, {
    //   ...item,
    //   ...row,
    // });
    this.setState({ dataFields: newData });

    this.props.handleSave(item);
  };

  handleDelete = key => {
    const dataFields = [...this.state.dataFields];
    this.setState({ dataFields: dataFields.filter(item => item.key !== key) });

    this.props.handleDelete(key);
  };

  handleSwitchIsId = (key, isId) => {
    if (isId === 0) {
      return;
    }
    const { dataFields } = this.state;
    dataFields.map(field => {
      if (field.key !== key) {
        field.isId = 0;
      }
    });
    this.setState({ dataFields });
  }

  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
          handleSwitchIsId: this.handleSwitchIsId,
          inputType: col.dataIndex === 'isId' ? 'switch' : 'text',
        }),
      };
    });

    return (
      <div>
        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16, display: this.state.readonly ? 'none' : 'block' }}>
          添加字段
        </Button>
        <Table
          components={components}
          rowClassName={() => { style.editableRow }}
          bordered
          dataSource={this.state.dataFields}
          columns={columns}
          pagination={{
            onChange: this.cancel,
            position: "none"
          }}
        />
      </div>
    );
  }
}

export default EditableTable;