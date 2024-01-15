import { message } from 'antd';
import router from 'umi/router';
import { DATA_NAMESPACE } from '../actions/data';
import { list, projectDataList, submit, detail, remove, bizFieldList, bizDataList } from '../services/data';
import { projectEnv } from '../services/env';

export default {
  namespace: DATA_NAMESPACE,
  state: {
    data: {
      list: [],
      pagination: false,
    },
    detail: {},
    bizField: [],
    bizData: {
      list: [],
      pagination: false,
    },
    init: {
      envList: []
    },
  },
  effects: {
    *fetchInit({ payload }, { call, put }) {
      const responseEnv = yield call(projectEnv, payload);
      if (responseEnv.success) {
        yield put({
          type: 'saveInit',
          payload: {
            envList: responseEnv.data,
          },
        });
      }
    },
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
    *fetchProjectDataList({ payload }, { call, put }) {
      const response = yield call(projectDataList, payload);
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
        router.push('/manage/data');
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
    *fetchBizFieldList({ payload }, { call, put }) {
      const response = yield call(bizFieldList, payload);
      if (response.success) {
        yield put({
          type: 'saveBizFieldList',
          payload: {
            bizField: response.data,
          },
        });
      }
    },
    *fetchBizDataList({ payload }, { call, put }) {
      const response = yield call(bizDataList, payload);
      if (response.success) {
        yield put({
          type: 'saveBizDataList',
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
    saveInit(state, action) {
      return {
        ...state,
        init: action.payload,
      };
    },
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
    saveBizFieldList(state, action) {
      return {
        ...state,
        bizField: action.payload.bizField,
      };
    },
    saveBizDataList(state, action) {
      return {
        ...state,
        bizData: action.payload,
      };
    },
  },
};
