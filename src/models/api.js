import { message } from 'antd';
import router from 'umi/router';
import { API_NAMESPACE } from '../actions/api';
import { list, submit, detail, remove, debug } from '../services/md_api';
import { select as appSelect } from '../services/app';
import { select as envSelect } from '../services/env';

export default {
  namespace: API_NAMESPACE,
  state: {
    data: {
      list: [],
      pagination: false,
    },
    detail: {},
    init: {
      appList: [],
      envList: [],
    },
    debugResult: {},
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
        router.push('/manage/api');
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
      const responseApp = yield call(appSelect, payload);
      const responseEnv = yield call(envSelect, payload);
      if (responseApp.success && responseEnv.success) {
        yield put({
          type: 'saveInit',
          payload: {
            appList: responseApp.data,
            envList: responseEnv.data,
          },
        });
      }
    },
    *fetchDebug({ payload }, { call, put }) {
      const response = yield call(debug, payload);
      if (response.success) {
        yield put({
          type: 'saveDebug',
          payload: {
            debugResult: response.data,
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
    saveDebug(state, action) {
      return {
        ...state,
        debugResult: action.payload.debugResult,
      };
    },
  },
};
