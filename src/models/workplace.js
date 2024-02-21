import { message } from 'antd';
import router from 'umi/router';
import { WORKPLACE_NAMESPACE } from '../actions/workplace';
import { queryStat, queryTask } from '../services/workplace';

export default {
  namespace: WORKPLACE_NAMESPACE,
  state: {
    stat: {},
    task: {
      successTasks: [],
      failedTasks: [],
    },
  },
  effects: {
    *fetchStat({ payload }, { call, put }) {
      const response = yield call(queryStat, payload);
      if (response.success) {
        yield put({
          type: 'saveStat',
          payload: {
            stat: response.data,
          },
        });
      }
    },
    *fetchTask({ payload }, { call, put }) {
      const response = yield call(queryTask, payload);
      if (response.success) {
        yield put({
          type: 'saveTask',
          payload: {
            task: response.data,
          },
        });
      }
    },
  },
  reducers: {
    saveStat(state, action) {
      return {
        ...state,
        stat: action.payload.stat,
      };
    },
    saveTask(state, action) {
      return {
        ...state,
        task: action.payload.task,
      };
    },
  },
};
