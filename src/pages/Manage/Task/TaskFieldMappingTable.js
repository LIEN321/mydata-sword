import { Form, Input, Table } from 'antd';
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

  getInput = () => {
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

class TaskFieldMappingTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fieldMappings: [],
      readonly: props.readonly ? props.readonly : false
    };

    this.columns = [
      {
        title: '数据字段编号',
        dataIndex: 'dataFieldCode',
        width: '25%',
        editable: false,
      },
      {
        title: '数据字段名称',
        dataIndex: 'dataFieldName',
        width: '25%',
        editable: false,
      },
      {
        title: '接口字段',
        dataIndex: 'apiFieldCode',
        width: '50%',
        editable: !this.state.readonly,
      },
      // {
      //   title: '是否标识',
      //   dataIndex: 'isId',
      //   width: '15%',
      //   render: (text, record) => {
      //     return record.isId == 1 ? "是" : "否";
      //   },
      //   editable: !this.state.readonly,
      // },
    ];

    // if(!this.state.readonly){
    //   this.columns.push({
    //     title: '操作',
    //     dataIndex: 'operation',
    //     render: (text, record) => 
    //       this.state.fieldMappingList.length >= 1 ? (
    //         <Popconfirm title="确认删除吗?" onConfirm={() => this.handleDelete(record.key)}>
    //           <a>删除</a>
    //         </Popconfirm>
    //       ) : null
    //     ,
    //   });
    // }
  }

  componentWillReceiveProps(nextProps) {

    const fieldMappings = [];

    const { dataFieldList, initFieldMappings } = nextProps;
    if (dataFieldList) {
      dataFieldList.map(dataField => {
        const mapping = {
          key: dataField.fieldCode
          , dataFieldCode: dataField.fieldCode
          , dataFieldName: dataField.fieldName
          , apiFieldCode: (initFieldMappings ? (initFieldMappings[dataField.fieldCode] ? initFieldMappings[dataField.fieldCode] : null) : null)
        };

        fieldMappings.push(mapping);
      });
    }

    this.setState({
      fieldMappings,
      readonly: nextProps.readonly ? nextProps.readonly : false,
    });
  }

  componentWillUnmount() {
    this.setState({ fieldMappings: [] });
  }

  // handleAdd = () => {
  //   const { count, fieldMappings } = this.state;
  //   const newDataField = {
  //     id: '',
  //     fieldCode: '',
  //     fieldName: '',
  //     isId: 0,
  //     key: count,
  //   };
  //   this.setState({
  //     fieldMappings: [...fieldMappings, newDataField],
  //     count: count + 1,
  //   });

  //   this.props.handleSave(newDataField);
  // };

  handleSave = (key, dataIndex, value) => {
    const newData = [...this.state.fieldMappings];
    const index = newData.findIndex(item => key === item.key);
    const item = newData[index];
    item[dataIndex] = value;
    // newData.splice(index, 1, {
    //   ...item,
    //   ...row,
    // });
    this.setState({ fieldMappings: newData });

    this.props.handleSave(item);
  };

  // handleDelete = key => {
  //   const fieldMappings = [...this.state.fieldMappings];
  //   this.setState({ fieldMappings: fieldMappings.filter(item => item.key !== key) });

  //   this.props.handleDelete(key);
  // };

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
          inputType: col.dataIndex === 'isId' ? 'switch' : 'text',
        }),
      };
    });

    return (
      <div>
        {/* <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16, display: this.state.readonly ? 'none' : 'block' }}>
          添加字段
        </Button> */}
        <Table
          components={components}
          rowClassName={() => { style.editableRow }}
          bordered
          dataSource={this.state.fieldMappings}
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

export default TaskFieldMappingTable;