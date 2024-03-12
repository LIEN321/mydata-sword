import { Form, Input, Button, Table, Popconfirm, InputNumber } from 'antd';
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
    const { record, handleSave } = this.props;
    this.form.validateFields((error) => {
      if (error && error[e.currentTarget.key]) {
        return;
      }
      this.toggleEdit();
      handleSave(record.key, this.props.dataIndex, e.target.value);
      // ----------------------------------------------------------
    });
  };

  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
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

class ApiEditableTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tableValues: [],
      count: 0,
      readonly: props.readonly ? props.readonly : false
    };

    this.columns = [
      {
        title: '参数名',
        dataIndex: 'k',
        width: '40%',
        editable: !this.state.readonly,
      },
      {
        title: '参数值',
        dataIndex: 'v',
        width: '40%',
        editable: !this.state.readonly,
      },
    ];

    if (!this.state.readonly) {
      this.columns.push({
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.tableValues.length >= 1 ? (
            <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
              <a>删除</a>
            </Popconfirm>
          ) : null
        ,
      });
    }
  }

  componentWillReceiveProps(nextProps) {

    let { tableValues } = nextProps;
    if (!tableValues) {
      tableValues = [];
    }

    this.setState({
      tableValues,
      count: tableValues.length,
      readonly: nextProps.readonly ? nextProps.readonly : false,
    });
  }

  componentWillUnmount() {
    this.setState({ tableValues: [], count: 0 });
  }

  handleAdd = () => {
    const { count, tableValues } = this.state;
    const tableValue = {
      k: '',
      v: '',
      key: count,
    };
    this.setState({
      tableValues: [...tableValues, tableValue],
      count: count + 1,
    });

    this.props.handleSave(tableValue);
  };

  handleSave = (key, dataIndex, value) => {
    const newData = [...this.state.tableValues];
    const index = newData.findIndex(item => key === item.key);
    const item = newData[index];
    item[dataIndex] = value;
    // newData.splice(index, 1, {
    //   ...item,
    //   ...row,
    // });
    this.setState({ tableValues: newData });

    this.props.handleSave(item);
  };

  handleDelete = key => {
    const tableValues = [...this.state.tableValues];
    this.setState({ tableValues: tableValues.filter(item => item.key !== key) });

    this.props.handleDelete(key);
  };

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
        }),
      };
    });

    return (
      <div>
        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16, display: this.state.readonly ? 'none' : 'block' }}>
          添加
        </Button>
        <Table
          components={components}
          rowClassName={() => { style.editableRow }}
          bordered
          dataSource={this.state.tableValues}
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

export default ApiEditableTable;