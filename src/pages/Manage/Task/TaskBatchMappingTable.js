import { Button, Form, Input, InputNumber, Popconfirm, Radio, Select, Table } from 'antd';
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
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave(record.key, this.props.dataIndex, e.currentTarget.value);
      // ----------------------------------------------------------
    });
  };

  handleSelectOp = (op) => {
    const { record, handleSave } = this.props;
    // record.op = op.target.value;
    handleSave(record.key, this.props.dataIndex, op.target.value);
  }

  getInput = () => {
    const { record, dataIndex } = this.props;
    if (dataIndex === 'op') {
      return <>
        <Radio.Group ref={node => (this.input = node)} onChange={this.handleSelectOp} value={record.op ? record.op : 'fix'}>
          <Radio.Button value='fix'>固定</Radio.Button>
          <Radio.Button value='inc'>递增</Radio.Button>
        </Radio.Group>
      </>;
    }
    if(dataIndex === 'v'){
      return <InputNumber min={0} ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} placeholder={`请输入${this.props.title}`} />;
    }
    if(dataIndex === 'step'){
      return <InputNumber min={1} ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} placeholder={`请输入${this.props.title}`} />;
    }
    return <Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} placeholder={`请输入${this.props.title}`} />;
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      (dataIndex !== 'step' || record.op === 'inc') ?
        <Form.Item style={{ margin: 0 }}>
          {form.getFieldDecorator(dataIndex, {
            rules: [
              {
                required: false,
                message: `请输入${title}`,
              },
            ],
            initialValue: record[dataIndex],
          })(
            // <Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />
            this.getInput()
          )}
        </Form.Item>
         : <></>
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

class TaskBatchParamTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      batchParams: [],
      count: 0,
      readonly: props.readonly ? props.readonly : false
    };

    this.columns = [
      {
        title: '参数名',
        dataIndex: 'k',
        width: '20%',
        editable: !this.state.readonly,
      },
      {
        title: '参数值（起始值）',
        dataIndex: 'v',
        width: '23%',
        editable: !this.state.readonly,
      },
      {
        title: '值变动方式',
        dataIndex: 'op',
        width: '25%',
        editable: !this.state.readonly,
      },
      {
        title: '递增值',
        dataIndex: 'step',
        width: '13%',
        editable: !this.state.readonly,
      },
    ];

    if (!this.state.readonly) {
      this.columns.push({
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.batchParams.length >= 1 ? (
            <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
              <a>删除</a>
            </Popconfirm>
          ) : null
        ,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { batchParams } = nextProps;

    this.setState({
      batchParams,
      count: batchParams.length,
      readonly: nextProps.readonly ? nextProps.readonly : false,
    });
  }

  componentWillUnmount() {
    this.setState({ batchParams: [], count: 0 });
  }

  handleAdd = () => {
    const { count, batchParams } = this.state;
    const newDataField = {
      k: '',
      v: '',
      op: 'fix',
      step: 0,
      key: count,
    };
    this.setState({
      batchParams: [...batchParams, newDataField],
      count: count + 1,
    });

    this.props.handleSave(newDataField);
  };

  handleSave = (key, dataIndex, value) => {
    const newData = [...this.state.batchParams];
    const index = newData.findIndex(item => key === item.key);
    const item = newData[index];
    item[dataIndex] = value;
    // newData.splice(index, 1, {
    //   ...item,
    //   ...row,
    // });
    this.setState({ batchParams: newData });

    this.props.handleSave(item);
  };

  handleDelete = key => {
    const batchParams = [...this.state.batchParams];
    this.setState({ batchParams: batchParams.filter(item => item.key !== key) });

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
          dataSource={this.state.batchParams}
          columns={columns}
          pagination={{
            onChange: this.cancel,
            position: "none"
          }}
        // size="small"
        // scroll={{ y: 230 }}
        />
      </div>
    );
  }
}

export default TaskBatchParamTable;