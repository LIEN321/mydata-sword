import { message } from 'antd';
import router from 'umi/router';
import { TASK_NAMESPACE } from '../actions/task';
import { list, submit, detail, remove, taskLogList, dataTasks, envTasks } from '../services/task';
import { select as envSelect } from '../services/env';
import { select as dataSelect } from '../services/data';
import { select as apiSelect } from '../services/md_api';
import { requestApi } from '@/services/api';

export default {
  namespace: TASK_NAMESPACE,
  state: {
    data: {
      list: [],
      pagination: false,
    },
    dataTasks: { producerTasks: [], consumerTasks: [] },
    envTasks: { producerTasks: [], consumerTasks: [] },
    detail: {},
    init: {
      envList: [],
      apiList: [],
      dataList: [],
    },
    logs: {
      list: [],
      pagination: false,
    },
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const response = yield call(list, payload);
      if (response.success) {
        yield put({
          type: 'saveList',
          payload: {
            list: response.data.records,
            pagination: {
              total: response.data.total,
              current: response.data.current,
              pageSize: response.data.size,
            },
          },
        });
      }
    },
    *fetchDataTasks({ payload }, { call, put }) {
      const response = yield call(dataTasks, payload);
      if (response.success) {
        yield put({
          type: 'saveDataTasks',
          payload: {
            dataTasks: response.data,
          },
        });
      }
    },
    *fetchEnvTasks({ payload }, { call, put }) {
      const response = yield call(envTasks, payload);
      if (response.success) {
        yield put({
          type: 'saveEnvTasks',
          payload: {
            envTasks: response.data,
          },
        });
      }
    },
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(detail, payload);
      if (response.success) {
        yield put({
          type: 'saveDetail',
          payload: {
            detail: response.data,
          },
        });
      }
    },
    *clearDetail({ payload }, { put }) {
      yield put({
        type: 'removeDetail',
        payload: { payload },
      });
    },
    *submit({ payload }, { call }) {
      const response = yield call(submit, payload);
      if (response.success) {
        message.success('提交成功');
        router.push('/manage/task');
      }
    },
    *remove({ payload }, { call }) {
      const {
        data: { keys },
        success,
      } = payload;
      const response = yield call(remove, { ids: keys });
      if (response.success) {
        success();
      }
    },
    *fetchInit({ payload }, { call, put }) {
      const responseEnv = yield call(envSelect, payload);
      const responseApi = yield call(apiSelect, payload);
      // const responsedData = yield call(dataSelect, payload);
      if (responseEnv.success
        && responseApi.success
        // && responsedData.success
      ) {
        yield put({
          type: 'saveInit',
          payload: {
            envList: responseEnv.data,
            apiList: responseApi.data,
            // dataList: responsedData.data,
          },
        });
      }
    },
    *fetchInitApi({ payload }, { call, put }) {
      const responseApi = yield call(apiSelect, payload);
      if (responseApi.success) {
        yield put({
          type: 'saveInit',
          payload: {
            apiList: responseApi.data,
          },
        });
      }
    },
    *fetchTaskLogList({ payload }, { call, put }) {
      const response = yield call(taskLogList, payload);
      if (response.success) {
        yield put({
          type: 'saveLogList',
          payload: {
            list: response.data.records,
            pagination: {
              total: response.data.total,
              current: response.data.current,
              pageSize: response.data.size,
            },
          },
        });
      }
    },
  },
  reducers: {
    saveList(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveDataTasks(state, action) {
      return {
        ...state,
        dataTasks: action.payload.dataTasks,
      };
    },
    saveEnvTasks(state, action) {
      return {
        ...state,
        envTasks: action.payload.envTasks,
      };
    },
    saveDetail(state, action) {
      return {
        ...state,
        detail: action.payload.detail,
      };
    },
    removeDetail(state) {
      return {
        ...state,
        detail: {},
      };
    },
    saveInit(state, action) {
      return {
        ...state,
        init: action.payload,
      };
    },
    saveLogList(state, action) {
      return {
        ...state,
        logs: action.payload,
      };
    },
  },
};
